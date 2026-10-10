import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Users, 
  Layers, 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Activity, 
  Settings, 
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../config/brand';

export function AdminLayout() {
  const { user, isAdmin, loading, signInWithGoogle } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-400">Verifying administrator clearance...</p>
      </div>
    );
  }

  // Enforce server-side authorization condition: ONLY yashrajart1999@gmail.com
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
          Admin Access Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The Admin Panel is strictly reserved for <strong className="text-slate-900 dark:text-white">yashrajart1999@gmail.com</strong>.
          Other users cannot view or access platform administrative controls.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => signInWithGoogle()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Sign In with Google
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const links = [
    { to: '/admin', label: 'Overview', icon: Activity, exact: true },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/experiences', label: 'Experience Moderation', icon: Layers },
    { to: '/admin/submissions', label: 'Quiz Submissions', icon: HelpCircle },
    { to: '/admin/anonymous-responses', label: 'Anonymous Records', icon: MessageSquare },
    { to: '/admin/reports', label: 'Safety Reports', icon: FileText },
    { to: '/admin/audit-logs', label: 'Audit Trail', icon: ShieldAlert },
    { to: '/admin/settings', label: 'Platform Config', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[85vh]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Admin Navigation Sidebar */}
        <aside className="md:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/30 to-purple-950/30 border border-pink-500/30 text-white">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-pink-400" />
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-pink-300">
                ADMIN CONSOLE
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Clearance: Super Admin ({user?.public_display_name})
            </div>
          </div>

          <nav className="p-2 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] space-y-1 shadow-sm">
            {links.map((link) => {
              const Icon = link.icon;
              const active = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a192e]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="md:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
