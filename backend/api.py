import csv
import io
import json
import uuid
from typing import Any, Literal
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from starlette.concurrency import run_in_threadpool
from backend import config
from backend.analytics import analyze, clean_rows
from backend.auth import public_user, require_admin, require_user
from backend.database import connection, get_record, json_document, list_dataset_metadata, list_records, put_record, query, utcnow
from backend.target_database import materialize_dataset
from backend.target_api import import_dataset_rows
from backend.upload_preview import parse_upload, preview_upload

router = APIRouter(prefix='/api')


def success(data):
    return {'status': 'success', 'data': data}


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid')


class DatasetInput(StrictModel):
    name: str = Field(min_length=1, max_length=150)
    rows: list[dict[str, Any]]
    source: str = Field(default='upload', max_length=40)
    module: Literal['C-BAP', 'R-BAP', 'V-BAP'] = 'C-BAP'
    description: str = Field(default='', max_length=2000)
    connection_id: str | None = None


class AnalysisInput(StrictModel):
    dataset_id: str
    method: Literal['profile', 'aggregate', 'correlation', 'text', 'descriptive', 'normality',
                    'ttest_one', 'ttest_ind', 'ttest_paired', 'anova', 'mannwhitney', 'kruskal',
                    'wilcoxon', 'chi_square', 'correlation_test', 'ols', 'logistic', 'pca', 'kmeans', 'reliability']
    group_by: str | None = None
    value: str | None = None
    aggregation: Literal['sum', 'mean', 'count', 'min', 'max'] = 'sum'
    columns: list[str] | None = None
    value2: str | None = None
    confidence: Literal[0.90, 0.95, 0.99] = 0.95
    null_mean: float = Field(default=0, ge=-1e50, le=1e50, allow_inf_nan=False)
    correlation_kind: Literal['pearson', 'spearman'] = 'pearson'
    robust: bool = True
    standardize: bool = True
    components: int = Field(default=2, ge=1, le=20)
    clusters: int = Field(default=3, ge=2, le=10)
    test_fraction: float = Field(default=0.25, ge=0.1, le=0.4, allow_inf_nan=False)


ChartType = Literal['line', 'bar', 'area', 'pie', 'scatter', 'heatmap', 'radar', 'treemap', 'sunburst', 'sankey', 'graph', 'boxplot', 'funnel', 'gauge']


class VisualizationInput(StrictModel):
    name: str = Field(min_length=1, max_length=150)
    dataset_id: str
    chart_type: ChartType
    config: dict[str, Any] = Field(default_factory=dict)


class DashboardInput(StrictModel):
    name: str = Field(min_length=1, max_length=150)
    visualization_ids: list[str] = Field(max_length=24)


def enabled(module):
    if module not in config.ENABLED_MODULES:
        raise HTTPException(403, f'{module} 모듈이 활성화되어 있지 않습니다.')


def owned(kind, user, record_id, materialize=True):
    item = get_record(kind, user['id'], record_id)
    if not item:
        raise HTTPException(404, '항목을 찾을 수 없습니다.')
    if materialize and kind == 'dataset' and item.get('source') == 'target-sql':
        return materialize_dataset(item, user)
    return item


def metadata(dataset):
    return {key: value for key, value in dataset.items() if key != 'rows'}


def save_dataset(payload, user):
    enabled(payload.module)
    if payload.connection_id:
        return import_dataset_rows(payload.connection_id, payload.rows, payload.name, payload.module, user, collection_type='file' if payload.source=='upload' else 'json')
    if payload.module == 'C-BAP':
        raise HTTPException(422, '수집 데이터를 저장할 TARGET DB를 먼저 선택하세요.')
    rows, columns = clean_rows(payload.rows)
    dataset = dict(id=uuid.uuid4().hex, name=payload.name.strip() or '새 데이터셋', source=payload.source, collection_type='file' if payload.source=='upload' else 'analysis' if payload.source=='analysis' else 'json', module=payload.module, description=payload.description, rows=rows, row_count=len(rows), columns=columns, created_at=utcnow())
    return metadata(put_record('dataset', user['id'], dataset))


@router.get('/health')
def health():
    return {'status': 'ok', 'service': 'IN-BAPS', 'version': '0.2.0'}


@router.get('/datasets')
def datasets(user=Depends(require_user)):
    return success(list_dataset_metadata(user['id']))


@router.post('/datasets', status_code=201)
def create_dataset(payload: DatasetInput, user=Depends(require_user)):
    return success(save_dataset(payload, user))


@router.post('/datasets/preview')
async def preview_dataset(file: UploadFile = File(...), module: Literal['C-BAP', 'R-BAP', 'V-BAP'] = Form('C-BAP'), user=Depends(require_user)):
    enabled(module)
    raw = await file.read(config.MAX_BYTES + 1)
    parsed = await run_in_threadpool(parse_upload, raw, file.filename or 'dataset.csv')
    return success(await run_in_threadpool(preview_upload, parsed))


@router.post('/datasets/import', status_code=201)
async def import_dataset(file: UploadFile = File(...), name: str = Form(''), module: Literal['C-BAP', 'R-BAP', 'V-BAP'] = Form('C-BAP'), connection_id: str | None = Form(None), preview_hash: str | None = Form(None), user=Depends(require_user)):
    enabled(module)
    raw = await file.read(config.MAX_BYTES + 1)
    filename = file.filename or 'dataset.csv'
    parsed = await run_in_threadpool(parse_upload, raw, filename)
    if preview_hash is not None and preview_hash != parsed['sha256']:
        raise HTTPException(409, '미리보기 이후 파일이 변경되었습니다. 파일을 다시 확인하세요.')
    try:
        payload = DatasetInput(name=(name.strip() or filename)[:150], rows=parsed['rows'], module=module, source='upload', connection_id=connection_id)
    except ValidationError:
        raise HTTPException(422, 'JSON의 각 행은 컬럼 이름과 값을 가진 객체여야 합니다.')
    return success(await run_in_threadpool(save_dataset, payload, user))


@router.get('/datasets/{dataset_id}')
def dataset_detail(dataset_id: str, limit: int = 5000, offset: int = 0, user=Depends(require_user)):
    if limit < 1 or limit > config.MAX_ROWS or offset < 0:
        raise HTTPException(422, '행 범위를 확인하세요.')
    item = owned('dataset', user, dataset_id)
    return success({**item, 'rows': item['rows'][offset:offset + limit], 'offset': offset, 'limit': limit})


@router.get('/datasets/{dataset_id}/export')
def export_dataset(dataset_id: str, user=Depends(require_user)):
    dataset = owned('dataset', user, dataset_id)
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    names = [col['name'] for col in dataset['columns']]
    def safe(value):
        if isinstance(value, str) and value.lstrip().startswith(('=', '+', '-', '@', '\t', '\r')):
            return "'" + value
        return value
    writer.writerow([safe(v) for v in names])
    for row in dataset['rows']:
        writer.writerow([safe(row.get(name)) for name in names])
    return Response('\ufeff' + buffer.getvalue(), media_type='text/csv; charset=utf-8', headers={'Content-Disposition': f'attachment; filename="inbaps-{dataset_id}.csv"'})


@router.delete('/datasets/{dataset_id}')
def delete_dataset(dataset_id: str, user=Depends(require_user)):
    owned('dataset', user, dataset_id, materialize=False)
    if any(v['dataset_id'] == dataset_id for v in list_records('visualization', user['id'])):
        raise HTTPException(409, '이 데이터셋을 사용하는 시각화를 먼저 삭제하세요.')
    query('RECORD_DELETE', dict(kind='dataset', owner=user['id'], id=dataset_id), write=True)
    return success({'deleted': dataset_id})


@router.post('/analysis', status_code=201)
def run_analysis(payload: AnalysisInput, user=Depends(require_user)):
    enabled('R-BAP')
    dataset = owned('dataset', user, payload.dataset_id)
    parameters = payload.model_dump()
    result = analyze(dataset, parameters)
    record = dict(id=uuid.uuid4().hex, dataset_id=dataset['id'], dataset_name=dataset['name'], method=payload.method, parameters=parameters, result=result, created_at=utcnow())
    return success(put_record('analysis', user['id'], record))


@router.get('/analyses')
def analyses(summary: bool = False, user=Depends(require_user)):
    enabled('R-BAP')
    if summary:
        sql_id = 'ANALYSIS_LIST_SQLITE' if config.STORAGE == 'sqlite' else 'ANALYSIS_LIST'
        return success([json_document(row['payload']) for row in query(sql_id, {'owner': user['id']})])
    return success(list_records('analysis', user['id']))


@router.get('/analyses/{record_id}')
def analysis_detail(record_id: str, user=Depends(require_user)):
    enabled('R-BAP')
    return success(owned('analysis', user, record_id))


@router.get('/visualizations')
def visualizations(user=Depends(require_user)):
    enabled('V-BAP')
    return success(list_records('visualization', user['id']))


def validate_visualization(payload, user):
    enabled('V-BAP')
    dataset = owned('dataset', user, payload.dataset_id)
    names = {c['name'] for c in dataset['columns']}
    for key in ('x', 'y', 'secondary', 'group_by', 'value', 'category', 'series'):
        field = payload.config.get(key)
        if field and (not isinstance(field, str) or field not in names):
            raise HTTPException(422, f'시각화 {key} 컬럼을 확인하세요.')
    if payload.config.get('aggregation', 'sum') not in ('sum', 'mean', 'count', 'min', 'max'):
        raise HTTPException(422, '시각화 집계 방식을 확인하세요.')
    return dataset


@router.post('/visualizations', status_code=201)
def create_visualization(payload: VisualizationInput, user=Depends(require_user)):
    dataset = validate_visualization(payload, user)
    record = dict(**payload.model_dump(), id=uuid.uuid4().hex, dataset_name=dataset['name'], created_at=utcnow())
    return success(put_record('visualization', user['id'], record))


@router.put('/visualizations/{record_id}')
def update_visualization(record_id: str, payload: VisualizationInput, user=Depends(require_user)):
    original = owned('visualization', user, record_id)
    dataset = validate_visualization(payload, user)
    record = {**original, **payload.model_dump(), 'dataset_name': dataset['name'], 'updated_at': utcnow()}
    query('RECORD_UPDATE', dict(id=record_id, kind='visualization', owner=user['id'], payload=json.dumps(record, ensure_ascii=False)), write=True)
    return success(record)


@router.delete('/visualizations/{record_id}')
def delete_visualization(record_id: str, user=Depends(require_user)):
    enabled('V-BAP')
    owned('visualization', user, record_id)
    if any(record_id in d['visualization_ids'] for d in list_records('dashboard', user['id'])):
        raise HTTPException(409, '대시보드에서 해당 시각화를 먼저 제거하세요.')
    query('RECORD_DELETE', dict(kind='visualization', owner=user['id'], id=record_id), write=True)
    return success({'deleted': record_id})


@router.get('/dashboards')
def dashboards(user=Depends(require_user)):
    enabled('V-BAP')
    return success(list_records('dashboard', user['id']))


@router.post('/dashboards', status_code=201)
def save_dashboard(payload: DashboardInput, user=Depends(require_user)):
    enabled('V-BAP')
    for record_id in payload.visualization_ids:
        owned('visualization', user, record_id)
    return success(put_record('dashboard', user['id'], dict(**payload.model_dump(), id=uuid.uuid4().hex, created_at=utcnow())))


@router.get('/overview')
def overview(user=Depends(require_user)):
    datasets = list_records('dataset', user['id'])
    return success({'dataset_count': len(datasets), 'row_count': sum(d['row_count'] for d in datasets), 'analysis_count': len(list_records('analysis', user['id'])), 'visualization_count': len(list_records('visualization', user['id'])), 'modules': sorted(config.ENABLED_MODULES), 'datasets': [metadata(d) for d in datasets]})


@router.get('/system')
def system(request: Request):
    user = require_admin(request)
    from backend.auth import session_policy
    return success({'name': 'IN-BAPS', 'version': '0.2.0', 'storage': config.STORAGE, 'environment': config.ENVIRONMENT, 'enabled_modules': sorted(config.ENABLED_MODULES), 'max_upload_mib': 10, 'max_rows': config.MAX_ROWS, 'max_columns': config.MAX_COLUMNS, **session_policy(), 'session_hours': session_policy()['absolute_timeout_seconds'] / 3600, 'oracle_auto_migrate': False, 'account': public_user(user), 'object_namespace': 'INIT$_<TYPE>_BAPS_<NAME>'})


@router.get('/system/schema')
def system_schema(user=Depends(require_admin)):
    if config.STORAGE != 'oracle':
        return success({'storage': config.STORAGE, 'test_only': True, 'objects': []})
    return success({'storage': 'oracle', 'objects': query('ORACLE_OBJECTS'), 'history': query('MIGRATION_LIST'), 'installer': 'database/DDL/install_oracle.sql', 'automatic': False})


@router.get('/system/schema/sql')
def system_schema_sql(user=Depends(require_admin)):
    content = (config.ROOT / 'database/DDL/install_oracle.sql').read_text(encoding='utf-8')
    return Response(content, media_type='application/sql; charset=utf-8', headers={'Content-Disposition': 'attachment; filename="in-baps-install-oracle.sql"'})


@router.post('/system/schema/initialize')
def initialize_system_schema(user=Depends(require_admin)):
    if config.STORAGE != 'oracle':
        raise HTTPException(409, 'SYSTEM 스키마 초기화는 Oracle 환경에서만 사용할 수 있습니다.')
    from scripts.build_oracle_installer import render
    from backend.migrate import split_statements
    text = (config.ROOT / 'database/DDL/install_oracle.sql').read_text(encoding='utf-8')
    if text != render():
        raise HTTPException(409, '설치 SQL과 스키마 정의가 다릅니다. 설치 SQL을 다시 생성하세요.')
    try:
        with connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(split_statements(text)[0])
    except Exception as error:
        code = getattr(error.args[0], 'code', None) if error.args else None
        detail = '테이블스페이스 할당량과 설치 권한을 확인하세요.' if code in (1950, 20001) else '설치 SQL과 현재 오브젝트 정의를 확인하세요.'
        raise HTTPException(409, 'SYSTEM 스키마 검증을 완료하지 못했습니다. ' + detail) from None
    return success({'initialized': True, 'preserved_data': True, 'installer': 'database/DDL/install_oracle.sql'})
