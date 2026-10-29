"""API ingestion safety, ownership, durable scheduling and transaction boundaries."""
import json
import os
import socket
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import MagicMock, Mock, patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from backend import collection, config, database, safe_http, target_database as target
from backend.auth import create_user
from backend.auth_api import router as auth_router
from backend.collection_api import SourceInput, router


def payload(**changes):
    values = {'name': '공개 통계 API', 'url': 'https://api.example.com/data', 'connection_id': 'target',
              'records_path': 'data.items', 'fields': [{'name': '지역', 'path': 'region'}, {'name': '값', 'path': 'value', 'type': 'number'}]}
    return SourceInput(**{**values, **changes}).model_dump()


class PublicHttpTests(unittest.TestCase):
    def test_private_metadata_special_addresses_and_unsafe_urls_are_denied(self):
        for address in ('127.0.0.1', '10.0.0.1', '169.254.169.254', '100.64.0.1', '192.0.2.1', '::1', 'fc00::1', 'ff02::1', '::ffff:127.0.0.1', '2002:7f00:0001::'):
            with self.subTest(address=address):
                self.assertFalse(safe_http.public_address(address))
        for url in ('http://example.com', 'https://localhost', 'https://service.internal', 'https://user:password@example.com',
                    'https://example.com:8443', 'https://127.0.0.1', 'https://[::1]', 'https://example.com/#fragment', 'https://example.com/\npath'):
            with self.subTest(url=url), self.assertRaises(HTTPException):
                safe_http.public_url(url)

    def test_mixed_dns_is_denied_without_opening_a_socket(self):
        answers = [(socket.AF_INET, socket.SOCK_STREAM, 6, '', ('8.8.8.8', 443)),
                   (socket.AF_INET, socket.SOCK_STREAM, 6, '', ('127.0.0.1', 443))]
        with patch.object(socket, 'getaddrinfo', return_value=answers), patch.object(safe_http, 'PinnedHTTPSConnection') as connect:
            with self.assertRaises(HTTPException):
                safe_http.request('https://api.example.com/data')
            connect.assert_not_called()

    def test_socket_is_pinned_and_tls_uses_original_hostname(self):
        raw, wrapped = Mock(), Mock()
        conn = safe_http.PinnedHTTPSConnection('api.example.com', (socket.AF_INET, '8.8.8.8'), time.monotonic() + 30)
        context = Mock()
        context.wrap_socket.return_value = wrapped
        conn._context = context
        with patch.object(socket, 'socket', return_value=raw), patch.object(socket, 'getaddrinfo') as dns:
            conn.connect()
        raw.connect.assert_called_once_with(('8.8.8.8', 443))
        context.wrap_socket.assert_called_once_with(raw, server_hostname='api.example.com', do_handshake_on_connect=False)
        wrapped.do_handshake.assert_called_once()
        dns.assert_not_called()
        self.assertIs(conn.sock, wrapped)

    def test_overall_deadline_interrupts_header_reads_and_detached_response_socket(self):
        transport = Mock()
        conn = safe_http.PinnedHTTPSConnection('api.example.com', (socket.AF_INET, '8.8.8.8'), time.monotonic() + 1)
        conn._transport = transport
        conn.sock = None  # HTTPResponse owns this socket after Connection: close.
        conn.expire()
        transport.shutdown.assert_called_once_with(socket.SHUT_RDWR)
        blocked, interrupted = Mock(), threading.Event()
        blocked.expire.side_effect = interrupted.set
        def headers():
            self.assertTrue(interrupted.wait(1))
            raise OSError('interrupted header parser')
        blocked.getresponse.side_effect = headers
        started = time.monotonic()
        with patch.object(safe_http, 'resolve_public', return_value=[(socket.AF_INET, '8.8.8.8')]), \
                patch.object(safe_http, 'PinnedHTTPSConnection', return_value=blocked), self.assertRaises(HTTPException):
            safe_http.request('https://api.example.com', deadline=started + .05)
        self.assertLess(time.monotonic() - started, .5)
        blocked.expire.assert_called_once()

    def test_redirects_compression_oversize_and_remote_errors_do_not_leak_location(self):
        for status, headers in ((302, {'Location': 'https://127.0.0.1/?token=secret'}),
                                (200, {'Content-Encoding': 'gzip'}), (200, {'Content-Length': '99999999'}), (401, {})):
            with self.subTest(status=status, headers=headers):
                response = Mock(status=status)
                response.getheader.side_effect = lambda name, default=None: headers.get(name, default)
                conn = Mock()
                conn.getresponse.return_value = response
                with patch.object(safe_http, 'resolve_public', return_value=[(socket.AF_INET, '8.8.8.8')]), \
                        patch.object(safe_http, 'PinnedHTTPSConnection', return_value=conn):
                    with self.assertRaises(HTTPException) as error:
                        safe_http.request('https://api.example.com/?token=private')
                    self.assertNotIn('private', error.exception.detail)
                    self.assertNotIn('secret', error.exception.detail)
                conn.close.assert_called_once()

    def test_chunked_oversize_response_is_bounded(self):
        response, conn = Mock(status=200), Mock()
        response.getheader.side_effect = lambda name, default=None: default
        response.read1.side_effect = [b'abcdef', b'ghijkl']
        conn.getresponse.return_value = response
        with patch.object(safe_http, 'resolve_public', return_value=[(socket.AF_INET, '8.8.8.8')]), \
                patch.object(safe_http, 'PinnedHTTPSConnection', return_value=conn):
            with self.assertRaises(HTTPException):
                safe_http.request('https://api.example.com', max_bytes=10)
        conn.close.assert_called_once()


class CollectionTests(unittest.TestCase):
    def setUp(self):
        runtime = config.ROOT / '.runtime'
        runtime.mkdir(exist_ok=True)
        self.directory = tempfile.TemporaryDirectory(dir=runtime, prefix='api-collection-test-')
        self.patches = [patch.object(config, 'STORAGE', 'sqlite'), patch.object(config, 'DATA_DIR', Path(self.directory.name)),
                        patch.object(config, 'ENABLED_MODULES', {'C-BAP', 'R-BAP', 'V-BAP'}), patch.object(config, 'COOKIE_SECURE', False),
                        patch.dict(os.environ, BAPS_SECRET_KEY='isolated-api-test-key-with-32-characters', BAPS_ADMIN_PASSWORD='',
                                   BAPS_PUBLIC_ORIGIN='', RENDER_EXTERNAL_HOSTNAME='')]
        for item in self.patches:
            item.start()
        database.statements.cache_clear()
        database.initialize()
        self.user = create_user('collection.one', '검증 회원', 'isolated-collection-test-password')
        self.other = create_user('collection.two', '다른 회원', 'isolated-other-test-password')
        self.connection = target.save_connection(self.user, {'name': '격리 TARGET', 'username': 'TEST', 'dsn': 'invalid.example/test', 'password': 'target-password', 'allow_dml': True})
        self.data = payload(connection_id=self.connection['id'])

    def tearDown(self):
        for item in reversed(self.patches):
            item.stop()
        self.directory.cleanup()

    def save(self, **changes):
        return collection.save_source({**self.data, **changes}, self.user)

    def test_secrets_are_encrypted_redacted_owned_and_reused_only_for_same_source(self):
        item = self.save(inputs=[{'name': 'serviceKey', 'location': 'query', 'type': 'string', 'secret': False, 'value': 'sensitive-api-value'}])
        self.assertTrue(item['inputs'][0]['secret'])
        self.assertEqual(item['inputs'][0]['value'], '')
        self.assertNotIn('sensitive-api-value', json.dumps(item))
        row = database.query('API_SOURCE_GET', {'id': item['id'], 'owner': self.user['id']})[0]
        self.assertNotIn('sensitive-api-value', row['config_json'])
        stored = collection.source(item['id'], self.user)
        self.assertEqual(collection._secret_values(stored['config'])['query:servicekey'], 'sensitive-api-value')
        edited = {**self.data, 'inputs': [{'name': 'serviceKey', 'location': 'query', 'type': 'string', 'secret': True, 'value': ''}]}
        collection.save_source(edited, self.user, item['id'])
        with self.assertRaises(HTTPException) as error:
            collection.source(item['id'], self.other)
        self.assertEqual(error.exception.status_code, 404)
        with patch.dict(os.environ, BAPS_SECRET_KEY=''), self.assertRaises(HTTPException):
            self.save(inputs=[{'name': 'token', 'location': 'query', 'type': 'string', 'secret': True, 'value': 'do-not-store'}])

    def test_url_query_and_unsafe_headers_are_rejected(self):
        with self.assertRaises(HTTPException):
            self.save(url='https://example.com/?token=unsafe')
        for name, value in (('Host', 'evil.example'), ('Proxy-Authorization', 'x'), ('X-Forwarded-For', '127.0.0.1'), ('X-Test', 'a\r\nb')):
            with self.subTest(name=name), self.assertRaises(HTTPException):
                self.save(inputs=[{'name': name, 'location': 'header', 'type': 'string', 'secret': False, 'value': value}])

    def test_json_nested_mapping_pagination_limits_and_read_only_preview(self):
        cfg = collection.prepare({**self.data, 'pagination': {'mode': 'page', 'parameter': 'page', 'start': 1, 'step': 1,
                                'size_parameter': 'size', 'page_size': 2, 'max_pages': 3}, 'max_rows': 3}, self.user)
        responses = [json.dumps({'data': {'items': [{'region': '서울', 'value': 0}, {'region': '부산', 'value': 2}]}}).encode(),
                     json.dumps({'data': {'items': [{'region': '인천', 'value': 3}, {'region': '대전', 'value': 4}]}}).encode()]
        with patch.object(safe_http, 'request', side_effect=[(body, 'application/json') for body in responses]) as request:
            result = collection.fetch_source(cfg)
        self.assertEqual(result['row_count'], 3)
        self.assertEqual(result['rows'][0]['값'], 0)
        self.assertTrue(result['truncated'])
        self.assertIn('page=2', request.call_args.args[0])
        with patch.object(safe_http, 'request', return_value=(responses[0], 'application/json')), patch.object(target, 'target_connection') as connect:
            preview = collection.test_source(cfg)
        connect.assert_not_called()
        self.assertEqual(preview['pages'], 1)
        self.assertNotIn('documents', preview)

    def test_xml_namespaces_attributes_nested_json_and_entities(self):
        cfg = payload(connection_id=self.connection['id'], response_format='xml', records_path='response/items/item', fields=[
            {'name': 'id', 'path': '@id'}, {'name': '값', 'path': 'value', 'type': 'number'}, {'name': '구조', 'path': 'detail', 'type': 'json'}])
        raw = b'<response xmlns="urn:test"><items><item id="007"><value>12</value><detail><x>A</x><x>B</x></detail></item></items></response>'
        with patch.object(safe_http, 'request', return_value=(raw, 'application/xml')):
            result = collection.fetch_source(cfg)
        self.assertEqual(result['rows'][0]['id'], '007')
        self.assertEqual(result['rows'][0]['값'], 12)
        self.assertEqual(json.loads(result['rows'][0]['구조']), {'x': ['A', 'B']})
        self.assertIn('item', result['documents'][0])
        malicious = b'<!DOCTYPE response [<!ENTITY secret SYSTEM "file:///private">]><response>&secret;</response>'
        with self.assertRaises(HTTPException):
            collection.parse_records(malicious, cfg)

    def test_reflected_secret_values_are_redacted_in_preview_and_raw_document(self):
        value = 'api-"secret"&key'
        cfg = collection.prepare({**self.data, 'fields': [], 'records_path': 'items', 'inputs': [
            {'name': 'token', 'location': 'query', 'type': 'string', 'secret': True, 'value': value}]}, self.user)
        raw = json.dumps({'items': [{'echo': value, 'nested': {'token': value}}]}).encode()
        with patch.object(safe_http, 'request', return_value=(raw, 'application/json')):
            result = collection.fetch_source(cfg)
        self.assertNotIn(value, str(result))
        self.assertNotIn('secret', json.dumps(result))
        cfg = collection.prepare({**self.data, 'fields': [], 'records_path': 'items', 'inputs': [
            {'name': 'Authorization', 'location': 'header', 'type': 'string', 'secret': True, 'value': 'Bearer AUTH_COMPONENT'}]}, self.user)
        with patch.object(safe_http, 'request', return_value=(b'{"items":[{"echo":"AUTH_COMPONENT"}]}', 'application/json')):
            result = collection.fetch_source(cfg)
        self.assertNotIn('AUTH_COMPONENT', json.dumps(result))

    def test_typed_body_parameters_and_numeric_identifiers(self):
        cfg = collection.prepare({**self.data, 'method': 'POST', 'inputs': [
            {'name': 'limit', 'location': 'body', 'type': 'number', 'secret': False, 'value': '10'},
            {'name': 'active', 'location': 'body', 'type': 'boolean', 'secret': False, 'value': 'true'},
            {'name': 'filter', 'location': 'body', 'type': 'json', 'secret': False, 'value': '{"state":[1,2]}'}]}, self.user)
        with patch.object(safe_http, 'request', return_value=(b'{"data":{"items":[]}}', 'application/json')) as request:
            collection.fetch_source(cfg)
        self.assertEqual(json.loads(request.call_args.args[3]), {'limit': 10, 'active': True, 'filter': {'state': [1, 2]}})
        with self.assertRaises(HTTPException):
            collection.mapped_record({'region': '서울', 'value': '001'}, cfg)
        for unsafe in (9007199254740993, '0.12345678901234567890123', '9007199254740993'):
            with self.subTest(unsafe=unsafe), self.assertRaises(HTTPException):
                collection.mapped_record({'region': '서울', 'value': unsafe}, cfg)

    def test_secret_json_body_leaves_are_redacted_individually(self):
        cfg = collection.prepare({**self.data, 'method': 'POST', 'fields': [], 'inputs': [
            {'name': 'credentials', 'location': 'body', 'type': 'json', 'secret': True,
             'value': '{"password":"LEAF_SECRET","nested":["SECOND_SECRET",987654321]}'}]}, self.user)
        raw = b'{"data":{"items":[{"echo":"LEAF_SECRET","nested":{"echo":"SECOND_SECRET"},"numeric":987654321}]}}'
        with patch.object(safe_http, 'request', return_value=(raw, 'application/json')):
            result = collection.fetch_source(cfg)
        self.assertNotIn('LEAF_SECRET', json.dumps(result))
        self.assertNotIn('SECOND_SECRET', json.dumps(result))
        self.assertNotIn('987654321', json.dumps(result))
        self.assertIsNone(json.loads(result['documents'][0])['numeric'])

    def test_json_decimal_lexeme_is_preserved_for_string_mapping_and_raw_document(self):
        raw = b'{"data":{"items":[{"region":"A","value":0.12345678901234567890123}]}}'
        with patch.object(safe_http, 'request', return_value=(raw, 'application/json')), self.assertRaises(HTTPException):
            collection.fetch_source(self.data)
        cfg = {**self.data, 'fields': [{'name': 'exact', 'path': 'value', 'type': 'string', 'required': True}]}
        with patch.object(safe_http, 'request', return_value=(raw, 'application/json')):
            result = collection.fetch_source(cfg)
        self.assertEqual(result['rows'][0]['exact'], '0.12345678901234567890123')
        self.assertIn('"value":0.12345678901234567890123', result['documents'][0])

    def test_public_secret_json_preserves_structural_config_types(self):
        saved = collection.save_source({**self.data, 'url': 'https://api.example.com/v1/data', 'method': 'POST', 'inputs': [
            {'name': 'credentials', 'location': 'body', 'type': 'json', 'secret': True,
             'value': '{"password":"SAMPLE_SECRET","enabled":true,"n":1}'}]}, self.user)
        self.assertIs(saved['inputs'][0]['secret'], True)
        self.assertIs(saved['inputs'][0]['has_secret'], True)
        self.assertEqual(saved['pagination']['start'], 1)
        self.assertEqual(saved['pagination']['step'], 1)
        self.assertEqual(saved['url'], 'https://api.example.com/v1/data')
        dto = {key: value for key, value in saved.items() if key in SourceInput.model_fields}
        for item in dto['inputs']:
            item.pop('has_secret', None)
        resaved = collection.save_source(SourceInput(**dto).model_dump(), self.user, saved['id'])
        self.assertEqual(resaved['url'], saved['url'])
        self.assertEqual(resaved['fields'], saved['fields'])
        self.assertEqual(resaved['inputs'][0]['value'], '')

    def test_run_claim_is_atomic_and_blocks_manual_overlap(self):
        item = self.save()
        def claim(_):
            try:
                return collection.begin_run(item['id'], self.user)
            except HTTPException:
                return None
        with ThreadPoolExecutor(max_workers=2) as executor:
            claimed = list(executor.map(claim, range(2)))
        self.assertEqual(sum(value is not None for value in claimed), 1)
        self.assertEqual(len(collection.list_runs(self.user)), 1)
        with self.assertRaises(HTTPException):
            collection.save_source(self.data, self.user, item['id'])

    def test_failed_fetch_records_failure_and_releases_source_without_writing_target(self):
        item = self.save()
        with patch.object(collection, 'fetch_source', side_effect=HTTPException(422, '연결 실패')), patch.object(collection, 'append_target') as append:
            run = collection.collect(item['id'], self.user)
        self.assertEqual(run['status'], 'FAILED')
        append.assert_not_called()
        self.assertFalse(collection.source(item['id'], self.user)['lock_token'])

    def test_uncertain_target_commit_retains_lock_until_explicit_recovery(self):
        item = self.save()
        fetched = {'rows': [{'값': 1}], 'columns': [{'name': '값', 'type': 'number'}], 'documents': ['{}'],
                   'pages': 1, 'bytes': 2, 'row_count': 1, 'truncated': False, 'warnings': []}
        with patch.object(collection, 'fetch_source', return_value=fetched), patch.object(collection, 'append_target', side_effect=RuntimeError('private-dsn-secret')):
            run = collection.collect(item['id'], self.user)
        self.assertEqual(run['status'], 'UNKNOWN')
        self.assertNotIn('private-dsn', json.dumps(run))
        self.assertTrue(collection.source(item['id'], self.user)['lock_token'])
        with self.assertRaises(HTTPException):
            collection.begin_run(item['id'], self.user)
        with self.assertRaises(HTTPException):
            collection.recover(item['id'], self.user)
        with patch.object(collection.time, 'time', return_value=time.time() + 301):
            self.assertTrue(collection.recover(item['id'], self.user)['recovered'])
        self.assertFalse(collection.source(item['id'], self.user)['lock_token'])

    def test_stale_recovery_cannot_corrupt_a_new_run(self):
        item = self.save()
        first = collection.begin_run(item['id'], self.user)
        with database.connection() as conn:
            conn.execute('UPDATE INIT$_TB_BAPS_API_SOURCE SET LOCK_UNTIL=0 WHERE ID=?', (item['id'],))
        stale = collection.source(item['id'], self.user)
        self.assertTrue(collection.recover(item['id'], self.user)['recovered'])
        second = collection.begin_run(item['id'], self.user)
        with patch.object(collection, 'source', return_value=stale), self.assertRaises(HTTPException) as error:
            collection.recover(item['id'], self.user)
        self.assertEqual(error.exception.status_code, 409)
        self.assertEqual(collection.source(item['id'], self.user)['lock_token'], second)
        runs = {run['id']: run['status'] for run in collection.list_runs(self.user)}
        self.assertEqual(runs, {first: 'UNKNOWN', second: 'RUNNING'})

    def test_due_job_advances_once_persists_and_enforces_owner(self):
        item = self.save()
        job = collection.save_job({'source_id': item['id'], 'name': '매시간', 'interval_minutes': 60, 'enabled': True}, self.user)
        with self.assertRaises(HTTPException):
            collection.delete_job(job['id'], self.other)
        with database.connection() as conn:
            conn.execute('UPDATE INIT$_TB_BAPS_API_JOB SET NEXT_RUN_AT=0 WHERE ID=?', (job['id'],))
        empty = {'rows': [], 'documents': [], 'columns': [], 'pages': 1, 'bytes': 2, 'row_count': 0, 'truncated': False, 'warnings': []}
        with patch.object(collection, 'fetch_source', return_value=empty):
            self.assertEqual(collection.run_due()['statuses'], ['SUCCEEDED'])
            self.assertEqual(collection.run_due()['processed'], 0)
        self.assertGreater(collection.list_jobs(self.user)[0]['next_run_at'], time.time())
        self.assertEqual(collection.list_runs(self.other), [])
        with patch.object(config, 'ENABLED_MODULES', {'R-BAP'}), self.assertRaises(HTTPException):
            collection.run_due()

    def test_authenticated_api_requires_csrf_and_never_returns_secrets(self):
        app = FastAPI()
        app.include_router(auth_router)
        app.include_router(router)
        with TestClient(app) as client:
            self.assertEqual(client.get('/api/collection/sources').status_code, 401)
            login = client.post('/api/auth/login', json={'username': 'collection.one', 'password': 'isolated-collection-test-password'}).json()['data']
            self.assertEqual(client.post('/api/collection/sources', json=self.data).status_code, 403)
            response = client.post('/api/collection/sources', json=self.data, headers={'X-CSRF-Token': login['csrf_token']})
            self.assertEqual(response.status_code, 201, response.text)
            self.assertEqual(client.get('/api/collection/sources').json()['data'][0]['id'], response.json()['data']['id'])
            invalid = {**self.data, 'inputs': [{'name': 'token', 'location': 'invalid', 'value': 'request-body-secret'}]}
            rejected = client.post('/api/collection/sources', json=invalid, headers={'X-CSRF-Token': login['csrf_token']})
            self.assertEqual(rejected.status_code, 422)
            self.assertNotIn('request-body-secret', rejected.text)

    def test_target_appends_are_bound_raw_documents_retained_and_catalog_stays_stable(self):
        item = self.save()
        row = collection.source(item['id'], self.user)
        marker = 'IN-BAPS API SOURCE ' + item['id'] + ' OWNER ' + self.user['id']
        state = {'exists': False, 'committed': [], 'pending': [], 'create_count': 0}
        conn, cursor = MagicMock(), MagicMock()
        conn.cursor.return_value.__enter__.return_value = cursor
        columns = [('BAPS_RUN_ID', 'VARCHAR2', 'N', 1, None, None, 'C', 32),
                   ('BAPS_ROW_ID', 'NUMBER', 'N', 1, None, None, None, 0),
                   ('BAPS_COLLECTED_AT', 'VARCHAR2', 'N', 0, None, None, 'C', 40),
                   ('BAPS_RAW_DOCUMENT', 'CLOB', 'N', 0, None, None, None, 0),
                   ('C001', 'VARCHAR2', 'Y', 0, None, None, 'B', 4000),
                   ('C002', 'NUMBER', 'Y', 0, None, None, None, 0)]
        def execute(sql, params=None):
            if sql == database.statements()['API_TARGET_EXISTS']:
                cursor.fetchone.return_value = ('owned-table',) if state['exists'] else None
            elif sql.startswith('CREATE TABLE'):
                state['exists'] = True
                state['create_count'] += 1
            elif sql == database.statements()['API_TARGET_COMMENT']:
                cursor.fetchone.return_value = (marker,)
            elif sql == database.statements()['API_TARGET_COLUMNS']:
                cursor.fetchall.return_value = columns
            elif sql.startswith('SELECT COUNT(*)'):
                cursor.fetchone.return_value = (len(state['committed']) + len(state['pending']),)
        cursor.execute.side_effect = execute
        cursor.executemany.side_effect = lambda sql, values: state['pending'].extend(values)
        conn.commit.side_effect = lambda: (state['committed'].extend(state['pending']), state['pending'].clear())
        @contextmanager
        def connected(_):
            try:
                yield conn
            finally:
                state['pending'].clear()
                conn.rollback()
        raw = json.dumps({'data': {'items': [{'region': "서울 ' ; --", 'value': 12}]}}).encode()
        with patch.object(target, 'target_connection', connected), patch.object(target, 'persist_ddl', return_value='.runtime/ddl/test.sql'), \
                patch.object(target, 'remember_table'), patch.object(safe_http, 'request', return_value=(raw, 'application/json')):
            first = collection.collect(item['id'], self.user)
            second = collection.collect(item['id'], self.user)
        self.assertEqual(first['status'], 'SUCCEEDED', first)
        self.assertEqual(second['status'], 'SUCCEEDED', second)
        self.assertEqual(first['result']['dataset_id'], second['result']['dataset_id'])
        self.assertEqual(state['create_count'], 1)
        self.assertEqual(second['result']['total_rows'], 2)
        self.assertNotEqual(state['committed'][0][0], state['committed'][1][0])
        self.assertEqual(json.loads(state['committed'][0][3]), {'region': "서울 ' ; --", 'value': 12})
        for call in cursor.executemany.call_args_list:
            self.assertNotIn("서울", call.args[0])
            self.assertIn(':1', call.args[0])
        self.assertEqual(conn.commit.call_count, 2)
        stored = database.get_record('dataset', self.user['id'], first['result']['dataset_id'])
        self.assertEqual(stored['row_count'], 2)
        self.assertEqual(stored['source'], 'target-sql')
        self.assertEqual(stored['collection_type'], 'api')
        self.assertNotIn('rows', stored)
        columns[-1] = ('C002', 'NUMBER', 'Y', 0, 8, 0, None, 0)
        with patch.object(target, 'target_connection', connected), patch.object(target, 'persist_ddl'), \
                patch.object(target, 'remember_table'), patch.object(safe_http, 'request', return_value=(raw, 'application/json')):
            drifted = collection.collect(item['id'], self.user)
        self.assertEqual(drifted['status'], 'UNKNOWN')
        self.assertEqual(len(state['committed']), 2)
        self.assertEqual(conn.commit.call_count, 2)


if __name__ == '__main__':
    unittest.main()
