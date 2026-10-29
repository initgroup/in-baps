"""Read-only DB diagnostics for local terminals and the Render Shell.

Only setting presence, file presence and error codes are printed, never values.
Run from the deployed source root: python scripts/check_database.py
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend import config
from backend.database import connection


def error_codes(error):
    codes = set(re.findall(r'\b(?:ORA|DPY|DPI)-\d{4,5}\b', str(error)))
    for part in getattr(error, 'args', ()):
        code = getattr(part, 'full_code', '')
        if re.fullmatch(r'(?:ORA|DPY|DPI)-\d{4,5}', str(code)):
            codes.add(code)
    return sorted(codes)


def main():
    report = {'storage': config.STORAGE, 'db_mode': config.setting('DB_MODE', 'local'),
              'driver_mode': config.setting('DB_ORACLE_MODE', 'thin'), 'read_only': True}
    cloud = report['db_mode'].lower() == 'cloud'
    required = ['DB_USER_CLD', 'DB_PASSWORD_CLD', 'DB_DSN_CLD'] if cloud else ['DB_USER_LOC', 'DB_PASSWORD_LOC']
    report['settings_present'] = {name: bool(config.setting(name)) for name in
        required + ['DB_WALLET_PATH', 'DB_WALLET_PASSWORD', 'BAPS_SECRET_KEY']}
    wallet = config.setting('DB_WALLET_PATH')
    if wallet:
        directory = config.project_path(wallet)
        report['wallet_directory_exists'] = directory.is_dir()
        report['wallet_files_present'] = {name: (directory / name).is_file() for name in
            ['tnsnames.ora', 'ewallet.pem', 'cwallet.sso']}
    if config.STORAGE != 'oracle':
        report['result'] = 'NOT_ORACLE_STORAGE'
    elif any(not config.setting(name) for name in required):
        report['result'] = 'MISSING_DATABASE_SETTINGS'
    else:
        stage = 'connect'
        try:
            with connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute('SELECT 1 FROM DUAL')
                    report['oracle_connection_ok'] = cursor.fetchone()[0] == 1
                    stage = 'system_tables'
                    needed = ['INIT$_TB_BAPS_MEMBER', 'INIT$_TB_BAPS_SESSION']
                    cursor.execute('SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME IN (:a, :b)',
                                   {'a': needed[0], 'b': needed[1]})
                    found = {row[0] for row in cursor}
                    report['login_tables_present'] = {name: name in found for name in needed}
                    # Verify actual SELECT rights and schema without returning member data.
                    for name in needed:
                        cursor.execute('SELECT 1 FROM ' + name + ' WHERE 1=0')
                    report['result'] = 'OK'
        except Exception as error:
            report.update(result='DATABASE_CHECK_FAILED', stage=stage,
                          error_type=type(error).__name__, error_codes=error_codes(error))
    print(json.dumps(report, ensure_ascii=True, indent=2))
    return 0 if report['result'] == 'OK' else 1


if __name__ == '__main__':
    raise SystemExit(main())
