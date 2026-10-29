"""Verify pinned runtime and test packages without contacting a package index."""
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path


def main():
    root = Path(__file__).resolve().parents[1]
    missing = []
    for path in (root / 'requirements.txt', root / 'reference/environment/requirements-dev.txt'):
        for line in path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            package, pinned = line.split('==', 1)
            try:
                installed = version(package)
            except PackageNotFoundError:
                installed = None
            if installed != pinned:
                missing.append(line)
    if missing:
        print('Packages requiring installation: ' + ', '.join(missing))
    return int(bool(missing))


if __name__ == '__main__':
    raise SystemExit(main())
