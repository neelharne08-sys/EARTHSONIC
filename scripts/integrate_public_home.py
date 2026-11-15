from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(content, old, new, label):
    if new in content:
        return content
    count = content.count(old)
    if count != 1:
        raise RuntimeError(f"Cannot safely update {label}: expected one anchor, found {count}")
    return content.replace(old, new, 1)


def build_changes(files):
    changes = dict(files)

    path = 'frontend/src/App.jsx'
    s = changes[path]
    s = replace_once(s,
        "  const [authOpen, setAuthOpen] = useState(false);",
        "  const [authOpen, setAuthOpen] = useState(false);\n  const [authMode, setAuthMode] = useState('login');\n  const [postAuthView, setPostAuthView] = useState('home');\n  const [postAuthStation, setPostAuthStation] = useState(null);",
        'App auth state')
    s = replace_once(s,
        "  const [pendingMix, setPendingMix] = useState(null);",
        "  const [pendingMix, setPendingMix] = useState(null);\n  const [homeScienceStopSignal, setHomeScienceStopSignal] = useState(0);",
        'App home scientific playback stop state')
    s = replace_once(s,
        "          setCurrentView((view) =>\n            view === 'home' ? 'dashboard' : view\n          );",
        "          setCurrentView('home');\n          setAuthOpen(false);",
        'App public landing startup')
    s = replace_once(s,
        "        setSelectedStation(STATIONS[number - 1]);",
        "        if (sessionRef.current?.user) {\n          setSelectedStation(STATIONS[number - 1]);\n        } else {\n          setAuthMode('login');\n          setPostAuthView('jukebox');\n          setPostAuthStation(STATIONS[number - 1]);\n          setAuthMessage('Sign in or create an account to open a station.');\n          setAuthOpen(true);\n        }",
        'App keyboard access gate')
    s = replace_once(s,
        "  function handleNavigate(view) {\n    if (view === 'dashboard' && !session?.user) {\n      setAuthMessage('');\n      setAuthOpen(true);\n      return;\n    }\n\n    setAuthOpen(false);\n    setAuthMessage('');\n    setCurrentView(view);",
        "  function openAuth(mode = 'login', destination = 'home', station = null) {\n    setAuthMode(mode);\n    setPostAuthView(destination);\n    setPostAuthStation(station);\n    setAuthMessage(destination === 'home' ? '' : 'Sign in or create an account to use this feature.');\n    setAuthOpen(true);\n    audioEngine.stopEarthPulse();\n    window.scrollTo({ top: 0, behavior: 'auto' });\n  }\n\n  function handleNavigate(view) {\n    if ((view === 'dashboard' || view === 'jukebox') && !sessionRef.current?.user) {\n      openAuth('login', view);\n      return;\n    }\n\n    setAuthOpen(false);\n    setAuthMessage('');\n    audioEngine.stopEarthPulse();\n    setCurrentView(view);",
        'App route gating')
    s = replace_once(s,
        "  function handleSelectStation(station) {\n    setPendingMix(null);",
        "  function handleSelectStation(station) {\n    if (!sessionRef.current?.user) {\n      openAuth('login', 'jukebox', station);\n      return;\n    }\n    setPendingMix(null);\n    setHomeScienceStopSignal(value => value + 1);",
        'App station gating')
    s = replace_once(s,
        "    setAuthOpen(false);\n    setCurrentView('dashboard');\n    setAuthMessage('Successfully signed in to Earthsonic.');",
        "    setAuthOpen(false);\n    setCurrentView(postAuthView);\n    if (postAuthStation) setSelectedStation(postAuthStation);\n    setPostAuthView('home');\n    setPostAuthStation(null);\n    audioEngine.toggleSpeech(true);\n    setAuthMessage('Successfully signed in to Earthsonic.');",
        'App post-login destination')
    s = replace_once(s,
        "      setCurrentView('home');\n      setAuthMessage('You have signed out successfully.');",
        "      setCurrentView('home');\n      setPostAuthView('home');\n      setPostAuthStation(null);\n      audioEngine.stopEarthPulse();\n      audioEngine.toggleSpeech(false);\n      setAuthMessage('You have signed out successfully.');",
        'App signout cleanup')
    s = replace_once(s,
        "        onSignIn={() => {\n          setAuthMessage('');\n          setAuthOpen(true);\n          window.scrollTo({ top: 0, behavior: 'auto' });\n        }}",
        "        onSignIn={() => openAuth('login')}\n        onSignUp={() => openAuth('signup')}",
        'App navbar auth actions')
    s = replace_once(s,
        "          <AuthPage\n            onBack={() => setAuthOpen(false)}",
        "          <AuthPage\n            key={authMode}\n            initialMode={authMode}\n            onBack={() => setAuthOpen(false)}",
        'App auth mode')
    s = replace_once(s,
        "        ) : currentView === 'jukebox' ? (",
        "        ) : currentView === 'jukebox' && session?.user ? (",
        'App Jukebox render guard')
    s = replace_once(s,
        "          <Home\n            stations={STATIONS}",
        "          <Home\n            isAuthenticated={Boolean(session?.user)}\n            onRequestAuth={(mode) => openAuth(mode, 'home')}\n            scienceStopSignal={homeScienceStopSignal}\n            stations={STATIONS}",
        'App home auth props')
    changes[path] = s

    path = 'frontend/src/pages/Home.jsx'
    s = changes[path]
    s = replace_once(s,
        "import Hero from '../components/Hero';",
        "import Hero from '../components/Hero';\nimport ScientificJukebox from '../components/ScientificJukebox';\nimport GuestSciencePreview from '../components/GuestSciencePreview';",
        'Home imports')
    s = replace_once(s,
        "export default function Home({ \n  stations,",
        "export default function Home({ \n  isAuthenticated = false,\n  onRequestAuth,\n  scienceStopSignal = 0,\n  stations,",
        'Home props')
    s = replace_once(s,
        "        onLaunchJukebox={onLaunchJukebox} \n        onSelectStation={onSelectStation} \n      />",
        "        onLaunchJukebox={onLaunchJukebox} \n        onSelectStation={onSelectStation} \n        canInteract={isAuthenticated}\n        onRequireAuth={onRequestAuth}\n      />",
        'Home Hero gate')
    s = replace_once(s,
        "      {/* 2. Station Selector (All 10 Official NASA SVS Stations) */}",
        "      {isAuthenticated ? (\n        <div className=\"mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8\">\n          <ScientificJukebox stopSignal={scienceStopSignal} />\n        </div>\n      ) : (\n        <GuestSciencePreview onRequestAuth={onRequestAuth} />\n      )}\n\n      {/* 2. Station Selector (All 10 Official NASA SVS Stations) */}",
        'Home science landing')
    changes[path] = s

    path = 'frontend/src/components/Hero.jsx'
    s = changes[path]
    s = replace_once(s,
        'export default function Hero({ onLaunchJukebox, onSelectStation }) {',
        "export default function Hero({ onLaunchJukebox, onSelectStation, canInteract = false, onRequireAuth }) {",
        'Hero public gate props')
    s = replace_once(s,
        '  const handleAuditoryDemo = () => {\n    setIsPlayingDemo(true);',
        "  const handleAuditoryDemo = () => {\n    if (!canInteract) {\n      onRequireAuth?.('login');\n      return;\n    }\n    setIsPlayingDemo(true);",
        'Hero audio preview gate')
    s = replace_once(s,
        "              <span>{isPlayingDemo ? 'Synthesizing Voices...' : 'Audition Voice Signature'}</span>",
        "              <span>{!canInteract ? 'Sign in to audition' : isPlayingDemo ? 'Synthesizing Voices...' : 'Audition Voice Signature'}</span>",
        'Hero CTA label')
    changes[path] = s

    path = 'frontend/src/components/Navbar.jsx'
    s = changes[path]
    s = replace_once(s,
        '  onSignIn,\n  onSignOut',
        '  onSignIn,\n  onSignUp,\n  onSignOut',
        'Navbar signup callback')
    s = replace_once(s,
        "            ) : (\n              <button\n                type=\"button\"\n                onClick={onSignIn}",
        "            ) : (\n              <div className=\"flex items-center gap-2\">\n                <button type=\"button\" onClick={onSignUp} className=\"rounded-xl border border-cyan-400/40 bg-white/5 px-3 py-2.5 text-xs font-bold text-cyan-200 transition hover:bg-white/10 sm:text-sm\">Sign Up</button>\n              <button\n                type=\"button\"\n                onClick={onSignIn}",
        'Navbar signup action')
    s = replace_once(s,
        "              </button>\n            )}\n          </nav>",
        "              </button>\n              </div>\n            )}\n          </nav>",
        'Navbar guest wrapper')
    changes[path] = s

    path = 'frontend/src/pages/AuthPage.jsx'
    s = changes[path]
    s = replace_once(s,
        'export default function AuthPage({ onBack, onAuthenticated }) {',
        "export default function AuthPage({ onBack, onAuthenticated, initialMode = 'login' }) {",
        'AuthPage initial mode prop')
    s = replace_once(s,
        "  const [mode, setMode] = useState('login');",
        '  const [mode, setMode] = useState(initialMode);',
        'AuthPage direct signup mode')
    s = replace_once(s,
        '              Continue as Guest',
        '              Back to public home',
        'AuthPage guest navigation copy')
    changes[path] = s

    path = 'frontend/src/components/ScientificJukebox.jsx'
    s = changes[path]
    s = replace_once(s,
        '        signal: controller.signal\n      });',
        "        signal: controller.signal,\n        credentials: 'include'\n      });",
        'ScientificJukebox credentials')
    changes[path] = s

    path = 'frontend/src/components/NASAClimateLab.jsx'
    s = changes[path]
    s = replace_once(s,
        '      const response = await fetch(`${API_BASE_URL}/api/science/climate?${query}`);',
        "      const response = await fetch(`${API_BASE_URL}/api/science/climate?${query}`, { credentials: 'include' });",
        'NASAClimateLab credentials')
    changes[path] = s

    path = 'frontend/src/components/NASATemperatureLab.jsx'
    s = changes[path]
    s = replace_once(s,
        '      const response = await fetch(`${API_BASE_URL}/api/science/temperature?${query}`);',
        "      const response = await fetch(`${API_BASE_URL}/api/science/temperature?${query}`, { credentials: 'include' });",
        'NASATemperatureLab credentials')
    changes[path] = s

    path = 'frontend/src/services/dataService.js'
    s = changes[path]
    s = replace_once(s,
        "      const res = await fetch(baseUrl + '/api/sonification', {\n        method: 'GET',",
        "      const res = await fetch(baseUrl + '/api/sonification', {\n        method: 'GET',\n        credentials: 'include',",
        'EarthPulse sonification credentials')
    changes[path] = s

    path = 'backend/main.py'
    s = changes[path]
    s = replace_once(s,
        'from fastapi.middleware.cors import CORSMiddleware',
        'from fastapi.middleware.cors import CORSMiddleware\nfrom fastapi.responses import JSONResponse',
        'backend auth response import')
    s = replace_once(s,
        'app.add_middleware(\n    CORSMiddleware,',
        "@app.middleware('http')\nasync def require_login_for_scientific_api(request: Request, call_next):\n    path = request.url.path\n    requires_login = path == '/api/sonification' or path.startswith('/api/science/')\n    if requires_login and request.method != 'OPTIONS':\n        try:\n            get_authenticated_session(request, get_auth_db_path())\n        except HTTPException as exc:\n            return JSONResponse(status_code=exc.status_code, content={'detail': 'Sign in to access Earthsonic scientific features'})\n    return await call_next(request)\n\n\napp.add_middleware(\n    CORSMiddleware,",
        'backend scientific session protection')
    changes[path] = s

    path = 'backend/test_main.py'
    s = changes[path]
    s = replace_once(s,
        'from fastapi.testclient import TestClient',
        "import pytest\nfrom fastapi.testclient import TestClient\nfrom backend import main as backend_main\nfrom backend.auth_database import create_user\nfrom backend.auth_sessions import create_session",
        'backend test imports')
    s = replace_once(s,
        'client = TestClient(app)\n',
        "client = TestClient(app)\n\n\n@pytest.fixture\ndef authorized_client(monkeypatch, tmp_path):\n    db_path = tmp_path / 'science-test.sqlite3'\n    monkeypatch.setattr(backend_main, 'get_auth_db_path', lambda: db_path)\n    user_id = create_user('science-test@example.com', 'test-password-hash', db_path)\n    session_token = create_session(user_id, db_path)\n    member_client = TestClient(app)\n    member_client.cookies.set('earthsonic_session', session_token)\n    return member_client\n\n\ndef test_science_routes_require_login():\n    assert client.get('/api/sonification').status_code == 401\n    assert client.get('/api/science/temperature').status_code == 401\n    assert client.get('/api/science/climate').status_code == 401\n",
        'backend auth fixture and access tests')
    s = replace_once(s,
        'def test_sonification_endpoint():\n    response = client.get("/api/sonification")',
        'def test_sonification_endpoint(authorized_client):\n    response = authorized_client.get("/api/sonification")',
        'backend authenticated sonification test')
    s = replace_once(s,
        'def test_missing_image_returns_404(monkeypatch, tmp_path):',
        'def test_missing_image_returns_404(monkeypatch, tmp_path, authorized_client):',
        'backend authenticated missing image test')
    s = replace_once(s,
        '    response = client.get("/api/sonification")\n\n    assert response.status_code == 404',
        '    response = authorized_client.get("/api/sonification")\n\n    assert response.status_code == 404',
        'backend missing image protected path')
    changes[path] = s

    return changes


def main():
    paths = [
        'frontend/src/App.jsx',
        'frontend/src/pages/Home.jsx',
        'frontend/src/components/Hero.jsx',
        'frontend/src/components/Navbar.jsx',
        'frontend/src/pages/AuthPage.jsx',
        'frontend/src/components/ScientificJukebox.jsx',
        'frontend/src/components/NASAClimateLab.jsx',
        'frontend/src/components/NASATemperatureLab.jsx',
        'frontend/src/services/dataService.js',
        'backend/main.py',
        'backend/test_main.py',
    ]
    files = {}
    for name in paths:
        file_path = ROOT / name
        if not file_path.is_file():
            raise RuntimeError(f'Missing expected source file: {name}')
        files[name] = file_path.read_text(encoding='utf-8')
    if not (ROOT / 'frontend/src/components/GuestSciencePreview.jsx').is_file():
        raise RuntimeError('Extract the ZIP into your project before running this script')
    changed = build_changes(files)
    for name in paths:
        if changed[name] != files[name]:
            (ROOT / name).write_text(changed[name], encoding='utf-8', newline='\n')
            print(f'Updated: {name}')
    print('Step 37 public-home member-access integration complete.')


if __name__ == '__main__':
    main()
