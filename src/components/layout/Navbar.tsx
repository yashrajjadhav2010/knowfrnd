import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown, 
  CheckCircle2,
  HelpCircle,
  LogIn
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { KawaiiBear } from '../common/KawaiiElements';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, switchRole, signOut, openSignInModal, openSignUpModal, signInWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-sky-200 bg-white/95 backdrop-blur-md shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Kawaii Badge */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center p-1 transition-transform group-hover:scale-105 shadow-sm">
              <KawaiiBear className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl tracking-tight bg-gradient-to-r from-sky-600 via-pink-500 to-sky-500 bg-clip-text text-transparent">
                  {BRAND.name}
                </span>
                <span className="text-xs">🎀</span>
              </div>
              <span className="text-[10px] -mt-1 font-semibold text-slate-500">
                {BRAND.poweredBy}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/explore"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isActive('/explore')
                  ? 'text-sky-700 bg-sky-100 border border-sky-300'
                  : 'text-slate-700 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <Compass className="w-4 h-4 text-sky-500" />
              Explore
            </Link>
            <Link
              to="/create"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isActive('/create')
                  ? 'text-sky-700 bg-sky-100 border border-sky-300'
                  : 'text-slate-700 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-pink-500" />
              Create Quiz
            </Link>
            <Link
              to="/about"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isActive('/about')
                  ? 'text-sky-700 bg-sky-100 border border-sky-300'
                  : 'text-slate-700 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              How It Works
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'text-sky-700 bg-sky-100 border border-sky-300'
                    : 'text-slate-700 hover:text-sky-600 hover:bg-sky-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-sky-500" />
                My Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-pink-400'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role & Clerk Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#272542] bg-slate-50 dark:bg-[#141324] hover:bg-slate-100 dark:hover:bg-[#1c1b33] flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition-colors"
              title="Switch demo preview role or sign in with Clerk"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium hidden sm:inline">Role:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {isAdmin ? 'Admin' : isAuthenticated ? 'Creator' : 'Visitor'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Sign In Options
                </div>
                <button
                  onClick={() => {
                    signInWithGoogle();
                    setRoleMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Google Sign In (Firebase)</span>
                </button>
                <button
                  onClick={() => {
                    openSignInModal();
                    setRoleMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Clerk Sign In / Sign Up</span>
                </button>

                <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px] border-t border-slate-100 dark:border-[#272542] mt-1">
                  Preview Role Switcher
                </div>
                {isAdmin && (
                  <div className="px-3 py-1.5 text-[11px] text-pink-600 dark:text-pink-400 font-semibold flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/30 rounded-lg mx-2 my-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin Mode Active</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    switchRole('creator');
                    setRoleMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center justify-between text-slate-700 dark:text-slate-200"
                >
                  <span>Creator (Kairo)</span>
                  {isAuthenticated && !isAdmin && <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />}
                </button>
                <button
                  onClick={() => {
                    switchRole('guest');
                    setRoleMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                >
                  <span>Visitor / Friend</span>
                  {!isAuthenticated && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181728] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
          </button>

          {/* Profile / Clerk Sign In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/20 hover:opacity-95 transition-opacity"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span>{user?.public_display_name || 'My VYBE'}</span>
              </Link>
              <button
                onClick={signOut}
                title="Sign out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors hidden sm:block"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openSignInModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/20 hover:opacity-95 transition-opacity"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#181728]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-[#272542] bg-white dark:bg-[#0B0B12] px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#181728]"
          >
            <Compass className="w-4 h-4 text-purple-500" />
            Explore
          </Link>
          <Link
            to="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#181728]"
          >
            <PlusCircle className="w-4 h-4 text-pink-500" />
            Create
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#181728]"
          >
            <HelpCircle className="w-4 h-4 text-cyan-500" />
            How It Works
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#181728]"
            >
              <LayoutDashboard className="w-4 h-4 text-purple-500" />
              Creator Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-[#181728]"
            >
              <ShieldAlert className="w-4 h-4 text-pink-500" />
              Admin Portal
            </Link>
          )}
          <div className="pt-2 border-t border-slate-200 dark:border-[#272542] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {BRAND.poweredBy}
            </span>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-500 flex items-center gap-1 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  openSignInModal();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-purple-500 font-semibold flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In with Clerk
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
