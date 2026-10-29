"""Membership/session integration tests against an isolated local SYSTEM DB."""
import hashlib
import os
import tempfile
import unittest
from unittest.mock import patch

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from backend import auth, config
from backend.auth_api import router
from backend.database import initialize, query, statements


class MembershipTests(unittest.TestCase):
    def setUp(self):
        (config.ROOT / '.runtime').mkdir(exist_ok=True)
        self.directory = tempfile.TemporaryDirectory(prefix='membership-test-', dir=config.ROOT / '.runtime')
        from pathlib import Path
        self.patches = [
            patch.object(config, 'STORAGE', 'sqlite'),
            patch.object(config, 'DATA_DIR', Path(self.directory.name)),
            patch.object(config, 'COOKIE_SECURE', False),
            patch.dict(os.environ, BAPS_ADMIN_PASSWORD='', BAPS_PUBLIC_ORIGIN='',
                       RENDER_EXTERNAL_HOSTNAME='', BAPS_SESSION_IDLE_MINUTES='1',
                       BAPS_SESSION_MAX_HOURS='1'),
        ]
        for item in self.patches:
            item.start()
        auth._attempts.clear()
        statements.cache_clear()
        initialize()
        self.app = FastAPI()
        self.app.include_router(router)

        @self.app.get('/api/private')
        def private(user=Depends(auth.require_user)):
            return auth.public_user(user)

        @self.app.get('/api/admin')
        def admin(user=Depends(auth.require_admin)):
            return auth.public_user(user)

        self.client = TestClient(self.app)
        self.payload = {'username': 'member.one', 'display_name': '회원 하나', 'password': 'a-member-password-2026!'}

    def tearDown(self):
        self.client.close()
        for item in reversed(self.patches):
            item.stop()
        self.directory.cleanup()

    def signup(self, **changes):
        response = self.client.post('/api/auth/signup', json={**self.payload, **changes})
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()['data']

    def test_signup_persists_member_and_only_exposes_public_identity(self):
        data = self.signup(username='Member.One')
        self.assertEqual(data['user']['username'], 'member.one')
        self.assertEqual(data['user']['role'], 'analyst')
        self.assertNotIn('password_hash', data['user'])
        stored = query('USER_GET', {'username': 'member.one'})[0]
        self.assertNotEqual(stored['password_hash'], self.payload['password'])
        self.assertTrue(auth.verify_password(self.payload['password'], stored['password_hash']))
        self.assertEqual(self.client.get('/api/admin').status_code, 403)
        self.assertEqual(self.client.get('/api/private', headers={'X-Role': 'admin'}).json()['role'], 'analyst')
        self.assertFalse(self.client.get('/api/auth/options').json()['data']['demo_available'])
        self.assertEqual(self.client.post('/api/auth/demo').status_code, 404)

    def test_signup_rejects_duplicate_weak_password_and_role_escalation(self):
        self.signup()
        response = self.client.post('/api/auth/signup', json={**self.payload, 'username': 'MEMBER.ONE'})
        self.assertEqual(response.status_code, 409)
        self.assertEqual(self.client.post('/api/auth/signup', json={**self.payload, 'username': 'two', 'role': 'admin'}).status_code, 422)
        self.assertEqual(self.client.post('/api/auth/signup', json={**self.payload, 'username': 'two', 'password': 'short'}).status_code, 422)
        self.assertEqual(self.client.post('/api/auth/signup', json={**self.payload, 'username': 'two', 'display_name': '   '}).status_code, 422)
        self.assertEqual(len(query('USER_GET', {'username': 'member.one'})), 1)

    def test_login_rotation_logout_and_csrf(self):
        first = self.signup()
        old_token = self.client.cookies.get(config.COOKIE)
        login = self.client.post('/api/auth/login', json={'username': 'Member.One', 'password': self.payload['password']})
        self.assertEqual(login.status_code, 200)
        current = login.json()['data']
        self.assertNotEqual(first['csrf_token'], current['csrf_token'])
        self.assertNotEqual(old_token, self.client.cookies.get(config.COOKIE))
        self.assertFalse(query('SESSION_GET', {'token_hash': hashlib.sha256(old_token.encode()).hexdigest(), 'now': 0}))
        self.assertEqual(self.client.post('/api/auth/logout').status_code, 403)
        self.assertEqual(self.client.post('/api/auth/logout', headers={'X-CSRF-Token': first['csrf_token']}).status_code, 403)
        self.assertEqual(self.client.post('/api/auth/logout', headers={'X-CSRF-Token': current['csrf_token']}).status_code, 200)
        self.assertEqual(self.client.get('/api/auth/session').status_code, 401)

    def test_session_poll_does_not_extend_idle_and_expiry_is_server_enforced(self):
        with patch('backend.auth.time.time', return_value=1000):
            data = self.signup()
        self.assertEqual(data['idle_expires_at'], 1060)
        with patch('backend.auth.time.time', return_value=1030):
            response = self.client.get('/api/auth/session')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['idle_expires_at'], 1060)
        with patch('backend.auth.time.time', return_value=1061):
            self.assertEqual(self.client.get('/api/private').status_code, 401)
            self.assertEqual(self.client.post('/api/auth/activity', headers={'X-CSRF-Token': data['csrf_token']}).status_code, 401)

    def test_business_activity_extends_idle_but_not_absolute_lifetime(self):
        with patch('backend.auth.time.time', return_value=1000):
            data = self.signup()
        with patch('backend.auth.time.time', return_value=1030):
            self.assertEqual(self.client.get('/api/private').status_code, 200)
            self.assertEqual(self.client.get('/api/auth/session').json()['data']['idle_expires_at'], 1090)
        with patch.dict(os.environ, BAPS_SESSION_IDLE_MINUTES='480'), patch('backend.auth.time.time', return_value=1050):
            response = self.client.post('/api/auth/activity', headers={'X-CSRF-Token': data['csrf_token']})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['idle_expires_at'], 4600)
        self.assertEqual(response.json()['data']['expires_at'], 4600)
        with patch('backend.auth.time.time', return_value=4601):
            self.assertEqual(self.client.get('/api/private').status_code, 401)

    def test_origin_is_checked_on_signup_and_authenticated_mutations(self):
        self.assertEqual(self.client.post('/api/auth/signup', json=self.payload, headers={'Origin': 'https://evil.example'}).status_code, 403)
        data = self.signup()
        self.assertEqual(self.client.post('/api/auth/activity', headers={'X-CSRF-Token': data['csrf_token'], 'Origin': 'https://evil.example'}).status_code, 403)
        self.assertEqual(self.client.post('/api/auth/activity', headers={'X-CSRF-Token': data['csrf_token'], 'Sec-Fetch-Site': 'cross-site'}).status_code, 403)
        self.assertEqual(self.client.post('/api/auth/activity', headers={'X-CSRF-Token': data['csrf_token'], 'Origin': 'http://testserver'}).status_code, 200)

    def test_login_errors_and_rate_limit_do_not_grant_identity(self):
        self.signup()
        expected = None
        for username in ('member.one', 'unknown.user'):
            response = self.client.post('/api/auth/login', json={'username': username, 'password': 'incorrect-password'})
            self.assertEqual(response.status_code, 401)
            if expected is None:
                expected = response.json()
            self.assertEqual(response.json(), expected)
        auth._attempts.clear()
        for _ in range(12):
            self.assertEqual(self.client.post('/api/auth/login', json={'username': 'unknown.user', 'password': 'incorrect-password'}).status_code, 401)
        self.assertEqual(self.client.post('/api/auth/login', json={'username': 'unknown.user', 'password': 'incorrect-password'}).status_code, 429)

    def test_bootstrap_does_not_promote_existing_member(self):
        self.signup()
        with patch.dict(os.environ, BAPS_ADMIN_USER='member.one', BAPS_ADMIN_PASSWORD='configured-admin-password'):
            with self.assertRaisesRegex(RuntimeError, 'non-administrator'):
                auth.initialize_admin()
        self.assertEqual(query('USER_GET', {'username': 'member.one'})[0]['role'], 'analyst')

    def test_bootstrap_preserves_existing_admin_credentials(self):
        created = auth.create_user('existing.admin', 'Admin', 'original-admin-password', 'admin')
        with patch.dict(os.environ, BAPS_ADMIN_USER='existing.admin', BAPS_ADMIN_PASSWORD='short'):
            auth.initialize_admin()
        stored = query('USER_GET', {'username': 'existing.admin'})[0]
        self.assertEqual(stored['id'], created['id'])
        self.assertTrue(auth.verify_password('original-admin-password', stored['password_hash']))
        self.assertFalse(auth.verify_password('short', stored['password_hash']))

    def test_bootstrap_rejects_short_password_for_new_admin(self):
        with patch.dict(os.environ, BAPS_ADMIN_USER='new.admin', BAPS_ADMIN_PASSWORD='short'):
            with self.assertRaisesRegex(RuntimeError, '12 to 256'):
                auth.initialize_admin()
        self.assertEqual(query('USER_GET', {'username': 'new.admin'}), [])


if __name__ == '__main__':
    unittest.main()
