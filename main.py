"""IN-BAPS ASGI entry point. Run: python -m uvicorn main:app --port 9000."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware
from backend import config
from backend.api import router
from backend.auth_api import router as auth_router
from backend.target_api import router as target_router
from backend.collection_api import router as collection_router
from backend.auth import initialize_admin
from backend.database import close_pool, initialize
from backend.middleware import BodyLimitMiddleware
from backend.frontend_assets import FrontendAssets, VersionedStaticFiles

logger = logging.getLogger('inbaps')


@asynccontextmanager
async def lifespan(app):
    config.public_origin()
    if config.ENVIRONMENT == 'production' and not config.COOKIE_SECURE:
        raise RuntimeError('Production requires BAPS_COOKIE_SECURE=true.')
    try:
        initialize()
        initialize_admin()
        yield
    finally:
        close_pool()


app = FastAPI(title='IN-BAPS API', version='0.2.0', lifespan=lifespan, docs_url='/docs' if config.ENVIRONMENT == 'development' else None, redoc_url=None, openapi_url='/openapi.json' if config.ENVIRONMENT == 'development' else None)
hosts = [h.strip() for h in config.setting('BAPS_ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver').split(',') if h.strip()]
render_host = config.setting('RENDER_EXTERNAL_HOSTNAME')
if render_host:
    hosts.append(render_host)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=hosts)
app.add_middleware(BodyLimitMiddleware, max_bytes=config.MAX_BYTES + 65536)


@app.middleware('http')
async def security_headers(request: Request, call_next):
    length = request.headers.get('content-length', '0')
    if not length.isdigit() or int(length) > config.MAX_BYTES + 65536:
        return JSONResponse({'detail': '요청 크기는 10MiB 이하여야 합니다.'}, status_code=413)
    response = await call_next(request)
    session_user = getattr(request.state, 'auth_user', None)
    if session_user:
        response.headers['X-Session-Expires-At'] = str(session_user.get('expires_at', ''))
        response.headers['X-Session-Idle-Expires-At'] = str(session_user.get('idle_expires_at', ''))
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'same-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    nonce = getattr(request.state, 'asset_nonce', None)
    script_policy = "'self'" + (" 'nonce-" + nonce + "'" if nonce else '')
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src " + script_policy + "; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    if request.url.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store'
    return response


@app.exception_handler(Exception)
async def unhandled_error(request, exc):
    logger.error('Request failed: %s %s (%s)', request.method, request.url.path, type(exc).__name__)
    return JSONResponse({'detail': '요청을 처리하지 못했습니다. 서버 상태와 설정을 확인하세요.'}, status_code=500)


app.include_router(router)
app.include_router(auth_router)
app.include_router(target_router)
app.include_router(collection_router)
frontend = config.ROOT / 'frontend'
frontend.mkdir(exist_ok=True)
frontend_assets = FrontendAssets(frontend)
app.mount('/static', VersionedStaticFiles(assets=frontend_assets, directory=str(frontend)), name='static')


@app.get('/favicon.ico', include_in_schema=False)
def favicon():
    return FileResponse(frontend / 'assets' / 'favicon.ico', media_type='image/x-icon')


@app.get('/site.webmanifest', include_in_schema=False)
def web_manifest():
    return FileResponse(frontend / 'site.webmanifest', media_type='application/manifest+json')


@app.get('/', include_in_schema=False)
def index(request: Request):
    path = frontend / 'index.html'
    if not path.exists():
        return JSONResponse({'service': 'IN-BAPS', 'detail': 'Frontend is being prepared.'})
    return frontend_assets.index_response(request)
