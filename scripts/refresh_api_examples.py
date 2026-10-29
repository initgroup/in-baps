"""Explicitly verify and refresh public API templates; never runs on app startup."""
import argparse
import copy
import json
import sys
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from public_api_catalog import additional_candidates, worldbank_candidates

OUTPUT = ROOT / 'frontend/config/api-examples.js'
REPORT = ROOT / 'reference/public-api/verification.json'


class NoObservations(ValueError):
    pass


def check(examples):
    ids = set()
    for item in examples:
        assert item['id'] not in ids, 'Duplicate template ID'
        ids.add(item['id'])
        assert item['preview'] and item['preview_checked_at'] and item['category'] and item['provider']
        assert item['auth_mode'] in ('none', 'public-sample')
        assert item['source']['url'].startswith('https://') and not item['source']['connection_id']
        assert all(not param.get('secret') for param in item['source']['inputs'])
        assert all(not param['name'].lower() in ('servicekey', 'apikey', 'api_key', 'authorization') for param in item['source']['inputs'])
        assert all(set(row) == {field['name'] for field in item['source']['fields']} for row in item['preview'])
    assert examples, 'No verified templates'


def verify(candidate):
    from backend.collection import fetch_source
    if candidate.get('invalid'):
        return None, {'id': candidate['id'], 'reason': candidate['invalid']}
    item = copy.deepcopy(candidate)
    for country in (('KOR', 'WLD') if item.get('code') else (None,)):
        try:
            if country == 'WLD':
                item['source']['url'] = item['source']['url'].replace('/country/KOR/', '/country/WLD/')
                item['title'] = item['title'].replace('한국 ', '세계 ', 1)
                item['source']['name'] = item['source']['name'].replace('한국 ', '세계 ', 1)
                item['region'] = '세계'
                item['indicator_url'] = item['indicator_url'].replace('locations=KR', 'locations=1W')
                item['limitations'] += ' 한국의 해당 기간 유효 관측이 없어 세계 집계로 제공합니다.'
            result = fetch_source(item['source'], preview=True)
            numeric = [field['name'] for field in item['source']['fields'] if field['type'] == 'number']
            valid = [row for row in result['rows'] if any(row.get(name) is not None for name in numeric)] if numeric else result['rows']
            if not valid:
                raise NoObservations('No non-missing observations')
            item['preview'] = valid[:5]
            item['preview_checked_at'] = datetime.now(timezone.utc).isoformat(timespec='seconds')
            item['verified_rows'] = result['row_count']
            item['preview_scope'] = f"실제 응답 {result['row_count']}행 중 {len(item['preview'])}행 표시" + (' · 미리보기에서 수치 결측 행 제외' if numeric and len(valid) != result['row_count'] else '')
            item['preview_warnings'] = result.get('warnings', [])
            item.pop('code', None)
            return item, None
        except Exception as exc:
            reason = getattr(exc, 'detail', str(exc))
            if country == 'KOR' and not isinstance(exc, NoObservations):
                break  # A transport failure does not establish missing Korean data.
    return None, {'id': candidate['id'], 'title': candidate['title'], 'provider': candidate['provider'],
                  'url': item['source']['url'], 'reason': reason}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--refresh', action='store_true', help='Explicit public HTTPS calls; no DB writes')
    mode.add_argument('--check', action='store_true', help='Offline generated-catalog integrity check')
    parser.add_argument('--workers', type=int, choices=(1, 2, 3, 4), default=3, help='Bounded concurrency, not a catalog size limit')
    parser.add_argument('--ids', help='Refresh only these comma-separated candidate IDs; preserve other verified entries')
    args = parser.parse_args()
    if args.check:
        examples = json.loads(OUTPUT.read_text(encoding='utf-8').split('export const apiExamples = ', 1)[1].rsplit(';', 1)[0])
        check(examples)
        print('Verified offline:', len(examples), 'templates;', len({item['category'] for item in examples}), 'categories')
        return
    from backend.safe_http import request
    raw, _ = request('https://api.worldbank.org/v2/indicator?format=json&source=2&per_page=20000')
    indicators = {item['id']: item for item in json.loads(raw)[1]}
    candidates = [*worldbank_candidates(indicators), *additional_candidates()]
    selected = candidates
    verified, failed = {}, []
    if args.ids:
        ids = set(args.ids.split(','))
        if ids - {item['id'] for item in candidates}:
            parser.error('Unknown candidate ID in --ids')
        selected = [item for item in candidates if item['id'] in ids]
        old = json.loads(OUTPUT.read_text(encoding='utf-8').split('export const apiExamples = ', 1)[1].rsplit(';', 1)[0])
        verified = {item['id']: item for item in old if item['id'] not in ids}
        old_report = json.loads(REPORT.read_text(encoding='utf-8'))
        failed = [item for item in old_report['excluded'] if item['id'] not in ids]
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(verify, item): item['id'] for item in selected}
        for number, future in enumerate(as_completed(futures), 1):
            item, error = future.result()
            if item:
                verified[item['id']] = item
            else:
                failed.append(error)
            print(f"{number}/{len(selected)} {'OK' if item else 'EXCLUDED'} {futures[future]}", flush=True)
    examples = [verified[item['id']] for item in candidates if item['id'] in verified]
    check(examples)
    report = {'checked_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
              'candidate_count': len(candidates), 'verified_count': len(examples),
              'categories': dict(Counter(item['category'] for item in examples)),
              'providers': dict(Counter(item['provider'] for item in examples)),
              'auth_modes': dict(Counter(item['auth_mode'] for item in examples)), 'excluded': failed,
              'notes': ['Only successful public HTTPS calls with non-missing real observations enter the catalog.',
                        'No catalog-size upper bound. Add indicator definitions or provider candidates and refresh.',
                        'Preview refresh does not register member sources or write TARGET data.']}
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary = OUTPUT.with_suffix('.js.tmp')
    temporary.write_text('// Verified real public observations. Explicit refresh: scripts/refresh_api_examples.py --refresh\nexport const apiExamples = ' + json.dumps(examples, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    temporary.replace(OUTPUT)
    print(f"Published {len(examples)} verified templates, {len(report['categories'])} categories, {len(report['providers'])} providers; excluded {len(failed)}. No DB writes.")


if __name__ == '__main__':
    main()
