"""File preview/direct-input contracts in an isolated SQLite SYSTEM store."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from backend import api, auth, config, database
from backend.auth_api import router as auth_router
from backend.upload_preview import parse_upload, preview_upload


class UploadParsingTests(unittest.TestCase):
    def test_cp949_values_types_missing_and_duplicates_match_saved_parser(self):
        raw = '식별자,날짜,값\n001,2026-10-01,10\n001,2026-10-01,10\n002,,오류\n'.encode('cp949')
        parsed = parse_upload(raw, 'explicit.csv')
        result = preview_upload(parsed)
        self.assertEqual(result['encoding'], 'CP949')
        self.assertEqual(result['row_count'], 3)
        self.assertEqual(result['rows'][0], {'식별자': '001', '날짜': '2026-10-01', '값': '10'})
        self.assertEqual(result['duplicate_rows'], 1)
        self.assertEqual(result['missing_cells'], 1)
        self.assertEqual(result['quality'][0]['type'], 'string')
        self.assertEqual(result['quality'][1]['type'], 'date')
        self.assertTrue(result['quality'][2]['mixed_numeric'])
        self.assertEqual(result['transformations'], [])
        self.assertEqual(result['sha256'], hashlib.sha256(raw).hexdigest())

    def test_full_file_limits_and_invalid_tabular_values_are_checked_before_preview(self):
        bad = [
            (b'a,a\n1,2', 'duplicate.csv'),
            (b'a\n1,2', 'wide-row.csv'),
            (json.dumps([{'a': index} for index in range(config.MAX_ROWS + 1)]).encode(), 'rows.json'),
            (json.dumps([{str(index): 1 for index in range(config.MAX_COLUMNS + 1)}]).encode(), 'columns.json'),
            (json.dumps([{'a': 'x' * 10001}]).encode(), 'cell.json'),
            (b'[{"a": {"nested": true}}]', 'nested.json'),
            (b'[{"a": NaN}]', 'nan.json'),
            (b'not-a-workbook', 'file.xlsx'),
        ]
        for raw, filename in bad:
            with self.subTest(filename=filename), self.assertRaises(HTTPException):
                parse_upload(raw, filename)
        with self.assertRaises(HTTPException) as error:
            parse_upload(b'x' * (config.MAX_BYTES + 1), 'large.csv')
        self.assertEqual(error.exception.status_code, 413)


class UploadApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        runtime = config.ROOT / '.runtime'
        runtime.mkdir(exist_ok=True)
        cls.directory = tempfile.TemporaryDirectory(prefix='file-preview-test-', dir=runtime)
        cls.addClassCleanup(cls.directory.cleanup)
        isolation = patch.multiple(config, STORAGE='sqlite', DATA_DIR=Path(cls.directory.name),
                                   COOKIE_SECURE=False, ENVIRONMENT='development',
                                   ENABLED_MODULES={'C-BAP', 'R-BAP', 'V-BAP'})
        isolation.start()
        cls.addClassCleanup(isolation.stop)
        database.initialize()
        app = FastAPI()
        app.include_router(api.router)
        app.include_router(auth_router)
        cls.client = TestClient(app)
        cls.client.__enter__()
        cls.addClassCleanup(cls.client.__exit__, None, None, None)
        cls.user = auth.create_user('file-preview-member', '파일 검증 회원', 'File-Preview-Isolated-2026!')
        session = cls.client.post('/api/auth/login', json={'username': 'file-preview-member', 'password': 'File-Preview-Isolated-2026!'}).json()['data']
        cls.headers = {'X-CSRF-Token': session['csrf_token']}

    def request(self, path, module='R-BAP', raw=b'id,value\n001,12\n002,\n', **values):
        return self.client.post(path, headers=self.headers, files={'file': ('explicit.csv', raw, 'text/csv')},
                                data={'module': module, 'name': '명시적 파일 입력', **values})

    def test_preview_is_owned_csrf_protected_and_never_creates_dataset_or_target(self):
        before = len(database.list_records('dataset', self.user['id']))
        raw = b'id,value\n' + b'001,12\n' * 25
        with patch.object(api, 'import_dataset_rows') as target:
            response = self.request('/api/datasets/preview', raw=raw)
        self.assertEqual(response.status_code, 200, response.text)
        data = response.json()['data']
        self.assertEqual(data['row_count'], 25)
        self.assertEqual(len(data['rows']), 20)
        self.assertTrue(data['preview_truncated'])
        self.assertEqual(data['quality'][0]['non_missing'], 25)
        self.assertEqual(len(database.list_records('dataset', self.user['id'])), before)
        target.assert_not_called()
        anonymous = TestClient(self.client.app)
        self.assertEqual(anonymous.post('/api/datasets/preview', files={'file': ('x.csv', b'a\n1')}, data={'module': 'R-BAP'}).status_code, 401)
        self.assertEqual(self.client.post('/api/datasets/preview', files={'file': ('x.csv', b'a\n1')}, data={'module': 'R-BAP'}).status_code, 403)
        with patch.object(config, 'ENABLED_MODULES', {'V-BAP'}):
            self.assertEqual(self.request('/api/datasets/preview', module='R-BAP').status_code, 403)

    def test_r_and_v_files_save_without_target_while_c_still_requires_target(self):
        raw = b'id,value\n001,12\n002,\n'
        digest = self.request('/api/datasets/preview', raw=raw).json()['data']['sha256']
        with patch.object(api, 'import_dataset_rows') as target:
            for module in ('R-BAP', 'V-BAP'):
                response = self.request('/api/datasets/import', module=module, raw=raw, preview_hash=digest)
                self.assertEqual(response.status_code, 201, response.text)
                item = database.get_record('dataset', self.user['id'], response.json()['data']['id'])
                self.assertEqual(item['collection_type'], 'file')
                self.assertEqual(item['rows'][0]['id'], '001')
                self.assertEqual(item['row_count'], 2)
            self.assertEqual(self.request('/api/datasets/import', module='C-BAP', raw=raw, preview_hash=digest).status_code, 422)
        target.assert_not_called()

    def test_changed_preview_file_is_rejected_and_target_is_only_called_on_explicit_save(self):
        before = len(database.list_records('dataset', self.user['id']))
        with patch.object(api, 'import_dataset_rows', return_value={'id': 'owned-target-fixture'}) as target:
            mismatch = self.request('/api/datasets/import', module='C-BAP', connection_id='target-fixture', preview_hash='wrong')
            self.assertEqual(mismatch.status_code, 409)
            target.assert_not_called()
            saved = self.request('/api/datasets/import', module='C-BAP', connection_id='target-fixture')
            self.assertEqual(saved.status_code, 201, saved.text)
            self.assertEqual(target.call_count, 1)
            self.assertEqual(target.call_args.kwargs['collection_type'], 'file')
        self.assertEqual(len(database.list_records('dataset', self.user['id'])), before)


if __name__ == '__main__':
    unittest.main()
