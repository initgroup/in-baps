"""Per-connection metadata visibility, separate from SQL/data authorization."""
import json
from contextlib import closing
from functools import lru_cache
from fastapi import HTTPException
import oracledb
from backend import config, target_database as target
from backend.database import connection, statements, utcnow

OBJECT_TYPES = ('TABLE', 'VIEW', 'MATERIALIZED VIEW', 'FUNCTION', 'PROCEDURE', 'PACKAGE', 'INDEX', 'TRIGGER', 'SEQUENCE')
MAX_OBJECTS = 1000


@lru_cache
def system_names():
    contract = json.loads((config.ROOT / 'database/DDL/schema_contract.json').read_text(encoding='utf-8'))
    names = set(contract['tables']) | set(contract['indexes'])
    names.update(c[0] for spec in contract['tables'].values() for c in spec['constraints'])
    return names | {'INIT$_VW_BAPS_CATALOG', 'INIT$_SP_BAPS_SESSION_PURGE'}


def is_system(name, parent=None):
    return any(value and (value.upper() in system_names() or any(value.upper().startswith(p) for p in target.PROTECTED)) for value in (name, parent))


def settings(record, user):
    restricted = target.is_restricted(record)
    can_schema = not restricted or user['role'] == 'admin'
    saved = record['config'].get('object_filter', {})
    scope = saved.get('scope', 'schema' if can_schema else 'owned')
    if not can_schema:
        scope = 'owned'
    return {'filter': {'scope': scope, 'hide_system': saved.get('hide_system', True),
                       'exclude_prefixes': saved.get('exclude_prefixes', []), 'exclude_types': saved.get('exclude_types', [])},
            'restricted_system': restricted, 'can_schema': can_schema}


def save_settings(record, user, values):
    if values['scope'] == 'schema' and not settings(record, user)['can_schema']:
        raise HTTPException(403, 'SYSTEM 공유 연결의 전체 목록은 관리자만 볼 수 있습니다.')
    prefixes = []
    for value in values['exclude_prefixes']:
        value = value.strip()
        if not value or len(value.encode('utf-8')) > 128 or any(ord(c) < 32 for c in value):
            raise HTTPException(422, '제외 접두어는 공백이 아닌 1~128바이트 문자열로 입력하세요.')
        if value.upper() not in {p.upper() for p in prefixes}:
            prefixes.append(value)
    values = {**values, 'exclude_prefixes': prefixes, 'exclude_types': list(dict.fromkeys(values['exclude_types']))}
    with connection() as conn:
        with closing(conn.cursor()) as cur:
            cfg = target.locked_connection_config(conn, cur, record['id'], user)
            cfg['object_filter'] = values
            if config.STORAGE == 'oracle':
                cur.setinputsizes(config_json=oracledb.DB_TYPE_CLOB)
            cur.execute(statements()['CONNECTION_UPDATE_CONFIG'], {'id': record['id'], 'owner': user['id'],
                        'config_json': json.dumps(cfg, ensure_ascii=False), 'updated': utcnow()})
    return settings(target.get_connection(record['id'], user), user)


def object_info(row, restricted, owned):
    name, kind, status, parent = row
    protected = is_system(name, parent)
    metadata_only = protected or (restricted and name not in owned and parent not in owned)
    return {'name': name, 'type': kind, 'status': status, 'system_object': protected,
            'metadata_only': metadata_only, 'access_note': '시스템 보호 · 목록만 표시' if protected else '회원 소유 범위 밖 · 목록만 표시' if metadata_only else ''}


def list_objects(record, user, search=''):
    policy = settings(record, user)
    filters = policy['filter']
    owned = target.managed_tables(user, record['id']) if policy['restricted_system'] or filters['scope'] == 'owned' else set()
    result = {**policy, 'objects': [], 'owned_table_count': len(owned), 'excluded_count': 0,
              'truncated': False, 'limit': MAX_OBJECTS, 'types': list(OBJECT_TYPES)}
    if filters['scope'] == 'owned' and not owned:
        return result
    with target.target_connection(record) as conn:
        with conn.cursor() as cur:
            # Search is a literal substring: %, _ and backslash are not wildcards.
            pattern = search.upper().replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
            cur.execute(statements()['TARGET_BROWSER_OBJECTS'], {'search': '%' + pattern + '%' if search else None})
            while True:
                batch = cur.fetchmany(500)
                if not batch:
                    break
                for row in batch:
                    if filters['scope'] == 'owned' and row[0] not in owned and row[3] not in owned:
                        continue
                    info = object_info(row, policy['restricted_system'], owned)
                    if (filters['hide_system'] and info['system_object']) or info['type'] in filters['exclude_types'] or any(info['name'].upper().startswith(p.upper()) for p in filters['exclude_prefixes']):
                        result['excluded_count'] += 1
                        continue
                    if len(result['objects']) >= MAX_OBJECTS:
                        result['truncated'] = True
                        return result
                    result['objects'].append(info)
    return result


def require_ddl(cur, record, user, name, kind):
    target.identifier(name)
    cur.execute(statements()['TARGET_BROWSER_OBJECT'], {'name': name, 'type': kind})
    row = cur.fetchone()
    if not row:
        raise HTTPException(404, '현재 스키마에서 해당 오브젝트를 찾을 수 없습니다.')
    restricted = target.is_restricted(record)
    info = object_info(row, restricted, target.managed_tables(user, record['id']) if restricted else set())
    if info['metadata_only']:
        raise HTTPException(403, '이 오브젝트는 이름·유형·상태만 확인할 수 있습니다. 목록 설정은 데이터·DDL 접근 권한을 변경하지 않습니다.')
