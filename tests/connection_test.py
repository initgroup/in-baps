"""Connection detail and unsaved test contracts, with no remote DB writes."""
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from backend import auth, config, database, target_database as target
from backend.auth_api import router as auth_router
from backend.target_api import router


class ConnectionTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(dir=config.ROOT / '.runtime', prefix='connection-test-')
        self.patches = [patch.object(config, 'STORAGE', 'sqlite'),
                        patch.object(config, 'DATA_DIR', Path(self.directory.name)),
                        patch.object(config, 'COOKIE_SECURE', False),
                        patch.dict(os.environ, BAPS_ADMIN_PASSWORD='', BAPS_PUBLIC_ORIGIN='',
                                   RENDER_EXTERNAL_HOSTNAME='', BAPS_SECRET_KEY='test-only-key-' * 4)]
        for item in self.patches: item.start()
        auth._attempts.clear()
        database.statements.cache_clear()
        database.initialize()
        app = FastAPI()
        app.include_router(auth_router)
        app.include_router(router)
        self.client, self.other = TestClient(app), TestClient(app)
        self.fields = dict(name='Customer', username='CUSTOMER', dsn='db.example:1521/service',
                           password='fixture-db-password', connection_type='easy', wallet_profile=False)
        self.headers = self.signup(self.client, 'connection_owner')
        self.other_headers = self.signup(self.other, 'connection_other')

    def tearDown(self):
        self.client.close(); self.other.close()
        for item in reversed(self.patches): item.stop()
        database.statements.cache_clear()
        self.directory.cleanup()

    def signup(self, client, username):
        response = client.post('/api/auth/signup', json={'username': username, 'display_name': 'Test', 'password': 'test-membership-password'})
        self.assertEqual(response.status_code, 201)
        return {'X-CSRF-Token': response.json()['data']['csrf_token']}

    def save(self):
        response = self.client.post('/api/connections', headers=self.headers, json=self.fields)
        self.assertEqual(response.status_code, 201)
        return response.json()['data']

    def test_details_are_owned_and_never_expose_secrets(self):
        saved = self.save()
        response = self.client.get('/api/connections/' + saved['id'])
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(data['dsn'], self.fields['dsn'])
        self.assertEqual(data['connection_type'], 'easy')
        self.assertTrue(data['has_password'])
        self.assertNotIn('password_enc', data)
        self.assertNotIn(self.fields['password'], response.text)
        self.assertEqual(self.other.get('/api/connections/' + saved['id']).status_code, 404)

    def test_unsaved_test_reuses_only_owners_password_and_does_not_save(self):
        saved = self.save()
        before = database.query('CONNECTION_LIST', {'owner': self.client.get('/api/auth/session').json()['data']['user']['id']})
        def connected(record):
            self.assertEqual(target.decrypt(record['config']['password_enc']), self.fields['password'])
            self.assertEqual(record['config']['dsn'], 'TEST_HIGH')
            return {'connected': True, 'schema': 'CUSTOMER', 'version': '23'}
        payload = {**self.fields, 'connection_id': saved['id'], 'password': '', 'dsn': 'TEST_HIGH', 'connection_type': 'tns', 'wallet_profile': True}
        with patch.object(target, 'check_connection', side_effect=connected) as check:
            self.assertEqual(self.client.post('/api/connections/test', headers=self.headers, json=payload).status_code, 200)
            self.assertEqual(self.other.post('/api/connections/test', headers=self.other_headers, json=payload).status_code, 404)
            self.assertEqual(self.client.post('/api/connections/test', json=payload).status_code, 403)
            self.assertEqual(check.call_count, 1)
        after = database.query('CONNECTION_LIST', {'owner': before[0]['owner_id']})
        self.assertEqual(before, after)

    def test_unsaved_new_connection_test_does_not_create_record(self):
        with patch.object(target, 'check_connection', return_value={'connected': True}) as check:
            response = self.client.post('/api/connections/test', headers=self.headers, json=self.fields)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(target.decrypt(check.call_args.args[0]['config']['password_enc']), self.fields['password'])
        self.assertEqual(self.client.get('/api/connections').json()['data'], [])

    def test_options_only_publish_aliases_and_readiness(self):
        folder = Path(self.directory.name) / 'wallet'
        folder.mkdir()
        (folder / 'tnsnames.ora').write_text('TEST_HIGH=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=private.example)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=service)))', encoding='utf-8')
        (folder / 'ewallet.pem').write_text('not-a-real-wallet', encoding='utf-8')
        with patch.dict(os.environ, DB_WALLET_PATH=str(folder)):
            response = self.client.get('/api/connections/options')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['data']['tns_aliases'], ['TEST_HIGH'])
            self.assertTrue(response.json()['data']['wallet_available'])
            self.assertNotIn('private.example', response.text)
            self.assertNotIn(str(folder), response.text)
            self.assertNotIn('not-a-real-wallet', response.text)

    def test_shared_server_details_resolve_settings_without_passwords(self):
        row = {'id': 'shared', 'name': 'Server', 'config': {'mode': 'system', 'allow_dml': True}, 'created_at': 'now', 'updated_at': 'now'}
        with patch.dict(os.environ, DB_MODE='cloud', DB_USER_CLD='SYSTEM_APP', DB_DSN_CLD='TEST_HIGH', DB_WALLET_PATH='private-wallet', DB_PASSWORD_CLD='private-db-secret', DB_WALLET_PASSWORD='private-wallet-secret'):
            public = target.public_connection(row)
        self.assertEqual(public['username'], 'SYSTEM_APP')
        self.assertEqual(public['dsn'], 'TEST_HIGH')
        self.assertEqual(public['connection_type'], 'tns')
        self.assertTrue(public['wallet_profile'])
        self.assertNotIn('private-', json.dumps(public))

    def test_save_edit_preserves_secret_and_connection_method(self):
        saved = self.save()
        payload = {**self.fields, 'password': '', 'dsn': 'TEST_HIGH', 'connection_type': 'tns', 'wallet_profile': True}
        response = self.client.put('/api/connections/' + saved['id'], headers=self.headers, json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['data']['has_password'])
        owner = self.client.get('/api/auth/session').json()['data']['user']
        stored = target.get_connection(saved['id'], owner)
        self.assertEqual(target.decrypt(stored['config']['password_enc']), self.fields['password'])
        self.assertEqual(stored['config']['connection_type'], 'tns')
        self.assertTrue(stored['config']['wallet_profile'])
        payload['connection_type'] = 'descriptor'
        self.assertEqual(self.client.put('/api/connections/' + saved['id'], headers=self.headers, json=payload).status_code, 422)


if __name__ == '__main__':
    unittest.main()
