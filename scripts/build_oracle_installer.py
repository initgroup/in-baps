"""Generate a rerunnable, standalone Oracle 19c+ installer from immutable V001.

No Oracle connection. Run after changing the installer template/contract.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DDL = ROOT / 'database' / 'DDL'


def literal(value):
    return "'" + str(value).replace("'", "''") + "'"


def render():
    baseline = DDL / 'V001__baseline.sql'
    checksum = hashlib.sha256(baseline.read_bytes()).hexdigest()
    contract = json.loads((DDL / 'schema_contract.json').read_text(encoding='utf-8'))
    sections = re.split(r'^/\s*$', baseline.read_text(encoding='utf-8'), flags=re.M)
    creates = {}
    for section in sections:
        sql = re.sub(r'^--[^\n]*\n?', '', section.strip(), flags=re.M).strip()
        match = re.match(r'CREATE (?:OR REPLACE )?(TABLE|INDEX|VIEW|PROCEDURE) (INIT\$_[A-Z_]+)', sql)
        if match:
            creates[match.group(2)] = sql
    lines = []
    for table, spec in contract['tables'].items():
        lines.append(f'  ensure_table({literal(table)}, {literal(creates[table])});')
        for name, kind, length in spec['columns']:
            lines.append(f'  assert_column({literal(table)}, {literal(name)}, {literal(kind)}, {length});')
        if table == 'INIT$_TB_BAPS_HISTORY':
            lines.append('  assert_history;')
        for name, kind, cols, expression in spec['constraints']:
            lines.append('  ensure_constraint(' + ', '.join(map(literal, [table, name, kind, cols, expression])) + ');')
    for index, spec in contract['indexes'].items():
        table, columns = spec
        lines.append('  ensure_index(' + ', '.join(map(literal, [index, table, columns, creates[index]])) + ');')
    view = 'INIT$_VW_BAPS_CATALOG'
    lines.append('  ensure_view(' + ', '.join(map(literal, [view, creates[view]])) + ');')
    procedure = 'INIT$_SP_BAPS_SESSION_PURGE'
    lines.append('  ensure_program(' + ', '.join(map(literal, [procedure, creates[procedure]])) + ');')
    comment = "COMMENT ON TABLE INIT$_TB_BAPS_RECORD IS 'IN-BAPS owned dataset definitions, analysis results and visualizations'"
    lines.append('  EXECUTE IMMEDIATE ' + literal(comment) + ';')
    template = (DDL / 'installer.sql.template').read_text(encoding='utf-8')
    return template.replace('__BASELINE_CHECKSUM__', checksum).replace('__GENERATED_OBJECTS__', '\n'.join(lines))


def main():
    target = DDL / 'install_oracle.sql'
    target.write_text(render(), encoding='utf-8', newline='\n')
    print('Generated database/DDL/install_oracle.sql (no database connection).')


if __name__ == '__main__':
    main()
