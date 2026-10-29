"""Keep a document's ES module graph on one content version across deployments."""
import hashlib
import json
import re
import secrets
import threading
from pathlib import Path

from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles


class FrontendAssets:
    def __init__(self, root):
        self.root = Path(root)
        self._lock = threading.Lock()
        self._signature = None
        self._version = ''
        self._modules = []

    def snapshot(self):
        with self._lock:
            files = sorted(path for path in self.root.rglob('*')
                           if path.is_file() and 'vendor' not in path.relative_to(self.root).parts
                           and path.suffix in ('.js', '.mjs', '.css', '.html'))
            signature = [(path.relative_to(self.root).as_posix(), path.stat().st_mtime_ns, path.stat().st_size) for path in files]
            if signature != self._signature:
                digest = hashlib.sha256()
                for path in files:
                    digest.update(path.relative_to(self.root).as_posix().encode())
                    digest.update(b'\0')
                    digest.update(path.read_bytes())
                    digest.update(b'\0')
                self._version = digest.hexdigest()[:20]
                self._modules = [path.relative_to(self.root).as_posix() for path in files if path.suffix in ('.js', '.mjs')]
                self._signature = signature
            return self._version, tuple(self._modules)

    def index_response(self, request):
        version, modules = self.snapshot()
        nonce = secrets.token_urlsafe(24)
        request.state.asset_nonce = nonce
        imports = {'/static/' + name: '/static/' + name + '?v=' + version for name in modules}
        mapping = json.dumps({'imports': imports}, separators=(',', ':')).replace('<', chr(92) + 'u003c')
        html = (self.root / 'index.html').read_text(encoding='utf-8')
        # Entry scripts and styles share the module graph's content version.
        html = re.sub(r'((?:src|href)=")(/static/[^"?]+)(")',
                      lambda match: match[1] + match[2] + '?v=' + version + match[3], html)
        head = f'<meta name="baps-build" content="{version}"><script type="importmap" nonce="{nonce}">{mapping}</script>'
        html = html.replace('<head>', '<head>\n  ' + head, 1)
        return HTMLResponse(html, headers={'Cache-Control': 'no-store', 'X-Frontend-Version': version})


class VersionedStaticFiles(StaticFiles):
    def __init__(self, *, assets, **kwargs):
        self.assets = assets
        super().__init__(**kwargs)

    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if path.endswith(('.html', '.js', '.mjs', '.css')):
            response.headers['Cache-Control'] = 'no-cache, must-revalidate'
        if path.endswith('.html'):
            response.headers['X-Frontend-Version'] = self.assets.snapshot()[0]
        return response
