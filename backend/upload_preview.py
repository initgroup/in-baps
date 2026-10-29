"""One bounded file parser shared by read-only preview and explicit dataset save."""
import csv
import hashlib
import io
import json

from fastapi import HTTPException
from backend import config
from backend.analytics import clean_rows, is_iso_date, number


def parse_upload(raw, filename):
    if len(raw) > config.MAX_BYTES:
        raise HTTPException(413, '파일은 10MiB 이하여야 합니다.')
    extension = filename.rsplit('.', 1)[-1].lower()
    try:
        try:
            text = raw.decode('utf-8-sig')
            encoding = 'UTF-8'
        except UnicodeDecodeError:
            text = raw.decode('cp949')
            encoding = 'CP949'
        if extension == 'json':
            rows = json.loads(text)
            if isinstance(rows, dict) and 'rows' in rows:
                rows = rows['rows']
        elif extension in ('csv', 'tsv'):
            reader = csv.DictReader(io.StringIO(text), delimiter='\t' if extension == 'tsv' else ',')
            if not reader.fieldnames or len(reader.fieldnames) != len(set(reader.fieldnames)):
                raise HTTPException(422, '헤더가 없거나 컬럼 이름이 중복되었습니다.')
            rows = []
            for row in reader:
                if None in row:
                    raise HTTPException(422, '헤더보다 많은 값이 있는 행을 확인하세요.')
                rows.append(row)
                if len(rows) > config.MAX_ROWS:
                    raise HTTPException(422, '최대 20,000행까지 가져올 수 있습니다.')
        else:
            raise HTTPException(422, 'CSV, TSV, JSON 파일을 선택하세요.')
    except (UnicodeDecodeError, json.JSONDecodeError, csv.Error, RecursionError):
        raise HTTPException(422, '파일 형식 또는 인코딩을 확인하세요. UTF-8/CP949 표 데이터를 지원합니다.') from None
    if not isinstance(rows, list):
        raise HTTPException(422, 'JSON은 행 객체의 배열 또는 {"rows": [...]} 형식이어야 합니다.')
    cleaned, columns = clean_rows(rows)
    return {'rows': cleaned, 'columns': columns, 'file_type': extension.upper(), 'encoding': encoding,
            'file_bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}


def preview_upload(parsed, limit=20):
    rows, columns = parsed['rows'], parsed['columns']
    quality = []
    for column in columns:
        name = column['name']
        values = [row[name] for row in rows if row[name] not in (None, '')]
        numeric = sum(number(value) is not None for value in values)
        dates = sum(is_iso_date(value) for value in values)
        quality.append({**column, 'missing': len(rows) - len(values), 'non_missing': len(values),
                        'numeric_values': numeric, 'iso_dates': dates,
                        'mixed_numeric': 0 < numeric < len(values), 'mixed_dates': 0 < dates < len(values)})
    unique = {json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False) for row in rows}
    warnings = []
    if any(column['mixed_numeric'] for column in quality):
        warnings.append('숫자와 다른 값이 섞인 컬럼은 문자로 판별합니다. 아래 컬럼 점검에서 확인하세요.')
    if any(column['mixed_dates'] for column in quality):
        warnings.append('YYYY-MM-DD 날짜와 다른 값이 섞인 컬럼은 날짜로 판별하지 않습니다.')
    return {key: value for key, value in parsed.items() if key != 'rows'} | {
        'row_count': len(rows), 'column_count': len(columns), 'rows': rows[:limit], 'preview_limit': limit,
        'preview_truncated': len(rows) > limit, 'quality_scope': 'all_uploaded_rows', 'quality': quality,
        'missing_cells': sum(column['missing'] for column in quality), 'duplicate_rows': len(rows) - len(unique),
        'warnings': warnings, 'transformations': [],
        'conversion_note': 'UTF-8/CP949 디코딩과 누락 컬럼의 null 보완만 적용합니다. 원본 셀 값의 형변환·결측 대체·행 삭제는 하지 않습니다.'}
