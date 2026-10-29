"""SYSTEM DB membership and server-owned sessions; browsers never grant roles.

The session/cookie and named-SQL patterns follow IN-EDITAONE auth_context.py.
IN-BAPS adds an absolute lifetime alongside sliding idle expiry and does not
create schema objects or demo members during request authentication.
"""
import hashlib
import hmac
import re
import secrets
import time
import uuid
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, Response
from backend import config
from backend.database import query, utcnow

_attempts = defaultdict(deque)
_lock = Lock()
_USERNAME = re.compile(r'[a-z0-9][a-z0-9._@+\-]{2,99}\Z')
_PASSWORD_ITERATIONS = 310000


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), _PASSWORD_ITERATIONS).hex()
    return f'pbkdf2_sha256${_PASSWORD_ITERATIONS}${salt}${digest}'


def verify_password(password, encoded):
    try:
        method, iterations, salt, expected = encoded.split('$')
        rounds = int(iterations)
        if method != 'pbkdf2_sha256' or not 100000 <= rounds <= 2000000 or len(salt) != 32 or len(expected) != 64:
            return False
        digest = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), rounds).hex()
        return hmac.compare_digest(digest, expected)
    except (ValueError, TypeError, AttributeError):
        return False


def normalize_username(value):
    username = value.strip().lower()
    if not _USERNAME.fullmatch(username):
        raise HTTPException(422, '아이디는 영문·숫자로 시작하는 3~100자이며 영문·숫자와 . _ @ + - 를 사용할 수 있습니다.')
    return username


def _duplicate_key(error):
    # Check driver error codes without returning connection details or SQL text.
    code = getattr(error.args[0], 'code', None) if getattr(error, 'args', ()) else None
    return code == 1 or getattr(error, 'sqlite_errorname', '') in ('SQLITE_CONSTRAINT_UNIQUE', 'SQLITE_CONSTRAINT_PRIMARYKEY')


def create_user(username, display_name, password='', role='analyst', *, allow_existing=True):
    username = normalize_username(username)
    display_name = display_name.strip()
    if not display_name or len(display_name) > 150 or role not in ('analyst', 'admin'):
        raise HTTPException(422, '회원 이름 또는 권한 값이 올바르지 않습니다.')
    existing = query('USER_GET', {'username': username})
    if existing:
        if allow_existing:
            return existing[0]
        raise HTTPException(409, '이미 등록된 아이디입니다.')
    user = dict(id=uuid.uuid4().hex, username=username, display_name=display_name,
                password_hash=password_hash(password or secrets.token_urlsafe(48)), role=role)
    try:
        query('USER_INSERT', {**user, 'created': utcnow()}, write=True)
    except Exception as error:
        if _duplicate_key(error):
            if allow_existing:
                existing = query('USER_GET', {'username': username})
                if existing:
                    return existing[0]
            raise HTTPException(409, '이미 등록된 아이디입니다.') from None
        raise
    return user


def initialize_admin():
    """Create only the explicitly configured administrator, without role takeover."""
    password = config.setting('BAPS_ADMIN_PASSWORD')
    if password:
        username = normalize_username(config.setting('BAPS_ADMIN_USER', 'admin'))
        existing = query('USER_GET', {'username': username})
        if existing:
            if existing[0]['role'] != 'admin':
                raise RuntimeError('BAPS_ADMIN_USER already belongs to a non-administrator member. Choose another administrator ID.')
            # Bootstrap settings never replace an existing account's credentials.
            return
        if not 12 <= len(password) <= 256:
            raise RuntimeError('BAPS_ADMIN_PASSWORD must contain 12 to 256 characters.')
        user = create_user(username, '인법스 관리자', password, 'admin')
        if user['role'] != 'admin':
            raise RuntimeError('BAPS_ADMIN_USER already belongs to a non-administrator member. Choose another administrator ID.')


def public_user(user):
    result = {key: user[key] for key in ('id', 'username', 'display_name', 'role')}
    # Compatibility for the original bootstrap label stored in existing databases.
    if result['role'] == 'admin' and result['display_name'] == '워크스페이스 관리자':
        result['display_name'] = '인법스 관리자'
    return result


def _bounded_setting(name, default, minimum, maximum):
    try:
        value = int(config.setting(name, str(default)))
    except ValueError:
        value = default
    return max(minimum, min(value, maximum))


def session_policy():
    return {
        'idle_timeout_seconds': _bounded_setting('BAPS_SESSION_IDLE_MINUTES', 30, 1, 480) * 60,
        'absolute_timeout_seconds': _bounded_setting('BAPS_SESSION_MAX_HOURS', 8, 1, 168) * 3600,
    }


def session_payload(user):
    return {
        'user': public_user(user), 'csrf_token': user['csrf_token'],
        'modules': sorted(config.ENABLED_MODULES),
        'expires_at': float(user['expires_at']), 'idle_expires_at': float(user['idle_expires_at']),
        'server_time': time.time(), **session_policy(),
    }


def issue_session(user, response: Response, request: Request | None = None):
    token, csrf = secrets.token_urlsafe(48), secrets.token_urlsafe(32)
    now = time.time()
    policy = session_policy()
    expires = now + policy['absolute_timeout_seconds']
    idle_expires = min(expires, now + policy['idle_timeout_seconds'])
    query('SESSION_CLEAN', {'now': now}, write=True)
    if request and request.cookies.get(config.COOKIE):
        query('SESSION_DELETE', {'token_hash': hashlib.sha256(request.cookies[config.COOKIE].encode()).hexdigest()}, write=True)
    query('SESSION_INSERT', dict(token_hash=hashlib.sha256(token.encode()).hexdigest(), user_id=user['id'],
                                csrf_token=csrf, expires=expires, idle_expires=idle_expires, now=now), write=True)
    response.set_cookie(config.COOKIE, token, httponly=True, secure=config.COOKIE_SECURE,
                        samesite='lax', max_age=policy['absolute_timeout_seconds'], path='/')
    return session_payload({**user, 'csrf_token': csrf, 'expires_at': expires, 'idle_expires_at': idle_expires})


def require_user(request: Request):
    cached = getattr(request.state, 'auth_user', None)
    if cached:
        return cached
    token = request.cookies.get(config.COOKIE, '')
    if not token or len(token) > 256:
        raise HTTPException(401, '로그인이 필요합니다.')
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now = time.time()
    rows = query('SESSION_GET', dict(token_hash=token_hash, now=now))
    if not rows:
        raise HTTPException(401, '세션이 만료되었습니다. 다시 로그인해 주세요.')
    user = rows[0]
    if request.method not in ('GET', 'HEAD', 'OPTIONS'):
        same_origin(request)
        csrf = request.headers.get('X-CSRF-Token', '')
        if not csrf or not hmac.compare_digest(csrf.encode(), user['csrf_token'].encode()):
            raise HTTPException(403, '유효한 CSRF 토큰이 필요합니다.')
    # Status polling must not keep an otherwise idle browser authenticated.
    if request.url.path != '/api/auth/session':
        idle_expires = min(float(user['expires_at']), now + session_policy()['idle_timeout_seconds'])
        updated = query('SESSION_TOUCH', dict(token_hash=token_hash, now=now, idle_expires=idle_expires), write=True)
        if not updated:
            raise HTTPException(401, '세션이 만료되었습니다. 다시 로그인해 주세요.')
        user['idle_expires_at'] = max(float(user['idle_expires_at']), idle_expires)
        user['last_seen_at'] = now
    request.state.auth_user = user
    return user


def require_admin(request: Request):
    user = require_user(request)
    if user['role'] != 'admin':
        raise HTTPException(403, '관리자 권한이 필요합니다.')
    return user


def rate_limit_login(request):
    key = request.client.host if request.client else 'unknown'
    now = time.monotonic()
    with _lock:
        if len(_attempts) >= 4096 and key not in _attempts:
            expired = [entry for entry, bucket in _attempts.items() if not bucket or bucket[-1] < now - 300]
            for entry in expired:
                del _attempts[entry]
            if len(_attempts) >= 4096:
                raise HTTPException(429, '인증 요청이 많습니다. 잠시 후 다시 시도하세요.')
        bucket = _attempts[key]
        while bucket and bucket[0] < now - 300:
            bucket.popleft()
        if len(bucket) >= 12:
            raise HTTPException(429, '인증 요청이 많습니다. 5분 후 다시 시도하세요.')
        bucket.append(now)


def same_origin(request):
    origin = request.headers.get('origin')
    allowed = {str(request.base_url).rstrip('/')}
    public = config.public_origin()
    if public:
        allowed.add(public)
    if origin and origin.rstrip('/') not in allowed:
        raise HTTPException(403, '같은 출처에서만 요청할 수 있습니다.')
    if request.headers.get('sec-fetch-site') == 'cross-site':
        raise HTTPException(403, '같은 출처에서만 요청할 수 있습니다.')
