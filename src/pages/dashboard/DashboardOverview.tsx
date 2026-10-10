import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  MessageSquare, 
  TrendingUp, 
  ArrowRight, 
  PlusCircle, 
  HelpCircle, 
  Clock 
} from 'lucide-react';
import { api } from '../../lib/api';

export function DashboardOverview() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardOverview()
      .then((res) => setData(res))
      .catch((err) => console.error('Overview error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-3xl bg-pink-100/60 border border-pink-200" />
        ))}
      </div>
    );
  }

  const metrics = data?.metrics || {
    total_experiences: 0,
    published_experiences: 0,
    total_responses: 0,
    average_quiz_score: 0,
  };

  const recent = data?.recent_activity || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner - VIBRANT, COLORFUL & BRIGHT */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-white shadow-xl shadow-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
            <span>🎀</span>
            <span>CREATOR HQ</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Welcome Back, {data?.user?.public_display_name || 'Creator'}! ✨
          </h2>
          <p className="text-xs sm:text-sm text-pink-100 max-w-lg font-medium">
            Track engagement, review submissions, and manage your live social experiences with your friends.
          </p>
        </div>
        <Link
          to="/create"
          className="px-5 py-3 rounded-2xl text-xs font-black bg-white text-purple-700 hover:bg-pink-50 transition-all shrink-0 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 cursor-pointer relative z-10"
        >
          <PlusCircle className="w-4 h-4 text-pink-500" />
          <span>Create New Experience</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border-2 border-purple-100 shadow-sm hover:border-pink-200 transition-all">
          <div className="text-xs font-bold text-slate-500 mb-1">Total Created</div>
          <div className="font-heading text-2xl font-black text-slate-900">
            {metrics.total_experiences}
          </div>
          <div className="text-[11px] font-bold text-purple-600 mt-1">
            {metrics.published_experiences} published
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border-2 border-pink-100 shadow-sm hover:border-pink-300 transition-all">
          <div className="text-xs font-bold text-slate-500 mb-1">Responses Received</div>
          <div className="font-heading text-2xl font-black text-slate-900">
            {metrics.total_responses}
          </div>
          <div className="text-[11px] font-bold text-pink-600 mt-1">Real database records</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border-2 border-cyan-100 shadow-sm hover:border-cyan-300 transition-all">
          <div className="text-xs font-bold text-slate-500 mb-1">Average Score</div>
          <div className="font-heading text-2xl font-black text-slate-900">
            {metrics.average_quiz_score}%
          </div>
          <div className="text-[11px] font-bold text-cyan-600 mt-1">Across all friend quizzes</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border-2 border-emerald-100 shadow-sm hover:border-emerald-300 transition-all">
          <div className="text-xs font-bold text-slate-500 mb-1">Account Standing</div>
          <div className="font-heading text-lg font-black text-emerald-600">Active ✨</div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">Creator Tier</div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <span>Recent Engagement</span>
            <span className="text-pink-500">💌</span>
          </h3>
          <Link
            to="/dashboard/responses"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length > 0 ? (
          <div className="space-y-3">
            {recent.map((act: any) => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">
                    {act.experience_title}
                  </div>
                  <div className="text-[11px] text-slate-600">{act.label}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-pink-500" />
                  <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 text-pink-300 mx-auto" />
            <p className="font-medium">No recent activity yet. Share your experiences with friends to collect responses!</p>
          </div>
        )}
      </div>
    </div>
  );
}
