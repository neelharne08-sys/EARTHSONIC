# Earthsonic — Editorial NASA Science Theme

This is a complete visual palette pass over the existing Earthsonic React frontend. It does not change authentication, FastAPI routes, NASA requests, or sound mapping.

## Colors

| Role | Hex |
|---|---|
| Primary canvas (Editorial Cream) | `#FAF9F6` |
| Secondary surface (Warm Stone) | `#EFECE6` |
| Main text (Carbon Ink) | `#18181B` |
| Muted copy (Slate Mist) | `#71717A` |
| Borders (Stone divider) | `#DCD7CD` |
| Primary highlight (NASA Worm Red) | `#FC3D21` |
| Data / interactive cobalt | `#0B3D91` |
| Secondary comparison / markers | `#D97706` |

The sign-in form is a solid editorial card for legibility; the scientific data layers and hero highlights use the red/cobalt/terracotta palette.

## Install

Keep your current work on its own branch, then extract the ZIP at the repository root and run:

```powershell
.\backend\.venv\Scripts\python.exe .\scripts\apply_editorial_cream_theme.py
.\backend\.venv\Scripts\python.exe -m unittest discover -s scripts -p test_editorial_cream_theme.py -v
npm run build --prefix .\frontend
.\backend\.venv\Scripts\python.exe -m pytest backend -q
```

The installer removes the previous full light, obsidian/gold and violet overlay styles. It modifies only `.jsx` components, the color declarations in `scientificPlayback.js` and `stations.js`, `index.css`, and `tailwind.config.js`. The installer is idempotent (subsequent runs do nothing). Existing untracked `README.txt` is not modified.

## Visual QA

Check homepage, account login/signup (including autofill), navbar, station cards, scientific playback charts, Jukebox controls, and My Space dashboard. Confirm red primary actions and cobalt data/link accents, with readable dark text on cream/stone.
