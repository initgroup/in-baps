"""Bounded tabular analysis with explicit missing-value and numeric policies."""
import math
import re
import statistics
from collections import Counter, defaultdict
from datetime import date
from fastapi import HTTPException
from backend import config


def number(value):
    if isinstance(value, bool) or value is None or value == '':
        return None
    try:
        # Preserve zero-padded identifier strings as categories.
        if isinstance(value, str) and re.match(r'^[-+]?0\d', value.strip()):
            return None
        result = float(value)
        return result if math.isfinite(result) and abs(result) <= 1e100 else None
    except (TypeError, ValueError, OverflowError):
        return None


def clean_rows(rows):
    if not isinstance(rows, list) or not rows or len(rows) > config.MAX_ROWS:
        raise HTTPException(422, f'1~{config.MAX_ROWS:,}개의 행을 입력하세요.')
    if not all(isinstance(row, dict) for row in rows):
        raise HTTPException(422, '각 행은 컬럼 이름을 가진 JSON 객체여야 합니다.')
    names = list(dict.fromkeys(key for row in rows for key in row))
    if len(names) > config.MAX_COLUMNS or not names:
        raise HTTPException(422, f'컬럼은 1~{config.MAX_COLUMNS}개여야 합니다.')
    if any(not isinstance(name, str) or not name.strip() or len(name) > 100 for name in names):
        raise HTTPException(422, '컬럼 이름은 1~100자의 문자열이어야 합니다.')
    output = []
    for row in rows:
        item = {}
        for name in names:
            value = row.get(name)
            if isinstance(value, (list, dict)):
                raise HTTPException(422, '중첩 객체는 지원하지 않습니다. 표 형식으로 변환해 주세요.')
            if isinstance(value, float) and not math.isfinite(value):
                raise HTTPException(422, 'NaN 또는 무한대는 사용할 수 없습니다.')
            if value is not None and len(str(value)) > 10000:
                raise HTTPException(422, '셀 값은 10,000자 이하여야 합니다.')
            item[name] = value
        output.append(item)
    return output, infer_columns(output)


def infer_columns(rows):
    result = []
    for name in rows[0]:
        values = [row[name] for row in rows if row[name] not in (None, '')]
        is_numeric = bool(values) and all(number(v) is not None for v in values)
        is_date = bool(values) and all(is_iso_date(v) for v in values)
        result.append({'name': name, 'type': 'number' if is_numeric else 'date' if is_date else 'string'})
    return result


def is_iso_date(value):
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
        return False
    try:
        date.fromisoformat(value)
        return True
    except ValueError:
        return False


def profile(rows, columns):
    result = []
    for col in columns:
        name = col['name']
        values = [row[name] for row in rows if row.get(name) not in (None, '')]
        numeric = [number(v) for v in values]
        numeric = [v for v in numeric if v is not None]
        entry = {**col, 'count': len(rows), 'missing': len(rows) - len(values), 'unique': len({str(v) for v in values})}
        if col['type'] == 'number' and numeric:
            entry.update(min=min(numeric), max=max(numeric), mean=statistics.mean(numeric), median=statistics.median(numeric), sum=sum(numeric), stddev=statistics.stdev(numeric) if len(numeric) > 1 else 0)
        entry['top_values'] = [{'name': str(k), 'value': v} for k, v in Counter(values).most_common(8)]
        result.append(entry)
    missing = sum(c['missing'] for c in result)
    cells = len(rows) * len(columns)
    return {'row_count': len(rows), 'column_count': len(columns), 'missing_cells': missing, 'completeness': round((1 - missing / cells) * 100, 2) if cells else 100, 'columns': result}


def analyze(dataset, spec):
    rows, columns = dataset['rows'], dataset['columns']
    names = {col['name'] for col in columns}
    method = spec['method']
    from backend.advanced_analytics import METHODS, analyze_advanced
    if method in METHODS:
        return analyze_advanced(dataset, spec)
    if method == 'profile':
        return profile(rows, columns)
    if method == 'aggregate':
        group, value, aggregation = spec.get('group_by'), spec.get('value'), spec.get('aggregation', 'sum')
        if group not in names or (aggregation != 'count' and value not in names):
            raise HTTPException(422, '집계할 컬럼을 선택하세요.')
        if aggregation not in ('sum', 'mean', 'count', 'min', 'max'):
            raise HTTPException(422, '지원하지 않는 집계 방식입니다.')
        buckets = defaultdict(list)
        for row in rows:
            key = str(row.get(group) if row.get(group) not in (None, '') else '(결측)')
            buckets[key].append(number(row.get(value)))
        if len(buckets) > 2000:
            raise HTTPException(422, '집계 그룹은 2,000개 이하여야 합니다. 범주 컬럼을 선택하세요.')
        data = []
        for key, values in buckets.items():
            valid = [v for v in values if v is not None]
            amount = len(values) if aggregation == 'count' else (getattr(statistics, 'mean')(valid) if aggregation == 'mean' else {'sum': sum, 'min': min, 'max': max}[aggregation](valid)) if valid else None
            data.append({'name': key, 'value': amount, 'count': len(values), 'valid_count': len(valid)})
        data.sort(key=lambda row: row['name'])
        return {'group_by': group, 'value': value, 'aggregation': aggregation, 'rows': data}
    if method == 'correlation':
        selected = spec.get('columns') or [c['name'] for c in columns if c['type'] == 'number']
        if len(selected) < 2 or len(selected) > 20 or any(name not in names for name in selected):
            raise HTTPException(422, '상관분석은 숫자 컬럼 2~20개를 선택하세요.')
        matrix = []
        for i, left in enumerate(selected):
            for j, right in enumerate(selected):
                pairs = [(number(row.get(left)), number(row.get(right))) for row in rows]
                pairs = [(x, y) for x, y in pairs if x is not None and y is not None]
                corr = None
                if len(pairs) >= 3:
                    xs, ys = zip(*pairs)
                    mx, my = statistics.mean(xs), statistics.mean(ys)
                    numerator = sum((x - mx) * (y - my) for x, y in pairs)
                    # Taking square roots separately avoids overflow of the
                    # product when valid finite measurements are very large.
                    denominator = math.sqrt(sum((x - mx) ** 2 for x in xs)) * math.sqrt(sum((y - my) ** 2 for y in ys))
                    if denominator:
                        corr = round(max(-1, min(1, numerator / denominator)), 6)
                matrix.append({'x': left, 'y': right, 'value': corr, 'count': len(pairs), 'i': i, 'j': j})
        return {'columns': selected, 'matrix': matrix, 'note': 'Pearson 상관계수 · 쌍별 결측 제외 · 상관관계는 인과관계를 의미하지 않습니다.'}
    if method == 'text':
        field = spec.get('value') or spec.get('group_by')
        if field not in names:
            raise HTTPException(422, '분석할 텍스트 컬럼을 선택하세요.')
        counter = Counter(token.lower() for row in rows for token in re.findall(r'[가-힣a-zA-Z0-9]{2,}', str(row.get(field) or '')))
        return {'column': field, 'rows': [{'name': word, 'value': count} for word, count in counter.most_common(100)], 'token_count': sum(counter.values()), 'note': '공백·문장부호 기반 토큰 빈도입니다. 형태소·감성 분석은 포함하지 않습니다.'}
    raise HTTPException(422, '지원하지 않는 분석 방식입니다.')
