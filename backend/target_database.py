"""Owned Oracle targets, encrypted credentials and bounded SQL execution.

Patterns adapted from IN-EDITAONE M99001/M99002/target_database/security:
server-side connection ownership, separate SYSTEM metadata and TARGET sessions,
named dictionary SQL, finite call timeout, bound values and transaction cleanup.
No credential fallback and no implicit target/schema provisioning.
"""
import base64
import hashlib
import json
import math
import os
import re
import time
import uuid
from contextlib import closing, contextmanager
from datetime import date, datetime
from decimal import Decimal

import oracledb
import sqlglot
from cryptography.fernet import Fernet, InvalidToken
from fastapi import HTTPException
from sqlglot import exp
from sqlglot.optimizer.scope import Scope, traverse_scope

from backend import config
from backend.analytics import clean_rows, infer_columns
from backend.database import connection, get_record, json_document, list_records, put_record, query, statements, utcnow

MANAGED_PREFIX = 'INIT$_TB_BAPS_C_'
PROTECTED = ('INIT$_TB_BAPS_MEMBER', 'INIT$_TB_BAPS_SESSION', 'INIT$_TB_BAPS_CONNECTION',
             'INIT$_TB_BAPS_HISTORY', 'INIT$_TB_BAPS_RECORD', 'INIT$_TB_BAPS_SCHEMA')
SAFE_ANONYMOUS = {'NVL', 'NVL2', 'DECODE', 'TO_CHAR', 'TO_DATE', 'TO_TIMESTAMP', 'TO_NUMBER',
                  'TRUNC', 'ROUND', 'REGEXP_REPLACE', 'REGEXP_SUBSTR', 'REGEXP_LIKE',
                  'ADD_MONTHS', 'MONTHS_BETWEEN', 'LAST_DAY', 'INSTR', 'SUBSTR', 'LENGTH',
                  'LISTAGG', 'MEDIAN', 'STDDEV', 'VARIANCE', 'RATIO_TO_REPORT'}


def cipher():
    secret = os.getenv('BAPS_SECRET_KEY', '').strip()
    if len(secret) < 32:
        raise HTTPException(503, 'TARGET DB 암호화를 위한 BAPS_SECRET_KEY 설정이 필요합니다.')
    return Fernet(base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest()))


def encrypt(value):
    return 'fernet:' + cipher().encrypt(value.encode()).decode()


def decrypt(value):
    try:
        if not value.startswith('fernet:'):
            raise ValueError()
        return cipher().decrypt(value[7:].encode()).decode()
    except (InvalidToken, ValueError):
        raise HTTPException(503, '저장된 연결 암호를 해독할 수 없습니다. 관리자가 암호화 키를 확인해야 합니다.')


def get_connection(connection_id, user):
    rows = query('CONNECTION_GET', {'id': connection_id, 'owner': user['id']})
    if not rows:
        raise HTTPException(404, '본인 소유의 TARGET DB 연결을 선택하세요.')
    result = rows[0]
    result['config'] = json_document(result.pop('config_json'))
    return result


def connection_type(dsn):
    value = dsn.strip()
    if value.startswith('('):
        return 'descriptor'
    return 'tns' if re.fullmatch(r'[\w.$#-]+', value) else 'easy'


def connection_options():
    """Only publish alias names and readiness, never wallet contents or paths."""
    wallet = config.setting('DB_WALLET_PATH')
    result = {'tns_aliases': [], 'profile_configured': bool(wallet), 'wallet_available': False,
              'driver_mode': 'thin' if oracledb.is_thin_mode() else 'thick', 'profile_error': ''}
    if wallet:
        folder = config.project_path(wallet)
        try:
            params = oracledb.ConnectParams(config_dir=str(folder))
            result['tns_aliases'] = sorted(params.get_network_service_names())
            result['wallet_available'] = (folder / ('ewallet.pem' if oracledb.is_thin_mode() else 'cwallet.sso')).is_file()
        except (oracledb.Error, OSError):
            result['profile_error'] = '서버 TNS 목록을 읽지 못했습니다. 관리자에게 네트워크 프로필 설정을 확인해 주세요.'
    return result


def public_connection(row):
    cfg = row.get('config') or json_document(row['config_json'])
    username, dsn, wallet = cfg.get('username', ''), cfg.get('dsn', ''), cfg.get('wallet_profile', False)
    if cfg.get('mode') == 'system':
        cloud = config.setting('DB_MODE', 'local').lower() == 'cloud'
        username = config.setting('DB_USER_CLD' if cloud else 'DB_USER_LOC')
        dsn = config.setting('DB_DSN_CLD') if cloud else f"{config.setting('DB_HOST', '127.0.0.1')}:{config.setting('DB_PORT', '1521')}/{config.setting('DB_SERVICE', 'ORCLCDB')}"
        wallet = bool(config.setting('DB_WALLET_PATH'))
    return {'id': row['id'], 'name': row['name'], 'username': username,
            'dsn': dsn, 'mode': cfg.get('mode', 'direct'),
            'connection_type': cfg.get('connection_type') or connection_type(dsn),
            'wallet_profile': wallet, 'allow_dml': cfg.get('allow_dml', False),
            'has_password': bool(cfg.get('password_enc')) or cfg.get('mode') == 'system',
            'created_at': row['created_at'], 'updated_at': row['updated_at']}


def prepare_connection_config(data, previous=None):
    """Used by both save and unsaved tests, with identical credential handling."""
    if previous and previous['config'].get('mode') == 'system':
        raise HTTPException(409, '서버 DB 공유 연결은 상세보기에서 확인하고 서버 환경설정으로 관리하세요.')
    username, dsn = data['username'].strip(), data['dsn'].strip()
    if not username or not dsn or username.upper() in ('SYS', 'SYSTEM'):
        raise HTTPException(422, '일반 업무 DB 계정과 DSN을 입력하세요. SYS/SYSTEM은 지원하지 않습니다.')
    method = data.get('connection_type') or connection_type(dsn)
    if method not in ('easy', 'tns', 'descriptor'):
        raise HTTPException(422, '지원하는 접속 방식을 선택하세요.')
    if method != connection_type(dsn):
        raise HTTPException(422, '선택한 접속 방식과 DSN 형식이 다릅니다. TNS 별칭, host:port/service 또는 (DESCRIPTION=...) 형식을 확인하세요.')
    password = data.get('password', '')
    old = previous['config'].get('password_enc') if previous else None
    if not password and not old:
        raise HTTPException(422, 'DB 비밀번호를 입력하세요.')
    cfg = {'mode': 'direct', 'username': username, 'dsn': dsn, 'connection_type': method,
           'password_enc': encrypt(password) if password else old,
           'wallet_profile': data.get('wallet_profile', False), 'allow_dml': data.get('allow_dml', False)}
    if previous and previous['config'].get('managed_tables'):
        cfg['managed_tables'] = previous['config']['managed_tables']
    return cfg


def save_connection(user, data, connection_id=None, system=False):
    previous = get_connection(connection_id, user) if connection_id else None
    if previous and previous['config'].get('mode') == 'system' and not system:
        raise HTTPException(409, 'SYSTEM 공유 연결은 삭제 후 다시 등록하세요.')
    if system:
        if user['role'] != 'admin' or config.STORAGE != 'oracle':
            raise HTTPException(403, 'Oracle SYSTEM DB를 사용하는 관리자만 공유 연결을 등록할 수 있습니다.')
        cfg = {'mode': 'system', 'allow_dml': True, 'username': '', 'dsn': ''}
    else:
        cfg = prepare_connection_config(data, previous)
    identifier = connection_id or uuid.uuid4().hex
    now = utcnow()
    params = {'id': identifier, 'owner': user['id'], 'name': data['name'].strip(),
              'config_json': json.dumps(cfg, ensure_ascii=False), 'updated': now}
    if not params['name']:
        raise HTTPException(422, '연결 이름을 입력하세요.')
    if not previous:
        params['created'] = now
    with connection() as conn:
        with closing(conn.cursor()) as cur:
            if previous:
                current = locked_connection_config(conn, cur, identifier, user)
                cfg['managed_tables'] = current.get('managed_tables', [])
                if 'object_filter' in current:
                    cfg['object_filter'] = current['object_filter']
                if not data.get('password'):
                    cfg['password_enc'] = current.get('password_enc', '')
                params['config_json'] = json.dumps(cfg, ensure_ascii=False)
            if config.STORAGE == 'oracle':
                cur.setinputsizes(config_json=oracledb.DB_TYPE_CLOB)
            cur.execute(statements()['CONNECTION_UPDATE' if previous else 'CONNECTION_INSERT'], params)
    return public_connection(get_connection(identifier, user))


def system_username():
    cloud = config.setting('DB_MODE', 'local').lower() == 'cloud'
    return config.setting('DB_USER_CLD' if cloud else 'DB_USER_LOC').upper()


def is_restricted(record):
    # A reused SYSTEM login is intentionally restricted even if the DSN differs.
    cfg = record['config']
    return cfg.get('mode') == 'system' or cfg.get('username', '').upper() == system_username()


def check_connection(record):
    with target_connection(record) as conn:
        with conn.cursor() as cur:
            cur.execute(statements()['TARGET_IDENTITY'])
            schema = cur.fetchone()[0]
        return {'connected': True, 'schema': schema, 'version': conn.version,
                'restricted_system': is_restricted(record)}


@contextmanager
def target_connection(record):
    cfg = record['config']
    if cfg.get('mode') == 'system':
        args = config.oracle_connect_args()
    else:
        args = {'user': cfg['username'], 'password': decrypt(cfg['password_enc']), 'dsn': cfg['dsn'],
                'tcp_connect_timeout': 10, 'retry_count': 0}
        if cfg.get('wallet_profile'):
            wallet = config.setting('DB_WALLET_PATH')
            if not wallet:
                raise HTTPException(422, '서버 Oracle wallet 프로필이 설정되지 않았습니다.')
            path = str(config.project_path(wallet))
            args.update(config_dir=path, wallet_location=path)
            if config.setting('DB_WALLET_PASSWORD'):
                args['wallet_password'] = config.setting('DB_WALLET_PASSWORD')
    conn = None
    try:
        conn = oracledb.connect(**args)
        conn.call_timeout = 15000
        yield conn
    except oracledb.Error as error:
        detail = error.args[0] if error.args else None
        code = str(getattr(detail, 'full_code', '') or '')
        code = code if re.fullmatch(r'(ORA|DPY|DPI)-\d+', code) else 'DB_ERROR'
        raise HTTPException(422, f'TARGET DB 작업을 완료하지 못했습니다. 연결·권한·SQL을 확인하세요. ({code})') from None
    finally:
        if conn is not None:
            try:
                conn.rollback()
            finally:
                conn.close()


def identifier(name):
    if not isinstance(name, str) or not name or len(name.encode('utf-8')) > 128 or '\x00' in name:
        raise HTTPException(422, '유효한 DB 오브젝트 이름을 입력하세요.')
    return '"' + name.replace('"', '""') + '"'


def managed_tables(user, connection_id):
    record = get_connection(connection_id, user)
    stored = set(record['config'].get('managed_tables', []))
    return stored | {row.get('target', {}).get('table') for row in list_records('dataset', user['id'])
                     if row.get('target', {}).get('connection_id') == connection_id and row.get('target', {}).get('table')}


def require_table(name, record, user):
    if any(name.upper().startswith(prefix) for prefix in PROTECTED):
        raise HTTPException(403, 'SYSTEM 보안·회원·설정 테이블은 DBMS에서 접근할 수 없습니다.')
    if is_restricted(record) and name not in managed_tables(user, record['id']):
        raise HTTPException(403, 'SYSTEM 공유 계정에서는 본인이 적재한 TARGET 테이블만 접근할 수 있습니다.')
    return identifier(name)


def validate_sql(sql, record, user, dml=False):
    if not sql.strip() or len(sql) > 50000:
        raise HTTPException(422, 'SQL은 1~50,000자여야 합니다.')
    try:
        statements_parsed = sqlglot.parse(sql, read='oracle')
        if len(statements_parsed) != 1 or statements_parsed[0] is None:
            raise ValueError()
        tree = statements_parsed[0]
    except (sqlglot.errors.ParseError, ValueError):
        raise HTTPException(422, 'Oracle 문법의 단일 SQL 문장을 입력하세요.')
    allowed = (exp.Insert, exp.Update, exp.Delete) if dml else (exp.Select, exp.Union, exp.Intersect, exp.Except, exp.Subquery)
    if not isinstance(tree, allowed):
        raise HTTPException(422, 'INSERT/UPDATE/DELETE만 지원합니다.' if dml else 'SELECT 또는 WITH SELECT 조회만 지원합니다.')
    forbidden_names = {'Command', 'Create', 'Drop', 'Alter', 'Grant', 'Revoke', 'Execute', 'Merge',
                       'Into', 'Returning', 'Lock', 'NextValueFor', 'Transaction', 'Commit', 'Rollback', 'Pragma'}
    for node in tree.walk():
        if node.__class__.__name__ in forbidden_names:
            raise HTTPException(422, 'DDL, PL/SQL, 잠금 조회 및 트랜잭션 제어는 SQL 작업창에서 허용하지 않습니다.')
        if isinstance(node, exp.Anonymous) and node.name.upper() not in SAFE_ANONYMOUS:
            raise HTTPException(422, '이 사용자 정의/패키지 함수는 SQL 작업창에서 지원하지 않습니다.')
        if isinstance(node, exp.Dot) and isinstance(node.expression, exp.Func):
            raise HTTPException(422, '패키지 함수 실행은 허용하지 않습니다.')
        if isinstance(node, exp.Column) and node.name.upper() in ('NEXTVAL', 'CURRVAL'):
            raise HTTPException(422, '시퀀스 실행은 조회 작업창에서 허용하지 않습니다.')
    cte_references = set()
    for scope in traverse_scope(tree):
        for table in scope.tables:
            if isinstance(scope.sources.get(table.alias_or_name), Scope):
                cte_references.add(id(table))
    for table in tree.find_all(exp.Table):
        if id(table) in cte_references and not table.db and not table.catalog:
            continue
        if table.name.upper() == 'DUAL' and not dml and not table.db and not table.catalog:
            continue
        if not isinstance(table.this, exp.Identifier) or table.db or table.catalog or '@' in table.name:
            raise HTTPException(422, '선택한 계정의 스키마 내 테이블만 조회할 수 있습니다. DB 링크는 지원하지 않습니다.')
        require_table(table.name if table.this.args.get('quoted') else table.name.upper(), record, user)
    return sql.strip().rstrip(';').strip()


def checked_binds(binds):
    if not isinstance(binds, dict) or len(binds) > 100:
        raise HTTPException(422, '바인드 변수는 최대 100개의 JSON 객체입니다.')
    for key, value in binds.items():
        if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_]*', key) or key.lower().startswith('baps_'):
            raise HTTPException(422, '바인드 이름은 영문으로 시작하며 baps_ 접두어는 예약되어 있습니다.')
        if not isinstance(value, (str, int, float, bool, date, datetime, Decimal, type(None))) or len(str(value)) > 10000:
            raise HTTPException(422, '바인드 값은 단순 값이며 10,000자 이하여야 합니다.')
    return binds


def db_value(value):
    if hasattr(value, 'read'):
        value = value.read(1, 10001)
    if isinstance(value, bytes):
        return '[BINARY DATA]'
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        numeric = float(value)
        return numeric if math.isfinite(numeric) and Decimal(str(numeric)) == value else str(value)
    if isinstance(value, int) and abs(value) > 9007199254740991:
        return str(value)
    if isinstance(value, float) and not math.isfinite(value):
        return str(value)
    if isinstance(value, str) and len(value) > 10000:
        return value[:10000] + '…'
    return value


def fetch_query(record, user, sql, binds=None, limit=500, offset=0):
    if not 1 <= limit <= config.MAX_ROWS or not 0 <= offset <= 1000000:
        raise HTTPException(422, '조회 행 범위를 확인하세요.')
    statement = validate_sql(sql, record, user)
    params = checked_binds(binds or {}).copy()
    params.update(baps_offset=offset, baps_limit=limit + 1)
    started = time.monotonic()
    with target_connection(record) as conn:
        with conn.cursor() as cur:
            cur.execute(statements()['TARGET_READ_ONLY'])
            cur.arraysize = min(limit + 1, 500)
            cur.execute(f'SELECT * FROM ({statement}) BAPS_Q OFFSET :baps_offset ROWS FETCH NEXT :baps_limit ROWS ONLY', params)
            names = [column[0] for column in cur.description]
            if len(names) != len(set(names)) or len(names) > config.MAX_COLUMNS:
                raise HTTPException(422, '컬럼 별칭을 고유하게 지정하고 100개 이하로 조회하세요.')
            rows, output_bytes, truncated = [], 0, False
            while True:
                batch = cur.fetchmany(min(500, limit + 1 - len(rows)))
                if not batch:
                    break
                for row in batch:
                    item = dict(zip(names, [db_value(v) for v in row]))
                    output_bytes += len(json.dumps(item, ensure_ascii=False, default=str).encode('utf-8'))
                    if len(rows) >= limit or output_bytes > config.MAX_BYTES:
                        truncated = True
                        break
                    rows.append(item)
                if truncated:
                    break
    columns = infer_columns(rows) if rows else [{'name': n, 'type': 'string'} for n in names]
    return {'rows': rows, 'columns': columns, 'row_count': len(rows), 'limit': limit, 'offset': offset,
            'truncated': truncated, 'max_result_bytes': config.MAX_BYTES,
            'elapsed_ms': round((time.monotonic() - started) * 1000)}


def materialize_dataset(dataset, user):
    target = dataset.get('target')
    if not target:
        return dataset
    record = get_connection(target['connection_id'], user)
    result = fetch_query(record, user, target['sql'], target.get('binds', {}), target.get('limit', config.MAX_ROWS))
    return {**dataset, 'rows': result['rows'], 'columns': result['columns'], 'row_count': result['row_count'],
            'truncated': result['truncated'], 'queried_at': utcnow()}


def register_dataset(record, user, name, sql, binds, module, limit=20000, table=None, sample=False, result=None):
    if module not in config.ENABLED_MODULES:
        raise HTTPException(403, '선택한 모듈이 활성화되어 있지 않습니다.')
    if result is None:
        result = fetch_query(record, user, sql, binds, limit)
    payload = {'id': uuid.uuid4().hex, 'name': name, 'module': module, 'source': 'target-sql',
               'description': '명시적으로 생성하여 실제 TARGET DB에 적재한 합성 샘플' if sample else 'TARGET DB SQL 실시간 조회',
               'synthetic': sample, 'created_at': utcnow(), 'row_count': result['row_count'],
               'columns': result['columns'], 'truncated': result.get('truncated', False),
               'target': {'connection_id': record['id'], 'sql': sql, 'binds': binds, 'limit': limit}}
    if table:
        payload['target']['table'] = table
    put_record('dataset', user['id'], payload)
    return payload


def target_columns(record, user, table):
    require_table(table, record, user)
    with target_connection(record) as conn:
        with conn.cursor() as cur:
            cur.execute(statements()['TARGET_COLUMNS'], {'table_name': table})
            names = [c[0].lower() for c in cur.description]
            return [dict(zip(names, row)) for row in cur.fetchall()]


def execute_dml(record, user, sql, binds, commit=False, max_rows=1000):
    if not record['config'].get('allow_dml'):
        raise HTTPException(403, 'DB 설정에서 이 연결의 DML 쓰기를 먼저 허용하세요.')
    statement = validate_sql(sql, record, user, dml=True)
    checked_binds(binds)
    with target_connection(record) as conn:
        with conn.cursor() as cur:
            cur.execute(statement, binds)
            count = cur.rowcount
            if count > max_rows:
                raise HTTPException(422, f'1회 변경은 {max_rows:,}행 이하입니다. 조건을 좁혀 다시 실행하세요.')
            if commit:
                conn.commit()
    return {'affected_rows': count, 'committed': commit, 'mode': 'commit' if commit else 'preview_rolled_back'}


def ddl_template(group, filename, **values):
    return (config.ROOT / 'database' / group / filename).read_text(encoding='utf-8').format(**values).strip()


def persist_ddl(record, user, table, ddl):
    """Keep each actual DDL as a portable SQL file; filenames contain no DB secrets."""
    owner = hashlib.sha256(user['id'].encode()).hexdigest()[:24]
    folder = config.ROOT / '.runtime' / 'ddl' / owner
    folder.mkdir(parents=True, exist_ok=True)
    filename = uuid.uuid4().hex + '.sql'
    path = folder / filename
    path.write_text('-- IN-BAPS TARGET object definition; execute explicitly on the intended schema.\n' + ddl + ';\n', encoding='utf-8')
    return str(path.relative_to(config.ROOT)).replace('\\', '/')


def locked_connection_config(conn, cursor, connection_id, user):
    if config.STORAGE == 'oracle':
        cursor.execute(statements()['CONNECTION_LOCK'], {'id': connection_id, 'owner': user['id']})
    else:
        conn.execute('BEGIN IMMEDIATE')
        cursor.execute(statements()['CONNECTION_GET'], {'id': connection_id, 'owner': user['id']})
    row = cursor.fetchone()
    if not row:
        raise HTTPException(404, 'TARGET DB 연결이 변경되거나 삭제되었습니다.')
    raw = row[0] if config.STORAGE == 'oracle' else row[3]
    return json_document(raw)


def remember_table(record, user, table):
    with connection() as conn:
        with closing(conn.cursor()) as cur:
            cfg = locked_connection_config(conn, cur, record['id'], user)
            cfg['managed_tables'] = sorted(set(cfg.get('managed_tables', [])) | {table})
            params = {'id': record['id'], 'owner': user['id'],
                      'config_json': json.dumps(cfg, ensure_ascii=False), 'updated': utcnow()}
            if config.STORAGE == 'oracle':
                cur.setinputsizes(config_json=oracledb.DB_TYPE_CLOB)
            cur.execute(statements()['CONNECTION_UPDATE_CONFIG'], params)


def import_rows(record, user, name, rows, module='C-BAP', sample=False):
    if module not in config.ENABLED_MODULES:
        raise HTTPException(403, '선택한 모듈이 활성화되어 있지 않습니다.')
    if not record['config'].get('allow_dml'):
        raise HTTPException(403, 'TARGET 연결의 DML 쓰기를 허용한 뒤 적재하세요.')
    rows, columns = clean_rows(rows)
    table = MANAGED_PREFIX + uuid.uuid4().hex[:12].upper()
    cols = [f'C{i:03d}' for i in range(1, len(columns) + 1)]
    definitions = ', '.join(f'{identifier(c)} ' + ('NUMBER' if column['type'] == 'number' else 'VARCHAR2(4000 BYTE)') for c, column in zip(cols, columns))
    values = []
    for row in rows:
        record_values = []
        for col in columns:
            value = row.get(col['name'])
            text_value = None if value is None else str(value)
            if text_value is not None and len(text_value.encode('utf-8')) > 4000:
                raise HTTPException(422, 'TARGET 적재 셀 값은 UTF-8 기준 4,000바이트 이하여야 합니다.')
            record_values.append(Decimal(text_value) if text_value not in (None, '') and col['type'] == 'number' else (None if col['type'] == 'number' else text_value))
        values.append([len(values) + 1, *record_values])
    select = 'SELECT ' + ', '.join(f'{identifier(c)} AS {identifier(column["name"])}' for c, column in zip(cols, columns)) + f' FROM {identifier(table)}'
    create_sql = ddl_template('DDL', 'target_collection.sql.template', table=identifier(table), columns=definitions, constraint=identifier('INIT$_PK_BAPS_' + table[-12:]))
    ddl_file = persist_ddl(record, user, table, create_sql)
    with target_connection(record) as conn:
        with conn.cursor() as cur:
            cur.execute(create_sql)
            insert_columns = ['BAPS_ROW_ID', *cols]
            cur.setinputsizes(oracledb.DB_TYPE_NUMBER, *[oracledb.DB_TYPE_NUMBER if c['type'] == 'number' else 4000 for c in columns])
            cur.executemany(f'INSERT INTO {identifier(table)} ({", ".join(identifier(c) for c in insert_columns)}) VALUES ({", ".join(":" + str(i) for i in range(1, len(insert_columns) + 1))})', values)
        conn.commit()
    result = {'rows': rows, 'columns': columns, 'row_count': len(rows), 'truncated': False}
    try:
        remember_table(record, user, table)
        payload = register_dataset(record, user, name, select, {}, module, table=table, sample=sample, result=result)
    except Exception:
        raise HTTPException(500, f'TARGET 테이블 {table} 적재는 완료했으나 SYSTEM 카탈로그 등록에 실패했습니다. 테이블은 보존되었으며 관리자에게 DDL 기록을 확인해 달라고 요청하세요.') from None
    return {**payload, 'ddl_file': ddl_file}


def column_definition(column):
    name = identifier(column['name'])
    datatype = column['type']
    if datatype == 'VARCHAR2':
        datatype += f'({column.get("length", 255)} BYTE)'
    elif datatype == 'NUMBER' and column.get('precision') is not None:
        datatype += f'({column["precision"]},{column.get("scale", 0)})'
    return f'{name} {datatype}' + ('' if column.get('nullable', True) else ' NOT NULL')


def create_table(record, user, name, columns, primary_key):
    if not record['config'].get('allow_dml'):
        raise HTTPException(403, 'DB 설정에서 DML 쓰기를 허용하세요.')
    # User-owned TARGET objects do not follow the IN-BAPS SYSTEM naming scheme.
    # Quote the supplied name as one identifier; never interpolate SQL syntax.
    quoted = identifier(name)
    if any(name.upper().startswith(p) for p in PROTECTED):
        raise HTTPException(422, 'IN-BAPS SYSTEM 보호 오브젝트 이름은 사용할 수 없습니다.')
    names = [c['name'] for c in columns]
    if len(names) != len(set(names)) or set(primary_key) - set(names):
        raise HTTPException(422, '중복 컬럼 또는 존재하지 않는 기본 키 컬럼을 확인하세요.')
    definitions = [column_definition(c) for c in columns]
    if primary_key:
        definitions.append('PRIMARY KEY (' + ', '.join(identifier(k) for k in primary_key) + ')')
    sql = ddl_template('DDL', 'target_table.sql.template', table=quoted, definitions=',\n  '.join(definitions))
    file = persist_ddl(record, user, name, sql)
    with target_connection(record) as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
    try:
        remember_table(record, user, name)
    except Exception:
        raise HTTPException(500, f'{name} 생성은 완료했으나 SYSTEM 등록에 실패했습니다. 오브젝트와 DDL 파일은 보존되었습니다.') from None
    return {'table': name, 'ddl': sql, 'ddl_file': file, 'created': True}


def add_column(record, user, table, column):
    if not record['config'].get('allow_dml'):
        raise HTTPException(403, 'DB 설정에서 DML 쓰기를 허용하세요.')
    quoted = require_table(table, record, user)
    if not column.get('nullable', True):
        raise HTTPException(422, '기존 행 보존을 위해 새 컬럼은 NULL 허용으로 추가하세요.')
    sql = ddl_template('ALT', 'target_add_column.sql.template', table=quoted, definition=column_definition(column))
    file = persist_ddl(record, user, table, sql)
    with target_connection(record) as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
    return {'table': table, 'ddl': sql, 'ddl_file': file, 'altered': True}
