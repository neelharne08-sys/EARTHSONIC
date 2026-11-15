
import React from 'react';
import {
  Compass,
  Eye,
  Globe2,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Radio,
  UserRound
} from 'lucide-react';

export default function Navbar({
  currentView,
  onNavigate,
  onToggleAccessibility,
  isAccessibilityOpen,
  selectedStation,
  user,
  authChecking,
  authBusy,
  onSignIn,
  onSignUp,
  onSignOut
}) {
  return (
    <header className="editorial-navbar sticky top-0 z-50 border-b border-[#DCD7CD]/80 bg-[#FAF9F6]/95 shadow-xl backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3 sm:min-h-20">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="group flex min-w-0 items-center gap-2 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-[#0B3D91] sm:gap-3"
            aria-label="Earthsonic Home"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCD7CD]/80 bg-gradient-to-br from-[#FFFDF9] to-[#EFECE6]">
              <Globe2 className="h-6 w-6 text-[#D97706]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-[#FFFDF9] to-[#EFECE6] bg-clip-text text-base font-extrabold tracking-wider text-transparent sm:text-xl">
                  EARTHSONIC
                </span>

                <span className="hidden rounded border border-[#DCD7CD]/70 bg-[#EFECE6]/95 px-2 py-0.5 text-[10px] font-semibold text-[#D97706] xl:inline">
                  NASA 2026
                </span>
              </div>

              <p className="hidden text-[11px] text-[#71717A] lg:block">
                The Earth Information Jukebox
              </p>
            </div>
          </button>

          <nav
            aria-label="Main navigation"
            className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2"
          >
            <button
              type="button"
              onClick={() => onNavigate('home')}
              aria-label="Explore Earthsonic"
              className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                currentView === 'home'
                  ? 'border border-[#DCD7CD]/80 bg-[#EFECE6]/95 text-[#D97706]'
                  : 'text-[#71717A] hover:bg-[#EFECE6] hover:text-[#18181B]'
              }`}
            >
              <Compass className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Explore</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('jukebox')}
              aria-label="Open Jukebox"
              className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                currentView === 'jukebox'
                  ? 'bg-gradient-to-r from-[#FFFDF9] to-[#EFECE6] text-[#18181B]'
                  : 'border border-[#DCD7CD] bg-[#EFECE6] text-[#18181B] hover:bg-[#EFECE6]'
              }`}
            >
              <Radio className="h-4 w-4" />

              <span className="hidden min-[420px]:inline">
                Jukebox
              </span>

              {selectedStation && currentView === 'jukebox' && (
                <span className="hidden text-[10px] font-bold lg:inline">
                  {selectedStation.svsId}
                </span>
              )}
            </button>

            {user && (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                aria-label="Open My Space dashboard"
                title="My Space"
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                  currentView === 'dashboard'
                    ? 'border-[#DCD7CD]/50 bg-[#EFECE6]/95 text-[#D97706]'
                    : 'border-[#DCD7CD] bg-[#EFECE6] text-[#18181B] hover:border-[#DCD7CD]/80 hover:text-[#18181B]'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">My Space</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleAccessibility}
              aria-label="Toggle accessibility panel"
              title="Accessibility controls"
              className={`rounded-xl border p-2.5 transition ${
                isAccessibilityOpen
                  ? 'border-[#DCD7CD] bg-[#EFECE6]/95 text-[#D97706]'
                  : 'border-[#DCD7CD] bg-[#EFECE6] text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Eye className="h-4 w-4" />
            </button>

            {authChecking ? (
              <div
                className="flex h-10 w-10 items-center justify-center"
                aria-label="Checking account session"
              >
                <Loader2 className="h-4 w-4 animate-spin text-[#D97706]" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <div
                  className="hidden max-w-[150px] items-center gap-2 rounded-xl border border-[#DCD7CD]/70 bg-[#EFECE6]/95 px-3 py-2 text-xs text-[#D97706] xl:flex"
                  title={user.email}
                >
                  <UserRound className="h-4 w-4 shrink-0" />

                  <span className="truncate">
                    {user.email}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={authBusy}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="flex items-center gap-1.5 rounded-xl border border-[#DCD7CD] bg-[#EFECE6] px-2.5 py-2 text-xs font-semibold text-[#18181B] transition hover:border-[#DCD7CD]/80 hover:text-[#18181B] disabled:opacity-60 sm:px-3"
                >
                  {authBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}

                  <span className="hidden lg:inline">
                    Sign Out
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button" onClick={onSignUp} className="rounded-xl border border-[#DCD7CD]/80 bg-[#EFECE6]/95 px-3 py-2.5 text-xs font-bold text-[#D97706] transition hover:bg-[#EFECE6]/95 sm:text-sm">Sign Up</button>
              <button
                type="button"
                onClick={onSignIn}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FFFDF9] to-[#EFECE6] px-3 py-2.5 text-xs font-bold text-[#D97706] transition hover:brightness-110 sm:px-4 sm:text-sm"
              >
                <LogIn className="h-4 w-4" />

                <span className="hidden min-[420px]:inline">
                  Sign In
                </span>
              </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
