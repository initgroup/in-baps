"""Pool isolation and transaction cleanup without a live Oracle database."""
import types
import json
import tempfile
import unittest
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier, Lock
from unittest.mock import Mock, patch

from backend import database


class DatasetMetadataTests(unittest.TestCase):
    def test_large_metadata_preserves_nulls_order_and_owner_without_loading_rows(self):
        runtime = database.config.ROOT / '.runtime'
        runtime.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=runtime, prefix='catalog-performance-') as temporary, \
                patch.object(database.config, 'STORAGE', 'sqlite'), \
                patch.object(database.config, 'DATA_DIR', Path(temporary)):
            database.initialize()
            for owner in ('one', 'two'):
                database.query('USER_INSERT', dict(id=owner, username=owner, display_name=owner,
                               password_hash='unused-test-hash', role='analyst', created='2026-10-29'), write=True)
            document = dict(id='b', name='large metadata', created_at='2026-10-29',
                            description='x' * 5000, optional=None, nested={'rows': [1], 'optional': None},
                            rows=[{'value': 'large row data'}] * 1000, row_count=1000)
            database.put_record('dataset', 'one', document)
            database.put_record('dataset', 'one', {**document, 'id': 'a'})
            database.put_record('dataset', 'two', {**document, 'id': 'foreign'})
            database.put_record('analysis', 'one', {**document, 'id': 'analysis'})
            metadata = database.list_dataset_metadata('one')
            self.assertEqual([item['id'] for item in metadata], ['a', 'b'])
            self.assertEqual(metadata[1], {key: value for key, value in document.items() if key != 'rows'})
            self.assertGreater(len(json.dumps(metadata[1])), 4000)
            self.assertEqual(database.get_record('dataset', 'one', 'b'), document)
            self.assertEqual(database.list_dataset_metadata('absent'), [])


class PoolTests(unittest.TestCase):
    def test_parallel_requests_reuse_one_bounded_pool_and_release_isolated_transactions(self):
        connections, lock, start = [], Lock(), Barrier(4)

        def acquire():
            conn = Mock()
            with lock:
                connections.append(conn)
            return conn

        pool = Mock()
        pool.acquire.side_effect = acquire
        driver = types.SimpleNamespace(create_pool=Mock(return_value=pool), POOL_GETMODE_TIMEDWAIT=3)

        def request(index):
            start.wait(timeout=5)
            try:
                with database.connection(commit=index == 1):
                    if index == 2:
                        raise ValueError('Request failed')
            except ValueError:
                pass

        with patch.dict('sys.modules', {'oracledb': driver}), \
                patch.object(database.config, 'STORAGE', 'oracle'), \
                patch.object(database.config, 'oracle_connect_args', return_value={}), \
                patch.object(database.config, 'setting', return_value='4'), \
                patch.object(database, '_pool', None):
            with ThreadPoolExecutor(max_workers=4) as executor:
                list(executor.map(request, range(4)))
            driver.create_pool.assert_called_once()
            self.assertEqual(driver.create_pool.call_args.kwargs['max'], 4)
            self.assertEqual(driver.create_pool.call_args.kwargs['wait_timeout'], 15000)
            self.assertEqual(len({id(conn) for conn in connections}), 4)
            self.assertEqual(sum(conn.commit.call_count for conn in connections), 1)
            self.assertEqual(sum(conn.rollback.call_count for conn in connections), 1)
            for conn in connections:
                conn.close.assert_called_once_with()
            database.close_pool()
            pool.close.assert_called_once_with()
            self.assertIsNone(database._pool)

    def test_pool_creation_failure_can_recover_without_another_storage_backend(self):
        pool = Mock()
        driver = types.SimpleNamespace(
            create_pool=Mock(side_effect=[RuntimeError('Unavailable'), pool]), POOL_GETMODE_TIMEDWAIT=3)
        with patch.dict('sys.modules', {'oracledb': driver}), \
                patch.object(database.config, 'oracle_connect_args', return_value={}), \
                patch.object(database, '_pool', None):
            with self.assertRaises(RuntimeError):
                database.system_pool()
            self.assertIsNone(database._pool)
            self.assertIs(database.system_pool(), pool)
            database.close_pool()


if __name__ == '__main__':
    unittest.main()
