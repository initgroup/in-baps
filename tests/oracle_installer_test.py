"""Offline installer generation and guarded invocation; no live Oracle DDL."""
import contextlib
import hashlib
import io
import re
import types
import unittest
from unittest.mock import patch
from backend import config, migrate
from scripts.build_oracle_installer import DDL, render


class OracleInstallerTests(unittest.TestCase):
    def test_generated_file_preserves_baseline_sql_and_is_one_block(self):
        sql = (DDL / 'install_oracle.sql').read_text(encoding='utf-8')
        self.assertEqual(sql, render())
        blocks = migrate.split_statements(sql)
        self.assertEqual(len(blocks), 1)
        self.assertTrue(blocks[0].rstrip().endswith('END;'))
        baseline = (DDL / 'V001__baseline.sql').read_text(encoding='utf-8')
        for piece in migrate.split_statements(baseline):
            statement = re.sub(r'^--[^\n]*\n?', '', piece, flags=re.M).strip()
            self.assertIn("'" + statement.replace("'", "''") + "'", sql)
        # Parent PK/unique must be repaired before a missing child table is created.
        self.assertLess(sql.index("ensure_constraint('INIT$_TB_BAPS_MEMBER'"), sql.index("ensure_table('INIT$_TB_BAPS_SESSION'"))
        self.assertIn(hashlib.sha256((DDL / 'V001__baseline.sql').read_bytes()).hexdigest(), sql)
        self.assertLess(sql.index('No writable quota'), sql.index("ensure_table('INIT$_TB_BAPS_HISTORY'"))

    def test_install_requires_schema_and_checks_it_before_block(self):
        executed = []
        class Cursor:
            def execute(self, sql, params=None):
                executed.append(sql)
            def fetchone(self):
                return ('BAPS_TEST',)
            def close(self):
                pass
        class Connection:
            def cursor(self):
                return Cursor()
            def commit(self):
                pass
            def close(self):
                pass
        driver = types.SimpleNamespace(connect=lambda **kwargs: Connection())
        with patch.dict('sys.modules', {'oracledb': driver}), patch.object(config, 'oracle_connect_args', return_value={}):
            with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
                migrate.main(['install'])
            self.assertFalse(executed)
            with self.assertRaisesRegex(RuntimeError, 'Target schema mismatch'):
                migrate.main(['install', '--schema', 'WRONG_SCHEMA'])
            self.assertEqual(len(executed), 1)
            executed.clear()
            with contextlib.redirect_stdout(io.StringIO()):
                migrate.main(['install', '--schema', 'BAPS_TEST'])
            self.assertEqual(len(executed), 2)
            self.assertEqual(executed[1], migrate.split_statements(render())[0])


if __name__ == '__main__':
    unittest.main()
