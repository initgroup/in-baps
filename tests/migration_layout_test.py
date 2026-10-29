"""No database access: classified SQL order and existing history compatibility."""
import tempfile
import hashlib
import unittest
from pathlib import Path
from unittest.mock import patch
from backend import config, migrate
from backend.database import statements


class MigrationLayoutTests(unittest.TestCase):
    def test_baseline_keeps_identity_and_runtime_ids(self):
        files = migrate.migration_files()
        self.assertEqual(files[0][0].relative_to(config.ROOT).as_posix(), 'database/DDL/V001__baseline.sql')
        legacy = config.ROOT / 'reference/database/legacy-prototype/V001__baseline.sql'
        self.assertEqual(hashlib.sha256(legacy.read_bytes()).hexdigest(), '12472293754a84a80e300c3e3fa5321783dd094fe582b1a20f9932d481e9cef6')
        self.assertNotEqual(files[0][1], hashlib.sha256(legacy.read_bytes()).hexdigest())
        self.assertNotIn('INBAPS_USERS', '\n'.join(statements().values()))
        self.assertIn('USER_GET', statements())
        self.assertIn('RECORD_INSERT', statements())
        self.assertIn('MIGRATION_LIST', statements())

    def test_global_order_duplicates_and_non_executable_examples(self):
        runtime = config.ROOT / '.runtime'
        runtime.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=runtime, prefix='sql-layout-') as temporary:
            root = Path(temporary)
            for group in migrate.MIGRATION_GROUPS:
                (root / group).mkdir()
            (root / 'DDL/V001__baseline.sql').write_text('CREATE TABLE INIT$_TB_BAPS_HISTORY (ID NUMBER)\n/\n')
            (root / 'DDL/V004__new_object.sql').write_text('CREATE TABLE INIT$_TB_BAPS_EXTRA (ID NUMBER)\n/\n')
            (root / 'ALT/V002__change_object.sql').write_text('ALTER TABLE INIT$_TB_BAPS_EXTRA ADD NAME VARCHAR2(20)\n/\n')
            (root / 'DML/V003__seed.sql').write_text('INSERT INTO INIT$_TB_BAPS_EXTRA (ID) VALUES (1)\n/\n')
            (root / 'ALT/V005__example.sql.example').write_text('NOT EXECUTABLE')
            with patch.object(migrate, 'DATABASE_ROOT', root):
                self.assertEqual([p.name[:4] for p, _ in migrate.migration_files()], ['V001', 'V002', 'V003', 'V004'])
                duplicate = root / 'DDL/V002__duplicate.sql'
                duplicate.write_text('SELECT 1 FROM DUAL\n/\n')
                with self.assertRaisesRegex(RuntimeError, 'Duplicate migration version'):
                    migrate.migration_files()
                duplicate.unlink()
                (root / 'ALT/Vbroken.sql').write_text('SELECT 1 FROM DUAL\n/\n')
                with self.assertRaisesRegex(RuntimeError, 'Invalid migration filename'):
                    migrate.migration_files()


if __name__ == '__main__':
    unittest.main()
