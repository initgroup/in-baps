"""Project-relative settings compatible with IN-EDITAONE Oracle variables."""
import os
from pathlib import Path
from urllib.parse import urlsplit
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / '.env', override=False)


def setting(name, default=''):
    return os.getenv(name, default).strip()


def project_path(value):
    path = Path(value)
    return path.resolve() if path.is_absolute() else (ROOT / path).resolve()


STORAGE = setting('BAPS_STORAGE', 'oracle').lower()
ENVIRONMENT = setting('BAPS_ENV', 'development').lower()
DATA_DIR = project_path(setting('BAPS_DATA_DIR', '.runtime/data'))
COOKIE = 'inbaps_session'
COOKIE_SECURE = setting('BAPS_COOKIE_SECURE', 'true' if ENVIRONMENT == 'production' else 'false').lower() == 'true'
MAX_BYTES = 10 * 1024 * 1024
MAX_ROWS = 20000
MAX_COLUMNS = 100
ENABLED_MODULES = {v.strip().upper() for v in setting('BAPS_MODULES', 'C-BAP,R-BAP,V-BAP').split(',')}


def allowed_hosts():
    hosts = [host.strip() for host in setting('BAPS_ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver').split(',') if host.strip()]
    # Keep the service's registered domains working with older Render env values.
    if ENVIRONMENT == 'production':
        hosts.extend(('inbaps.com', 'www.inbaps.com'))
    render_host = setting('RENDER_EXTERNAL_HOSTNAME')
    if render_host:
        hosts.append(render_host)
    public = public_origin()
    if public:
        hosts.append(urlsplit(public).hostname)
    return list(dict.fromkeys(hosts))


def public_origin():
    value = setting('BAPS_PUBLIC_ORIGIN')
    if not value and setting('RENDER_EXTERNAL_HOSTNAME'):
        value = 'https://' + setting('RENDER_EXTERNAL_HOSTNAME')
    if not value:
        return ''
    parsed = urlsplit(value)
    if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path not in ('', '/'):
        raise RuntimeError('BAPS_PUBLIC_ORIGIN must be a single origin without credentials, path, query or fragment.')
    if ENVIRONMENT == 'production' and parsed.scheme != 'https':
        raise RuntimeError('Production BAPS_PUBLIC_ORIGIN must use https.')
    return f'{parsed.scheme}://{parsed.netloc}'


def oracle_connect_args():
    cloud = setting('DB_MODE', 'local').lower() == 'cloud'
    if cloud:
        user, password, dsn = (setting('DB_USER_CLD'), setting('DB_PASSWORD_CLD'), setting('DB_DSN_CLD'))
    else:
        user, password = setting('DB_USER_LOC'), setting('DB_PASSWORD_LOC')
        dsn = f"{setting('DB_HOST', '127.0.0.1')}:{setting('DB_PORT', '1521')}/{setting('DB_SERVICE', 'ORCLCDB')}"
    if not user or not password or not dsn:
        raise RuntimeError('Oracle connection settings are incomplete.')
    args = dict(user=user, password=password, dsn=dsn)
    wallet = setting('DB_WALLET_PATH')
    wallet_path = str(project_path(wallet)) if wallet else None
    if setting('DB_ORACLE_MODE', 'thin') == 'thick':
        import oracledb
        client = setting('DB_CLIENT_PATH')
        if not client:
            raise RuntimeError('DB_CLIENT_PATH is required for thick mode.')
        oracledb.init_oracle_client(lib_dir=str(project_path(client)), config_dir=wallet_path)
    elif wallet_path:
        args.update(config_dir=wallet_path, wallet_location=wallet_path)
        if setting('DB_WALLET_PASSWORD'):
            args['wallet_password'] = setting('DB_WALLET_PASSWORD')
    args.update(tcp_connect_timeout=10, retry_count=1)
    return args
