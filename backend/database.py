"""Named SQL loader and transaction boundary; no startup Oracle DDL."""
import json
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from functools import lru_cache
from threading import Lock
from backend import config

_pool = None
_pool_lock = Lock()


def system_pool():
    """One bounded, thread-safe pool per worker, used only for SYSTEM metadata."""
    global _pool
    with _pool_lock:
        if _pool is None:
            import oracledb
            try:
                maximum = int(config.setting('BAPS_SYSTEM_POOL_MAX', '4'))
            except ValueError:
                maximum = 4
            _pool = oracledb.create_pool(
                **config.oracle_connect_args(), min=1, max=max(1, min(maximum, 16)),
                increment=1, getmode=oracledb.POOL_GETMODE_TIMEDWAIT,
                wait_timeout=15000, timeout=300, ping_interval=60, stmtcachesize=50,
            )
        return _pool


def close_pool():
    """Called after requests drain at application shutdown."""
    global _pool
    with _pool_lock:
        if _pool is not None:
            _pool.close()
            _pool = None


def utcnow():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')


@lru_cache(maxsize=1)
def statements():
    output = {}
    for path in sorted((config.ROOT / 'database' / 'SQL').glob('*.sql')):
        parts = re.split(r'^-- \[([A-Z_]+)\]\s*$', path.read_text(encoding='utf-8'), flags=re.M)
        for i in range(1, len(parts), 2):
            if parts[i] in output:
                raise RuntimeError('Duplicate SQL ID: ' + parts[i])
            output[parts[i]] = parts[i + 1].strip().rstrip(';')
    if not output:
        raise RuntimeError('No runtime SQL files found in database/SQL.')
    return output


@contextmanager
def connection(*, commit=True):
    if config.STORAGE == 'oracle':
        conn = system_pool().acquire()
    elif config.STORAGE == 'sqlite':
        config.DATA_DIR.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(config.DATA_DIR / 'inbaps.db'), timeout=15)
        conn.execute('PRAGMA foreign_keys=ON')
    else:
        raise RuntimeError('BAPS_STORAGE must be sqlite or oracle.')
    try:
        if config.STORAGE == 'oracle':
            conn.call_timeout = 15000
        yield conn
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def initialize():
    if config.STORAGE == 'sqlite':
        with connection() as conn:
            conn.executescript((config.ROOT / 'database' / 'DDL' / 'sqlite.sql').read_text(encoding='utf-8'))
    # Oracle schema is explicitly installed with: python -m backend.migrate apply.


def query(sql_id, params=None, write=False):
    # A SELECT does not need a COMMIT network round trip. Pool release rolls
    # back any outstanding transaction; callers with writes still commit.
    with connection(commit=write) as conn:
        cursor = conn.cursor()
        try:
            if config.STORAGE == 'oracle' and params and 'payload' in params:
                import oracledb
                cursor.setinputsizes(payload=oracledb.DB_TYPE_CLOB)
            # SYSTEM JSON is already consumed in full. Fetch CLOB text with the
            # result batch instead of issuing a LOB.read() round trip per row.
            fetch_options = {'fetch_lobs': False} if config.STORAGE == 'oracle' and not write else {}
            cursor.execute(statements()[sql_id], params or {}, **fetch_options)
            if write:
                return cursor.rowcount
            names = [column[0].lower() for column in cursor.description]
            return [dict(zip(names, [v.read() if hasattr(v, 'read') else v for v in row])) for row in cursor.fetchall()]
        finally:
            cursor.close()


def put_record(kind, owner, payload):
    params = dict(id=payload['id'], kind=kind, owner=owner, payload=json.dumps(payload, ensure_ascii=False, allow_nan=False), created=payload['created_at'])
    query('RECORD_INSERT', params, write=True)
    return payload


def json_document(value):
    """Accept native Oracle JSON objects, older LOB/text and SQLite JSON text."""
    if hasattr(value, 'read'):
        value = value.read()
    document = value if isinstance(value, dict) else json.loads(value)
    if not isinstance(document, dict):
        raise ValueError('Expected a JSON document object in SYSTEM storage.')
    return document


def list_records(kind, owner):
    return [json_document(row['payload']) for row in query('RECORD_LIST', dict(kind=kind, owner=owner))]


def list_dataset_metadata(owner):
    """Remove stored row arrays in SQL before transferring/parsing catalog JSON."""
    sql_id = 'DATASET_LIST_SQLITE' if config.STORAGE == 'sqlite' else 'DATASET_LIST'
    return [json_document(row['payload']) for row in query(sql_id, {'owner': owner})]


def get_record(kind, owner, record_id):
    rows = query('RECORD_GET', dict(kind=kind, owner=owner, id=record_id))
    return json_document(rows[0]['payload']) if rows else None
