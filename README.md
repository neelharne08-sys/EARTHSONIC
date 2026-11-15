# EarthPulse — Hear Our Planet

**NASA Space Apps Challenge 2026, Nagpur** | **PS 14: The Earth Information Jukebox** | **Team Vertex**

## 1. Project Title & Problem Statement

EarthPulse is an interactive prototype that pairs NASA Earth Information Center (EIC) visual frames with real-time, generated audio. Its first technique analyzes the brightness of columns in a frame and changes audio pitch while scanning from left to right. It is intentionally labeled as image-feature sonification and does not represent direct measurements of climate, pollution, population or nighttime radiance.

Official challenge: https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/

## 2. Team Details

| Member | Role | GitHub username |
| --- | --- | --- |
| Shubhanshu Bambal | Team Leader & Research | TODO |
| Sahil Thute | Backend/Audio & Data Processing | SAH-21 |
| Member 3 | Frontend Developer | TODO |
| Member 4 | Presentation, Testing, Documentation & Project Support | TODO |

Replace placeholders with the real registered names and GitHub usernames before the submission deadline.

## 3. Solution Overview & Architecture

```text
NASA EIC image (saved locally, or user-provided image)
          |
          v
Browser Canvas: average relative luminance in 100 vertical slices
          |
          v
Normalize series within selected frame [0,1]
          |
          +--------------------+
          |                    |
          v                    v
Interactive plot         Browser Web Audio API
+ scanning cursor        brightness → sine tone pitch
```

Technology stack: HTML, CSS, JavaScript, Canvas API, Web Audio API. No third-party JS dependencies. No server is required for the initial prototype.

## 4. Live Demo & Screenshots

- Live URL: TODO (GitHub Pages or another host)
- Demo video: TODO
- Screenshots: TODO

The provided illustrative image is **not** NASA data. Replace it for the scientific demonstration with a genuine EIC frame before submitting the project.

**Authentic NASA visual source:** NASA Scientific Visualization Studio, *Change in Night Lights between 2012 and 2023 — EIC Version*, ID 5313: https://svs.gsfc.nasa.gov/5313/

**How to add the NASA EIC image:**

1. Open https://svs.gsfc.nasa.gov/5313/
2. Under Images, download `nightlights_flat_series_and_change_wZooms_13_EIC.02599_print.jpg` (1024x288).
3. Save the downloaded file inside this repository at `assets/nasa-eic-nightlights.jpg`.
4. Refresh the application, click `Load NASA EIC frame`, then click Play.
5. Keep the image unmodified and credit NASA's Scientific Visualization Studio. This frame is a snapshot from a time-based visualization; it does not itself provide direct measurements in calibrated units.

## 5. Installation & Setup Guide

Run from project root using Python:

```powershell
python -m http.server 5173
```

Visit http://localhost:5173 in your browser.

Alternatively, use VS Code Live Server. Opening `index.html` directly with a `file://` URL may cause restrictions on ES module imports.

### Deploy via GitHub Pages

On GitHub, open repository Settings → Pages, choose Deploy from a branch, `main` and `/ (root)`. The site uses relative paths to work under a GitHub Pages repository path.

## 6. AI Usage Disclosure

AI assistance (OpenAI ChatGPT) was used to draft the initial HTML/CSS/JavaScript scaffold, browser audio engine, brightness-analysis logic, accompanying documentation, and proposed workflow on November 14, 2026. Team members must review, understand, test, modify, and integrate any AI-assisted material themselves. Update this section to record any further Gemini, Copilot, Claude or other assistance and the files they helped produce. All git commits must be authored by real registered team members. Do not add any AI tool as a git contributor or co-author.

## Development and Evaluation Notes

See `CONTRIBUTING.md`, `docs/SCIENCE.md`, and `docs/PITCH.md`.

**Important:** The 4 PM commit checkpoint was communicated in the Nagpur group; organizers also require authentic participation by every member, and the handbook lists a 2 PM November 15 local code freeze. Confirm final timing with the venue and submit on the official NASA team Project tab as well.
