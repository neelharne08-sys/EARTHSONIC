import tempfile
import unittest
from pathlib import Path

from apply_editorial_cream_theme import (
    BORDER, COBALT, CREAM, INK, MARKER, NASA_RED, STONE, TERRACOTTA, MARKERS,
    add_page_marker, apply, rewrite_component, strip_old_styles, update_tailwind,
)


class EditorialThemeTests(unittest.TestCase):
    def test_dark_and_light_tailwind_colors_are_replaced(self):
        source = '<div className="bg-space-900 bg-[#151921] text-white text-[#F4F6F8] border-slate-700 bg-white/5" />'
        result = rewrite_component(source)
        self.assertIn('bg-[#FAF9F6]', result)
        self.assertIn('bg-[#EFECE6]', result)
        self.assertIn('text-[#18181B]', result)
        self.assertIn('border-[#DCD7CD]', result)
        self.assertNotIn('text-white', result)

    def test_nasa_colors_are_distinct(self):
        source = '<div className="text-[#FC3D21] text-[#0B3D91] text-[#D97706]" />'
        result = rewrite_component(source)
        for color in (NASA_RED, COBALT, TERRACOTTA):
            self.assertIn(color, result)
        self.assertEqual(rewrite_component(result), result)

    def test_old_marker_is_removed(self):
        source = '<main className="earthsonic-gold-home premium-home min-h-screen bg-space-900" />'
        result = rewrite_component(source)
        self.assertNotIn('premium-home', result)
        self.assertNotIn('earthsonic-gold-home', result)
        result = add_page_marker(result, 'min-h-screen', 'editorial-home', 'home')
        self.assertEqual(result.count('editorial-home'), 1)
        self.assertEqual(add_page_marker(result, 'min-h-screen', 'editorial-home', 'home'), result)

    def test_old_theme_css_is_removed(self):
        css = '@tailwind base;\n@tailwind utilities;\n/* EARTHSONIC_FULL_LIGHT_THEME_V1 */\nbody { color: red; }'
        self.assertNotIn('EARTHSONIC_FULL_LIGHT_THEME_V1',strip_old_styles(css))
        self.assertIn('@tailwind utilities;',strip_old_styles(css))

    def test_tailwind_config_palette(self):
        src = "colors: { space: { 950: '#0B0D10', 900: '#0B0D10' },earth: { cyan: '#E5C158', amber: '#E5C158' }, nasa: { red: '#FC3D21', blue: '#0B3D91' } }"
        result = update_tailwind(src)
        self.assertIn(CREAM,result)
        self.assertIn(COBALT,result)
        self.assertIn(TERRACOTTA,result)
        self.assertEqual(update_tailwind(result),result)

    def test_installer_applies_once_to_sample_repo(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = root / 'frontend/src'
            src.mkdir(parents=True)
            (src / 'index.css').write_text('@tailwind base;\n@tailwind components;\n@tailwind utilities;\n/* EARTHSONIC_OBSIDIAN_GOLD_V1 */\nbody{background:black;}', encoding='utf-8')
            (root / 'frontend/tailwind.config.js').write_text("colors:{space:{950:'#0B0D10',900:'#0B0D10'},earth:{cyan:'#E5C158',amber:'#D4AF37'},nasa:{red:'#FC3D21',blue:'#0B3D91'}}", encoding='utf-8')
            for relative, (fragment, _) in MARKERS.items():
                dest = src / relative
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text('<div className="' + fragment + ' text-white bg-space-900" />', encoding='utf-8')
            first = apply(root)
            self.assertGreater(first, 0)
            self.assertEqual(apply(root), 0)
            css = (src / 'index.css').read_text(encoding='utf-8')
            self.assertIn(MARKER, css)
            self.assertNotIn('EARTHSONIC_OBSIDIAN_GOLD_V1', css)
            self.assertIn('#FAF9F6', (src / 'pages/Home.jsx').read_text(encoding='utf-8'))
            self.assertIn('#0B3D91', (root / 'frontend/tailwind.config.js').read_text(encoding='utf-8'))

    def test_input_and_modal_colors(self):
        src = '<section className="relative isolate w-full min-w-0 overflow-hidden rounded-[28px] bg-[#071427]/25 text-[#E4EEF8]" />'
        res = rewrite_component(src)
        self.assertIn(INK,res)
        self.assertIn('#E7EDF7',res)


if __name__ == '__main__':
    unittest.main()
