"""Explicit real Oracle / World Bank C-BAP integration; excluded from unit discovery.

Run: venv/Scripts/python.exe tests/collection_oracle_live.py --run
Requires migrated SYSTEM schema and configured Oracle credentials. Creates one
private QA analyst, one encrypted owned TARGET connection, two append tables,
catalogs and a disabled batch. No customer objects are altered or dropped.
No credential or response body is printed or included in the QA report.
"""
import argparse
import json
import os
from pathlib import Path
import secrets
import subprocess
import sys
import time
import traceback
import uuid

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

ENDPOINT = 'https://api.worldbank.org/v2/country/KOR/indicator/NY.GDP.MKTP.CD'


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true', help='Permit dedicated QA account, objects and real public data creation.')
    args = parser.parse_args(argv)
    if not args.run:
        parser.error('--run is required; no network or database connection was made')
    os.environ['BAPS_STORAGE'] = 'oracle'
    os.environ['BAPS_ALLOWED_HOSTS'] = 'testserver,127.0.0.1,localhost'
    os.environ['BAPS_COOKIE_SECURE'] = 'false'
    from fastapi.testclient import TestClient
    from defusedxml import ElementTree
    from backend import config, target_database as target
    from backend.database import connection, close_pool
    from main import app

    report = {'started_at': time.time(), 'backend': 'oracle', 'endpoint': ENDPOINT,
              'steps': [], 'qa_objects': [], 'source_ids': []}
    output = config.ROOT / '.runtime/qa/collection-oracle-functional.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    suffix = uuid.uuid4().hex[:12]
    job_id = owner_id = None

    def ok(label):
        report['steps'].append(label)
        print('PASS ' + label, flush=True)

    def require(condition, label):
        if not condition:
            raise AssertionError(label)

    def call(client, method, path, expected=200, **kwargs):
        report['last_request'] = {'method': method, 'path': path}
        response = client.request(method, path, **kwargs)
        require(response.status_code == expected, f'{method} {path}: HTTP {response.status_code}, expected {expected}')
        return response.json()['data']

    def due(identifier, owner):
        with connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('UPDATE INIT$_TB_BAPS_API_JOB SET NEXT_RUN_AT=:due WHERE ID=:id AND OWNER_ID=:owner',
                               {'due': time.time() - 1, 'id': identifier, 'owner': owner})
                require(cursor.rowcount == 1, 'QA job due-time update must affect exactly one owned job')

    def worker(identifier):
        completed = subprocess.run([sys.executable, '-m', 'backend.collection_worker', '--once', '--job-id', identifier],
                                   cwd=config.ROOT, capture_output=True, text=True, timeout=180, check=False)
        require(completed.returncode == 0, 'QA scoped worker exited unsuccessfully; inspect saved run history')
        try:
            result = json.loads(completed.stdout.strip().splitlines()[-1])
        except (ValueError, IndexError):
            raise AssertionError('QA scoped worker did not return a valid bounded report') from None
        return result

    try:
        with TestClient(app) as client:
            session = call(client, 'POST', '/api/auth/signup', 201,
                           json={'username': 'qa_api_' + suffix, 'display_name': 'Open API QA', 'password': secrets.token_urlsafe(24)})
            user = session['user']
            owner_id = user['id']
            headers = {'X-CSRF-Token': session['csrf_token']}
            require(user['role'] == 'analyst', 'QA account must be analyst')
            report['qa_member_id'] = owner_id
            args_db = config.oracle_connect_args()
            saved_connection = call(client, 'POST', '/api/connections', 201, headers=headers, json={
                'name': 'QA public API TARGET ' + suffix, 'username': args_db['user'], 'password': args_db['password'],
                'dsn': args_db['dsn'], 'wallet_profile': bool(args_db.get('wallet_location')), 'allow_dml': True})
            cid = saved_connection['id']
            require(call(client, 'POST', '/api/connections/' + cid + '/test', headers=headers)['connected'], 'TARGET connection test')
            owned = target.get_connection(cid, user)
            ok('dedicated analyst and encrypted owned Oracle TARGET connection')

            for response_format in ('json', 'xml'):
                data = {'name': 'QA World Bank KOR GDP ' + response_format + ' ' + suffix,
                        'url': ENDPOINT, 'connection_id': cid, 'response_format': response_format,
                        'records_path': '[1]' if response_format == 'json' else 'data/data',
                        'inputs': [{'name': 'format', 'location': 'query', 'value': response_format},
                                   {'name': 'per_page', 'location': 'query', 'value': '5'}],
                        'fields': [{'name': 'year', 'path': 'date', 'type': 'string', 'required': True},
                                   {'name': 'value', 'path': 'value', 'type': 'number'}],
                        'max_rows': 5}
                source = call(client, 'POST', '/api/collection/sources', 201, headers=headers, json=data)
                sid = source['id']
                report['source_ids'].append(sid)
                table = target.MANAGED_PREFIX + 'API_' + sid[:12].upper()
                preview = call(client, 'POST', '/api/collection/sources/' + sid + '/test', headers=headers)
                require(preview['connected'] and preview['row_count'] == 5, response_format + ' preview must contain five real rows')
                require(not call(client, 'GET', '/api/collection/runs', params={'source_id': sid}), 'connection test creates no collection run')
                with target.target_connection(owned) as conn:
                    with conn.cursor() as cursor:
                        cursor.execute('SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME=:name', {'name': table})
                        require(cursor.fetchone()[0] == 0, 'connection preview must not create a TARGET table')
                ok(response_format + ' public HTTPS connection test has no TARGET writes')

                runs = []
                for iteration in range(2):
                    run = call(client, 'POST', '/api/collection/sources/' + sid + '/collect', headers=headers)
                    require(run['status'] == 'SUCCEEDED', response_format + ' collect did not succeed; inspect owned run history')
                    require(run['result']['inserted_rows'] == 5, response_format + ' each collection must append five rows')
                    runs.append(run)
                require(runs[0]['result']['dataset_id'] == runs[1]['result']['dataset_id'], 'append dataset ID must stay stable')
                require(runs[1]['result']['total_rows'] == 10, 'two collections must append ten physical rows')
                report['qa_objects'].append(table)
                with target.target_connection(owned) as conn:
                    with conn.cursor() as cursor:
                        cursor.execute('SELECT COUNT(*), COUNT(DISTINCT BAPS_RUN_ID) FROM ' + target.identifier(table))
                        require(tuple(cursor.fetchone()) == (10, 2), 'physical append row/run counts')
                        cursor.execute('SELECT BAPS_RAW_DOCUMENT FROM ' + target.identifier(table) + ' WHERE ROWNUM=1')
                        document = cursor.fetchone()[0]
                        document = document.read() if hasattr(document, 'read') else document
                        original = json.loads(document) if response_format == 'json' else ElementTree.fromstring(document)
                        require(bool(original), 'retained raw document must be valid JSON/XML')
                live = call(client, 'GET', '/api/datasets/' + runs[1]['result']['dataset_id'])
                require(live['row_count'] == 10 and len(live['rows']) == 10, 'live TARGET catalog must re-query appended records')
                ok(response_format + ' repeat append, raw documents, physical run counts and live catalog verified')

                if response_format == 'json':
                    job = call(client, 'POST', '/api/collection/jobs', 201, headers=headers, json={
                        'source_id': sid, 'name': 'QA scoped batch ' + suffix, 'interval_minutes': 5, 'enabled': True})
                    job_id = job['id']
                    report['qa_job_id'] = job_id
                    due(job_id, owner_id)
                    result = worker(job_id)
                    require(result == {'processed': 1, 'statuses': ['SUCCEEDED']}, 'scoped due worker must execute exactly once')
                    require(worker(job_id)['processed'] == 0, 'advanced next-run time prevents duplicate execution')
                    history = call(client, 'GET', '/api/collection/runs', params={'source_id': sid})
                    require(sum(run['job_id'] == job_id for run in history) == 1, 'exactly one durable scheduled run')
                    live = call(client, 'GET', '/api/datasets/' + runs[1]['result']['dataset_id'])
                    require(live['row_count'] == 15, 'scheduled append must update live catalog')
                    call(client, 'PUT', '/api/collection/jobs/' + job_id, headers=headers, json={
                        'source_id': sid, 'name': job['name'], 'interval_minutes': 5, 'enabled': False})
                    due(job_id, owner_id)
                    require(worker(job_id)['processed'] == 0, 'disabled due job must not run')
                    ok('persisted due job executes once in standalone worker; disabled due job is skipped')
            call(client, 'POST', '/api/auth/logout', headers=headers)
            report['success'] = True
    except Exception as error:
        report.update(success=False, error_type=type(error).__name__)
        frames = traceback.extract_tb(error.__traceback__)
        if frames:
            report['failure_location'] = f'{Path(frames[-1].filename).name}:{frames[-1].lineno} ({frames[-1].name})'
        # Only our static assertion labels are safe; never stringify driver/HTTP exceptions.
        if isinstance(error, AssertionError):
            report['failure'] = str(error)
    finally:
        if job_id and owner_id:
            try:
                with connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute('UPDATE INIT$_TB_BAPS_API_JOB SET ENABLED=0 WHERE ID=:id AND OWNER_ID=:owner',
                                       {'id': job_id, 'owner': owner_id})
                report['qa_job_disabled'] = True
            except Exception:
                report['qa_job_disabled'] = False
        close_pool()
        report['finished_at'] = time.time()
        output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps(report, ensure_ascii=False), flush=True)
    return 0 if report.get('success') else 1


if __name__ == '__main__':
    raise SystemExit(main())
