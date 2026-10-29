"""Member-owned Oracle DB settings and DBMS workbench routes."""
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from backend import config
from backend.auth import require_admin, require_user
from backend.database import list_records, query, statements
from backend import target_database as target
from backend import object_browser

router = APIRouter(prefix='/api')


def success(data):
    return {'status': 'success', 'data': data}


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid')


class ConnectionInput(StrictModel):
    name: str = Field(min_length=1, max_length=150)
    username: str = Field(min_length=1, max_length=128)
    dsn: str = Field(min_length=1, max_length=4000)
    password: str = Field(default='', max_length=256)
    wallet_profile: bool = False
    allow_dml: bool = False
    connection_type: Literal['easy', 'tns', 'descriptor'] | None = None


class ConnectionTestInput(ConnectionInput):
    connection_id: str | None = None


class SystemConnectionInput(StrictModel):
    name: str = Field(default='SYSTEM 공유 TARGET', min_length=1, max_length=150)


class ObjectFilterInput(StrictModel):
    scope: Literal['owned', 'schema']
    hide_system: bool = True
    exclude_prefixes: list[str] = Field(default_factory=list, max_length=50)
    exclude_types: list[Literal['TABLE', 'VIEW', 'MATERIALIZED VIEW', 'FUNCTION', 'PROCEDURE', 'PACKAGE', 'INDEX', 'TRIGGER', 'SEQUENCE']] = Field(default_factory=list, max_length=9)


class SQLInput(StrictModel):
    connection_id: str
    sql: str = Field(min_length=1, max_length=50000)
    binds: dict[str, Any] = Field(default_factory=dict)
    limit: int = Field(default=500, ge=1, le=config.MAX_ROWS)
    offset: int = Field(default=0, ge=0, le=1000000)


class DMLInput(StrictModel):
    connection_id: str
    sql: str = Field(min_length=1, max_length=50000)
    binds: dict[str, Any] = Field(default_factory=dict)
    commit: bool = False


class GridInput(StrictModel):
    connection_id: str
    table: str = Field(min_length=1, max_length=128)
    operation: Literal['insert', 'update', 'delete']
    values: dict[str, Any] = Field(default_factory=dict)
    original: dict[str, Any] = Field(default_factory=dict)
    commit: bool = False


class SQLDatasetInput(StrictModel):
    connection_id: str
    name: str = Field(min_length=1, max_length=150)
    sql: str = Field(min_length=1, max_length=50000)
    binds: dict[str, Any] = Field(default_factory=dict)
    module: Literal['C-BAP', 'R-BAP', 'V-BAP'] = 'R-BAP'
    limit: int = Field(default=config.MAX_ROWS, ge=1, le=config.MAX_ROWS)


class ImportInput(StrictModel):
    connection_id: str
    name: str = Field(min_length=1, max_length=150)
    rows: list[dict[str, Any]]
    module: Literal['C-BAP', 'R-BAP', 'V-BAP'] = 'C-BAP'


class SampleInput(StrictModel):
    connection_id: str
    module: Literal['C-BAP', 'R-BAP', 'V-BAP'] = 'C-BAP'


class ColumnInput(StrictModel):
    name: str = Field(min_length=1, max_length=128)
    type: Literal['VARCHAR2', 'NUMBER', 'DATE', 'TIMESTAMP'] = 'VARCHAR2'
    length: int = Field(default=255, ge=1, le=4000)
    precision: int | None = Field(default=None, ge=1, le=38)
    scale: int = Field(default=0, ge=-84, le=127)
    nullable: bool = True


class TableInput(StrictModel):
    connection_id: str
    name: str = Field(min_length=1, max_length=128)
    columns: list[ColumnInput] = Field(min_length=1, max_length=100)
    primary_key: list[str] = Field(default_factory=list, max_length=16)


class AddColumnInput(StrictModel):
    connection_id: str
    table: str = Field(min_length=1, max_length=128)
    column: ColumnInput


@router.post('/dbms/tables', status_code=201)
def create_table(payload: TableInput, user=Depends(require_user)):
    record = target.get_connection(payload.connection_id, user)
    return success(target.create_table(record, user, payload.name, [c.model_dump() for c in payload.columns], payload.primary_key))


@router.post('/dbms/columns', status_code=201)
def add_column(payload: AddColumnInput, user=Depends(require_user)):
    record = target.get_connection(payload.connection_id, user)
    return success(target.add_column(record, user, payload.table, payload.column.model_dump()))


@router.get('/connections')
def connections(user=Depends(require_user)):
    return success([target.public_connection(row) for row in query('CONNECTION_LIST', {'owner': user['id']})])


@router.get('/connections/options')
def connection_options(user=Depends(require_user)):
    return success(target.connection_options())


@router.post('/connections/test')
def test_unsaved_connection(payload: ConnectionTestInput, user=Depends(require_user)):
    previous = target.get_connection(payload.connection_id, user) if payload.connection_id else None
    cfg = target.prepare_connection_config(payload.model_dump(), previous)
    return success(target.check_connection({'config': cfg}))


@router.get('/connections/{connection_id}')
def connection_detail(connection_id: str, user=Depends(require_user)):
    return success(target.public_connection(target.get_connection(connection_id, user)))


@router.get('/connections/{connection_id}/object-filter')
def object_filter(connection_id: str, user=Depends(require_user)):
    return success(object_browser.settings(target.get_connection(connection_id, user), user))


@router.put('/connections/{connection_id}/object-filter')
def update_object_filter(connection_id: str, payload: ObjectFilterInput, user=Depends(require_user)):
    return success(object_browser.save_settings(target.get_connection(connection_id, user), user, payload.model_dump()))


@router.post('/connections', status_code=201)
def create_connection(payload: ConnectionInput, user=Depends(require_user)):
    return success(target.save_connection(user, payload.model_dump()))


@router.post('/connections/system', status_code=201)
def create_system_connection(payload: SystemConnectionInput, user=Depends(require_admin)):
    return success(target.save_connection(user, payload.model_dump(), system=True))


@router.put('/connections/{connection_id}')
def update_connection(connection_id: str, payload: ConnectionInput, user=Depends(require_user)):
    return success(target.save_connection(user, payload.model_dump(), connection_id))


@router.delete('/connections/{connection_id}')
def delete_connection(connection_id: str, user=Depends(require_user)):
    target.get_connection(connection_id, user)
    if any(row.get('target', {}).get('connection_id') == connection_id for row in list_records('dataset', user['id'])):
        raise HTTPException(409, '이 연결을 참조하는 데이터셋을 먼저 삭제하세요. TARGET 원본 테이블은 자동 삭제되지 않습니다.')
    query('CONNECTION_DELETE', {'id': connection_id, 'owner': user['id']}, write=True)
    return success({'deleted': True})


@router.post('/connections/{connection_id}/test')
def test_connection(connection_id: str, user=Depends(require_user)):
    record = target.get_connection(connection_id, user)
    return success(target.check_connection(record))


@router.get('/dbms/objects')
def objects(connection_id: str, search: str = '', user=Depends(require_user), details: bool = False):
    record = target.get_connection(connection_id, user)
    if len(search) > 128:
        raise HTTPException(422, '검색어는 128자 이하여야 합니다.')
    result = object_browser.list_objects(record, user, search)
    return success(result if details else result['objects'])


@router.get('/dbms/columns')
def columns(connection_id: str, table: str, user=Depends(require_user)):
    return success(target.target_columns(target.get_connection(connection_id, user), user, table))


@router.get('/dbms/ddl')
def ddl(connection_id: str, name: str, type: str = 'TABLE', user=Depends(require_user)):
    record = target.get_connection(connection_id, user)
    if type not in object_browser.OBJECT_TYPES:
        raise HTTPException(422, '지원하는 오브젝트 유형을 선택하세요.')
    with target.target_connection(record) as conn:
        with conn.cursor() as cur:
            object_browser.require_ddl(cur, record, user, name, type)
            cur.execute(statements()['TARGET_OBJECT_DDL'], {'object_type': type.replace(' ', '_'), 'object_name': name})
            value = cur.fetchone()[0]
            text = value.read() if hasattr(value, 'read') else value
    return success({'ddl': text})


@router.post('/dbms/query')
def execute_query(payload: SQLInput, user=Depends(require_user)):
    record = target.get_connection(payload.connection_id, user)
    return success(target.fetch_query(record, user, payload.sql, payload.binds, payload.limit, payload.offset))


@router.post('/dbms/dml')
def dml(payload: DMLInput, user=Depends(require_user)):
    record = target.get_connection(payload.connection_id, user)
    return success(target.execute_dml(record, user, payload.sql, payload.binds, payload.commit))


@router.post('/dbms/grid')
def grid(payload: GridInput, user=Depends(require_user)):
    record = target.get_connection(payload.connection_id, user)
    table = target.require_table(payload.table, record, user)
    metadata = target.target_columns(record, user, payload.table)
    valid = {c['name'] for c in metadata}
    if not valid or set(payload.values) - valid or set(payload.original) - valid:
        raise HTTPException(422, '실제 테이블 컬럼에 해당하는 값만 편집할 수 있습니다.')
    keys = {c['name'] for c in metadata if c['primary_key']}
    types = {c['name']: c['type'] for c in metadata}
    if any(types[key] in ('CLOB', 'BLOB', 'NCLOB', 'LONG', 'LONG RAW', 'RAW', 'XMLTYPE') or types[key].startswith('INTERVAL') for key in set(payload.original) | set(payload.values)):
        raise HTTPException(422, 'LOB/RAW/INTERVAL/XML 컬럼이 있는 행은 SQL DML 작업창을 사용하세요.')
    def typed_values(values):
        output = {}
        for key, value in values.items():
            if value is None or value == '':
                output[key] = None
                continue
            datatype = types[key]
            try:
                if datatype == 'DATE' or datatype.startswith('TIMESTAMP'):
                    value = datetime.fromisoformat(str(value))
                elif datatype in ('NUMBER', 'FLOAT', 'BINARY_FLOAT', 'BINARY_DOUBLE'):
                    value = Decimal(str(value))
                    if not value.is_finite():
                        raise ValueError()
            except (ValueError, InvalidOperation):
                raise HTTPException(422, f'{key} 컬럼의 날짜 또는 숫자 형식을 확인하세요.')
            output[key] = value
        return output
    original, values = typed_values(payload.original), typed_values(payload.values)
    binds = {}
    def value_bind(value):
        key = 'v' + str(len(binds))
        binds[key] = value
        return ':' + key
    if payload.operation == 'insert':
        if not payload.values:
            raise HTTPException(422, '추가할 컬럼 값을 입력하세요.')
        sql = f'INSERT INTO {table} ({", ".join(target.identifier(k) for k in values)}) VALUES ({", ".join(value_bind(v) for v in values.values())})'
    else:
        if not keys or not keys.issubset(payload.original):
            raise HTTPException(422, '행 수정/삭제에는 모든 기본 키와 조회 당시 원본 값이 필요합니다.')
        if set(payload.original) != valid:
            raise HTTPException(422, '동시 수정 검증을 위해 편집 전 모든 컬럼 값을 보내세요.')
        if any(c['type'] in ('CLOB', 'BLOB', 'NCLOB', 'LONG', 'XMLTYPE') for c in metadata):
            raise HTTPException(422, 'LOB/LONG/XML 컬럼이 있는 테이블은 SQL DML 작업창을 사용하세요.')
        where = ' AND '.join(f'{target.identifier(k)} IS NULL' if v is None else f'{target.identifier(k)} = {value_bind(v)}' for k, v in original.items())
        if payload.operation == 'delete':
            sql = f'DELETE FROM {table} WHERE {where}'
        else:
            if not payload.values:
                raise HTTPException(422, '변경할 컬럼 값을 입력하세요.')
            sql = f'UPDATE {table} SET ' + ', '.join(f'{target.identifier(k)} = {value_bind(v)}' for k, v in values.items()) + f' WHERE {where}'
    result = target.execute_dml(record, user, sql, binds, payload.commit, max_rows=1)
    if result['affected_rows'] == 0:
        raise HTTPException(409, '다른 작업에서 행이 변경되었습니다. 새로 조회한 뒤 다시 편집하세요.')
    return success(result)


@router.post('/dbms/datasets', status_code=201)
def sql_dataset(payload: SQLDatasetInput, user=Depends(require_user)):
    record = target.get_connection(payload.connection_id, user)
    return success(target.register_dataset(record, user, payload.name, payload.sql, payload.binds, payload.module, payload.limit))


def import_dataset_rows(connection_id, rows, name, module, user, collection_type='json'):
    return target.import_rows(target.get_connection(connection_id, user), user, name, rows, module, collection_type=collection_type)


@router.post('/dbms/import', status_code=201)
def import_dataset(payload: ImportInput, user=Depends(require_user)):
    return success(import_dataset_rows(payload.connection_id, payload.rows, payload.name, payload.module, user))


@router.post('/dbms/sample', status_code=201)
def sample_dataset(payload: SampleInput, user=Depends(require_user)):
    record = target.get_connection(payload.connection_id, user)
    rows = [{'MONTH': f'2026-{month:02d}-01', 'CHANNEL': channel, 'REVENUE': month * factor * 10000,
             'ORDERS': month * factor} for month in range(1, 13) for channel, factor in [('검색', 10), ('직접', 7), ('추천', 4)]]
    return success(target.import_rows(record, user, 'DB 적재 예제 · 합성 매출 데이터', rows, payload.module, sample=True))
