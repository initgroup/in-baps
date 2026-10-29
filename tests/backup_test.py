"""Focused backup privacy and configured SQLite path checks."""
from contextlib import closing
from pathlib import Path
import os
import sqlite3
import tempfile
import unittest
from unittest.mock import patch
from zipfile import ZipFile

from scripts.backup import configured_data_dir, create_backup


class BackupTests(unittest.TestCase):
    def test_generated_ddl_is_portable_but_admin_credentials_and_runtime_are_private(self):
        with tempfile.TemporaryDirectory(prefix='inbaps-backup-ddl-') as temporary:
            root = Path(temporary)
            (root / '.runtime/ddl/owner').mkdir(parents=True)
            (root / 'secrets').mkdir()
            (root / '.runtime/ddl/owner/table.sql').write_text('CREATE TABLE INIT$_TB_TEST (ID NUMBER);')
            (root / '.runtime/session.json').write_text('private')
            (root / 'secrets/initial-admin.txt').write_text('private')
            (root / '.env').write_text('BAPS_ADMIN_PASSWORD=private')
            with patch.dict(os.environ, {'BAPS_DATA_DIR': '.runtime/data'}):
                archive, _, _ = create_backup(root)
            with ZipFile(archive) as opened:
                self.assertEqual(opened.namelist(), ['.runtime/ddl/owner/table.sql'])

    def test_custom_data_directory_is_private_and_can_be_snapshotted(self):
        with tempfile.TemporaryDirectory(prefix='inbaps-backup-test-') as temporary:
            root = Path(temporary)
            data = root / 'private-data'
            data.mkdir()
            (root / 'README.md').write_text('public source', encoding='utf8')
            (root / 'orphan.sqlite3').write_text('private orphan', encoding='utf8')
            (root / 'orphan.db-wal').write_text('private journal', encoding='utf8')
            (data / 'metadata.json').write_text('private metadata', encoding='utf8')
            with closing(sqlite3.connect(data / 'inbaps.db')) as connection:
                connection.execute('CREATE TABLE records (value INTEGER)')
                connection.execute('INSERT INTO records VALUES (42)')
                connection.commit()
            with patch.dict(os.environ, {'BAPS_DATA_DIR': 'private-data'}):
                source_archive, _, snapshots = create_backup(root)
            self.assertEqual(snapshots, 0)
            with ZipFile(source_archive) as archive:
                self.assertEqual(archive.namelist(), ['README.md'])
            with patch.dict(os.environ, {'BAPS_DATA_DIR': 'private-data'}):
                data_archive, _, snapshots = create_backup(root, include_data=True)
            self.assertEqual(snapshots, 1)
            with ZipFile(data_archive) as archive:
                self.assertNotIn('private-data/metadata.json', archive.namelist())
                snapshot = root / '.runtime' / 'verified.db'
                snapshot.write_bytes(archive.read('data/inbaps.db'))
            with closing(sqlite3.connect(snapshot)) as connection:
                self.assertEqual(connection.execute('SELECT value FROM records').fetchone(), (42,))

    def test_data_directory_outside_project_is_rejected(self):
        with tempfile.TemporaryDirectory(prefix='inbaps-backup-boundary-') as temporary:
            with self.assertRaises(ValueError):
                configured_data_dir(Path(temporary), '../outside')


if __name__ == '__main__':
    unittest.main()
