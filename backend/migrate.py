"""Explicit Oracle migration command. Never called by application startup.

python -m backend.migrate plan
python -m backend.migrate status
python -m backend.migrate install --schema MY_SCHEMA
python -m backend.migrate apply --schema MY_SCHEMA
python -m backend.migrate export --output reference/database-export
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
from backend import config
from backend.database import statements, utcnow

DATABASE_ROOT = config.ROOT / 'database'
MIGRATION_GROUPS = ('DDL', 'ALT', 'DML')


def migration_files():
    output = []
    versions = set()
    for group in MIGRATION_GROUPS:
        for path in sorted((DATABASE_ROOT / group).glob('V*.sql')):
            match = re.fullmatch(r'V(\d{3})__[a-z0-9_]+\.sql', path.name)
            if not match:
                raise RuntimeError('Invalid migration filename: ' + path.name)
            version = int(match.group(1))
            if version in versions:
                raise RuntimeError('Duplicate migration version: V' + match.group(1))
            versions.add(version)
            raw = path.read_bytes()
            if not split_statements(raw.decode('utf-8')):
                raise RuntimeError('Empty migration: ' + path.name)
            output.append((path, hashlib.sha256(raw).hexdigest()))
    output.sort(key=lambda item: item[0].name)
    if not output or output[0][0].name != 'V001__baseline.sql' or output[0][0].parent.name != 'DDL':
        raise RuntimeError('database/DDL/V001__baseline.sql must be the first migration.')
    return output


def split_statements(text):
    return [part.strip() for part in re.split(r'^/\s*$', text, flags=re.M) if re.sub(r'--[^\n]*', '', part).strip()]


def history(cursor):
    try:
        cursor.execute(statements()['MIGRATION_LIST'])
        return {row[0]: {'checksum': row[1], 'applied_at': row[2], 'status': row[3]} for row in cursor.fetchall()}
    except Exception as exc:
        if getattr(exc.args[0], 'code', None) == 942:
            return {}
        raise


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['plan', 'status', 'install', 'apply', 'export'])
    parser.add_argument('--schema', help='Explicit Oracle CURRENT_SCHEMA confirmation required for apply')
    parser.add_argument('--output', default='reference/database-export')
    args = parser.parse_args(argv)
    if args.action in ('install', 'apply') and not args.schema:
        parser.error('--schema is required for install/apply; no database connection was made.')
    files = migration_files()
    if args.action == 'plan':
        print(json.dumps({'mode': 'offline-plan', 'migrations': [{'version': p.name, 'category': p.parent.name, 'file': p.relative_to(DATABASE_ROOT).as_posix(), 'checksum': sha, 'statements': len(split_statements(p.read_text(encoding='utf-8')))} for p, sha in files]}, indent=2))
        return
    installer_blocks = None
    if args.action == 'install':
        from scripts.build_oracle_installer import render
        installer = (DATABASE_ROOT / 'DDL' / 'install_oracle.sql').read_text(encoding='utf-8')
        if installer != render():
            raise RuntimeError('Oracle installer is stale. Run python scripts/build_oracle_installer.py before installation.')
        installer_blocks = split_statements(installer)
        if len(installer_blocks) != 1:
            raise RuntimeError('Oracle installer must contain one anonymous block.')
    import oracledb
    conn = oracledb.connect(**config.oracle_connect_args())
    conn.call_timeout = 30000
    try:
        cursor = conn.cursor()
        cursor.execute(statements()['ORACLE_SCHEMA'])
        schema = cursor.fetchone()[0]
        if args.action == 'install':
            if args.schema.upper() != schema.upper():
                raise RuntimeError('Target schema mismatch. No DDL executed.')
            cursor.execute(installer_blocks[0])
            conn.commit()
            print('Oracle initial objects verified in schema ' + schema + '. Application rows were preserved.')
            cursor.close()
            return
        applied = history(cursor)
        known = {p.name for p, _ in files}
        if any(version not in known for version in applied):
            raise RuntimeError('Database contains migrations missing from this checkout.')
        for path, checksum in files:
            if path.name in applied and applied[path.name]['checksum'] != checksum:
                raise RuntimeError('Applied migration checksum changed: ' + path.name)
        if args.action == 'status':
            print(json.dumps({'schema': schema, 'migrations': [{'version': p.name, 'status': applied.get(p.name, {}).get('status', 'PENDING')} for p, _ in files]}, indent=2))
        elif args.action == 'apply':
            if not args.schema or args.schema.upper() != schema.upper():
                raise RuntimeError('Pass --schema with the intended CURRENT_SCHEMA to apply. No DDL executed.')
            cursor.execute(statements()['ORACLE_OBJECTS'])
            objects = cursor.fetchall()
            if not applied and objects:
                raise RuntimeError('Untracked INIT$_*BAPS objects exist. Review a partial migration before retrying; no objects were overwritten.')
            if any(row['status'] != 'APPLIED' for row in applied.values()):
                raise RuntimeError('An incomplete migration is recorded. Compare actual objects with the migration file and explicitly resolve its RUNNING state before retrying.')
            for path, checksum in files:
                if path.name in applied:
                    continue
                pending = split_statements(path.read_text(encoding='utf-8'))
                if not applied:
                    # The first baseline statement creates the history table.
                    # Every later DDL is preceded by a committed RUNNING record.
                    cursor.execute(pending.pop(0))
                cursor.execute(statements()['MIGRATION_INSERT'], dict(version=path.name, checksum=checksum, applied_at=utcnow()))
                conn.commit()
                for statement in pending:
                    cursor.execute(statement)
                cursor.execute(statements()['MIGRATION_COMPLETE'], dict(version=path.name, applied_at=utcnow()))
                conn.commit()
                applied[path.name] = {'checksum': checksum, 'status': 'APPLIED'}
                print('Applied ' + path.name)
        elif args.action == 'export':
            target = config.project_path(args.output)
            try:
                target.relative_to(config.ROOT)
            except ValueError:
                raise RuntimeError('Export output must remain inside the project.')
            target.mkdir(parents=True, exist_ok=True)
            cursor.execute(statements()['ORACLE_OBJECTS'])
            objects = cursor.fetchall()
            exportable = {'TABLE', 'INDEX', 'VIEW', 'SEQUENCE', 'TRIGGER', 'PROCEDURE', 'FUNCTION', 'PACKAGE', 'PACKAGE BODY', 'TYPE', 'TYPE BODY'}
            manifest = []
            for name, kind, status in objects:
                if kind not in exportable or not re.fullmatch(r'INIT\$_[A-Z]+_BAPS_[A-Z0-9_]+', name):
                    continue
                ddl = cursor.callfunc('DBMS_METADATA.GET_DDL', oracledb.DB_TYPE_CLOB, [kind.replace(' ', '_'), name, schema])
                filename = f'{kind.replace(" ", "_").lower()}__{name}.sql'
                (target / filename).write_text(ddl.read() + '\n/\n', encoding='utf-8')
                manifest.append({'name': name, 'type': kind, 'status': status, 'file': filename})
            (target / 'manifest.json').write_text(json.dumps({'schema': schema, 'exported_at': utcnow(), 'objects': manifest, 'history': applied}, indent=2), encoding='utf-8')
            print(f'Exported {len(manifest)} object definitions inside project.')
        cursor.close()
    finally:
        conn.close()


if __name__ == '__main__':
    main()
