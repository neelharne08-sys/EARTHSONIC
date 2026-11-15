# Step 42 — Cinematic Earthsonic Homepage

## What changes

- A two-column editorial homepage hero with NASA Blue Marble globe visualization, physical-style orbital rings, and subtle 3D card hover depth.
- The Earth sphere draws NASA's historical Blue Marble composite using an orthographic Canvas projection, auto-rotates gently, and accepts pointer dragging and keyboard arrow keys. This is a 3D-looking globe visualization, not a WebGL 3D model or a live satellite feed.
- The public homepage remains public. Clicking the primary Jukebox button or attempting an audio audition still follows existing session/authentication checks.
- The 'Explore the science' button scrolls to the already-existing Scientific Jukebox or its guest preview. It does not request NASA data for unauthenticated users.
- Motion is paused for reduced-motion preferences; rendering is throttled when off-screen to reduce power use.
- The design uses Editorial Cream `#FAF9F6`, Warm Stone `#EFECE6`, Carbon Ink `#18181B`, NASA Red `#FC3D21`, Orbital Cobalt `#0B3D91`, and Terracotta Gold `#D97706`.

## Install

Stay on the existing integration branch until the fresh branch is created, and do not stage unrelated local README or older theme experiments.

```powershell
cd E:\SAHIL\nasa_spaceapps
git switch feature/integration
git switch -c feature/cinematic-earth-home
Expand-Archive -LiteralPath "E:\harshal\Earthsonic_Cinematic_3D_Home_Step42.zip" -DestinationPath "E:\SAHIL\nasa_spaceapps" -Force
.\backend\.venv\Scripts\python.exe .\scripts\install_cinematic_home.py
.\backend\.venv\Scripts\python.exe -m unittest discover -s scripts -p test_cinematic_home_installer.py -v
npm run build --prefix .\frontend
.\backend\.venv\Scripts\python.exe -m pytest backend -q
git diff --check
```

## Browser acceptance checklist

1. Open homepage as guest. Earth globe appears; hover and rotation work; explore-science scrolls to the guest preview.
2. Press 'Sign in to explore' and 'Preview after sign in': each must open login, with no unauthenticated audio playback.
3. Log in and test Launch Earth Jukebox and Audition sound.
4. Use arrow keys with the globe focused. Test pointer drag on desktop or touch drag on mobile.
5. Activate reduced-motion preference and verify the animation stops.
6. Check mobile viewport and read labels/small-screen controls.
7. Reconfirm favorites, My Space, and the scientific globe on the existing sections still work.

## Notes and limitations

The image texture is the bundled NASA composite (`/earthsonic-earth-nasa.jpg`) rather than real-time satellite imagery. The hero presents a visual overview, not time-varying geospatial measurements. The separate scientific globe still performs actual latitude/longitude selection and backend NASA POWER requests after authentication.

Do not claim the homepage uses full WebGL or Three.js. A future, larger 3D build may introduce Three.js or React Three Fiber after performance and usability review.
