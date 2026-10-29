"""Exercise asset graph version changes and CSP-safe import maps, without DB."""
import json
import re
import tempfile
import unittest
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from backend.frontend_assets import FrontendAssets, VersionedStaticFiles


class FrontendAssetsTests(unittest.TestCase):
    def test_graph_version_changes_with_transitive_module_content_and_keeps_one_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'js').mkdir()
            (root / 'pages').mkdir()
            (root / 'index.html').write_text('<html><head><script type="module" src="/static/js/app.js"></script></head></html>', encoding='utf-8')
            (root / 'js/app.js').write_text("import './M04001.js';", encoding='utf-8')
            module = root / 'js/M04001.js'
            module.write_text('export const table=1;', encoding='utf-8')
            (root / 'pages/M01001.html').write_text('<div></div>', encoding='utf-8')
            assets = FrontendAssets(root)
            app = FastAPI()
            @app.get('/')
            def index(request: Request):
                return assets.index_response(request)
            app.mount('/static', VersionedStaticFiles(assets=assets, directory=str(root)))
            with TestClient(app) as client:
                first = client.get('/')
                version = first.headers['X-Frontend-Version']
                self.assertEqual(first.headers['Cache-Control'], 'no-store')
                self.assertIn('/static/js/app.js?v=' + version, first.text)
                pattern = r'<script type="importmap" nonce="([^"]+)">(.*?)</script>'
                nonce, content = re.search(pattern, first.text).groups()
                mapping = json.loads(content)['imports']
                self.assertEqual(mapping['/static/js/M04001.js'], '/static/js/M04001.js?v=' + version)
                self.assertNotEqual(nonce, re.search(pattern, client.get('/').text)[1])
                script = client.get('/static/js/M04001.js')
                conditional = client.get('/static/js/M04001.js', headers={'If-None-Match': script.headers['ETag']})
                self.assertEqual(conditional.status_code, 304)
                self.assertIn('no-cache', conditional.headers['Cache-Control'])
                self.assertEqual(client.get('/static/pages/M01001.html').headers['X-Frontend-Version'], version)
                module.write_text('export function mountDatasetCatalog(){}', encoding='utf-8')
                new = client.get('/')
                self.assertNotEqual(new.headers['X-Frontend-Version'], version)
                self.assertEqual(client.get('/static/pages/M01001.html').headers['X-Frontend-Version'], new.headers['X-Frontend-Version'])
                self.assertIn('mountDatasetCatalog', client.get('/static/js/M04001.js').text)


if __name__ == '__main__':
    unittest.main()
