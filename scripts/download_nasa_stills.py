from __future__ import annotations

import io
import re
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STILLS_JS = ROOT / 'frontend/src/services/nasaStills.mjs'
TARGET = ROOT / 'frontend/public/nasa-stills'
ENTRIES = re.findall(r"filename: '([^']+)',\s*remote: '(https://svs\.gsfc\.nasa\.gov/[^']+)'", STILLS_JS.read_text(encoding='utf-8'))


def valid_image(data: bytes) -> bool:
    try:
        with Image.open(io.BytesIO(data)) as im:
            width, height = im.size
            im.verify()
            return width >= 400 and height >= 200
    except Exception:
        return False


def main() -> int:
    if len(ENTRIES) != 10:
        raise RuntimeError(f'Expected 10 official NASA images, found {len(ENTRIES)}')
    TARGET.mkdir(parents=True, exist_ok=True)
    failures = []
    for filename, url in ENTRIES:
        output = TARGET / filename
        if output.exists() and valid_image(output.read_bytes()):
            print(f'Already available: {filename}')
            continue
        print(f'Downloading NASA still: {filename} ...')
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'Earthsonic-Science-Education/1.0'})
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read(12_000_001)
            if len(data) > 12_000_000 or not valid_image(data):
                raise RuntimeError('download was too large or not a valid NASA image')
            temp = output.with_suffix(output.suffix + '.tmp')
            temp.write_bytes(data)
            temp.replace(output)
            print(f'  Saved {filename} ({len(data):,} bytes)')
        except (OSError, urllib.error.URLError, RuntimeError) as exc:
            print(f'  FAILED: {exc}')
            failures.append(filename)
    if failures:
        print('Some NASA images are missing. Check internet and rerun this script:', ', '.join(failures))
        return 1
    print('All 10 official NASA images downloaded. The gallery can now work offline.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
