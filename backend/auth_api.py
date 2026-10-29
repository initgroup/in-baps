"""Public signup/login endpoints and authenticated session lifecycle."""
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict, Field

from backend import config
from backend.auth import (
    create_user, issue_session, password_hash, rate_limit_login, require_user,
    same_origin, session_payload, session_policy, verify_password,
)
from backend.database import query

router = APIRouter(prefix='/api/auth', tags=['membership'])
_DUMMY_PASSWORD_HASH = password_hash(secrets.token_urlsafe(32))


class LoginInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=256, repr=False)


class SignupInput(LoginInput):
    display_name: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=12, max_length=256, repr=False)


def success(data):
    return {'status': 'success', 'data': data}


@router.get('/options')
def auth_options():
    return success({'demo_available': False, 'signup_available': True,
                    'modules': sorted(config.ENABLED_MODULES), **session_policy()})


@router.post('/signup', status_code=201)
def signup(payload: SignupInput, request: Request, response: Response):
    same_origin(request)
    rate_limit_login(request)
    user = create_user(payload.username, payload.display_name, payload.password,
                       role='analyst', allow_existing=False)
    return success(issue_session(user, response, request))


@router.post('/login')
def login(payload: LoginInput, request: Request, response: Response):
    same_origin(request)
    rate_limit_login(request)
    username = payload.username.strip().lower()
    users = query('USER_GET', {'username': username})
    valid = verify_password(payload.password, users[0]['password_hash'] if users else _DUMMY_PASSWORD_HASH)
    if not users or not valid:
        raise HTTPException(401, '계정 또는 비밀번호를 확인하세요.')
    return success(issue_session(users[0], response, request))


@router.get('/session')
def session(user=Depends(require_user)):
    return success(session_payload(user))


@router.post('/activity')
def activity(user=Depends(require_user)):
    """Explicit user continuation. The client must not poll this endpoint."""
    return success(session_payload(user))


@router.post('/logout')
def logout(request: Request, response: Response, user=Depends(require_user)):
    token_hash = hashlib.sha256(request.cookies[config.COOKIE].encode()).hexdigest()
    query('SESSION_DELETE', {'token_hash': token_hash}, write=True)
    response.delete_cookie(config.COOKIE, path='/', secure=config.COOKIE_SECURE,
                           httponly=True, samesite='lax')
    return success({'logged_out': True})
