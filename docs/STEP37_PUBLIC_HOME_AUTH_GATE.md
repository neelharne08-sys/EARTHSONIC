# Step 37: Public homepage, members-only features

This change keeps the Earthsonic homepage public and visible before sign-in. The main homepage displays a Scientific Jukebox preview; a signed-in account instead sees the live Scientific Jukebox at the same location. The full Jukebox, station selection, station auditions, My Space, saved mixes, and scientific API endpoints require a valid login. Accessibility preferences, NASA source descriptions and public marketing content remain available without registration.

## Installation

Use a new branch from `feature/integration` and extract this ZIP into the repository root. Run `scripts/integrate_public_home.py` with the project's Python environment.

## Verify

Run the original backend test suite, the new access-control tests, and the Vite build. In a private browser window, verify the homepage and preview appear without login and that all action buttons open sign in or sign up. After login, the homepage should show the active scientific workstation. Opening the full Jukebox and saving favorites should work with the existing session.

The API continues to expose public `/api/health`, `/api/auth/register`, `/api/auth/login`, `/api/auth/me` and logout as appropriate; `/api/sonification` and `/api/science/*` are now session-protected. Public NASA source links remain public external websites.

Note: the homepage visualization before sign-in is illustrative, not measured NASA data. After sign-in it uses actual NASA POWER gridded environmental data. No automatic production deployment is included.
