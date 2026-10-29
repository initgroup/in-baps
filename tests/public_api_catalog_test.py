"""Offline checks of published real API templates against the collection contract."""
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch
from fastapi import HTTPException
from backend import collection, safe_http
from backend.collection_api import SourceInput

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from refresh_api_examples import verify


class PublicApiCatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        text = (ROOT / 'frontend/config/api-examples.js').read_text(encoding='utf-8')
        cls.examples = json.loads(text.split('export const apiExamples = ', 1)[1].rsplit(';', 1)[0])

    def test_templates_are_distinct_valid_collectable_and_match_verification_report(self):
        report = json.loads((ROOT / 'reference/public-api/verification.json').read_text(encoding='utf-8'))
        self.assertEqual(len(self.examples), report['verified_count'])
        self.assertEqual(sum(report['auth_modes'].values()), len(self.examples))
        self.assertGreaterEqual(len(self.examples), 100)
        self.assertGreaterEqual(len(report['categories']), 15)
        self.assertGreaterEqual(len(report['providers']), 5)
        ids, requests = set(), set()
        for item in self.examples:
            with self.subTest(id=item['id']):
                cfg = item['source']
                SourceInput(**{**cfg, 'connection_id': 'explicit-test-target'})
                safe_http.public_url(cfg['url'])  # syntax/public hostname; no network
                self.assertNotIn(item['id'], ids)
                ids.add(item['id'])
                identity = json.dumps([cfg['url'], cfg['inputs'], cfg['records_path']], sort_keys=True)
                self.assertNotIn(identity, requests)
                requests.add(identity)
                self.assertFalse(cfg['connection_id'])
                self.assertTrue(item['preview'])
                self.assertTrue(item['preview_checked_at'])
                self.assertEqual(set(item['preview'][0]), {field['name'] for field in cfg['fields']})
                for parameter in cfg['inputs']:
                    self.assertFalse(parameter['secret'])
                if item['auth_mode'] == 'public-sample':
                    self.assertIn('/sample/', cfg['url'])
                    self.assertIn('10', item['limitations'])
                else:
                    self.assertEqual(item['auth_mode'], 'none')

    def test_nested_geojson_and_xml_templates_use_actual_supported_field_paths(self):
        quake = next(item for item in self.examples if item['id'] == 'usgs-major-earthquakes')['source']
        raw = json.dumps({'features': [{'id': 'explicit-offline-fixture', 'properties': {'mag': 6.1, 'place': 'fixture', 'time': 1},
                                      'geometry': {'coordinates': [127, 37, 10]}}]}).encode()
        record = collection.parse_records(raw, quake)[0][0]
        mapped = collection.mapped_record(record, quake)
        self.assertEqual((mapped['longitude'], mapped['latitude'], mapped['depth_km']), (127, 37, 10))
        population = next(item for item in self.examples if item['id'] == 'kor-population')['source']
        raw = b'<data><data><date>2024</date><value>123</value></data></data>'
        self.assertEqual(collection.mapped_record(collection.parse_records(raw, population)[0][0], population), {'year': '2024', 'value': 123})

    def test_transport_failure_is_not_mislabeled_as_missing_country_data_and_zero_is_valid(self):
        candidate = {**next(item for item in self.examples if item['id'] == 'kor-gdp'), 'code': 'NY.GDP.MKTP.CD'}
        with patch.object(collection, 'fetch_source', side_effect=HTTPException(422, 'offline transport failure')) as fetch:
            item, error = verify(candidate)
        self.assertIsNone(item)
        self.assertEqual(error['reason'], 'offline transport failure')
        self.assertEqual(fetch.call_count, 1)
        with patch.object(collection, 'fetch_source', return_value={'rows': [{'year': '2024', 'value': 0}], 'row_count': 1}):
            item, error = verify(candidate)
        self.assertIsNone(error)
        self.assertEqual(item['preview'][0]['value'], 0)
        self.assertIn('/country/KOR/', item['source']['url'])


if __name__ == '__main__':
    unittest.main()
