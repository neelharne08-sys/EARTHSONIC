
import React, { useEffect, useRef, useState } from 'react';
import './styles/earthsonic-redesign.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jukebox from './pages/Jukebox';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import AccessibilityControls from './components/AccessibilityControls';
import { STATIONS } from './data/stations';
import { audioEngine } from './services/audioEngine';
import { authService } from './services/authService';
import { favoritesService } from './services/favoritesService';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [pendingMix, setPendingMix] = useState(null);
  const [homeScienceStopSignal, setHomeScienceStopSignal] = useState(0);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [postAuthView, setPostAuthView] = useState('home');
  const [postAuthStation, setPostAuthStation] = useState(null);
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState('');
  const [favoriteBusyIds, setFavoriteBusyIds] = useState([]);

  const sessionRef = useRef(null);
  const favoriteRequestsRef = useRef(new Set());

  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('1rem');
  const [audioDescriptions, setAudioDescriptions] = useState(true);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  useEffect(() => {
    let active = true;

    authService.me()
      .then((data) => {
        if (active && data?.user) {
          sessionRef.current = data;
          setSession(data);
          setCurrentView('home');
          setAuthOpen(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setAuthChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setFavorites([]);
      setFavoritesLoading(false);
      setFavoritesError('');
      setFavoriteBusyIds([]);
      return;
    }

    let active = true;
    const sessionToken = session.csrf_token;

    setFavorites([]);
    setFavoritesLoading(true);
    setFavoritesError('');

    favoritesService.list()
      .then((data) => {
        if (
          active &&
          sessionRef.current?.csrf_token === sessionToken
        ) {
          setFavorites(
            data.favorites.map((item) => item.station_id)
          );
        }
      })
      .catch((error) => {
        if (
          active &&
          sessionRef.current?.csrf_token === sessionToken
        ) {
          setFavoritesError(
            error.message || 'Could not load your favorites.'
          );
        }
      })
      .finally(() => {
        if (
          active &&
          sessionRef.current?.csrf_token === sessionToken
        ) {
          setFavoritesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--font-scale',
      fontSize
    );
  }, [fontSize]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (authOpen) return;

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
      ) {
        return;
      }

      const number = Number(event.key);

      if (
        Number.isInteger(number) &&
        number >= 1 &&
        number <= STATIONS.length
      ) {
        if (sessionRef.current?.user) {
          setSelectedStation(STATIONS[number - 1]);
        } else {
          setAuthMode('login');
          setPostAuthView('jukebox');
          setPostAuthStation(STATIONS[number - 1]);
          setAuthMessage('Sign in or create an account to open a station.');
          setAuthOpen(true);
        }
      } else if (event.key.toLowerCase() === 'a') {
        setIsAccessibilityOpen((value) => !value);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [authOpen]);

  function openAuth(mode = 'login', destination = 'home', station = null) {
    setAuthMode(mode);
    setPostAuthView(destination);
    setPostAuthStation(station);
    setAuthMessage(destination === 'home' ? '' : 'Sign in or create an account to use this feature.');
    setAuthOpen(true);
    audioEngine.stopEarthPulse();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleNavigate(view) {
    if ((view === 'dashboard' || view === 'jukebox') && !sessionRef.current?.user) {
      openAuth('login', view);
      return;
    }

    setAuthOpen(false);
    setAuthMessage('');
    audioEngine.stopEarthPulse();
    setCurrentView(view);

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  }

  function handleSelectStation(station) {
    if (!sessionRef.current?.user) {
      openAuth('login', 'jukebox', station);
      return;
    }
    setPendingMix(null);
    setHomeScienceStopSignal(value => value + 1);
    setSelectedStation(station);

    if (audioDescriptions) {
      audioEngine.playStationPreview(station.id);
    }
  }

  function handleLoadMix(mix) {
    if (!sessionRef.current?.user) return;

    const station = STATIONS.find((item) => item.id === mix.station_id);

    if (!station) {
      setAuthMessage('This saved mix references an unavailable station.');
      return;
    }

    setSelectedStation(station);
    setPendingMix((previous) => ({
      mix,
      requestId: (previous?.requestId || 0) + 1
    }));
    setAuthOpen(false);
    setCurrentView('jukebox');
    setAuthMessage(`Loaded mix "${mix.name}".`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleAuthenticated(data) {
    sessionRef.current = data;
    setSession(data);
    setAuthChecking(false);
    setAuthOpen(false);
    setCurrentView(postAuthView);
    if (postAuthStation) setSelectedStation(postAuthStation);
    setPostAuthView('home');
    setPostAuthStation(null);
    audioEngine.toggleSpeech(true);
    setAuthMessage('Successfully signed in to Earthsonic.');

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
  }

  async function handleSignOut() {
    if (!session?.csrf_token || authBusy) return;

    setAuthBusy(true);
    setAuthMessage('');

    try {
      await authService.logout(session.csrf_token);

      sessionRef.current = null;
      setSession(null);
      setPendingMix(null);
      setFavorites([]);
      setFavoriteBusyIds([]);
      setAuthOpen(false);
      setCurrentView('home');
      setPostAuthView('home');
      setPostAuthStation(null);
      audioEngine.stopEarthPulse();
      audioEngine.toggleSpeech(false);
      setAuthMessage('You have signed out successfully.');
    } catch (error) {
      setAuthMessage(
        error.message || 'Unable to sign out. Please try again.'
      );
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleToggleFavorite(station) {
    const activeSession = sessionRef.current;

    if (!activeSession?.user) {
      setAuthOpen(true);
      setAuthMessage('Sign in to save your favorite stations.');
      return;
    }

    if (
      favoritesLoading ||
      authBusy ||
      favoriteRequestsRef.current.has(station.id)
    ) {
      return;
    }

    const wasFavorite = favorites.includes(station.id);
    const sessionToken = activeSession.csrf_token;

    favoriteRequestsRef.current.add(station.id);

    setFavoriteBusyIds((previous) => [
      ...previous.filter((id) => id !== station.id),
      station.id
    ]);

    setFavoritesError('');

    try {
      if (wasFavorite) {
        await favoritesService.remove(
          station.id,
          sessionToken
        );
      } else {
        await favoritesService.add(
          station.id,
          sessionToken
        );
      }

      if (sessionRef.current?.csrf_token === sessionToken) {
        setFavorites((previous) => {
          if (wasFavorite) {
            return previous.filter((id) => id !== station.id);
          }

          return previous.includes(station.id)
            ? previous
            : [...previous, station.id];
        });
      }
    } catch (error) {
      if (sessionRef.current?.csrf_token === sessionToken) {
        setFavoritesError(
          error.message || 'Unable to update your favorites.'
        );
      }
    } finally {
      favoriteRequestsRef.current.delete(station.id);

      if (sessionRef.current?.csrf_token === sessionToken) {
        setFavoriteBusyIds((previous) =>
          previous.filter((id) => id !== station.id)
        );
      }
    }
  }

  return (
    <div
      className={`flex min-h-screen flex-col bg-[#FAF9F6] font-sans text-[#18181B] transition-colors ${
        highContrast ? 'high-contrast' : ''
      } ${reducedMotion ? 'reduced-motion' : ''}`}
    >
      <Navbar
        currentView={authOpen ? 'auth' : currentView}
        onNavigate={handleNavigate}
        onToggleAccessibility={() => {
          setIsAccessibilityOpen((value) => !value);
        }}
        isAccessibilityOpen={isAccessibilityOpen}
        selectedStation={selectedStation}
        user={session?.user || null}
        authChecking={authChecking}
        authBusy={authBusy}
        onSignIn={() => openAuth('login')}
        onSignUp={() => openAuth('signup')}
        onSignOut={handleSignOut}
      />

      {authMessage && (
        <div
          role="status"
          className="border-b border-[#DCD7CD]/70 bg-[#EFECE6] px-5 py-3 text-center text-sm text-[#D97706]"
        >
          <span>{authMessage}</span>

          <button
            type="button"
            onClick={() => setAuthMessage('')}
            className="ml-3 font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1">
        {authOpen ? (
          <AuthPage
            key={authMode}
            initialMode={authMode}
            onBack={() => setAuthOpen(false)}
            onAuthenticated={handleAuthenticated}
          />
        ) : currentView === 'dashboard' && session?.user ? (
          <Dashboard
            user={session.user}
            csrfToken={session.csrf_token}
            onLoadMix={handleLoadMix}
            stations={STATIONS}
            favorites={favorites}
            favoritesLoading={favoritesLoading}
            favoritesError={favoritesError}
            favoriteBusyIds={favoriteBusyIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectStation={handleSelectStation}
            onLaunchJukebox={() => handleNavigate('jukebox')}
            onExplore={() => handleNavigate('home')}
          />
        ) : currentView === 'jukebox' && session?.user ? (
          <Jukebox
            user={session?.user || null}
            csrfToken={session?.csrf_token || ''}
            pendingMix={pendingMix}
            onLoadMix={handleLoadMix}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            onBackToHome={() => handleNavigate('home')}
          />
        ) : (
          <Home
            isAuthenticated={Boolean(session?.user)}
            onRequestAuth={(mode) => openAuth(mode, 'home')}
            scienceStopSignal={homeScienceStopSignal}
            stations={STATIONS}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            onLaunchJukebox={() => handleNavigate('jukebox')}
          />
        )}
      </main>

      <AccessibilityControls
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
        fontSize={fontSize}
        setFontSize={setFontSize}
        audioDescriptions={audioDescriptions}
        setAudioDescriptions={setAudioDescriptions}
      />
    </div>
  );
}
