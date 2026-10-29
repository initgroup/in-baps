"""Owned API definitions, bounded extraction, durable runs and TARGET appends."""
import base64
import binascii
import copy
import html
import json
import math
import re
import time
import uuid
from contextlib import closing
from datetime import datetime, timezone
from decimal import Decimal
from urllib.parse import quote, quote_plus, urlencode

import oracledb
from defusedxml import ElementTree
from defusedxml.common import DefusedXmlException
from fastapi import HTTPException

from backend import config, safe_http, target_database as target
from backend.analytics import infer_columns, number
from backend.database import connection, get_record, json_document, query, statements

MAX_BYTES = 10 * 1024 * 1024
LOCK_SECONDS = 300
_secret_name = re.compile(r'authorization|api.?key|service.?key|access.?key|token|secret|password|credential|signature', re.I)
_header_name = re.compile(r'[A-Za-z0-9-]{1,100}\Z')


class _JSONFloat(float):
    """Retain JSON decimal spelling until the OUTPUT mapping decides its type."""
    def __new__(cls, text):
        value = super().__new__(cls, text)
        value.lexeme = text
        return value

    def __str__(self):
        return self.lexeme


def _json_text(value):
    if isinstance(value, _JSONFloat):
        return value.lexeme
    if isinstance(value, dict):
        return '{' + ','.join(json.dumps(str(key), ensure_ascii=False) + ':' + _json_text(item) for key, item in value.items()) + '}'
    if isinstance(value, list):
        return '[' + ','.join(_json_text(item) for item in value) + ']'
    return json.dumps(value, ensure_ascii=False, allow_nan=False)


def stamp():
    return datetime.now(timezone.utc).isoformat(timespec='microseconds')


def enabled():
    if 'C-BAP' not in config.ENABLED_MODULES:
        raise HTTPException(403, 'C-BAP 모듈이 활성화되어 있지 않습니다.')


def _execute(cursor, sql_id, params):
    if config.STORAGE == 'oracle' and 'payload' in params:
        cursor.setinputsizes(payload=oracledb.DB_TYPE_CLOB)
    cursor.execute(statements()[sql_id], params)
    return cursor.rowcount


def _source(row):
    row = dict(row)
    row['config'] = json_document(row.pop('config_json'))
    return row


def source(source_id, user):
    rows = query('API_SOURCE_GET', {'id': source_id, 'owner': user['id']})
    if not rows:
        raise HTTPException(404, '본인 소유의 API 수집 설정을 찾을 수 없습니다.')
    return _source(rows[0])


def _secret_values(cfg):
    return json.loads(target.decrypt(cfg['secret_values'])) if cfg.get('secret_values') else {}


def _secret_key(item):
    return item['location'] + ':' + item['name'].lower()


def _redaction_values(cfg, secrets):
    """An API may reflect individual leaves from a structured secret body."""
    values = dict(secrets)
    for item in cfg.get('inputs', []):
        if item.get('secret') and item['location'] == 'header' and item['name'].lower() == 'authorization':
            scheme, _, credential = secrets[_secret_key(item)].partition(' ')
            if credential and scheme.lower() in ('bearer', 'basic'):
                values[str(len(values))] = credential
                if scheme.lower() == 'basic':
                    try:
                        decoded = base64.b64decode(credential, validate=True).decode('utf-8')
                        for component in (decoded, *decoded.split(':', 1)):
                            if component:
                                values[str(len(values))] = component
                    except (ValueError, UnicodeError, binascii.Error):
                        pass
        if not item.get('secret') or item.get('type') != 'json':
            continue
        try:
            document = json.loads(secrets[_secret_key(item)])
            _guard_tree(document)
        except (ValueError, KeyError, RecursionError):
            raise HTTPException(422, '비밀 JSON INPUT 값을 확인하세요.') from None
        pending = [document]
        while pending:
            value = pending.pop()
            if isinstance(value, dict):
                pending.extend(value.values())
            elif isinstance(value, list):
                pending.extend(value)
            elif value is not None:
                literal = value if isinstance(value, str) else json.dumps(value)
                if literal:
                    values[str(len(values))] = literal
    return values


def public_source(row):
    cfg = copy.deepcopy(row['config'])
    cfg.pop('secret_values', None)
    for item in cfg.get('inputs', []):
        if item.get('secret'):
            item['value'] = ''
            item['has_secret'] = True
    cfg.pop('target', None)
    # Configuration is user-authored, not an untrusted response. Preserve its
    # URL/keys/types exactly for safe editing; only credential INPUT values hide.
    # Response rows/raw documents use expanded secret-literal redaction instead.
    result = {**cfg, 'id': row['id'], 'created_at': row['created_at'],
              'updated_at': row['updated_at'], 'locked': bool(row.get('lock_token')),
              'lock_until': float(row.get('lock_until') or 0)}
    stored = row['config'].get('target')
    if stored:
        result['target'] = {key: stored.get(key) for key in ('table', 'dataset_id', 'row_count')}
    return result


def list_sources(user):
    return [public_source(_source(row)) for row in query('API_SOURCE_LIST', {'owner': user['id']})]


def _path_parts(path):
    if not path or path == '$':
        return []
    if len(path) > 500:
        raise HTTPException(422, '필드 경로는 500자 이하여야 합니다.')
    path = path.removeprefix('$.')
    if path.startswith('$['):
        path = path[1:]
    parts = []
    for token in re.split(r'\.|\[|\]', path):
        if token:
            parts.append(int(token) if token.isdigit() else token)
    if len(parts) > 32 or any(isinstance(p, str) and (not p.strip() or '*' in p) for p in parts):
        raise HTTPException(422, '필드 경로는 점과 배열 인덱스로 지정하세요. 와일드카드는 지원하지 않습니다.')
    return parts


def prepare(data, user, previous=None):
    enabled()
    cfg = copy.deepcopy(data)
    cfg.pop('source_id', None)
    cfg['name'] = cfg['name'].strip()
    if not cfg['name']:
        raise HTTPException(422, '수집 설정 이름을 입력하세요.')
    parsed, _ = safe_http.public_url(cfg['url'])
    if parsed.query:
        raise HTTPException(422, 'URL의 쿼리 문자열은 INPUT 파라미터로 옮기세요. 인증값은 비밀값으로 지정하세요.')
    record = target.get_connection(cfg['connection_id'], user)
    if not record['config'].get('allow_dml'):
        raise HTTPException(422, '수집 저장을 위해 TARGET 연결의 쓰기를 허용하세요.')
    old = previous['config'] if previous else {}
    old_secrets = _secret_values(old)
    secrets, used = {}, set()
    for item in cfg['inputs']:
        item['name'] = item['name'].strip()
        if not item['name'] or any(ord(c) < 32 for c in item['name']):
            raise HTTPException(422, 'INPUT 파라미터 이름을 확인하세요.')
        key = _secret_key(item)
        if key in used:
            raise HTTPException(422, '동일한 위치·이름의 INPUT 파라미터를 중복 등록할 수 없습니다.')
        used.add(key)
        if item['location'] == 'header':
            name = item['name'].lower()
            if not _header_name.fullmatch(item['name']) or name in ('host', 'connection', 'content-length', 'transfer-encoding', 'accept-encoding', 'cookie', 'te', 'trailer', 'upgrade', 'forwarded') or name.startswith(('proxy-', 'x-forwarded-')):
                raise HTTPException(422, '호스트·프록시·쿠키·전송 제어 헤더는 설정할 수 없습니다.')
            if '\r' in item['value'] or '\n' in item['value']:
                raise HTTPException(422, '헤더 값에 줄바꿈을 사용할 수 없습니다.')
        if cfg['method'] == 'GET' and item['location'] == 'body':
            raise HTTPException(422, 'GET 요청의 INPUT은 query 또는 header로 설정하세요.')
        item['secret'] = bool(item['secret'] or _secret_name.search(item['name']))
        if item['secret']:
            value = item['value'] or old_secrets.get(key, '')
            if not value:
                raise HTTPException(422, '비밀 INPUT 값을 입력하세요. 기존 설정의 빈 값은 저장된 비밀값을 재사용합니다.')
            secrets[key] = value
            item['value'] = ''
    if secrets:
        cfg['secret_values'] = target.encrypt(json.dumps(secrets, ensure_ascii=False))
        _redaction_values(cfg, secrets)
    names = [field['name'].strip() for field in cfg['fields']]
    if len(names) != len(set(name.casefold() for name in names)) or any(not name or len(name) > 100 or len(name.encode('utf-8')) > 128 or name.upper().startswith('BAPS_') for name in names):
        raise HTTPException(422, 'OUTPUT 컬럼은 고유한 이름으로 지정하고 BAPS_ 예약 접두어를 사용하지 마세요.')
    for field, name in zip(cfg['fields'], names):
        field['name'] = name
        if cfg['response_format'] == 'json':
            _path_parts(field['path'])
    if cfg['response_format'] == 'json':
        _path_parts(cfg['records_path'])
    pagination = cfg['pagination']
    if pagination['mode'] != 'none':
        if not pagination['parameter'].strip() or pagination['parameter'] == pagination['size_parameter']:
            raise HTTPException(422, '페이지·크기 파라미터 이름을 서로 다르게 지정하세요.')
        if _secret_name.search(pagination['parameter']) or _secret_name.search(pagination['size_parameter']):
            raise HTTPException(422, '인증 파라미터를 페이지 설정에 사용할 수 없습니다.')
    if old.get('target'):
        for key in ('connection_id', 'fields', 'response_format'):
            if cfg[key] != old[key]:
                raise HTTPException(409, '이미 TARGET 테이블이 준비된 설정의 연결·OUTPUT·응답 형식은 변경할 수 없습니다. 새 수집 설정을 등록하세요.')
        cfg['target'] = old['target']
    return cfg


def save_source(data, user, source_id=None):
    previous = source(source_id, user) if source_id else None
    cfg = prepare(data, user, previous)
    now, identifier = stamp(), source_id or uuid.uuid4().hex
    if not previous and len(list_sources(user)) >= 100:
        raise HTTPException(422, '회원별 수집 설정은 100개까지 등록할 수 있습니다.')
    params = dict(id=identifier, owner=user['id'], name=cfg['name'], payload=json.dumps(cfg, ensure_ascii=False), updated=now)
    if previous:
        params['previous_updated'] = previous['updated_at']
    else:
        params['created'] = now
    changed = query('API_SOURCE_UPDATE' if previous else 'API_SOURCE_INSERT', params, write=True)
    if not changed:
        raise HTTPException(409, '실행 중이거나 다른 창에서 변경된 수집 설정입니다. 새로 조회하세요.')
    return public_source(source(identifier, user))


def _guard_tree(value, depth=0, counter=None):
    counter = counter if counter is not None else [0]
    counter[0] += 1
    if depth > 32 or counter[0] > 200000:
        raise HTTPException(422, '응답의 중첩 깊이 또는 항목 수가 허용 범위를 초과했습니다.')
    if isinstance(value, dict):
        for item in value.values():
            _guard_tree(item, depth + 1, counter)
    elif isinstance(value, list):
        for item in value:
            _guard_tree(item, depth + 1, counter)
    elif isinstance(value, float) and not math.isfinite(value):
        raise HTTPException(422, '응답에 유효하지 않은 숫자가 있습니다.')


def json_path(value, path):
    for part in _path_parts(path):
        if isinstance(value, dict) and isinstance(part, str):
            value = value.get(part)
        elif isinstance(value, list) and isinstance(part, int):
            value = value[part] if 0 <= part < len(value) else None
        else:
            return None
    return value


def _local(tag):
    return tag.rsplit('}', 1)[-1]


def xml_nodes(root, path):
    parts = [part for part in path.strip('/').split('/') if part and part != '.']
    if len(parts) > 32 or any(any(c in part for c in '*[]()') or part == '..' for part in parts):
        raise HTTPException(422, 'XML 경로는 요소 이름을 /로 연결하세요. XPath 함수·와일드카드는 지원하지 않습니다.')
    if parts and parts[0] == _local(root.tag):
        parts.pop(0)
    nodes = [root]
    for part in parts:
        nodes = [child for node in nodes for child in node if _local(child.tag) == part]
    return nodes


def xml_value(root, path):
    if path in ('', '.', '#text'):
        return root.text
    pieces = path.rsplit('/', 1)
    last = pieces[-1]
    if last.startswith('@'):
        nodes = xml_nodes(root, pieces[0]) if len(pieces) == 2 else [root]
        return nodes[0].attrib.get(last[1:]) if nodes else None
    nodes = xml_nodes(root, path)
    if not nodes:
        return None
    values = [xml_object(node) if len(node) else node.text for node in nodes]
    return values[0] if len(values) == 1 else values


def xml_object(node):
    result = {'@' + key: value for key, value in node.attrib.items()}
    for child in node:
        key, value = _local(child.tag), xml_object(child) if len(child) or child.attrib else child.text
        if key in result:
            result[key] = result[key] + [value] if isinstance(result[key], list) else [result[key], value]
        else:
            result[key] = value
    if node.text and node.text.strip():
        result['#text'] = node.text.strip()
    return result


def parse_records(raw, cfg):
    try:
        if cfg['response_format'] == 'json':
            document = json.loads(raw, parse_float=_JSONFloat)
            _guard_tree(document)
            value = json_path(document, cfg['records_path'])
            if value is None:
                raise HTTPException(422, 'JSON 레코드 경로를 찾을 수 없습니다.')
            records = value if isinstance(value, list) else [value]
            return [(record if isinstance(record, dict) else {'value': record}, _json_text(record)) for record in records]
        root = ElementTree.fromstring(raw, forbid_dtd=True, forbid_entities=True, forbid_external=True)
        count = 0
        stack = [(root, 0)]
        while stack:
            node, depth = stack.pop()
            count += 1
            if count > 200000 or depth > 32:
                raise HTTPException(422, 'XML 중첩 깊이 또는 요소 수가 허용 범위를 초과했습니다.')
            stack.extend((child, depth + 1) for child in node)
        return [(node, ElementTree.tostring(node, encoding='unicode')) for node in xml_nodes(root, cfg['records_path'])]
    except HTTPException:
        raise
    except (ValueError, UnicodeError, RecursionError, ElementTree.ParseError, DefusedXmlException):
        raise HTTPException(422, '응답 JSON/XML 형식을 확인하세요. XML DTD·외부 엔터티는 허용하지 않습니다.') from None


def redact(value, secrets):
    originals = {str(item) for item in secrets.values() if item}
    literals = sorted(originals | {encoded for item in originals for encoded in (json.dumps(item, ensure_ascii=False)[1:-1], html.escape(item), quote(item, safe=''), quote_plus(item))}, key=len, reverse=True)
    if isinstance(value, dict):
        return {redact(str(key), secrets): redact(item, secrets) for key, item in value.items()}
    if isinstance(value, list):
        return [redact(item, secrets) for item in value]
    if value is None:
        return None
    if not isinstance(value, str):
        return None if str(value) in literals or json.dumps(value) in literals else value
    for literal in literals:
        value = value.replace(literal, '[비밀값 제외]')
    return value


def raw_document(record, original, cfg, secrets):
    """Redact before serialization so retained JSON/XML remains structurally valid."""
    if cfg['response_format'] == 'json':
        return _json_text(redact(json.loads(original, parse_float=_JSONFloat), secrets))
    node = copy.deepcopy(record)
    for element in node.iter():
        element.text = redact(element.text, secrets)
        element.tail = redact(element.tail, secrets)
        if redact(element.tag, secrets) != element.tag:
            element.tag = 'redacted'
        element.attrib = {(name if redact(name, secrets) == name else 'redacted_' + str(index)): redact(value, secrets)
                          for index, (name, value) in enumerate(element.attrib.items())}
    return ElementTree.tostring(node, encoding='unicode')


def mapped_record(record, cfg):
    fields = cfg['fields']
    if not fields:
        obj = record if cfg['response_format'] == 'json' else xml_object(record)
        if len(obj) > config.MAX_COLUMNS:
            raise HTTPException(422, 'OUTPUT 컬럼은 100개 이하여야 합니다. 필요한 필드를 지정하세요.')
        return {str(key): _json_text(value) if isinstance(value, (dict, list)) else value for key, value in obj.items()}
    result = {}
    for field in fields:
        value = json_path(record, field['path']) if cfg['response_format'] == 'json' else xml_value(record, field['path'])
        if value is None or value == '':
            if field['required']:
                raise HTTPException(422, '필수 OUTPUT 필드의 값이 없거나 비어 있습니다. 매핑을 확인하세요.')
            value = None
        elif field['type'] == 'number':
            value = collection_number(value)
            if value is None:
                raise HTTPException(422, '숫자 OUTPUT 필드에 숫자가 아닌 값이 있습니다.')
        elif field['type'] == 'boolean':
            text = str(value).lower()
            if text not in ('true', 'false', '1', '0'):
                raise HTTPException(422, '불리언 OUTPUT 필드는 true/false 또는 1/0이어야 합니다.')
            value = 1 if text in ('true', '1') else 0
        elif field['type'] == 'json' or isinstance(value, (dict, list)):
            value = _json_text(value)
        else:
            value = str(value)
        result[field['name']] = value
    return result


def collection_number(value):
    numeric = number(value)
    if numeric is not None:
        original = Decimal(str(value).strip())
        if original != Decimal(str(numeric)) or (original == original.to_integral_value() and abs(original) > 9007199254740991):
            raise HTTPException(422, '정밀도를 유지할 수 없는 숫자입니다. 큰 식별자·고정밀 값은 OUTPUT string 형식으로 매핑하세요.')
    return numeric


def fetch_source(cfg, *, preview=False):
    secrets = _secret_values(cfg)
    redaction_values = _redaction_values(cfg, secrets)
    query_inputs, headers, body_inputs = {}, {}, {}
    for item in cfg['inputs']:
        value = secrets[_secret_key(item)] if item['secret'] else item['value']
        if item['location'] == 'body' and cfg['body_format'] == 'json' and item.get('type', 'string') != 'string':
            try:
                value = json.loads(value)
                expected = item['type']
                if (expected == 'number' and (isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value))) or (expected == 'boolean' and not isinstance(value, bool)):
                    raise ValueError()
                _guard_tree(value)
            except (ValueError, RecursionError):
                raise HTTPException(422, 'JSON body INPUT 값과 number/boolean/json 형식을 확인하세요.') from None
        {'query': query_inputs, 'header': headers, 'body': body_inputs}[item['location']][item['name']] = value
    pagination = cfg['pagination']
    rows, documents, pages, total_bytes, truncated = [], [], 0, 0, False
    deadline = time.monotonic() + (20 if preview else 60)
    max_pages = 1 if preview or pagination['mode'] == 'none' else pagination['max_pages']
    last_records = []
    for page in range(max_pages):
        query_values = dict(query_inputs)
        if pagination['mode'] != 'none':
            query_values[pagination['parameter']] = pagination['start'] + page * pagination['step']
            if pagination['size_parameter']:
                query_values[pagination['size_parameter']] = pagination['page_size']
        url = cfg['url'] + ('?' + urlencode(query_values) if query_values else '')
        request_headers = dict(headers)
        body = None
        if cfg['method'] == 'POST':
            if cfg['body_format'] == 'json':
                body = json.dumps(body_inputs, ensure_ascii=False).encode('utf-8')
                request_headers['Content-Type'] = 'application/json'
            else:
                body = urlencode(body_inputs).encode('utf-8')
                request_headers['Content-Type'] = 'application/x-www-form-urlencoded'
        raw, _ = safe_http.request(url, cfg['method'], request_headers, body, max_bytes=MAX_BYTES - total_bytes, deadline=deadline)
        total_bytes += len(raw)
        pages += 1
        records = parse_records(raw, cfg)
        last_records = records
        remaining = cfg['max_rows'] - len(rows)
        if len(records) > remaining:
            truncated = True
        for record, original in records[:remaining]:
            rows.append(redact(mapped_record(record, cfg), redaction_values))
            documents.append(raw_document(record, original, cfg, redaction_values))
        if len(rows) >= cfg['max_rows']:
            truncated = True
            break
        if not records or pagination['mode'] == 'none' or (pagination['size_parameter'] and len(records) < pagination['page_size']):
            break
    if pagination['mode'] != 'none' and pages == max_pages and last_records and not (pagination['size_parameter'] and len(last_records) < pagination['page_size']):
        truncated = True
    if preview and pagination['mode'] != 'none':
        truncated = True
    names = list(dict.fromkeys(key for row in rows for key in row))
    if len(names) > config.MAX_COLUMNS or any(not name.strip() or len(name) > 100 or len(name.encode('utf-8')) > 128 or name.upper().startswith('BAPS_') for name in names) or len({name.casefold() for name in names}) != len(names):
        raise HTTPException(422, '응답 컬럼 이름·수를 확인하거나 OUTPUT 매핑을 지정하세요.')
    rows = [{name: row.get(name) for name in names} for row in rows]
    if not rows:
        columns = [{'name': item['name'], 'type': 'number' if item['type'] in ('number', 'boolean') else 'string'} for item in cfg['fields']]
    else:
        columns = infer_columns(rows)
    # Explicit mappings own their stable types even when the current page is all null.
    if cfg['fields']:
        columns = [{'name': item['name'], 'type': 'number' if item['type'] in ('number', 'boolean') else 'string'} for item in cfg['fields']]
    for column in columns:
        if column['type'] == 'number':
            for row in rows:
                if row.get(column['name']) not in (None, ''):
                    collection_number(row[column['name']])
    warnings = ['페이지·행 제한에 도달했습니다. 제한 범위의 데이터만 처리합니다.'] if truncated else []
    return {'connected': True, 'format': cfg['response_format'], 'rows': rows, 'documents': documents,
            'columns': columns, 'row_count': len(rows), 'pages': pages, 'bytes': total_bytes,
            'truncated': truncated, 'warnings': warnings}


def test_source(cfg):
    result = fetch_source(cfg, preview=True)
    result.pop('documents', None)
    result['preview_limit'] = 20
    result['rows'] = result['rows'][:20]
    return result


def _write_descriptor(row, user, token, descriptor):
    row['config']['target'] = descriptor
    changed = query('API_SOURCE_TARGET', dict(id=row['id'], owner=user['id'], token=token,
                    payload=json.dumps(row['config'], ensure_ascii=False), updated=stamp()), write=True)
    if changed != 1:
        raise HTTPException(409, '수집 실행 잠금 상태가 변경되었습니다. 재실행 전에 결과를 확인하세요.')


def _schema(columns, cfg):
    mapped = {field['name']: field['type'] for field in cfg['fields']}
    return [{'name': col['name'], 'type': col['type'], 'db_type': 'CLOB' if mapped.get(col['name']) == 'json' else 'NUMBER' if col['type'] == 'number' else 'VARCHAR2'} for col in columns]


def append_target(row, user, run_id, result):
    cfg = row['config']
    record = target.get_connection(cfg['connection_id'], user)
    if not record['config'].get('allow_dml'):
        raise HTTPException(403, 'TARGET 연결의 쓰기 권한을 확인하세요.')
    descriptor = cfg.get('target')
    if not descriptor:
        descriptor = {'table': target.MANAGED_PREFIX + 'API_' + row['id'][:12].upper(),
                      'dataset_id': uuid.uuid4().hex, 'schema': _schema(result['columns'], cfg), 'row_count': 0}
        _write_descriptor(row, user, run_id, descriptor)
    schema = descriptor['schema']
    if [col['name'] for col in schema] != [col['name'] for col in result['columns']]:
        raise HTTPException(409, '응답 컬럼이 기존 TARGET 구조와 다릅니다. OUTPUT 매핑을 고정하거나 새 설정을 등록하세요.')
    table, marker = descriptor['table'], 'IN-BAPS API SOURCE ' + row['id'] + ' OWNER ' + user['id']
    cols = [f'C{i:03d}' for i in range(1, len(schema) + 1)]
    if not cols:
        raise HTTPException(422, '수집할 OUTPUT 컬럼이 없습니다.')
    values, collected = [], stamp()
    for index, (item, document) in enumerate(zip(result['rows'], result['documents']), 1):
        entries = [run_id, index, collected, document]
        for col in schema:
            value = item.get(col['name'])
            if col['db_type'] == 'NUMBER':
                numeric = collection_number(value)
                if value not in (None, '') and numeric is None:
                    raise HTTPException(422, '숫자 TARGET 컬럼에 숫자가 아닌 값이 있어 전체 적재를 중단했습니다.')
                entries.append(Decimal(str(numeric)) if numeric is not None else None)
            else:
                text = None if value is None else str(value)
                if text and len(text.encode('utf-8')) > (MAX_BYTES if col['db_type'] == 'CLOB' else 4000):
                    raise HTTPException(422, '문자 OUTPUT은 UTF-8 4,000바이트 이하여야 합니다. 큰 구조는 json 형식으로 매핑하세요.')
                entries.append(text)
        values.append(entries)
    definitions = ',\n  '.join(target.identifier(name) + ' ' + (col['db_type'] if col['db_type'] != 'VARCHAR2' else 'VARCHAR2(4000 BYTE)') for name, col in zip(cols, schema))
    ddl = target.ddl_template('DDL', 'target_api_collection.sql.template', table=target.identifier(table), columns=definitions,
                              constraint=target.identifier('INIT$_PK_BAPS_API_' + row['id'][:12].upper()))
    with target.target_connection(record) as conn:
        with conn.cursor() as cursor:
            cursor.execute(statements()['API_TARGET_EXISTS'], {'table_name': table})
            existing = cursor.fetchone()
            if not existing:
                target.persist_ddl(record, user, table, ddl)
                cursor.execute(ddl)
                comment = 'COMMENT ON TABLE ' + target.identifier(table) + " IS '" + marker.replace("'", "''") + "'"
                target.persist_ddl(record, user, table, comment)
                cursor.execute(comment)
            else:
                cursor.execute(statements()['API_TARGET_COMMENT'], {'table_name': table})
                found = cursor.fetchone()
                if not found or found[0] != marker:
                    raise HTTPException(409, '같은 이름의 TARGET 테이블 소유 표식이 일치하지 않아 적재를 차단했습니다.')
            cursor.execute(statements()['API_TARGET_COLUMNS'], {'table_name': table})
            actual = [tuple(column) for column in cursor.fetchall()]
            expected = [('BAPS_RUN_ID', 'VARCHAR2', 'N', 1, None, None, 'C', 32),
                        ('BAPS_ROW_ID', 'NUMBER', 'N', 1, None, None, None, 0),
                        ('BAPS_COLLECTED_AT', 'VARCHAR2', 'N', 0, None, None, 'C', 40),
                        ('BAPS_RAW_DOCUMENT', 'CLOB', 'N', 0, None, None, None, 0)]
            expected += [(name, column['db_type'], 'Y', 0, None, None,
                          'B' if column['db_type'] == 'VARCHAR2' else None,
                          4000 if column['db_type'] == 'VARCHAR2' else 0) for name, column in zip(cols, schema)]
            if actual != expected:
                raise HTTPException(409, 'TARGET 테이블의 실제 컬럼 구조가 등록 구조와 다릅니다.')
            names = ['BAPS_RUN_ID', 'BAPS_ROW_ID', 'BAPS_COLLECTED_AT', 'BAPS_RAW_DOCUMENT', *cols]
            cursor.setinputsizes(32, oracledb.DB_TYPE_NUMBER, 40, oracledb.DB_TYPE_CLOB,
                                 *[oracledb.DB_TYPE_NUMBER if col['db_type'] == 'NUMBER' else oracledb.DB_TYPE_CLOB if col['db_type'] == 'CLOB' else 4000 for col in schema])
            cursor.executemany('INSERT INTO ' + target.identifier(table) + ' (' + ', '.join(map(target.identifier, names)) + ') VALUES (' + ', '.join(':' + str(i) for i in range(1, len(names) + 1)) + ')', values)
            cursor.execute('SELECT COUNT(*) FROM ' + target.identifier(table))
            total_rows = int(cursor.fetchone()[0])
        conn.commit()
    descriptor['row_count'] = total_rows
    # TARGET commit and SYSTEM metadata cannot be an atomic distributed transaction.
    # Failures after this point retain the source lock and become UNKNOWN for review.
    target.remember_table(record, user, table)
    select = 'SELECT ' + ', '.join(target.identifier(name) + ' AS ' + target.identifier(col['name']) for name, col in zip(cols, schema)) + ' FROM ' + target.identifier(table) + ' ORDER BY BAPS_COLLECTED_AT DESC, BAPS_RUN_ID, BAPS_ROW_ID'
    old = get_record('dataset', user['id'], descriptor['dataset_id'])
    payload = {'id': descriptor['dataset_id'], 'name': row['name'] + ' · API 수집', 'module': 'C-BAP',
               'source': 'target-sql', 'collection_type': 'api', 'description': 'Open API 누적 수집 · 원본 문서는 TARGET BAPS_RAW_DOCUMENT에 보관',
               'created_at': old['created_at'] if old else stamp(), 'updated_at': stamp(),
               'row_count': descriptor['row_count'], 'columns': [{'name': col['name'], 'type': col['type']} for col in schema],
               'truncated': descriptor['row_count'] > config.MAX_ROWS,
               'target': {'connection_id': cfg['connection_id'], 'sql': select, 'binds': {}, 'limit': config.MAX_ROWS, 'table': table}}
    if old:
        query('RECORD_UPDATE', {'id': payload['id'], 'kind': 'dataset', 'owner': user['id'], 'payload': json.dumps(payload, ensure_ascii=False)}, write=True)
    else:
        query('RECORD_INSERT', {'id': payload['id'], 'kind': 'dataset', 'owner': user['id'], 'payload': json.dumps(payload, ensure_ascii=False), 'created': payload['created_at']}, write=True)
    _write_descriptor(row, user, run_id, descriptor)
    return {'table': table, 'dataset_id': descriptor['dataset_id'], 'inserted_rows': len(values), 'total_rows': descriptor['row_count']}


def public_run(row):
    return {key: row[key] for key in ('id', 'source_id', 'job_id', 'started_at', 'finished_at', 'status')} | {'result': json_document(row['result_json'])}


def list_runs(user, source_id=None):
    if source_id:
        source(source_id, user)
    return [public_run(row) for row in query('API_RUN_LIST_SQLITE' if config.STORAGE == 'sqlite' else 'API_RUN_LIST', {'owner': user['id'], 'source_id': source_id})]


def begin_run(source_id, user, job=None):
    enabled()
    source(source_id, user)
    run_id, now = uuid.uuid4().hex, time.time()
    with connection() as conn:
        with closing(conn.cursor()) as cursor:
            if _execute(cursor, 'API_SOURCE_CLAIM', dict(id=source_id, owner=user['id'], token=run_id, until=now + LOCK_SECONDS)) != 1:
                raise HTTPException(409, '이 수집 설정은 실행 중이거나 이전 실행 결과 확인이 필요합니다.')
            if job and _execute(cursor, 'API_JOB_ADVANCE', dict(id=job['id'], owner=user['id'], previous_due=job['next_run_at'], now=now,
                                           next_run_at=now + float(job['interval_seconds']), updated=stamp())) != 1:
                raise HTTPException(409, '배치 설정이 변경되었거나 다른 실행자가 처리했습니다.')
            _execute(cursor, 'API_RUN_INSERT', dict(id=run_id, owner=user['id'], source_id=source_id, job_id=job['id'] if job else None,
                                                   started=now, payload='{}'))
    return run_id


def collect(source_id, user, job=None):
    run_id = begin_run(source_id, user, job)
    row, storing, status, result = source(source_id, user), False, 'FAILED', {}
    try:
        fetched = fetch_source(row['config'])
        result = {key: fetched[key] for key in ('pages', 'bytes', 'row_count', 'truncated', 'warnings')}
        if fetched['rows']:
            storing = True
            result.update(append_target(row, user, run_id, fetched))
        else:
            result['inserted_rows'] = 0
            result['message'] = 'API 연결은 성공했으며 수집할 레코드가 없어 TARGET에 쓰지 않았습니다.'
        status = 'SUCCEEDED'
    except Exception as error:
        status = 'UNKNOWN' if storing else 'FAILED'
        result['message'] = ('TARGET 작업 결과를 확정할 수 없습니다. 이 설정의 자동 실행을 차단했습니다. TARGET 원본·실행 ID를 확인한 뒤 실행 잠금을 해제하세요.' if storing else
                             (error.detail if isinstance(error, HTTPException) else 'API 수집을 완료하지 못했습니다. 설정과 연결을 확인하세요.'))
    with connection() as conn:
        with closing(conn.cursor()) as cursor:
            _execute(cursor, 'API_RUN_FINISH', dict(id=run_id, owner=user['id'], finished=time.time(), status=status, payload=json.dumps(result, ensure_ascii=False)))
            if status != 'UNKNOWN':
                _execute(cursor, 'API_SOURCE_RELEASE', dict(id=source_id, owner=user['id'], token=run_id))
    return public_run(query('API_RUN_GET', {'id': run_id, 'owner': user['id']})[0])


def recover(source_id, user):
    row = source(source_id, user)
    if not row.get('lock_token'):
        return {'recovered': False, 'message': '실행 잠금이 없습니다.'}
    if float(row['lock_until']) > time.time():
        raise HTTPException(409, '실행 보호 기간(5분)이 끝난 뒤 TARGET 결과를 확인하고 해제하세요.')
    with connection() as conn:
        with closing(conn.cursor()) as cursor:
            # Conditional UPDATE locks and verifies the exact expired token.
            if _execute(cursor, 'API_SOURCE_RECOVER', dict(id=source_id, owner=user['id'], token=row['lock_token'], now=time.time())) != 1:
                raise HTTPException(409, '실행 상태가 변경되었습니다. 새로 조회한 뒤 확인하세요.')
            _execute(cursor, 'API_RUN_RECOVER', dict(id=row['lock_token'], source_id=source_id, owner=user['id'], finished=time.time(),
                     payload=json.dumps({'message': '사용자가 TARGET 결과 확인 후 실행 잠금을 해제했습니다. 이전 실행의 저장 여부는 자동 확정하지 않습니다.'}, ensure_ascii=False)))
    return {'recovered': True, 'message': '실행 잠금을 해제했습니다. 재수집하면 이미 저장된 원천 레코드가 추가될 수 있습니다.'}


def delete_source(source_id, user):
    source(source_id, user)
    token = uuid.uuid4().hex
    with connection() as conn:
        with closing(conn.cursor()) as cursor:
            if _execute(cursor, 'API_SOURCE_CLAIM', dict(id=source_id, owner=user['id'], token=token, until=time.time() + LOCK_SECONDS)) != 1:
                raise HTTPException(409, '실행 중이거나 확인이 필요한 설정은 삭제할 수 없습니다.')
            _execute(cursor, 'API_JOB_DELETE_SOURCE', dict(source_id=source_id, owner=user['id']))
            _execute(cursor, 'API_RUN_DELETE_SOURCE', dict(source_id=source_id, owner=user['id']))
            _execute(cursor, 'API_SOURCE_DELETE', dict(id=source_id, owner=user['id'], token=token))
    return {'deleted': source_id, 'target_preserved': True}


def public_job(row):
    return {key: row[key] for key in ('id', 'source_id', 'name', 'next_run_at', 'created_at', 'updated_at')} | {
        'enabled': bool(row['enabled']), 'interval_minutes': int(row['interval_seconds']) // 60}


def list_jobs(user):
    return [public_job(row) for row in query('API_JOB_LIST', {'owner': user['id']})]


def save_job(data, user, job_id=None):
    enabled()
    source(data['source_id'], user)
    old = None
    if job_id:
        rows = query('API_JOB_GET', dict(id=job_id, owner=user['id']))
        if not rows:
            raise HTTPException(404, '본인 소유의 배치 설정을 찾을 수 없습니다.')
        old = rows[0]
        if old['source_id'] != data['source_id']:
            raise HTTPException(409, '배치의 수집 설정은 변경할 수 없습니다. 새로 등록하세요.')
    now = stamp()
    params = {'id': job_id or uuid.uuid4().hex, 'owner': user['id'], 'name': data['name'].strip(),
              'interval_seconds': data['interval_minutes'] * 60, 'next_run_at': time.time() + data['interval_minutes'] * 60,
              'enabled': int(data['enabled']), 'updated': now}
    if not params['name']:
        raise HTTPException(422, '배치 이름을 입력하세요.')
    if not old:
        params.update(source_id=data['source_id'], created=now)
    try:
        query('API_JOB_UPDATE' if old else 'API_JOB_INSERT', params, write=True)
    except Exception as error:
        from backend.auth import _duplicate_key
        if _duplicate_key(error):
            raise HTTPException(409, '이 API에 배치가 이미 등록되어 있습니다. 기존 배치를 수정하세요.') from None
        raise
    return public_job(query('API_JOB_GET', dict(id=params['id'], owner=user['id']))[0])


def delete_job(job_id, user):
    if not query('API_JOB_DELETE', dict(id=job_id, owner=user['id']), write=True):
        raise HTTPException(404, '본인 소유의 배치 설정을 찾을 수 없습니다.')
    return {'deleted': job_id}


def run_due(limit=20, job_id=None):
    enabled()
    due = query('API_JOB_DUE_SQLITE' if config.STORAGE == 'sqlite' else 'API_JOB_DUE', {'now': time.time(), 'job_id': job_id})
    outcomes = []
    for job in due[:limit]:
        try:
            outcomes.append(collect(job['source_id'], {'id': job['owner_id'], 'role': job['role']}, job)['status'])
        except HTTPException as error:
            outcomes.append('SKIPPED' if error.status_code == 409 else 'FAILED')
        except Exception:
            # A crash/unknown commit leaves a durable source lock; no blind retry.
            outcomes.append('UNKNOWN')
    return {'processed': len(outcomes), 'statuses': outcomes}
