"""Offline API contract/security tests; never connect to Oracle or read credentials."""
import os
import tempfile
import unittest
import types
import hashlib
from pathlib import Path
from unittest.mock import patch

_runtime = Path(__file__).resolve().parent.parent / '.runtime'
_runtime.mkdir(exist_ok=True)
_sandbox = tempfile.TemporaryDirectory(prefix='inbaps-test-', dir=_runtime)
os.environ.update(BAPS_STORAGE='sqlite', BAPS_ENV='development', BAPS_DATA_DIR=_sandbox.name, BAPS_ADMIN_PASSWORD='', BAPS_ALLOWED_HOSTS='testserver,127.0.0.1,localhost')

from fastapi.testclient import TestClient
from main import app
from backend import config
from backend.analytics import analyze, clean_rows
from backend.auth import create_user, issue_session, same_origin
from backend.database import query
from backend.migrate import migration_files, split_statements, main as migrate_main
from backend.database import statements


class BackendTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Discovery order must never select the real Oracle backend merely
        # because another test imported config before this module's env setup.
        isolation = patch.multiple(config, STORAGE='sqlite', DATA_DIR=Path(_sandbox.name),
                                   COOKIE_SECURE=False, ENVIRONMENT='development',
                                   ENABLED_MODULES={'C-BAP', 'R-BAP', 'V-BAP'})
        isolation.start()
        cls.addClassCleanup(isolation.stop)
        cls.addClassCleanup(_sandbox.cleanup)
        cls.context = TestClient(app)
        cls.client = cls.context.__enter__()
        cls.addClassCleanup(cls.context.__exit__, None, None, None)
        create_user('test-admin', '검증 관리자', 'backend-test-password-2026!', role='admin')
        login = cls.client.post('/api/auth/login', json={'username': 'test-admin', 'password': 'backend-test-password-2026!'})
        assert login.status_code == 200, login.text
        cls.csrf = login.json()['data']['csrf_token']
        cls.headers = {'X-CSRF-Token': cls.csrf}
        assert cls.client.get('/api/datasets').json()['data'] == [], 'Startup must not seed synthetic datasets.'
        fixture = cls.client.post('/api/datasets', headers=cls.headers, json={
            'name': '명시적 분석 테스트 입력', 'module': 'R-BAP', 'source': 'test-fixture',
            'rows': [{'visitors': 2, 'conversions': 1, 'keyword': '분석 데이터'},
                     {'visitors': 4, 'conversions': 2, 'keyword': '분석 시각화'},
                     {'visitors': 8, 'conversions': 4, 'keyword': '데이터 연결'},
                     {'visitors': 16, 'conversions': 8, 'keyword': '분석 연결'}],
        })
        assert fixture.status_code == 201, fixture.text
        cls.sample_id = fixture.json()['data']['id']

    def test_public_health_and_protected_api(self):
        anonymous = TestClient(app)
        self.assertEqual(anonymous.get('/api/health').status_code, 200)
        self.assertEqual(anonymous.get('/api/datasets').status_code, 401)
        self.assertEqual(anonymous.get('/.env').status_code, 404)
        self.assertEqual(anonymous.get('/database/queries.sql').status_code, 404)
        self.assertEqual(anonymous.get('/database/SQL/auth.sql').status_code, 404)
        self.assertEqual(anonymous.get('/.local/ops/git-deploy.ps1').status_code, 404)
        self.assertEqual(self.client.get('/api/system').json()['data']['storage'], 'sqlite')

    def test_csrf_and_origin(self):
        self.assertEqual(self.client.post('/api/datasets', json={'name': 'x', 'rows': [{'a': 1}]}).status_code, 403)
        anonymous = TestClient(app)
        self.assertEqual(anonymous.post('/api/auth/login', json={'username': 'test-admin', 'password': 'incorrect-password'}, headers={'Origin': 'https://evil.example'}).status_code, 403)
        self.assertEqual(anonymous.post('/api/auth/demo').status_code, 404)

    def test_https_public_origin_behind_proxy(self):
        from starlette.requests import Request
        from fastapi import HTTPException
        def request(origin):
            return Request({'type': 'http', 'scheme': 'http', 'server': ('in-baps.onrender.com', 80), 'path': '/api/auth/login', 'root_path': '', 'query_string': b'', 'headers': [(b'host', b'in-baps.onrender.com'), (b'origin', origin.encode())]})
        with patch.dict(os.environ, {'BAPS_PUBLIC_ORIGIN': 'https://in-baps.onrender.com'}), patch.object(config, 'ENVIRONMENT', 'production'):
            same_origin(request('https://in-baps.onrender.com'))
            with self.assertRaises(HTTPException):
                same_origin(request('https://in-baps.onrender.com.evil.example'))
            with self.assertRaises(HTTPException):
                same_origin(request('https://evil.example'))

    def test_independent_modules_and_roundtrip(self):
        old = config.ENABLED_MODULES
        try:
            config.ENABLED_MODULES = {'R-BAP', 'V-BAP'}
            request = {'name': '독립 분석', 'rows': [{'지역': '서울', '값': '10'}, {'지역': '서울', '값': '20'}, {'지역': '부산', '값': '5'}], 'module': 'R-BAP'}
            response = self.client.post('/api/datasets', headers=self.headers, json=request)
            self.assertEqual(response.status_code, 201, response.text)
            dataset_id = response.json()['data']['id']
            self.assertEqual(self.client.post('/api/datasets', headers=self.headers, json={**request, 'module': 'C-BAP'}).status_code, 403)
            result = self.client.post('/api/analysis', headers=self.headers, json={'dataset_id': dataset_id, 'method': 'aggregate', 'group_by': '지역', 'value': '값'}).json()['data']['result']['rows']
            self.assertEqual({r['name']: r['value'] for r in result}, {'서울': 30, '부산': 5})
            config.ENABLED_MODULES = {'V-BAP'}
            chart = self.client.post('/api/visualizations', headers=self.headers, json={'name': '직접 시각화', 'dataset_id': dataset_id, 'chart_type': 'bar', 'config': {'x': '지역', 'y': '값'}})
            self.assertEqual(chart.status_code, 201, chart.text)
            chart_id = chart.json()['data']['id']
            self.assertEqual(self.client.delete('/api/datasets/' + dataset_id, headers=self.headers).status_code, 409)
            self.assertEqual(self.client.delete('/api/visualizations/' + chart_id, headers=self.headers).status_code, 200)
            self.assertEqual(self.client.delete('/api/datasets/' + dataset_id, headers=self.headers).status_code, 200)
        finally:
            config.ENABLED_MODULES = old

    def test_real_file_import_and_validation(self):
        raw = '지역,금액\n서울,100\n부산,200\n'.encode('cp949')
        response = self.client.post('/api/datasets/import', headers=self.headers, files={'file': ('매출.csv', raw, 'text/csv')}, data={'module': 'V-BAP'})
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual(response.json()['data']['row_count'], 2)
        self.assertEqual(response.json()['data']['collection_type'], 'file')
        dataset_id = response.json()['data']['id']
        self.assertEqual(self.client.get('/api/datasets/' + dataset_id).json()['data']['rows'][0]['지역'], '서울')
        duplicate = self.client.post('/api/datasets/import', headers=self.headers, files={'file': ('bad.csv', b'a,a\n1,2', 'text/csv')}, data={'module': 'V-BAP'})
        self.assertEqual(duplicate.status_code, 422)
        nested = self.client.post('/api/datasets', headers=self.headers, json={'name': 'bad', 'module': 'V-BAP', 'rows': [{'x': {'nested': True}}]})
        self.assertEqual(nested.status_code, 422)
        invalid_json_rows = self.client.post('/api/datasets/import', headers=self.headers, files={'file': ('bad.json', b'[1]', 'application/json')}, data={'module': 'V-BAP'})
        self.assertEqual(invalid_json_rows.status_code, 422)
        recursive_json = self.client.post('/api/datasets/import', headers=self.headers, files={'file': ('bad.json', b'[' * 2000 + b'0' + b']' * 2000, 'application/json')}, data={'module': 'V-BAP'})
        self.assertEqual(recursive_json.status_code, 422)
        missing_target = self.client.post('/api/datasets', headers=self.headers, json={'name': '수집 저장 위치 검증', 'module': 'C-BAP', 'rows': [{'a': 1}]})
        self.assertEqual(missing_target.status_code, 422)
        self.assertIn('TARGET DB', missing_target.json()['detail'])

    def test_analysis_and_persistence(self):
        profile = self.client.post('/api/analysis', headers=self.headers, json={'dataset_id': self.sample_id, 'method': 'profile'})
        self.assertEqual(profile.status_code, 201, profile.text)
        self.assertEqual(profile.json()['data']['result']['row_count'], 4)
        corr = self.client.post('/api/analysis', headers=self.headers, json={'dataset_id': self.sample_id, 'method': 'correlation', 'columns': ['visitors', 'conversions']}).json()['data']['result']
        self.assertEqual(corr['matrix'][0]['value'], 1)
        text = self.client.post('/api/analysis', headers=self.headers, json={'dataset_id': self.sample_id, 'method': 'text', 'value': 'keyword'}).json()['data']['result']
        self.assertGreater(text['token_count'], 0)
        self.assertGreaterEqual(len(self.client.get('/api/analyses').json()['data']), 3)

    def test_owner_isolation_and_admin_role(self):
        from fastapi import Response
        user = create_user('analyst-test', '분석 사용자', role='analyst')
        response = Response()
        issue_session(user, response)
        token = response.headers['set-cookie'].split(';')[0].split('=', 1)[1]
        separate = TestClient(app)
        separate.cookies.set(config.COOKIE, token)
        self.assertEqual(separate.get('/api/datasets/' + self.sample_id).status_code, 404)
        self.assertEqual(separate.get('/api/system', headers={'X-Login-Role': 'admin'}).status_code, 403)

    def test_numeric_policy_and_missing_correlations(self):
        rows, columns = clean_rows([{'code': '001', 'x': None, 'y': 5}, {'code': '002', 'x': 2, 'y': 5}, {'code': '003', 'x': 3, 'y': 5}])
        self.assertEqual(columns[0]['type'], 'string')
        result = analyze({'rows': rows, 'columns': columns}, {'method': 'correlation', 'columns': ['x', 'y']})
        self.assertIsNone(result['matrix'][1]['value'])
        large_rows, large_columns = clean_rows([{'x': 1e99, 'y': 2e99}, {'x': 2e99, 'y': 4e99}, {'x': 3e99, 'y': 6e99}])
        large_result = analyze({'rows': large_rows, 'columns': large_columns}, {'method': 'correlation', 'columns': ['x', 'y']})
        self.assertEqual(large_result['matrix'][1]['value'], 1)
        _, date_columns = clean_rows([{'invalid_date': '2026-99-99', 'valid_date': '2026-10-29'}])
        self.assertEqual(date_columns[0]['type'], 'string')
        self.assertEqual(date_columns[1]['type'], 'date')

    def test_migration_plan_is_complete(self):
        files = migration_files()
        self.assertEqual([path.name for path, _ in files], ['V001__baseline.sql', 'V002__open_api_collection.sql'])
        statements = split_statements(files[0][0].read_text(encoding='utf-8'))
        self.assertEqual(len(statements), 11)
        self.assertTrue(any('CREATE TABLE INIT$_TB_BAPS_HISTORY' in text for text in statements))
        self.assertTrue(any('CREATE TABLE INIT$_TB_BAPS_MEMBER' in text for text in statements))
        self.assertTrue(any('CREATE OR REPLACE PROCEDURE INIT$_SP_BAPS_SESSION_PURGE' in text for text in statements))

    def test_later_migration_failure_is_not_replayed(self):
        baseline, checksum = migration_files()[0]
        change = Path(_sandbox.name) / 'V002__test_failure.sql'
        change.write_text('CREATE TABLE INIT$_TB_BAPS_TEMP (ID NUMBER)\n/\nBROKEN DDL\n/\n', encoding='utf-8')
        change_hash = hashlib.sha256(change.read_bytes()).hexdigest()
        state = {baseline.name: (checksum, '2026-10-29', 'APPLIED')}
        executed = []

        class Cursor:
            def execute(self, sql, params=None):
                self.sql = sql
                if sql == statements()['MIGRATION_INSERT']:
                    state[params['version']] = (params['checksum'], params['applied_at'], 'RUNNING')
                elif sql == statements()['MIGRATION_COMPLETE']:
                    row = state[params['version']]
                    state[params['version']] = (row[0], params['applied_at'], 'APPLIED')
                elif sql.startswith('CREATE TABLE INIT$_TB_BAPS_TEMP'):
                    executed.append(sql)
                elif sql == 'BROKEN DDL':
                    raise RuntimeError('Simulated Oracle DDL failure')
            def fetchone(self):
                return ('BAPS_TEST',)
            def fetchall(self):
                if self.sql == statements()['MIGRATION_LIST']:
                    return [(version, *values) for version, values in state.items()]
                return [('INIT$_TB_BAPS_MEMBER', 'TABLE', 'VALID')]
            def close(self):
                pass

        class Connection:
            def cursor(self):
                return Cursor()
            def commit(self):
                pass
            def close(self):
                pass

        fake_driver = types.SimpleNamespace(connect=lambda **kwargs: Connection())
        with patch.dict('sys.modules', {'oracledb': fake_driver}), patch('backend.config.oracle_connect_args', return_value={}), patch('backend.migrate.migration_files', return_value=[(baseline, checksum), (change, change_hash)]):
            with self.assertRaisesRegex(RuntimeError, 'Simulated Oracle'):
                migrate_main(['apply', '--schema', 'BAPS_TEST'])
            self.assertEqual(state[change.name][2], 'RUNNING')
            with self.assertRaisesRegex(RuntimeError, 'incomplete migration'):
                migrate_main(['apply', '--schema', 'BAPS_TEST'])
        self.assertEqual(len(executed), 1)


if __name__ == '__main__':
    unittest.main(verbosity=2)
