import json
import os
from pathlib import Path
import tempfile
import unittest
from contextlib import contextmanager
from datetime import datetime
from decimal import Decimal
from unittest.mock import Mock, patch

from fastapi import HTTPException
from backend import target_database as target
from backend import target_api
from backend import database, auth


USER = {'id': 'member-one', 'role': 'analyst'}
DIRECT = {'id': 'target-one', 'config': {'mode': 'direct', 'username': 'CUSTOMER_ONLY', 'allow_dml': True}}
SYSTEM = {'id': 'target-one', 'config': {'mode': 'system', 'allow_dml': True}}


class Cursor:
    def __init__(self, rows=None, affected=1):
        self.rows = list(rows or [])
        self.description = [('ID',), ('VALUE',)]
        self.rowcount = affected
        self.calls = []
    def __enter__(self): return self
    def __exit__(self, *args): self.close()
    def close(self): pass
    def execute(self, statement, binds=None): self.calls.append((statement, binds))
    def fetchmany(self, size):
        batch, self.rows = self.rows[:size], self.rows[size:]
        return batch


class TargetTests(unittest.TestCase):
    def test_connection_crud_uses_real_system_store_and_preserves_owned_objects(self):
        with tempfile.TemporaryDirectory() as temp, patch.object(target.config, 'STORAGE', 'sqlite'), patch.object(target.config, 'DATA_DIR', Path(temp)), patch.dict(os.environ, {'BAPS_SECRET_KEY': 'isolated-test-only-key-' * 3}):
            database.initialize()
            user = auth.create_user('target-test-member', 'Test member', 'test-only-password')
            fields = {'name': 'Customer', 'username': 'CUSTOMER', 'dsn': 'example/service', 'password': 'db-test-password', 'allow_dml': True}
            public = target.save_connection(user, fields)
            record = target.get_connection(public['id'], user)
            self.assertEqual(target.decrypt(record['config']['password_enc']), fields['password'])
            target.remember_table(record, user, 'INIT$_TB_TEST_CUSTOMER')
            updated = target.save_connection(user, {**fields, 'name': 'Renamed', 'password': ''}, public['id'])
            record = target.get_connection(public['id'], user)
            self.assertEqual(updated['name'], 'Renamed')
            self.assertEqual(record['config']['managed_tables'], ['INIT$_TB_TEST_CUSTOMER'])
            self.assertEqual(target.decrypt(record['config']['password_enc']), fields['password'])
            self.assertEqual(target.managed_tables(user, public['id']), {'INIT$_TB_TEST_CUSTOMER'})
            with self.assertRaises(HTTPException):
                target.get_connection(public['id'], {'id': 'another-member'})

    def test_encrypted_credentials_fail_closed_and_public_output_redacts(self):
        with patch.dict(os.environ, {'BAPS_SECRET_KEY': 'test-key-only-never-production-' * 2}):
            encrypted = target.encrypt('topsecret')
            self.assertNotIn('topsecret', encrypted)
            self.assertEqual(target.decrypt(encrypted), 'topsecret')
            cfg = {'mode': 'direct', 'username': 'MEMBER', 'dsn': 'db/service', 'password_enc': encrypted}
            result = target.public_connection({'id': '1', 'name': 'x', 'config_json': json.dumps(cfg), 'created_at': 'x', 'updated_at': 'x'})
            self.assertTrue(result['has_password'])
            self.assertNotIn(encrypted, json.dumps(result))
        with patch.dict(os.environ, {'BAPS_SECRET_KEY': ''}):
            with self.assertRaises(HTTPException) as err:
                target.encrypt('secret')
            self.assertEqual(err.exception.status_code, 503)

    def test_connection_owner_is_part_of_lookup(self):
        with patch.object(target, 'query', return_value=[]) as query:
            with self.assertRaises(HTTPException) as err:
                target.get_connection('foreign', USER)
            self.assertEqual(err.exception.status_code, 404)
            query.assert_called_once_with('CONNECTION_GET', {'id': 'foreign', 'owner': USER['id']})

    def test_sql_blocks_ddl_plsql_system_data_and_function_side_effects(self):
        bad = [
            'DELETE FROM ORDERS', 'SELECT 1 FROM DUAL; DELETE FROM ORDERS',
            'SELECT * FROM INIT$_TB_BAPS_MEMBER',
            'SELECT * FROM OTHER.ORDERS', 'SELECT * FROM ORDERS@LINK',
            'SELECT PKG.DO_WRITE() FROM DUAL', 'SELECT my_function() FROM DUAL',
            'SELECT SEQ.NEXTVAL FROM DUAL', 'SELECT * FROM ORDERS FOR UPDATE',
            'WITH FUNCTION f RETURN NUMBER IS BEGIN RETURN 1; END; SELECT f() FROM DUAL',
        ]
        for sql in bad:
            with self.subTest(sql=sql), self.assertRaises(HTTPException):
                target.validate_sql(sql, DIRECT, USER)

    def test_cte_scope_cannot_hide_foreign_table(self):
        owned = 'INIT$_TB_BAPS_C_123456789ABC'
        with patch.object(target, 'managed_tables', return_value={owned}):
            accepted = f'WITH X AS (SELECT * FROM {owned}) SELECT COUNT(*) FROM X'
            self.assertEqual(target.validate_sql(accepted, SYSTEM, USER), accepted)
            for sql in ['WITH SECRET AS (SELECT * FROM SECRET) SELECT * FROM SECRET',
                        'WITH X AS (SELECT * FROM INIT$_TB_BAPS_MEMBER) SELECT * FROM X',
                        'SELECT * FROM USER_TABLES']:
                with self.subTest(sql=sql), self.assertRaises(HTTPException):
                    target.validate_sql(sql, SYSTEM, USER)

    def test_sql_allows_bound_aggregates_and_literal_keywords(self):
        sql = "SELECT CHANNEL, SUM(REVENUE) TOTAL FROM ORDERS WHERE TITLE <> 'delete; drop' AND ID > :minimum GROUP BY CHANNEL"
        self.assertEqual(target.validate_sql(sql, DIRECT, USER), sql)
        self.assertEqual(target.checked_binds({'minimum': 1}), {'minimum': 1})
        with self.assertRaises(HTTPException): target.checked_binds({'baps_limit': 5000})

    def test_query_uses_readonly_transaction_and_limit_plus_one(self):
        cursor = Cursor([(1, 'a'), (2, 'b'), (3, 'c')])
        conn = Mock()
        conn.cursor.return_value = cursor
        @contextmanager
        def target_conn(_record): yield conn
        with patch.object(target, 'target_connection', target_conn):
            result = target.fetch_query(DIRECT, USER, 'SELECT ID, VALUE FROM ORDERS', {}, 2)
        self.assertTrue(result['truncated'])
        self.assertEqual(result['row_count'], 2)
        self.assertEqual(cursor.calls[0][0], 'SET TRANSACTION READ ONLY')
        self.assertEqual(cursor.calls[1][1]['baps_limit'], 3)
        conn.commit.assert_not_called()

    def test_dml_preview_does_not_commit_and_large_write_is_rejected(self):
        cursor, conn = Cursor(affected=2), Mock()
        conn.cursor.return_value = cursor
        @contextmanager
        def target_conn(_record): yield conn
        with patch.object(target, 'target_connection', target_conn):
            result = target.execute_dml(DIRECT, USER, 'UPDATE ORDERS SET VALUE=:value WHERE ID=:id', {'value': 'x', 'id': 1})
            self.assertFalse(result['committed'])
            conn.commit.assert_not_called()
            target.execute_dml(DIRECT, USER, 'DELETE FROM ORDERS WHERE ID=:id', {'id': 1}, True)
            conn.commit.assert_called_once()
            cursor.rowcount = 1001
            with self.assertRaises(HTTPException):
                target.execute_dml(DIRECT, USER, 'DELETE FROM ORDERS', {}, True)
            self.assertEqual(conn.commit.call_count, 1)

    def test_target_connection_always_rolls_back_and_closes(self):
        conn = Mock()
        cfg = {'config': {'mode': 'direct', 'username': 'u', 'password_enc': 'opaque', 'dsn': 'target'}}
        with patch.object(target, 'decrypt', return_value='secret'), patch.object(target.oracledb, 'connect', return_value=conn):
            with target.target_connection(cfg): pass
        conn.rollback.assert_called_once()
        conn.close.assert_called_once()

    def test_live_dataset_is_requeried_not_frozen(self):
        dataset = {'id': 'dataset', 'source': 'target-sql', 'target': {'connection_id': 'target-one', 'sql': 'SELECT * FROM ORDERS', 'limit': 100}}
        with patch.object(target, 'get_connection', return_value=DIRECT), patch.object(target, 'fetch_query', return_value={'rows': [{'ID': 2}], 'columns': [{'name': 'ID', 'type': 'number'}], 'row_count': 1, 'truncated': False}) as fetch:
            result = target.materialize_dataset(dataset, USER)
        self.assertEqual(result['rows'], [{'ID': 2}])
        fetch.assert_called_once_with(DIRECT, USER, 'SELECT * FROM ORDERS', {}, 100)

    def test_grid_datetime_originals_and_changes_use_typed_binds(self):
        columns = [{'name': 'ID', 'type': 'NUMBER', 'primary_key': 1}, {'name': 'EVENT_DATE', 'type': 'DATE', 'primary_key': 0}]
        payload = target_api.GridInput(connection_id='target-one', table='EVENTS', operation='update',
                                       original={'ID': 1, 'EVENT_DATE': '2026-10-29T12:13:14'},
                                       values={'EVENT_DATE': '2026-10-30T00:00:00'})
        with patch.object(target, 'get_connection', return_value=DIRECT), patch.object(target, 'target_columns', return_value=columns), patch.object(target, 'execute_dml', return_value={'affected_rows': 1, 'committed': False}) as execute:
            result = target_api.grid(payload, USER)
        self.assertEqual(result['data']['affected_rows'], 1)
        binds = execute.call_args.args[3]
        self.assertIn(Decimal('1'), binds.values())
        self.assertIn(datetime(2026, 10, 29, 12, 13, 14), binds.values())
        self.assertIn(datetime(2026, 10, 30), binds.values())

    def test_grid_rejects_incomplete_snapshot_and_binary_placeholder(self):
        columns = [{'name': 'ID', 'type': 'NUMBER', 'primary_key': 1}, {'name': 'VALUE', 'type': 'RAW', 'primary_key': 0}]
        with patch.object(target, 'get_connection', return_value=DIRECT), patch.object(target, 'target_columns', return_value=columns), patch.object(target, 'execute_dml') as execute:
            for original in ({'ID': 1}, {'ID': 1, 'VALUE': '[BINARY DATA]'}):
                payload = target_api.GridInput(connection_id='target-one', table='ORDERS', operation='delete', original=original)
                with self.assertRaises(HTTPException): target_api.grid(payload, USER)
        execute.assert_not_called()

    def test_query_result_byte_budget_is_enforced(self):
        cursor, conn = Cursor([(1, 'a' * 40), (2, 'b')]), Mock()
        conn.cursor.return_value = cursor
        @contextmanager
        def target_conn(_record): yield conn
        with patch.object(target, 'target_connection', target_conn), patch.object(target.config, 'MAX_BYTES', 30):
            result = target.fetch_query(DIRECT, USER, 'SELECT ID, VALUE FROM ORDERS')
        self.assertTrue(result['truncated'])
        self.assertEqual(result['rows'], [])

    def test_user_table_creation_keeps_names_without_system_prefix(self):
        # Exercise the API model and DDL path, including the registered ownership
        # name later used by the shared SYSTEM target's access checks.
        names = ['SALES', 'TB_CUSTOMER', 'sales_detail', '매출 내역', 'T' * 128]
        for name in names:
            with self.subTest(name=name):
                cursor, conn = Cursor(), Mock()
                conn.cursor.return_value = cursor
                @contextmanager
                def target_conn(_record): yield conn
                payload = target_api.TableInput(connection_id=DIRECT['id'], name=name,
                    columns=[{'name': 'ID', 'type': 'NUMBER', 'nullable': False},
                             {'name': 'customer_name', 'type': 'VARCHAR2'},
                             {'name': '매출 합계', 'type': 'NUMBER'}], primary_key=['ID'])
                with patch.object(target, 'get_connection', return_value=DIRECT), \
                     patch.object(target, 'target_connection', target_conn), \
                     patch.object(target, 'persist_ddl', return_value='.runtime/ddl/test.sql') as persist, \
                     patch.object(target, 'remember_table') as remember:
                    result = target_api.create_table(payload, USER)['data']
                self.assertEqual(result['table'], name)
                self.assertTrue(result['created'])
                self.assertEqual(cursor.calls, [(result['ddl'], None)])
                self.assertIn('CREATE TABLE ' + target.identifier(name), result['ddl'])
                self.assertIn('"customer_name" VARCHAR2(255 BYTE)', result['ddl'])
                self.assertIn('"매출 합계" NUMBER', result['ddl'])
                self.assertIn('PRIMARY KEY ("ID")', result['ddl'])
                self.assertNotIn('INIT$_', result['ddl'])
                persist.assert_called_once_with(DIRECT, USER, name, result['ddl'])
                remember.assert_called_once_with(DIRECT, USER, name)
                with patch.object(target, 'managed_tables', return_value={name}):
                    sql = 'SELECT * FROM ' + target.identifier(name)
                    self.assertEqual(target.validate_sql(sql, SYSTEM, USER), sql)

    def test_user_table_creation_still_checks_writes_and_protected_names(self):
        readonly = {**DIRECT, 'config': {**DIRECT['config'], 'allow_dml': False}}
        cases = [(readonly, 'SALES', 403), (DIRECT, 'INIT$_TB_BAPS_MEMBER', 422),
                 (DIRECT, 'init$_tb_baps_session', 422), (DIRECT, 'T' * 129, 422),
                 (DIRECT, '한' * 43, 422), (DIRECT, 'bad\x00name', 422)]
        with patch.object(target, 'target_connection') as connect, patch.object(target, 'persist_ddl') as persist:
            for record, name, status in cases:
                with self.subTest(name=name), self.assertRaises(HTTPException) as error:
                    target.create_table(record, USER, name, [{'name': 'ID', 'type': 'NUMBER'}], [])
                self.assertEqual(error.exception.status_code, status)
            connect.assert_not_called()
            persist.assert_not_called()

    def test_user_column_names_are_quoted_as_one_identifier_and_byte_limited(self):
        for name in ['customer_name', '고객 메모', 'CODE#', 'C' * 128, 'A"; DROP TABLE USERS; --']:
            with self.subTest(name=name):
                column = target_api.ColumnInput(name=name, type='NUMBER')
                ddl = 'CREATE TABLE "SALES" (' + target.column_definition(column.model_dump()) + ')'
                trees = target.sqlglot.parse(ddl, read='oracle')
                self.assertEqual(len(trees), 1)
                self.assertIsInstance(trees[0], target.exp.Create)
                self.assertEqual(next(trees[0].find_all(target.exp.ColumnDef)).this.name, name)
        with self.assertRaises(HTTPException):
            target.column_definition({'name': '한' * 43, 'type': 'NUMBER'})


if __name__ == '__main__':
    unittest.main()
