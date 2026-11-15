from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PATCHES = [
    (
        ROOT / 'backend' / 'main.py',
        [
            (
                'from backend.nasa_power_api import router as science_router\n',
                'from backend.nasa_power_api import router as science_router\n'
                'from backend.nasa_climate_api import router as climate_router\n',
                'from backend.nasa_climate_api import router as climate_router',
            ),
            (
                'app.include_router(science_router)\n',
                'app.include_router(science_router)\napp.include_router(climate_router)\n',
                'app.include_router(climate_router)',
            ),
        ],
    ),
    (
        ROOT / 'frontend' / 'src' / 'pages' / 'Dashboard.jsx',
        [
            (
                "import NASATemperatureLab from '../components/NASATemperatureLab';\n",
                "import NASATemperatureLab from '../components/NASATemperatureLab';\n"
                "import NASAClimateLab from '../components/NASAClimateLab';\n",
                "import NASAClimateLab from '../components/NASAClimateLab';",
            ),
            (
                '        <NASATemperatureLab />',
                '        <NASATemperatureLab />\n\n        <NASAClimateLab />',
                '<NASAClimateLab />',
            ),
        ],
    ),
]


def main():
    pending = []
    for path, edits in PATCHES:
        content = path.read_text(encoding='utf-8')
        modified = content
        for anchor, replacement, existing in edits:
            if existing in modified:
                continue
            count = modified.count(anchor)
            if count != 1:
                raise RuntimeError(
                    f'Safe integration stopped: {path.relative_to(ROOT)} '
                    f'expected one anchor but found {count}: {anchor!r}'
                )
            modified = modified.replace(anchor, replacement, 1)
        pending.append((path, content, modified))

    for path, old, new in pending:
        if new != old:
            path.write_text(new, encoding='utf-8')
            print(f'Updated: {path.relative_to(ROOT)}')
        else:
            print(f'Already integrated: {path.relative_to(ROOT)}')
    print('NASA climate integration completed.')


if __name__ == '__main__':
    main()
