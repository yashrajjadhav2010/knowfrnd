import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  MessageSquare, 
  Settings, 
  PlusCircle, 
  Sparkles, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../config/brand';

export function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/experiences', label: 'My Experiences', icon: Layers },
    { to: '/dashboard/responses', label: 'Responses & Results', icon: MessageSquare },
    { to: '/dashboard/settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[85vh]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-3 space-y-6">
          {/* Creator Profile Card */}
          <div className="p-5 rounded-3xl bg-white border-2 border-purple-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-purple-500/20">
                {user?.public_display_name?.charAt(0) || 'C'}
              </div>
              <div className="overflow-hidden">
                <div className="font-heading font-extrabold text-sm text-slate-900 truncate">
                  {user?.public_display_name || 'Creator'}
                </div>
                <div className="text-xs text-pink-600 font-semibold truncate">
                  @{user?.username || 'user'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/create"
                className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 hover:opacity-95 hover:scale-105 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Experience</span>
              </Link>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-2.5 rounded-3xl bg-white border-2 border-purple-100 shadow-sm space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const active = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 shadow-sm'
                      : 'text-slate-600 hover:text-purple-600 hover:bg-pink-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-pink-500" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Tips Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 border-2 border-pink-200 text-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-pink-600">
              <span>🎀</span>
              <span>POOKIE PRO TIP</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Share your quiz link in WhatsApp or Instagram Stories with a cute sticker to get 3x more friend responses!
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
