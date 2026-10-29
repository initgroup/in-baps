"""Read-only SYSTEM startup measurements; never print credentials or payloads.

Run from any directory: venv/Scripts/python.exe scripts/benchmark_startup.py
"""
import argparse
import json
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend import config, database


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--samples', type=int, default=5, choices=range(1, 11))
    parser.add_argument('--output')
    args = parser.parse_args()
    if config.STORAGE != 'oracle':
        parser.error('This measurement requires the configured SYSTEM Oracle database.')
    output = config.project_path(args.output) if args.output else None
    if output and not output.is_relative_to(ROOT):
        parser.error('Output must remain inside the project.')
    report = {'storage': 'oracle', 'read_only': True, 'samples': {}}
    try:
        username = config.setting('BAPS_ADMIN_USER', 'admin')
        user = None
        for name in ('member', 'datasets', 'visualizations'):
            elapsed = []
            for _ in range(args.samples):
                started = time.perf_counter()
                if name == 'member':
                    rows = database.query('USER_GET', {'username': username})
                    if not rows:
                        raise RuntimeError('Configured member is absent.')
                    user = rows[0]
                elif name == 'datasets':
                    loader = getattr(database, 'list_dataset_metadata', None)
                    rows = loader(user['id']) if loader else database.list_records('dataset', user['id'])
                else:
                    rows = database.list_records('visualization', user['id'])
                elapsed.append(round((time.perf_counter() - started) * 1000, 2))
            report['samples'][name] = {'ms': elapsed, 'median_ms': statistics.median(elapsed), 'records': len(rows)}
        with database.connection() as conn:
            report['oracle_version'] = conn.version
            with conn.cursor() as cursor:
                cursor.execute("SELECT index_name, column_name, descend FROM user_ind_columns "
                               "WHERE table_name IN ('INIT$_TB_BAPS_RECORD','INIT$_TB_BAPS_SESSION','INIT$_TB_BAPS_MEMBER') "
                               "ORDER BY index_name, column_position")
                report['indexes'] = cursor.fetchall()
        if output:
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(report, ensure_ascii=False, indent=2))
    except Exception as error:
        # Driver messages may contain DSNs, network paths or connection details.
        print(json.dumps({'error': type(error).__name__, 'detail': 'SYSTEM measurement failed; verify network and configuration locally.'}))
        return 1
    finally:
        close_pool = getattr(database, 'close_pool', None)
        if close_pool:
            close_pool()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
