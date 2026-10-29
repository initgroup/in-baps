"""Portable source backup; private configuration is deliberately excluded."""
from __future__ import annotations

import argparse
from contextlib import closing
import os
from pathlib import Path
import sqlite3
import tempfile
from datetime import datetime, timezone, timedelta
from zipfile import ZipFile, ZIP_DEFLATED
from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {
    '.git', '.aws', '.codex', '.agents', 'venv', '.venv', 'node_modules',
    'secrets', 'secreats', 'instantclient', '.runtime', 'backups', '__pycache__',
    '.pytest_cache', 'test-results', 'playwright-report',
}
DATABASE_SUFFIXES = {'.db', '.sqlite', '.sqlite3'}
EXCLUDED_SUFFIXES = {'.pem', '.key', '.p12', '.sso', '.jks', '.pyc', '.log'} | DATABASE_SUFFIXES


def configured_data_dir(root: Path, value: str | None = None) -> Path:
    """Match app env precedence, but require a real descendant of this project."""
    root = root.resolve()
    if value is None:
        local = dotenv_values(root / '.env')
        value = os.environ.get('BAPS_DATA_DIR', local.get('BAPS_DATA_DIR') or '.runtime/data')
    candidate = Path(value.strip())
    candidate = candidate if candidate.is_absolute() else root / candidate
    resolved = candidate.resolve()
    if resolved == root or not resolved.is_relative_to(root):
        raise ValueError('BAPS_DATA_DIR must be a directory inside this project for local backup.')
    for component in (candidate, *candidate.parents):
        if component == root:
            break
        if component.is_symlink() or component.is_junction():
            raise ValueError('BAPS_DATA_DIR must not traverse a symbolic link or junction.')
    return resolved


def database_file(path: Path) -> bool:
    return any(path.name.lower().endswith(suffix + sidecar)
               for suffix in DATABASE_SUFFIXES for sidecar in ('', '-wal', '-shm', '-journal'))


def create_backup(root: Path, include_data: bool = False, data_dir: Path | None = None) -> tuple[Path, int, int]:
    root = root.resolve()
    data_dir = configured_data_dir(root, str(data_dir)) if data_dir is not None else configured_data_dir(root)
    destination = configured_data_dir(root, 'backups')
    destination.mkdir(exist_ok=True)
    stamp = datetime.now(timezone(timedelta(hours=9))).strftime('%Y%m%d-%H%M%S-%f')
    archive = destination / f'in-baps-{stamp}.zip'
    partial = archive.with_suffix('.partial')
    count = 0
    snapshots = 0
    with ZipFile(partial, 'w', ZIP_DEFLATED) as output:
        for current, folders, names in os.walk(root, followlinks=False):
            folders[:] = [name for name in folders if name not in EXCLUDED_DIRS
                          and not (Path(current) / name).is_symlink()
                          and not (Path(current) / name).is_junction()
                          and (Path(current) / name).resolve() != data_dir]
            for name in names:
                path = Path(current) / name
                if path.is_symlink() or path.suffix.lower() in EXCLUDED_SUFFIXES or database_file(path):
                    continue
                if (name.startswith('.env') and name != '.env.example') or ('wallet' in name.lower() and path.suffix.lower() == '.zip'):
                    continue
                output.write(path, path.relative_to(root).as_posix())
                count += 1
        # Generated object definitions are source artifacts, unlike runtime rows,
        # sessions or logs. Keep them portable while excluding all other runtime.
        ddl_root = configured_data_dir(root, '.runtime/ddl')
        if ddl_root.is_dir():
            for current, folders, names in os.walk(ddl_root, followlinks=False):
                folders[:] = [name for name in folders if not (Path(current) / name).is_symlink()
                              and not (Path(current) / name).is_junction()]
                for name in names:
                    path = Path(current) / name
                    if path.suffix.lower() == '.sql' and not path.is_symlink() and path.resolve().is_relative_to(ddl_root):
                        output.write(path, path.relative_to(root).as_posix())
                        count += 1
        if include_data and data_dir.is_dir():
            files = [path for path in data_dir.iterdir() if path.is_file() and path.suffix.lower() in DATABASE_SUFFIXES]
            for path in files:
                if path.is_symlink() or not path.resolve().is_relative_to(root):
                    continue
                temporary_root = configured_data_dir(root, '.runtime')
                temporary_root.mkdir(exist_ok=True)
                with tempfile.TemporaryDirectory(prefix='backup-', dir=temporary_root) as temporary:
                    snapshot = Path(temporary) / path.name
                    with closing(sqlite3.connect(path.as_uri() + '?mode=ro', uri=True)) as source:
                        with closing(sqlite3.connect(snapshot)) as target:
                            source.backup(target)
                    output.write(snapshot, f'data/{path.name}')
                count += 1
                snapshots += 1
    partial.replace(archive)
    return archive, count, snapshots


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--include-data', action='store_true', help='Include consistent SQLite snapshots from BAPS_DATA_DIR.')
    args = parser.parse_args()
    archive, count, snapshots = create_backup(ROOT, args.include_data)
    print(f'Backup complete: {archive} ({count} files)')
    if args.include_data:
        print(f'{snapshots} data snapshots include local records and account/session data. Store the archive privately.')
    print('Generated TARGET DDL files are included. Environment variables, credentials, Oracle wallet and remote data are excluded.')


if __name__ == '__main__':
    main()
