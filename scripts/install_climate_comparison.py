from __future__ import annotations

import re
import shutil
from datetime import datetime
from pathlib import Path

REQUIRED_FILES = [
    'frontend/src/components/ClimateComparison.jsx',
    'frontend/src/components/ClimateComparison.css',
    'frontend/src/services/climateComparison.mjs',
    'frontend/src/services/climateComparison.test.mjs',
]

IMPORT = "import ClimateComparison from '../components/ClimateComparison';"
STATE = """  const [scienceStopFromCompare, setScienceStopFromCompare] = useState(0);
  const [compareStopFromScience, setCompareStopFromScience] = useState(0);
"""
SECTION = """      {isAuthenticated ? (
        <ClimateComparison
          stopSignal={scienceStopSignal + compareStopFromScience}
          onSciencePlay={() => setScienceStopFromCompare(value => value + 1)}
        />
      ) : (
        <section id="earthsonic-climate-comparison" className="es-compare-guest">
          <div className="es-container es-compare-guest__layout">
            <div><p className="es-compare-kicker">NEW / EARTHSONIC COMPARE</p><h2>Two places. One planetary soundtrack.</h2><p>Sign in to compare NASA POWER daily climate measurements and listen to two original data-driven soundscapes.</p></div>
            <button type="button" onClick={() => onRequestAuth?.('login')}>Sign in to compare</button>
          </div>
        </section>
      )}
"""


def patch_home(original: str) -> str:
    if 'className="es-home editorial-home"' not in original:
        raise RuntimeError('Step 43 redesigned Home.jsx was not detected. Install and verify Step 43 first.')
    if original.count('<StationSelector') != 1:
        raise RuntimeError('Expected exactly one StationSelector in Home.jsx. No changes made.')
    if original.count('<ScientificJukebox') != 1:
        raise RuntimeError('Expected exactly one ScientificJukebox in Home.jsx. No changes made.')
    if original.count('import React') != 1:
        raise RuntimeError('Expected React import in Home.jsx. No changes made.')

    if original.count(IMPORT) > 1 or original.count('<ClimateComparison') > 1:
        raise RuntimeError('Duplicate comparison integration detected. No changes made.')
    if IMPORT in original and '<ClimateComparison' not in original:
        raise RuntimeError('Partial comparison installation detected; manual inspection needed.')
    if '<ClimateComparison' in original and IMPORT not in original:
        raise RuntimeError('Partial comparison installation detected; manual inspection needed.')
    if IMPORT in original and '<ClimateComparison' in original:
        if 'scienceStopFromCompare' not in original or 'compareStopFromScience' not in original:
            raise RuntimeError('Comparison installed with altered synchronization hooks; manual inspection needed.')
        return original

    updated = original.replace("import React from 'react';", "import React, { useState } from 'react';", 1)
    if updated == original and "import React, { useState } from 'react';" not in original:
        raise RuntimeError('Unexpected React import. No changes made.')
    updated = updated.replace("import StationSelector from '../components/StationSelector';", "import StationSelector from '../components/StationSelector';\n" + IMPORT, 1)
    if IMPORT not in updated:
        raise RuntimeError('StationSelector import anchor missing. No changes made.')
    regex = r'(export default function Home\([^\n]*\) \{\n)'
    updated, count = re.subn(regex, lambda match: match.group(1) + STATE, updated, count=1)
    if count != 1:
        raise RuntimeError('Unable to add comparison audio state. No changes made.')
    science = '<ScientificJukebox stopSignal={scienceStopSignal}/>'
    if updated.count(science) != 1:
        raise RuntimeError('ScientificJukebox stopSignal anchor changed. No changes made.')
    updated = updated.replace(science,
        '<ScientificJukebox stopSignal={scienceStopSignal + scienceStopFromCompare} onSciencePlay={() => setCompareStopFromScience(value => value + 1)}/>', 1)
    updated = updated.replace('      <StationSelector', SECTION + '      <StationSelector', 1)
    if updated.count('<ClimateComparison') != 1:
        raise RuntimeError('Failed to insert the comparison component. No changes made.')
    return updated


def install(root: Path) -> tuple[bool, Path | None]:
    root = Path(root)
    home = root / 'frontend/src/pages/Home.jsx'
    if not home.is_file():
        raise RuntimeError('Cannot find frontend/src/pages/Home.jsx; run from Earthsonic root.')
    for rel in REQUIRED_FILES:
        if not (root / rel).is_file():
            raise RuntimeError(f'Missing package file: {rel}. Extract the ZIP into the repository root first.')
    before = home.read_text(encoding='utf-8')
    after = patch_home(before)
    if before == after:
        return False, None
    backup_dir = root.parent / 'earthsonic_compare_backups' / datetime.now().strftime('step44_45_%Y%m%d_%H%M%S_%f')
    backup = backup_dir / 'Home.jsx'
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(home, backup)
    temp = home.with_name(home.name + '.step44.tmp')
    try:
        temp.write_text(after, encoding='utf-8', newline='')
        temp.replace(home)
    finally:
        temp.unlink(missing_ok=True)
    return True, backup


def main():
    changed, backup = install(Path.cwd())
    if changed:
        print('Integrated NASA two-location comparison into Step 43 homepage.')
        print(f'Previous Home.jsx backup: {backup}')
        print('Backend, authentication, database and other frontend modules were not rewritten.')
    else:
        print('Two-location comparison was already installed; no changes made.')


if __name__ == '__main__':
    main()
