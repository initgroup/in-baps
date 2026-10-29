"""Public, credential-free candidate definitions; no network or DB work on import."""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WB_DOC = 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation'


def source(name, url, path='', fields=(), inputs=None, fmt='json'):
    return {'name': name, 'url': url, 'method': 'GET', 'response_format': fmt,
            'records_path': path, 'inputs': [
                {'name': key, 'location': 'query', 'value': str(value), 'type': 'string', 'secret': False}
                for key, value in (inputs or {}).items()],
            'body_format': 'json', 'fields': [
                {'name': name, 'path': path, 'type': kind, 'required': False} for name, path, kind in fields],
            'pagination': {'mode': 'none', 'parameter': 'page', 'start': 1, 'step': 1,
                           'size_parameter': 'per_page', 'page_size': 100, 'max_pages': 10},
            'max_rows': 20000, 'connection_id': ''}


def worldbank_candidates(metadata):
    specs = list(csv.DictReader((ROOT / 'reference/public-api/worldbank-indicators.tsv').open(encoding='utf-8'), delimiter='\t'))
    legacy = {'NY.GDP.MKTP.CD': ('kor-gdp', 'GDP', '현재 US$'),
              'SP.POP.TOTL': ('kor-population', '총인구', '명'),
              'SP.DYN.LE00.IN': ('kor-life', '기대수명', '세')}
    for spec in specs:
        code = spec['code']
        if code not in metadata:
            yield {'id': 'wb-' + code.lower().replace('.', '-'), 'invalid': '공식 WDI 목록에 없는 지표', **spec}
            continue
        info = metadata[code]
        identifier, title, unit = legacy.get(code, ('wb-' + code.lower().replace('.', '-'), spec['title'], info.get('unit') or '공식 지표 정의 참고'))
        fmt = 'xml' if identifier == 'kor-population' else 'json'
        cfg = source('한국 ' + title + ' · World Bank', 'https://api.worldbank.org/v2/country/KOR/indicator/' + code,
                     '$[1]' if fmt == 'json' else 'data/data',
                     [('year', 'date', 'string'), ('value', 'value', 'number')],
                     {'format': fmt, 'date': '2015:2025', 'per_page': 100}, fmt)
        yield {'id': identifier, 'title': '한국 ' + title, 'provider': 'World Bank', 'category': spec['category'],
               'region': '한국', 'auth_mode': 'none', 'unit': unit, 'documentation': WB_DOC,
               'indicator_url': 'https://data.worldbank.org/indicator/' + code + '?locations=KR',
               'description': info['name'], 'definition': info.get('sourceNote', ''),
               'attribution': info.get('sourceOrganization', 'World Bank World Development Indicators'),
               'limitations': '2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.',
               'code': code, 'source': cfg}


def additional_candidates():
    def item(identifier, title, provider, category, region, cfg, doc, *, unit='제공기관 정의 참고', auth='none', limitations='', attribution=''):
        return {'id': identifier, 'title': title, 'provider': provider, 'category': category, 'region': region,
                'auth_mode': auth, 'unit': unit, 'source': cfg, 'documentation': doc, 'indicator_url': doc,
                'description': title, 'definition': '', 'attribution': attribution or provider,
                'limitations': limitations or '예제는 제한된 기간·범위로 조회합니다. INPUT에서 수집 범위를 변경하세요.'}

    for identifier, title, code, cycle, start, end, category in [
        ('base-rate', '한국은행 기준금리', '722Y001', 'D', '20240101', '20240110', '금융·물가'),
        ('exchange', '한국은행 주요 환율', '731Y001', 'D', '20240101', '20240110', '금융·물가'),
        ('cpi', '한국은행 소비자물가', '901Y009', 'M', '202401', '202410', '금융·물가'),
        ('industrial', '한국은행 산업생산 통계', '901Y033', 'M', '202401', '202410', '제조·산업'),
        ('money', '한국은행 통화량', '101Y004', 'M', '202401', '202410', '금융·물가'),
        ('gdp', '한국은행 국민계정', '200Y001', 'A', '2015', '2024', '경제·성장'),
        ('household-credit', '한국은행 가계신용', '151Y005', 'Q', '2022Q1', '2024Q2', '금융·물가'),
    ]:
        cfg = source(title, f'https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/{code}/{cycle}/{start}/{end}',
                     'StatisticSearch.row', [('period', 'TIME', 'string'), ('statistic', 'STAT_NAME', 'string'),
                                           ('item', 'ITEM_NAME1', 'string'), ('unit', 'UNIT_NAME', 'string'),
                                           ('value', 'DATA_VALUE', 'number')])
        yield item('bok-' + identifier, title, '한국은행 ECOS', category, '한국', cfg, 'https://ecos.bok.or.kr/api/',
                   auth='public-sample', limitations='개인 인증키 없이 공개 sample 경로로 실제 통계를 최대 10행 조회합니다. 정식 대량 수집은 본인 ECOS 인증키가 필요합니다.')
    cfg = source('한국은행 주요 경제지표', 'https://ecos.bok.or.kr/api/KeyStatisticList/sample/json/kr/1/10/',
                 'KeyStatisticList.row', [('category', 'CLASS_NAME', 'string'), ('indicator', 'KEYSTAT_NAME', 'string'),
                                         ('period', 'CYCLE', 'string'), ('unit', 'UNIT_NAME', 'string'), ('value', 'DATA_VALUE', 'number')])
    yield item('bok-key-stats', '한국은행 주요 경제지표', '한국은행 ECOS', '금융·물가', '한국', cfg, 'https://ecos.bok.or.kr/api/',
               auth='public-sample', limitations='공개 sample 경로의 실제 최신 지표 최대 10행. 정식 대량 수집은 본인 인증키가 필요합니다.')

    for code, title, category in [('3', '정책', '행정·재정'), ('4', '경제·산업', '제조·산업'), ('5', '과학·기술', '디지털·기술'),
                                  ('6', '사회', '인구·사회'), ('7', '문화', '문화·관광'), ('8', '음식·여행', '문화·관광'), ('9', '체육', '문화·관광')]:
        cfg = source('Korea.net ' + title + ' 소식', 'https://www.korea.net/koreanet/rss/news/' + code, 'rss/channel/item',
                     [('title', 'title', 'string'), ('published', 'pubDate', 'string'), ('link', 'link', 'string')], fmt='xml')
        yield item('koreanet-' + code, '대한민국 ' + title + ' 공개 소식', '해외문화홍보원 Korea.net', category, '한국', cfg,
                   'https://www.korea.net/Others/Subscribe-to-Koreanet/RSS-Service',
                   limitations='정부 공식 RSS XML. 통계가 아닌 공개 소식의 제목·발행일·링크이며 영문으로 제공됩니다.')

    for identifier, title, params in [('global-earthquakes', '세계 지진 목록', {'minmagnitude': 4}),
                                     ('major-earthquakes', '규모 6 이상 지진', {'minmagnitude': 6})]:
        cfg = source(title + ' · USGS', 'https://earthquake.usgs.gov/fdsnws/event/1/query', 'features',
                     [('event_id', 'id', 'string'), ('magnitude', 'properties.mag', 'number'), ('place', 'properties.place', 'string'),
                      ('time_ms', 'properties.time', 'number'), ('longitude', 'geometry.coordinates[0]', 'number'),
                      ('latitude', 'geometry.coordinates[1]', 'number'), ('depth_km', 'geometry.coordinates[2]', 'number')],
                     {'format': 'geojson', 'starttime': '2024-01-01', 'endtime': '2024-02-01', 'limit': 100, **params})
        yield item('usgs-' + identifier, title, '미국 지질조사국 USGS', '안전·재난', '세계', cfg,
                   'https://earthquake.usgs.gov/fdsnws/event/1/', unit='규모·km·밀리초',
                   limitations='2024년 1월 역사 관측 최대 100행. INPUT 기간·최소 규모·위치 조건을 변경해 조회할 수 있습니다.')

    for identifier, title, product, fields in [
        ('water-level', '해수면 높이', 'water_level', [('time', 't', 'string'), ('value', 'v', 'number')]),
        ('water-temperature', '해수 온도', 'water_temperature', [('time', 't', 'string'), ('value', 'v', 'number')]),
        ('air-temperature', '연안 대기 온도', 'air_temperature', [('time', 't', 'string'), ('value', 'v', 'number')]),
        ('wind', '연안 풍속·풍향', 'wind', [('time', 't', 'string'), ('speed', 's', 'number'), ('direction', 'd', 'number')]),
    ]:
        cfg = source(title + ' · NOAA', 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', 'data', fields,
                     {'product': product, 'application': 'IN-BAPS', 'begin_date': '20240101', 'end_date': '20240101',
                      'datum': 'MLLW', 'station': '9414290', 'time_zone': 'gmt', 'units': 'metric', 'format': 'json'})
        yield item('noaa-' + identifier, 'NOAA ' + title, '미국 해양대기청 NOAA', '해양·기상', '미국', cfg,
                   'https://api.tidesandcurrents.noaa.gov/api/prod/',
                   limitations='샌프란시스코 9414290 관측소의 2024-01-01 관측. 관측소·일자·product를 INPUT에서 변경하세요. 결측은 제공기관 정책을 따릅니다.')

    treasury = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/'
    for identifier, title, endpoint, fields in [
        ('debt', '미국 일별 국가부채', 'v2/accounting/od/debt_to_penny', [('date', 'record_date', 'string'), ('public_debt', 'tot_pub_debt_out_amt', 'number'), ('held_by_public', 'debt_held_public_amt', 'number')]),
        ('exchange', '미국 재무부 기준 환율', 'v1/accounting/od/rates_of_exchange', [('date', 'record_date', 'string'), ('country_currency', 'country_currency_desc', 'string'), ('exchange_rate', 'exchange_rate', 'number')]),
        ('interest', '미국 연방채무 평균금리', 'v2/accounting/od/avg_interest_rates', [('date', 'record_date', 'string'), ('security', 'security_desc', 'string'), ('average_rate', 'avg_interest_rate_amt', 'number')]),
    ]:
        yield item('treasury-' + identifier, title, '미국 재무부 Fiscal Data', '금융·물가', '미국',
                   source(title, treasury + endpoint, 'data', fields, {'page[size]': 100, 'sort': '-record_date'}),
                   'https://fiscaldata.treasury.gov/api-documentation/', limitations='최신순 첫 100행. 검색 조건·페이지 크기를 INPUT에서 수정할 수 있습니다.')

    for category, title in [('wildfires', '산불'), ('volcanoes', '화산'), ('severeStorms', '폭풍')]:
        cfg = source('NASA ' + title + ' 자연재해', 'https://eonet.gsfc.nasa.gov/api/v3/events', 'events',
                     [('event_id', 'id', 'string'), ('title', 'title', 'string'), ('closed', 'closed', 'string'),
                      ('categories', 'categories', 'json'), ('geometry', 'geometry', 'json')],
                     {'status': 'closed', 'category': category, 'limit': 20})
        yield item('nasa-' + category.lower(), 'NASA ' + title + ' 사건', '미국 항공우주국 NASA', '안전·재난', '세계', cfg,
                   'https://eonet.gsfc.nasa.gov/docs/v3', limitations='종료된 자연재해의 최근 최대 20건. 범주·기간·상태를 INPUT에서 수정합니다. 위치·범주는 중첩 JSON으로 보존합니다.')
