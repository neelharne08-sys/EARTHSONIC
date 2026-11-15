from pathlib import Path

GLOBE_PATH = Path('frontend/src/components/GlobeLocationPicker.jsx')
CSS_PATH = Path('frontend/src/components/GlobeLocationPicker.css')

CSS_MARKER = '/* Step 40 NASA Blue Marble country labels */'
CSS_ADDITIONS = '''
/* Step 40 NASA Blue Marble country labels */
.earthsonic-globe-header-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.earthsonic-globe-label-toggle{background:#ffffff;color:#0B3D91;border:1px solid #DCD7CD;border-radius:11px;padding:10px 12px;font-size:12px;font-weight:700;cursor:pointer}
.earthsonic-globe-label-toggle:hover,.earthsonic-globe-label-toggle:focus-visible{border-color:#0B3D91;outline-offset:2px}
.earthsonic-globe-canvas-wrap canvas{box-shadow:0 0 32px -18px rgba(26,118,208,.48);}
'''


def replace_once(source, old, new, label):
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected one anchor, found {count}. Leaving files unchanged.')
    return source.replace(old, new, 1)


def upgrade(source):
    if "from '../services/countryLabels.mjs'" in source:
        return source
    if 'export default function GlobeLocationPicker' not in source:
        raise RuntimeError('This is not the expected Step 39 GlobeLocationPicker component.')
    source = replace_once(
        source,
        "import './GlobeLocationPicker.css';",
        "import './GlobeLocationPicker.css';\nimport { getVisibleCountryLabels } from '../services/countryLabels.mjs';",
        'Country labels import'
    )
    source = replace_once(
        source,
        '  const [rotation, setRotation] = useState(0);',
        '  const [rotation, setRotation] = useState(0);\n  const [showCountries, setShowCountries] = useState(true);\n  const showCountriesRef = useRef(true);',
        'Country labels toggle state'
    )
    source = replace_once(
        source,
        '        const light = 0.51 + 0.34 * z + 0.15 * Math.max(0, -0.5 * x + 0.7 * y);',
        '        const light = 0.25 + 0.83 * Math.max(0, 0.94 * z - 0.29 * x + 0.16 * y);',
        'More realistic planetary illumination'
    )
    source = replace_once(
        source,
        '''    context.stroke();

    const selected = normalizeLocation(latestRef.current.latitude, latestRef.current.longitude);''',
        '''    context.stroke();

    if (showCountriesRef.current) {
      context.save();
      context.font = '650 10px system-ui, -apple-system, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.lineJoin = 'round';
      for (const country of getVisibleCountryLabels(view.latitude, view.longitude)) {
        const cx = CENTER + country.x * RADIUS;
        const cy = CENTER - country.y * RADIUS;
        context.globalAlpha = Math.min(1, Math.max(0.65, country.depth));
        context.lineWidth = 3.4;
        context.strokeStyle = 'rgba(5, 17, 31, 0.95)';
        context.strokeText(country.name, cx, cy);
        context.fillStyle = '#FAFBFC';
        context.fillText(country.name, cx, cy);
      }
      context.restore();
    }

    const selected = normalizeLocation(latestRef.current.latitude, latestRef.current.longitude);''',
        'Visible country labels'
    )
    source = replace_once(
        source,
        "    image.src = '/earthsonic-earth-texture.png';\n    requestDraw();",
        """    const textureChoices = ['/earthsonic-earth-nasa.jpg', '/earthsonic-earth-texture.png'];
    let textureIndex = 0;
    image.onerror = () => {
      textureIndex += 1;
      if (textureIndex < textureChoices.length) image.src = textureChoices[textureIndex];
    };
    image.src = textureChoices[0];
    requestDraw();""",
        'Real NASA imagery with offline fallback'
    )
    source = replace_once(
        source,
        '''  useEffect(() => {
    setManualLat(String(latitude));''',
        '''  useEffect(() => {
    showCountriesRef.current = showCountries;
    requestDraw();
  }, [showCountries]);

  useEffect(() => {
    setManualLat(String(latitude));''',
        'Toggle redraw effect'
    )
    source = replace_once(
        source,
        '''        <button type="button" className="earthsonic-globe-reset" onClick={() => { const selected = normalizeLocation(latitude, longitude); if (selected) { viewRef.current = selected; setRotation(n => n + 1); } }}>
          <Crosshair size={16} /> Center selection
        </button>''',
        '''        <div className="earthsonic-globe-header-actions">
          <button type="button" className="earthsonic-globe-label-toggle" onClick={() => setShowCountries(value => !value)} aria-pressed={showCountries}>
            Country names: {showCountries ? 'On' : 'Off'}
          </button>
          <button type="button" className="earthsonic-globe-reset" onClick={() => { const selected = normalizeLocation(latitude, longitude); if (selected) { viewRef.current = selected; setRotation(n => n + 1); } }}>
            <Crosshair size={16} /> Center selection
          </button>
        </div>''',
        'Country labels UI toggle'
    )
    return source


def main():
    if not GLOBE_PATH.is_file():
        raise SystemExit('Step 39 globe component not found. Install Step 39 before using this upgrade.')
    if not Path('frontend/src/services/countryLabels.mjs').is_file():
        raise SystemExit('Country labels dataset is missing. Extract the full Step 40 package first.')
    old = GLOBE_PATH.read_text(encoding='utf-8')
    new = upgrade(old)
    css_old = CSS_PATH.read_text(encoding='utf-8')
    css_new = css_old if CSS_MARKER in css_old else css_old.rstrip() + '\n' + CSS_ADDITIONS
    if old != new:
        GLOBE_PATH.write_text(new, encoding='utf-8')
        print('Updated:', GLOBE_PATH)
    else:
        print('Already updated:', GLOBE_PATH)
    if css_old != css_new:
        CSS_PATH.write_text(css_new, encoding='utf-8')
        print('Updated:', CSS_PATH)
    print('Realistic NASA globe renderer and country-label overlay installed.')
    print('Optional next step: download NASA Blue Marble texture using scripts/download_nasa_earth_texture.py')


if __name__ == '__main__':
    main()
