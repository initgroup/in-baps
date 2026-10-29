"""Oracle native JSON and legacy CLOB boundaries, without a database connection."""
import json
import unittest
from contextlib import contextmanager
from unittest.mock import Mock, patch

from fastapi import HTTPException

from backend import database
from backend import target_database as target


class LegacyLOB:
    def __init__(self, document):
        self.text = json.dumps(document)
        self.read_count = 0

    def read(self):
        self.read_count += 1
        return self.text


def stored_document(document, representation):
    if representation == 'native':
        return dict(document)
    if representation == 'lob':
        return LegacyLOB(document)
    return json.dumps(document)


@contextmanager
def system_rows(columns, rows):
    """Replace only the driver boundary; keep named SQL and query decoding real."""
    cursor = Mock()
    cursor.description = [(column,) for column in columns]
    cursor.fetchall.return_value = rows
    conn = Mock()
    conn.cursor.return_value = cursor
    with patch.object(database, 'connection') as connect:
        connect.return_value.__enter__.return_value = conn
        with patch.object(database.config, 'STORAGE', 'oracle'):
            yield cursor
    cursor.close.assert_called_once_with()


class JsonStorageTests(unittest.TestCase):
    user = {'id': 'json-regression-member', 'role': 'analyst'}
    dataset = {
        'id': 'json-regression-dataset', 'source': 'target-sql',
        'target': {'connection_id': 'json-regression-target', 'sql': 'SELECT ID FROM ORDERS'},
        'columns': [{'name': 'ID', 'type': 'number'}], 'sample': False,
    }
    target_config = {
        'mode': 'direct', 'username': 'TEST_CUSTOMER', 'dsn': 'invalid.example/test',
        'password_enc': 'fernet:FAKE-REGRESSION-CIPHERTEXT', 'allow_dml': True,
        'wallet_profile': False, 'managed_tables': ['INIT$_TB_BAPS_C_TEST'],
    }

    def test_catalog_get_and_list_accept_driver_json_forms_and_bind_owner(self):
        for representation in ('native', 'text', 'lob'):
            for operation in ('get', 'list'):
                with self.subTest(representation=representation, operation=operation):
                    raw = stored_document(self.dataset, representation)
                    with system_rows(['PAYLOAD'], [(raw,)]) as cursor:
                        if operation == 'get':
                            result = database.get_record('dataset', self.user['id'], self.dataset['id'])
                            expected_id = 'RECORD_GET'
                            expected_binds = {'kind': 'dataset', 'owner': self.user['id'], 'id': self.dataset['id']}
                        else:
                            result = database.list_records('dataset', self.user['id'])
                            expected_id = 'RECORD_LIST'
                            expected_binds = {'kind': 'dataset', 'owner': self.user['id']}
                        self.assertEqual(result, self.dataset if operation == 'get' else [self.dataset])
                        cursor.execute.assert_called_once_with(database.statements()[expected_id], expected_binds)
                    if representation == 'lob':
                        self.assertEqual(raw.read_count, 1)

    def test_missing_owned_catalog_record_stays_absent(self):
        with system_rows(['PAYLOAD'], []) as cursor:
            self.assertIsNone(database.get_record('dataset', self.user['id'], 'foreign-record'))
            self.assertEqual(cursor.execute.call_args.args[1]['owner'], self.user['id'])
        with system_rows(['PAYLOAD'], []):
            self.assertEqual(database.list_records('dataset', self.user['id']), [])

    def assert_public_connection(self, public):
        self.assertEqual(set(public), {
            'id', 'name', 'username', 'dsn', 'mode', 'wallet_profile',
            'allow_dml', 'has_password', 'created_at', 'updated_at', 'connection_type',
        })
        self.assertEqual(public['username'], self.target_config['username'])
        self.assertTrue(public['has_password'])
        self.assertTrue(public['allow_dml'])
        self.assertNotIn(self.target_config['password_enc'], json.dumps(public))
        self.assertNotIn('managed_tables', public)

    def test_connection_lookup_and_public_list_decode_and_redact_all_json_forms(self):
        columns = ['ID', 'NAME', 'CONFIG_JSON', 'CREATED_AT', 'UPDATED_AT']
        for representation in ('native', 'text', 'lob'):
            with self.subTest(representation=representation):
                raw = stored_document(self.target_config, representation)
                with system_rows(columns, [('json-regression-target', 'Customer DB', raw, 'created', 'updated')]) as cursor:
                    record = target.get_connection('json-regression-target', self.user)
                    self.assertEqual(record['config'], self.target_config)
                    self.assertNotIn('config_json', record)
                    self.assert_public_connection(target.public_connection(record))
                    cursor.execute.assert_called_once_with(database.statements()['CONNECTION_GET'], {
                        'id': 'json-regression-target', 'owner': self.user['id'],
                    })
                # The connection-list endpoint also passes raw rows directly to the serializer.
                row = dict(zip([column.lower() for column in columns], [
                    'json-regression-target', 'Customer DB',
                    stored_document(self.target_config, representation), 'created', 'updated',
                ]))
                self.assert_public_connection(target.public_connection(row))

    def test_locked_config_keeps_owner_lock_and_existing_registration_for_all_json_forms(self):
        for representation in ('native', 'text', 'lob'):
            with self.subTest(representation=representation):
                raw = stored_document(self.target_config, representation)
                cursor, conn = Mock(), Mock()
                cursor.fetchone.return_value = (raw,)
                with patch.object(target.config, 'STORAGE', 'oracle'):
                    result = target.locked_connection_config(conn, cursor, 'json-regression-target', self.user)
                self.assertEqual(result, self.target_config)
                statement = database.statements()['CONNECTION_LOCK']
                self.assertIn('FOR UPDATE', statement.upper())
                cursor.execute.assert_called_once_with(statement, {
                    'id': 'json-regression-target', 'owner': self.user['id'],
                })
                conn.execute.assert_not_called()
                if representation == 'lob':
                    self.assertEqual(raw.read_count, 1)

    def test_missing_owned_connection_is_rejected_before_decoding(self):
        with system_rows(['CONFIG_JSON'], []):
            with self.assertRaises(HTTPException) as error:
                target.get_connection('foreign-target', self.user)
            self.assertEqual(error.exception.status_code, 404)
        cursor = Mock()
        cursor.fetchone.return_value = None
        with patch.object(target.config, 'STORAGE', 'oracle'):
            with self.assertRaises(HTTPException) as error:
                target.locked_connection_config(Mock(), cursor, 'foreign-target', self.user)
            self.assertEqual(error.exception.status_code, 404)
        self.assertEqual(cursor.execute.call_args.args[1], {'id': 'foreign-target', 'owner': self.user['id']})

    def test_stored_array_is_not_accepted_as_a_catalog_document(self):
        for raw in ('[]', LegacyLOB([])):
            with self.subTest(representation=type(raw).__name__):
                with system_rows(['PAYLOAD'], [(raw,)]):
                    with self.assertRaisesRegex(ValueError, 'JSON document object'):
                        database.get_record('dataset', self.user['id'], self.dataset['id'])


if __name__ == '__main__':
    unittest.main()
