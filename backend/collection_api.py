"""Member-owned C-BAP API collection and durable batch registration."""
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from pydantic import BaseModel, ConfigDict, Field

from backend.auth import require_user
from backend import collection

class CollectionRoute(APIRoute):
    def get_route_handler(self):
        original = super().get_route_handler()

        async def handle(request):
            try:
                return await original(request)
            except RequestValidationError:
                # FastAPI's default validation response echoes invalid input,
                # which may contain authorization values in a connector body.
                raise HTTPException(422, '수집 설정의 필수값·형식·길이·허용 범위를 확인하세요.') from None
        return handle


router = APIRouter(prefix='/api/collection', tags=['collection'], route_class=CollectionRoute)


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid')


class InputParameter(StrictModel):
    name: str = Field(min_length=1, max_length=100)
    location: Literal['query', 'header', 'body'] = 'query'
    value: str = Field(default='', max_length=20000, repr=False)
    type: Literal['string', 'number', 'boolean', 'json'] = 'string'
    secret: bool = False


class OutputField(StrictModel):
    name: str = Field(min_length=1, max_length=100)
    path: str = Field(default='', max_length=500)
    type: Literal['string', 'number', 'boolean', 'json'] = 'string'
    required: bool = False


class Pagination(StrictModel):
    mode: Literal['none', 'page', 'offset'] = 'none'
    parameter: str = Field(default='page', max_length=100)
    start: int = Field(default=1, ge=0, le=100000000)
    step: int = Field(default=1, ge=1, le=100000)
    size_parameter: str = Field(default='per_page', max_length=100)
    page_size: int = Field(default=100, ge=1, le=2000)
    max_pages: int = Field(default=10, ge=1, le=20)


class SourceInput(StrictModel):
    name: str = Field(min_length=1, max_length=150)
    url: str = Field(min_length=1, max_length=2048)
    method: Literal['GET', 'POST'] = 'GET'
    response_format: Literal['json', 'xml'] = 'json'
    records_path: str = Field(default='', max_length=500)
    inputs: list[InputParameter] = Field(default_factory=list, max_length=50)
    body_format: Literal['json', 'form'] = 'json'
    fields: list[OutputField] = Field(default_factory=list, max_length=100)
    pagination: Pagination = Field(default_factory=Pagination)
    connection_id: str = Field(min_length=1, max_length=32)
    max_rows: int = Field(default=20000, ge=1, le=20000)


class SourceTestInput(SourceInput):
    source_id: str | None = Field(default=None, max_length=32)


class JobInput(StrictModel):
    source_id: str = Field(min_length=1, max_length=32)
    name: str = Field(min_length=1, max_length=150)
    interval_minutes: int = Field(default=60, ge=5, le=10080)
    enabled: bool = True


class RecoveryInput(StrictModel):
    acknowledge: Literal[True]


def member(user=Depends(require_user)):
    collection.enabled()
    return user


def success(value):
    return {'status': 'success', 'data': value}


@router.get('/sources')
def sources(user=Depends(member)):
    return success(collection.list_sources(user))


@router.post('/sources', status_code=201)
def create_source(payload: SourceInput, user=Depends(member)):
    return success(collection.save_source(payload.model_dump(), user))


@router.put('/sources/{source_id}')
def update_source(source_id: str, payload: SourceInput, user=Depends(member)):
    return success(collection.save_source(payload.model_dump(), user, source_id))


@router.delete('/sources/{source_id}')
def delete_source(source_id: str, user=Depends(member)):
    return success(collection.delete_source(source_id, user))


@router.post('/test')
def test_unsaved_source(payload: SourceTestInput, user=Depends(member)):
    previous = collection.source(payload.source_id, user) if payload.source_id else None
    prepared = collection.prepare(payload.model_dump(), user, previous)
    return success(collection.test_source(prepared))


@router.post('/sources/{source_id}/test')
def test_saved_source(source_id: str, user=Depends(member)):
    row = collection.source(source_id, user)
    return success(collection.test_source(row['config']))


@router.post('/sources/{source_id}/collect')
def collect(source_id: str, user=Depends(member)):
    return success(collection.collect(source_id, user))


@router.post('/sources/{source_id}/recover')
def recover(source_id: str, payload: RecoveryInput, user=Depends(member)):
    return success(collection.recover(source_id, user))


@router.get('/runs')
def runs(source_id: str | None = None, user=Depends(member)):
    return success(collection.list_runs(user, source_id))


@router.get('/jobs')
def jobs(user=Depends(member)):
    return success(collection.list_jobs(user))


@router.post('/jobs', status_code=201)
def create_job(payload: JobInput, user=Depends(member)):
    return success(collection.save_job(payload.model_dump(), user))


@router.put('/jobs/{job_id}')
def update_job(job_id: str, payload: JobInput, user=Depends(member)):
    return success(collection.save_job(payload.model_dump(), user, job_id))


@router.delete('/jobs/{job_id}')
def delete_job(job_id: str, user=Depends(member)):
    return success(collection.delete_job(job_id, user))
