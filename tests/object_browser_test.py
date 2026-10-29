import unittest
from contextlib import contextmanager
from unittest.mock import Mock, patch
from fastapi import HTTPException
import connection_test as fixtures
from backend import object_browser as browser, target_database as target, database, config


class ObjectBrowserTests(unittest.TestCase):
    setUp = fixtures.ConnectionTests.setUp
    tearDown = fixtures.ConnectionTests.tearDown
    signup = fixtures.ConnectionTests.signup
    save = fixtures.ConnectionTests.save
    def test_filter_is_owned_persistent_and_survives_connection_edit(self):
        saved = self.save()
        path = '/api/connections/' + saved['id'] + '/object-filter'
        values = {'scope': 'schema', 'hide_system': False, 'exclude_prefixes': ['TMP_', 'tmp_', 'INIT$_'], 'exclude_types': ['INDEX']}
        self.assertEqual(self.client.put(path, json=values).status_code, 403)
        self.assertEqual(self.other.put(path, headers=self.other_headers, json=values).status_code, 404)
        response = self.client.put(path, headers=self.headers, json=values)
        self.assertEqual(response.status_code, 200)
        values['exclude_prefixes'] = ['TMP_', 'INIT$_']
        self.assertEqual(response.json()['data']['filter'], values)
        self.assertEqual(self.client.get(path).json()['data']['filter'], values)
        owner = self.client.get('/api/auth/session').json()['data']['user']
        target.remember_table(target.get_connection(saved['id'], owner), owner, 'MyTable')
        self.client.put('/api/connections/' + saved['id'], headers=self.headers, json={**self.fields, 'password': '', 'name': 'Edited'})
        stored = target.get_connection(saved['id'], owner)['config']
        self.assertEqual(stored['object_filter'], values)
        self.assertEqual(stored['managed_tables'], ['MyTable'])
        self.assertEqual(target.decrypt(stored['password_enc']), self.fields['password'])
        self.assertEqual(self.client.put(path, headers=self.headers, json={**values, 'exclude_types': ['INVALID']}).status_code, 422)
        self.assertEqual(self.client.put(path, headers=self.headers, json={**values, 'exclude_prefixes': ['가' * 50]}).status_code, 422)

    def test_restricted_role_controls_metadata_scope_but_not_sql_rights(self):
        record = {'id': 'shared', 'config': {'mode': 'system', 'object_filter': {'scope': 'schema', 'hide_system': False}}}
        analyst = {'id': 'member', 'role': 'analyst'}
        admin = {**analyst, 'role': 'admin'}
        self.assertEqual(browser.settings(record, analyst)['filter']['scope'], 'owned')
        self.assertEqual(browser.settings(record, admin)['filter']['scope'], 'schema')
        with self.assertRaises(HTTPException) as denied:
            browser.save_settings(record, analyst, {'scope': 'schema'})
        self.assertEqual(denied.exception.status_code, 403)
        with patch.object(target, 'managed_tables', return_value=set()):
            for name in ['OTHER_MEMBER_TABLE', 'INIT$_TB_BAPS_MEMBER']:
                with self.assertRaises(HTTPException):
                    target.require_table(name, record, admin)

    def browse(self, record, rows, user=None, owned=None):
        cursor = Mock()
        cursor.__enter__ = Mock(return_value=cursor)
        cursor.__exit__ = Mock(return_value=False)
        cursor.fetchmany.side_effect = [rows, []]
        conn = Mock();conn.cursor.return_value = cursor
        @contextmanager
        def connect(_): yield conn
        with patch.object(target, 'target_connection', connect), patch.object(target, 'managed_tables', return_value=owned or set()):
            result = browser.list_objects(record, user or {'id': 'owner', 'role': 'admin'}, 'A_%')
        self.assertEqual(cursor.execute.call_args.args[1]['search'], '%A\\_\\%%')
        return result

    def test_filters_use_literal_prefixes_and_classify_related_system_objects(self):
        rows = [('INIT$_TB_BAPS_MEMBER', 'TABLE', 'VALID', None), ('SYS_IDX', 'INDEX', 'VALID', 'INIT$_TB_BAPS_MEMBER'),
                ('TMP_OLD', 'TABLE', 'VALID', None), ('TMPXKEEP', 'TABLE', 'VALID', None),
                ('FN_SCORE', 'FUNCTION', 'VALID', None), ('USER_IDX', 'INDEX', 'VALID', 'TMPXKEEP')]
        record = {'id': 'c', 'config': {'mode': 'direct', 'username': 'CUSTOMER', 'object_filter': {'scope': 'schema', 'hide_system': True, 'exclude_prefixes': ['TMP_'], 'exclude_types': ['INDEX']}}}
        result = self.browse(record, rows)
        self.assertEqual([item['name'] for item in result['objects']], ['TMPXKEEP', 'FN_SCORE'])
        self.assertEqual(result['excluded_count'], 4)
        record['config']['object_filter'] = {'scope': 'schema', 'hide_system': False}
        result = self.browse(record, rows)
        self.assertTrue(result['objects'][0]['metadata_only'])
        self.assertTrue(result['objects'][1]['system_object'])

    def test_owned_table_indexes_are_visible_but_foreign_objects_are_not(self):
        record = {'id': 'shared', 'config': {'mode': 'system'}}
        rows = [('OWN_TABLE', 'TABLE', 'VALID', None), ('OWN_INDEX', 'INDEX', 'VALID', 'OWN_TABLE'), ('FOREIGN_TABLE', 'TABLE', 'VALID', None)]
        result = self.browse(record, rows, {'id': 'member', 'role': 'analyst'}, {'OWN_TABLE'})
        self.assertEqual([item['name'] for item in result['objects']], ['OWN_TABLE', 'OWN_INDEX'])
        self.assertFalse(any(item['metadata_only'] for item in result['objects']))
        cursor = Mock();cursor.fetchone.return_value = rows[1]
        with patch.object(target, 'managed_tables', return_value={'OWN_TABLE'}):
            browser.require_ddl(cursor, record, {'id': 'member'}, 'OWN_INDEX', 'INDEX')
            cursor.fetchone.return_value = rows[2]
            with self.assertRaises(HTTPException):
                browser.require_ddl(cursor, record, {'id': 'member'}, 'FOREIGN_TABLE', 'TABLE')

    def test_metadata_limit_applies_after_filtering(self):
        rows = [('TMP_' + str(i), 'TABLE', 'VALID', None) for i in range(10)] + [('KEEP_' + str(i), 'TABLE', 'VALID', None) for i in range(3)]
        record = {'id': 'c', 'config': {'mode': 'direct', 'username': 'CUSTOMER', 'object_filter': {'scope': 'schema', 'exclude_prefixes': ['TMP_']}}}
        with patch.object(browser, 'MAX_OBJECTS', 2):
            result = self.browse(record, rows)
        self.assertEqual(len(result['objects']), 2)
        self.assertTrue(result['truncated'])
        self.assertEqual(result['excluded_count'], 10)
