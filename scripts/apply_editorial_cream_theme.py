from pathlib import Path
import colorsys
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
MARKER = 'EARTHSONIC_EDITORIAL_CREAM_V1'
CREAM = '#FAF9F6'
STONE = '#EFECE6'
PAPER = '#FFFDF9'
INK = '#18181B'
MUTED = '#71717A'
BORDER = '#DCD7CD'
NASA_RED = '#FC3D21'
COBALT = '#0B3D91'
TERRACOTTA = '#D97706'

HEX_UTILITY = re.compile(r'(?<![\w-])(?P<kind>bg|text|border|from|via|to|ring|placeholder|fill|stroke|accent|divide)-\[\#(?P<color>[0-9a-fA-F]{6})\](?P<opacity>/\d{1,3})?(?![\w-])')
NAMED_UTILITY = re.compile(r'(?<![\w-])(?P<kind>bg|text|border|from|via|to|ring|placeholder|fill|stroke|accent|divide)-(?P<color>[a-z][a-z0-9-]*)(?P<opacity>/\d{1,3})?(?![\w-])')
HEX_LITERAL = re.compile(r'(?P<quote>[\'"\`])#(?P<hex>[0-9a-fA-F]{6})(?P=quote)')
THEME_CLASS = re.compile(r'(?<![\w-])(?:premium-(?:home|hero|navbar|preview|science|auth|auth-panel|dashboard|jukebox)|earthsonic-light-auth-panel|earthsonic-gold-(?:home|hero|navbar|preview|science|auth-panel|dashboard|jukebox))(?=\s)')

THEME_SIGNATURES = (
    '/* EARTHSONIC_EDITORIAL_CREAM_V1 */',
    '/* EARTHSONIC_OBSIDIAN_GOLD_V1 */',
    '/* EARTHSONIC_FULL_LIGHT_THEME_V1 */',
    '/* EARTHSONIC PREMIUM V2 -- VIOLET AURORA */',
    ':root {\n  --premium-background:',
)

MARKERS = {
    'pages/Home.jsx': ('min-h-screen', 'editorial-home'),
    'components/Hero.jsx': ('relative overflow-hidden pt-8', 'editorial-hero'),
    'components/Navbar.jsx': ('sticky top-0 z-50', 'editorial-navbar'),
    'components/GuestSciencePreview.jsx': ('border-y', 'editorial-preview'),
    'components/ScientificJukebox.jsx': ('rounded-2xl border', 'editorial-science'),
    'pages/AuthPage.jsx': ('relative isolate w-full min-w-0 overflow-hidden rounded-[28px]', 'editorial-auth-panel'),
    'pages/Dashboard.jsx': ('min-h-screen', 'editorial-dashboard'),
    'pages/Jukebox.jsx': ('min-h-screen py-8', 'editorial-jukebox'),
}

PALETTE_WHITELIST = {c.upper(): c for c in (CREAM, STONE, PAPER, INK, MUTED, BORDER, NASA_RED, COBALT, TERRACOTTA, '#FFFFFF', '#E8E3DB', '#E7EDF7', '#FCE7E2', '#C32F1A', '#F5F0E7')}


def hex_stats(value):
    rgb = [int(value[i:i+2], 16)/255 for i in (0, 2, 4)]
    hue, sat, val = colorsys.rgb_to_hsv(*rgb)
    return hue * 360, sat, val


def hue_color(value):
    h, s, v = hex_stats(value)
    if s < 0.12:
        return MUTED
    if h < 16 or h >= 345:
        return NASA_RED
    if h < 70:
        return TERRACOTTA
    if 70 <= h < 165:
        return MUTED
    if 165 <= h < 310:
        return COBALT
    return NASA_RED


def translate_hex(kind, value, opacity=None):
    value = value.upper()
    _, sat, brightness = hex_stats(value)
    h, _, _ = hex_stats(value)
    if kind in ('from', 'via', 'to'):
        if brightness < 0.4 and sat < 0.7:
            return {'from': PAPER, 'via': CREAM, 'to': STONE}[kind]
        if (h < 70 or h >= 345) and sat > 0.2:
            return {'from': NASA_RED, 'via': '#FC3D21', 'to': '#C32F1A'}[kind]
        return {'from': PAPER, 'via': STONE, 'to': CREAM}[kind]
    if kind == 'bg':
        if opacity is not None and int(opacity[1:]) <= 45:
            return '#E7EDF7' if 165 <= h <= 300 and sat > 0.3 else ('#FCE7E2' if sat > 0.3 else STONE)
        if brightness < 0.45:
            return CREAM if brightness < 0.12 else STONE
        if sat > 0.36 and 0.35 < brightness < 0.95:
            return NASA_RED if h < 65 or h > 310 else COBALT
        if brightness >= 0.92:
            return PAPER
        return STONE
    if kind in ('text', 'fill', 'stroke'):
        if brightness < 0.4 and sat < 0.55:
            return INK
        if sat > 0.35:
            return hue_color(value)
        if brightness > 0.82:
            return INK
        return MUTED
    if kind in ('border', 'divide'):
        return BORDER
    if kind in ('ring', 'accent'):
        return COBALT
    if kind == 'placeholder':
        return MUTED
    return None


def translate_named(kind, name, opacity=None):
    if name in ('transparent', 'current', 'inherit', 'none'):
        return None
    if name in ('white', 'black'):
        if kind == 'bg':
            return PAPER if name == 'white' else CREAM
        if kind in ('text', 'fill', 'stroke'):
            return INK
        if kind in ('from', 'via', 'to'):
            return {'from': PAPER, 'via': STONE, 'to': CREAM}[kind]
        if kind in ('border', 'divide'):
            return BORDER
        return COBALT
    if name.startswith('space-'):
        shade = name.split('-')[1]
        if kind == 'bg':
            return CREAM if shade in ('950', '900') else STONE
        if kind in ('text', 'fill', 'stroke'):
            return INK
        if kind in ('border', 'divide'):
            return BORDER
        if kind in ('from', 'via', 'to'):
            return {'from': PAPER, 'via': STONE, 'to': CREAM}[kind]
        return COBALT
    neutral = ('slate-', 'gray-', 'zinc-', 'neutral-', 'stone-')
    if name.startswith(neutral):
        shade = int(name.rsplit('-', 1)[-1]) if name.rsplit('-', 1)[-1].isdigit() else 500
        if kind == 'bg':
            return STONE if shade >= 500 else PAPER
        if kind in ('text', 'fill', 'stroke'):
            return MUTED if shade in range(300, 800) else INK
        if kind in ('border', 'divide'):
            return BORDER
        if kind in ('from', 'via', 'to'):
            return {'from': PAPER, 'via': CREAM, 'to': STONE}[kind]
        return COBALT
    color_prefixes = ('cyan-', 'teal-', 'sky-', 'blue-', 'indigo-', 'purple-', 'violet-', 'amber-', 'yellow-', 'orange-', 'emerald-', 'green-', 'rose-', 'red-', 'earth-', 'nasa-')
    if name.startswith(color_prefixes):
        is_warm = name.startswith(('amber-', 'orange-', 'yellow-')) or name.endswith(('amber', 'orange'))
        is_red = name.startswith(('red-', 'rose-')) or name.endswith('red')
        if kind in ('text', 'fill', 'stroke'):
            return TERRACOTTA if is_warm else NASA_RED if is_red else COBALT
        if kind == 'bg':
            if opacity is not None and int(opacity[1:]) <= 45:
                return '#FCE7E2' if is_red or is_warm else '#E7EDF7'
            return TERRACOTTA if is_warm else NASA_RED if is_red else COBALT
        if kind in ('from', 'via', 'to'):
            return {'from': NASA_RED, 'via': '#FC3D21', 'to': '#C32F1A'}[kind]
        if kind in ('border', 'divide'):
            return BORDER
        return COBALT
    return None


def rewrite_utility(match, is_hex):
    kind = match.group('kind')
    color = match.group('color')
    opacity = match.group('opacity')
    if is_hex:
        replacement = translate_hex(kind, color, opacity)
    else:
        replacement = translate_named(kind, color, opacity)
    if replacement is None:
        return match.group(0)
    if kind == 'bg' and opacity and int(opacity[1:]) < 85:
        opacity = '/95'
    if kind in ('border', 'ring', 'divide') and opacity and int(opacity[1:]) < 50:
        opacity = '/80'
    return f'{kind}-[{replacement}]' + (opacity or '')


def normalize_js_literal(match):
    h = match.group('hex')
    if h.upper() in PALETTE_WHITELIST:
        return match.group(0)
    replacement = hue_color(h)
    return match.group('quote') + replacement + match.group('quote')


def rewrite_component(source):
    source = THEME_CLASS.sub('', source)
    source = HEX_UTILITY.sub(lambda m: rewrite_utility(m, True), source)
    source = NAMED_UTILITY.sub(lambda m: rewrite_utility(m, False), source)
    source = HEX_LITERAL.sub(normalize_js_literal, source)
    return source


def add_page_marker(source, fragment, marker, location):
    if re.search(r'(?<![\w-])' + marker + r'(?![\w-])', source):
        return source
    matches = [m for m in re.finditer(r'className="([^"\n]*)"', source) if fragment in m.group(1)]
    if len(matches) != 1:
        raise ValueError(f'Cannot identify {location} for theme: found {len(matches)} matches for {fragment!r}')
    m = matches[0]
    replacement = 'className="' + marker + ' ' + m.group(1).strip() + '"'
    return source[:m.start()] + replacement + source[m.end():]


def update_tailwind(source):
    if 'space:' not in source or 'earth:' not in source or 'nasa:' not in source:
        raise ValueError('Expected Earthsonic Tailwind color groups are missing')
    mapping = {
        'space': {'950': CREAM, '900': CREAM, '850': STONE, '800': '#E8E3DB', '700': BORDER, '600': '#B5ACA0'},
        'earth': {'ocean': COBALT, 'cyan': COBALT, 'teal': COBALT, 'emerald': COBALT, 'forest': COBALT, 'amber': TERRACOTTA, 'orange': TERRACOTTA, 'violet': NASA_RED},
        'nasa': {'red': NASA_RED, 'blue': COBALT, 'cyan': COBALT, 'amber': TERRACOTTA, 'emerald': COBALT},
    }
    for group, colors in mapping.items():
        pattern = re.compile(r'(' + group + r':\s*\{)(.*?)(\})', re.S)
        group_match = pattern.search(source)
        if group_match is None:
            raise ValueError('Missing color group: ' + group)
        block = group_match.group(2)
        for color, value in colors.items():
            rgba = re.compile(r'''(?P<start>\b(?:['"]?''' + re.escape(color) + r'''['"]?)\s*:\s*)['"]#[0-9a-fA-F]{6}['"]''')
            block = rgba.sub(lambda m: m.group('start') + "'" + value + "'", block)
        source = source[:group_match.start(2)] + block + source[group_match.end(2):]
    source = re.sub(r'rgba\(0,\s*229,\s*255,\s*0\.4\)', 'rgba(11,61,145,0.18)', source)
    return source


def strip_old_styles(source):
    offsets = [source.find(marker) for marker in THEME_SIGNATURES if marker in source]
    if offsets:
        source = source[:min(offsets)].rstrip() + '\n'
    return source


THEME_CSS = r'''
/* EARTHSONIC_EDITORIAL_CREAM_V1 */
:root {
  color-scheme: light;
  --es-canvas: #FAF9F6;
  --es-stone: #EFECE6;
  --es-paper: #FFFDF9;
  --es-ink: #18181B;
  --es-muted: #71717A;
  --es-border: #DCD7CD;
  --es-red: #FC3D21;
  --es-cobalt: #0B3D91;
  --es-terracotta: #D97706;
}
html,body,#root {
  background:#FAF9F6 !important;
  color:#18181B;
}
body {
  color-scheme:light;
  background-image:none !important;
}
::selection { background:#FBD4CD; color:#18181B; }
.editorial-home,.editorial-jukebox,.editorial-dashboard {
  background:#FAF9F6 !important;
  color:#18181B !important;
}
.editorial-navbar {
  background:rgba(250,249,246,.97) !important;
  border-bottom:1px solid #DCD7CD !important;
  color:#18181B !important;
  box-shadow:0 4px 20px rgba(24,24,27,.06) !important;
}
.editorial-hero {
  background:radial-gradient(ellipse at 90% 7%,rgba(252,61,33,.075),transparent 39%),radial-gradient(ellipse at 4% 70%,rgba(11,61,145,.065),transparent 41%),#FAF9F6 !important;
  border-color:#DCD7CD !important;
}
.editorial-hero h1 { color:#18181B !important; }
.editorial-hero h1 span {
  background-image:linear-gradient(105deg,#FC3D21 12%,#0B3D91 85%) !important;
  color:transparent !important;
}
.editorial-preview {
  background:linear-gradient(135deg,#FFFDF9 0%,#EFECE6 100%) !important;
  border-color:#DCD7CD !important;
  color:#18181B !important;
}
.editorial-science {
  background:linear-gradient(145deg,#FFFDF9,#FAF9F6 70%,#EFECE6) !important;
  border:1px solid #DCD7CD !important;
  color:#18181B !important;
  box-shadow:0 12px 38px rgba(24,24,27,.055) !important;
}
.editorial-science input[type="range"],.editorial-home input[type="range"] { accent-color:#0B3D91 !important; }
.editorial-dashboard :is(section,article)[class*="border"],
.editorial-jukebox :is(section,article)[class*="border"],
.editorial-home :is(section,article)[class*="border"] { border-color:#DCD7CD; }
.editorial-dashboard :is(section,article)[class*="bg-gradient"],
.editorial-home :is(section,article)[class*="bg-gradient"] {
  background-image:linear-gradient(135deg,#FFFDF9,#EFECE6) !important;
}
.editorial-home table,.editorial-dashboard table { color:#18181B !important; }
.editorial-home :is(th,td),.editorial-dashboard :is(th,td) { border-color:#DCD7CD !important; }
.editorial-home thead,.editorial-dashboard thead { background:#EFECE6 !important; }
.editorial-auth-panel {
  background:#FAF9F6 !important;
  color:#18181B !important;
  border:1px solid #DCD7CD !important;
  box-shadow:0 22px 70px rgba(24,24,27,.12) !important;
  backdrop-filter:none !important;
}
.editorial-auth-panel > [aria-hidden="true"] { display:none !important; }
.editorial-auth-panel :is(h1,h2,h3,p,label) { color:#18181B; }
.editorial-auth-panel :is(input[type="email"],input[type="password"],input[type="text"]) {
  background:#FFFFFF !important;
  border:1px solid #DCD7CD !important;
  color:#18181B !important;
  box-shadow:none !important;
}
.editorial-auth-panel input::placeholder { color:#71717A !important; }
.editorial-auth-panel input:is(:-webkit-autofill,:autofill) {
  -webkit-box-shadow:0 0 0 1000px #FFFDF9 inset !important;
  -webkit-text-fill-color:#18181B !important;
  caret-color:#18181B;
}
.editorial-auth-panel [role="group"] { background:#EFECE6 !important; border-color:#DCD7CD !important; }
.editorial-auth-panel [role="group"] button[aria-pressed="true"] {
  background:#0B3D91 !important;
  color:#FFFFFF !important;
}
.editorial-auth-panel [role="group"] button[aria-pressed="true"] * { color:#FFFFFF !important; }
.editorial-auth-panel button[type="submit"],
body button[class*="bg-gradient-to-r"],
body a[class*="bg-gradient-to-r"] {
  background:#FC3D21 !important;
  color:#18181B !important;
  border-color:#FC3D21 !important;
  box-shadow:0 6px 18px rgba(252,61,33,.14) !important;
}
body button[class*="bg-gradient-to-r"] :is(svg,span),
body a[class*="bg-gradient-to-r"] :is(svg,span),
.editorial-auth-panel button[type="submit"] :is(svg,span) { color:#18181B !important; }
body button[class*="bg-[#0B3D91]"] { color:#FFFFFF !important; }
body button[class*="bg-[#0B3D91]"] :is(svg,span) { color:#FFFFFF !important; }
body button[class*="bg-[#FC3D21]"], body button[class*="bg-[#D97706]"] { color:#18181B !important; }
body button[class*="bg-[#FC3D21]"] :is(svg,span),
body button[class*="bg-[#D97706]"] :is(svg,span) { color:#18181B !important; }
.editorial-science button[type="submit"],
.editorial-preview button[type="button"]:not([class*="bg-transparent"]) {
  background:#0B3D91 !important;
  color:#FFFFFF !important;
}
.editorial-science button[type="submit"] :is(svg,span),
.editorial-preview button[type="button"] :is(svg,span) { color:#FFFFFF !important; }
body :is(button,a,input,textarea,select):focus-visible { outline:2px solid #0B3D91 !important; outline-offset:3px; }
body :is(input[type="number"],input[type="date"],input[type="email"],input[type="password"],input[type="text"],textarea,select) {
  color:#18181B;
  border-color:#DCD7CD;
}
body :is(input[type="number"],input[type="date"],input[type="email"],input[type="password"],input[type="text"]):not([class*="bg-transparent"]) {
  background:#FFFDF9 !important;
}
body a[class*="text-[#0B3D91]"] { text-underline-offset:3px; }
.glow-cyan,.glow-teal,.glow-amber,.glow-emerald { box-shadow:0 4px 18px rgba(11,61,145,.12) !important; }
.bg-telemetry-grid {
  background-image:linear-gradient(to right,rgba(11,61,145,.03) 1px,transparent 1px),linear-gradient(to bottom,rgba(11,61,145,.03) 1px,transparent 1px) !important;
}
::-webkit-scrollbar-track {background:#EFECE6 !important;}
::-webkit-scrollbar-thumb {background:#C5BEB2 !important;}
::-webkit-scrollbar-thumb:hover {background:#A8A198 !important;}
@media (prefers-reduced-motion:reduce) {
  .editorial-hero *, .editorial-auth-panel * {animation-duration:.001ms !important;transition-duration:.001ms !important;}
}
'''


def build_changes(root):
    src = root / 'frontend/src'
    css = src / 'index.css'
    tailwind = root / 'frontend/tailwind.config.js'
    required = [css,tailwind] + [src / p for p in MARKERS]
    for path in required:
        if not path.is_file():
            raise ValueError('Missing Earthsonic frontend file: ' + str(path.relative_to(root)))
    old_css = css.read_text(encoding='utf-8')
    if '@tailwind utilities;' not in old_css:
        raise ValueError('Tailwind CSS directives not found')
    if MARKER in old_css:
        return {}
    updates = {}
    for path in sorted(src.rglob('*.jsx')):
        original = path.read_text(encoding='utf-8')
        modified = rewrite_component(original)
        rel = path.relative_to(src).as_posix()
        if rel in MARKERS:
            fragment, marker = MARKERS[rel]
            modified = add_page_marker(modified, fragment, marker, rel)
        if modified != original:
            updates[path] = modified
    for relative in ('data/stations.js','services/scientificPlayback.js'):
        path = src / relative
        if path.is_file():
            original = path.read_text(encoding='utf-8')
            modified = HEX_LITERAL.sub(normalize_js_literal, original)
            if relative == 'services/scientificPlayback.js':
                modified = re.sub(r"(id: 'temperature_c'[^\n]*?color: )'#[0-9a-fA-F]{6}'", lambda m:m.group(1)+"'"+COBALT+"'",modified)
                modified = re.sub(r"(id: 'relative_humidity_pct'[^\n]*?color: )'#[0-9a-fA-F]{6}'", lambda m:m.group(1)+"'"+TERRACOTTA+"'",modified)
                modified = re.sub(r"(id: 'wind_speed_mps'[^\n]*?color: )'#[0-9a-fA-F]{6}'", lambda m:m.group(1)+"'"+NASA_RED+"'",modified)
            if modified != original:
                updates[path] = modified
    original_tw = tailwind.read_text(encoding='utf-8')
    updated_tw = update_tailwind(original_tw)
    if original_tw != updated_tw:
        updates[tailwind] = updated_tw
    updates[css] = strip_old_styles(old_css).rstrip() + '\n\n' + THEME_CSS.strip() + '\n'
    return updates


def apply(root):
    changes = build_changes(root)
    if not changes:
        print('Editorial Cream theme is already applied.')
        return 0
    for path,content in changes.items():
        if path.read_text(encoding='utf-8') != content:
            path.write_text(content,encoding='utf-8')
            print('Updated:',path.relative_to(root))
    print('Applied Editorial Cream, Warm Stone, NASA Red, Cobalt and Terracotta. Backend unchanged.')
    return len(changes)


def main():
    try:
        apply(ROOT)
    except (ValueError, OSError) as exc:
        print('Theme update failed:',str(exc),file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
