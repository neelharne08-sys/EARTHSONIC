# Earthsonic — Step 43: Integrated Frontend Redesign

This update is a frontend-only redesign for Team Vertex's NASA Space Apps Earth Information Jukebox. It uses the existing Editorial Cream (`#FAF9F6`), Warm Stone (`#EFECE6`), NASA Red (`#FC3D21`), Orbital Cobalt (`#0B3D91`), and Carbon Ink (`#18181B`) design scheme.

## Rebuilt interaction and content

- Cinematic two-column homepage with NASA Blue Marble globe and clear sign-in calls to action.
- Three-stage explainer covering globe location selection, daily NASA POWER readings, and audio sonification.
- Redesigned guest science preview with a clearly identified illustrative chart.
- Searchable/filterable 10-station collection; new NASA source links and redesigned cards.
- Guest station card previews now require authentication, using the existing App.jsx station authorization flow.
- Scientific mapping concepts remain available in an expandable source table.
- Shared updated layout, typography and surfaces for login/signup, My Space dashboard, Jukebox and science areas.
- Existing real-data science panel, account state, saved mixes, favorites and browser Web Audio behavior are reused.

## Explicit limitations

The homepage globe uses the existing Canvas renderer, not a Three.js WebGL scene. Scientific audio is artistic synthesis of NASA POWER gridded values, not NASA-recorded sounds. The 10 NASA SVS station entries are visualization references; they are not all backed by independent calibrated data pipelines. Full backend and cross-browser behavior must be tested locally after installation.

## Install safely

1. Work from `E:\SAHIL\nasa_spaceapps` on `feature/integration` or a clean feature branch.
2. Create `feature/experience-redesign` from `feature/integration` (avoid doing this if it already exists).
3. Unzip package into repository root. Templates remain inside `redesign_templates/`; they do not replace existing React files until you run the installer.
4. Run `.\backend\.venv\Scripts\python.exe .\scripts\install_earthsonic_redesign.py`.
5. The installer creates backups in `E:\SAHIL\earthsonic_redesign_backups` outside the repository.
6. Run installer unit tests, `npm run build --prefix .\frontend`, and `python -m pytest backend -q` using the backend virtual environment.
7. Preview on Vite and verify guest sign-in gating, globe, NASA data, favorites, saved mixes and mobile/keyboard interactions.
8. Review Git diffs and commit only after browser acceptance. Never stage unrelated README.txt and other experiment files.

## Main files

- `frontend/src/components/Hero.jsx`
- `frontend/src/components/CinematicEarthHero.jsx`
- `frontend/src/components/StationSelector.jsx`
- `frontend/src/components/StationCard.jsx`
- `frontend/src/components/GuestSciencePreview.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/styles/earthsonic-redesign.css`
- `frontend/src/App.jsx` — CSS import added; no functional routing changes

## Backend

No backend files are modified by this installer. Current baseline: 152 backend tests, frontend Vite/React/Tailwind, FastAPI NASA POWER routes, Argon2/SQLite authentication, favorites and saved mixes. Verify locally; these baseline results are not a promise of success in the new UI.
