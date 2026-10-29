#!/usr/bin/env bash
set -euo pipefail
cd "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
python -m pip install -r requirements.txt -c reference/environment/requirements-lock.txt
python -m compileall -q main.py backend
# Vendored chart libraries and fonts are committed for reproducible offline delivery.
test -f frontend/index.html
test -d frontend/vendor
echo 'IN-BAPS runtime and static assets are ready.'
