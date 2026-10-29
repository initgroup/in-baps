"""Small public-HTTPS transport with DNS pinning and finite resource budgets.

No proxy environment variables, cookies, redirects, or automatic retries are used.
The hostname is retained for TLS verification and Host while the socket connects
only to a previously validated numeric address.
"""
import concurrent.futures
import http.client
import ipaddress
import socket
import ssl
import threading
import time
from urllib.parse import urlsplit

from fastapi import HTTPException

_dns_workers = concurrent.futures.ThreadPoolExecutor(max_workers=4, thread_name_prefix='baps-public-dns')
_dns_slots = threading.BoundedSemaphore(4)
_tls = ssl.create_default_context()


def public_address(value):
    address = ipaddress.ip_address(value.split('%', 1)[0])
    if not address.is_global or address.is_multicast or address.is_reserved or address.is_unspecified:
        return False
    if isinstance(address, ipaddress.IPv6Address) and (address.ipv4_mapped or address.sixtofour or address.teredo):
        return False
    return True


def public_url(value):
    if not isinstance(value, str) or not value or len(value) > 2048 or any(ord(c) < 33 for c in value) or '\\' in value:
        raise HTTPException(422, '공개 HTTPS API 주소를 입력하세요.')
    try:
        parsed = urlsplit(value)
        if parsed.scheme.lower() != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.fragment or parsed.port not in (None, 443):
            raise ValueError()
        hostname = parsed.hostname.rstrip('.').encode('idna').decode('ascii').lower()
        if not hostname or hostname == 'localhost' or hostname.endswith(('.localhost', '.local', '.internal')):
            raise ValueError()
        try:
            ipaddress.ip_address(hostname)
        except ValueError:
            if '.' not in hostname or any(not part or len(part) > 63 for part in hostname.split('.')):
                raise ValueError()
        else:
            if not public_address(hostname):
                raise ValueError()
    except (ValueError, UnicodeError):
        raise HTTPException(422, '외부 공개 HTTPS 주소와 기본 443 포트만 사용할 수 있습니다.') from None
    return parsed, hostname


def resolve_public(hostname, deadline):
    if not _dns_slots.acquire(timeout=max(0, min(1, deadline - time.monotonic()))):
        raise HTTPException(503, 'API 주소 확인 요청이 많습니다. 잠시 후 다시 시도하세요.')
    try:
        task = _dns_workers.submit(socket.getaddrinfo, hostname, 443, 0, socket.SOCK_STREAM)
    except Exception:
        _dns_slots.release()
        raise
    task.add_done_callback(lambda _: _dns_slots.release())
    try:
        found = task.result(timeout=max(.01, min(5, deadline - time.monotonic())))
        addresses = []
        for family, socktype, protocol, _, address in found:
            if family not in (socket.AF_INET, socket.AF_INET6) or not public_address(address[0]):
                raise ValueError()
            item = (family, address[0])
            if item not in addresses:
                addresses.append(item)
        if not addresses:
            raise ValueError()
        return addresses
    except (socket.gaierror, ValueError, concurrent.futures.TimeoutError):
        raise HTTPException(422, 'API 호스트의 공개 주소를 확인하지 못했습니다. 내부 주소와 혼합 DNS는 허용하지 않습니다.') from None


class PinnedHTTPSConnection(http.client.HTTPSConnection):
    def __init__(self, hostname, address, deadline):
        self.address = address
        self.deadline = deadline
        self._transport = None
        self._expired = threading.Event()
        super().__init__(hostname, 443, timeout=max(.01, min(10, deadline - time.monotonic())), context=_tls)

    def expire(self):
        """Interrupt even while http.client parses a dribbled header/trailer."""
        self._expired.set()
        transport = self._transport
        if transport is not None:
            try:
                transport.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass

    def connect(self):
        family, address = self.address
        raw = socket.socket(family, socket.SOCK_STREAM)
        self._transport = raw
        try:
            if self._expired.is_set():
                raise TimeoutError()
            raw.settimeout(max(.01, min(10, self.deadline - time.monotonic())))
            raw.connect((address, 443))
            raw.settimeout(max(.01, min(10, self.deadline - time.monotonic())))
            self.sock = self._context.wrap_socket(raw, server_hostname=self.host, do_handshake_on_connect=False)
            self._transport = self.sock
            if self._expired.is_set():
                raise TimeoutError()
            self.sock.do_handshake()
        except BaseException:
            raw.close()
            raise


def request(url, method='GET', headers=None, body=None, *, max_bytes=10 * 1024 * 1024, deadline=None):
    deadline = deadline or time.monotonic() + 30
    parsed, hostname = public_url(url)
    addresses = resolve_public(hostname, deadline)
    safe_headers = {'accept': 'application/json, application/xml, text/xml;q=0.9',
                    'accept-encoding': 'identity', 'user-agent': 'IN-BAPS/1.0',
                    **{name.lower(): value for name, value in (headers or {}).items()}}
    connection = PinnedHTTPSConnection(hostname, addresses[0], deadline)
    watchdog = threading.Timer(max(.001, deadline - time.monotonic()), connection.expire)
    watchdog.daemon = True
    watchdog.start()
    response = None
    try:
        if time.monotonic() >= deadline:
            raise TimeoutError()
        path = (parsed.path or '/') + ('?' + parsed.query if parsed.query else '')
        connection.request(method, path, body=body, headers=safe_headers)
        response = connection.getresponse()
        if time.monotonic() >= deadline:
            raise TimeoutError()
        if 300 <= response.status < 400:
            raise HTTPException(422, 'API 리디렉션은 허용하지 않습니다. 최종 HTTPS 주소를 직접 등록하세요.')
        if not 200 <= response.status < 300:
            raise HTTPException(422, f'외부 API가 HTTP {response.status} 상태를 반환했습니다. 입력 파라미터와 인증정보를 확인하세요.')
        if response.getheader('Content-Encoding', 'identity').lower() not in ('', 'identity'):
            raise HTTPException(422, '압축 응답은 허용하지 않습니다. identity 응답을 지원하는 API를 사용하세요.')
        length = response.getheader('Content-Length')
        if length and (not length.isdigit() or int(length) > max_bytes):
            raise HTTPException(422, 'API 응답 크기가 허용 범위를 초과했습니다.')
        chunks, size = [], 0
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise TimeoutError()
            if connection.sock is not None:
                connection.sock.settimeout(min(5, remaining))
            chunk = response.read1(min(65536, max_bytes + 1 - size))
            if not chunk:
                break
            chunks.append(chunk)
            size += len(chunk)
            if size > max_bytes:
                raise HTTPException(422, 'API 응답 크기가 허용 범위를 초과했습니다.')
        return b''.join(chunks), response.getheader('Content-Type', '')
    except HTTPException:
        raise
    except (OSError, TimeoutError, http.client.HTTPException, UnicodeError, ValueError):
        raise HTTPException(422, '외부 API 연결·TLS 확인 또는 응답 제한 시간을 초과했습니다.') from None
    finally:
        watchdog.cancel()
        if response is not None:
            response.close()
        connection.close()
