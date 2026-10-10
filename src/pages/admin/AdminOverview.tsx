import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Layers, 
  HelpCircle, 
  MessageSquare, 
  Vote, 
  ShieldAlert, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { api } from '../../lib/api';

export function AdminOverview() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminOverview()
      .then((res) => setData(res))
      .catch((err) => console.error('Admin overview error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-[#141324]" />
        ))}
      </div>
    );
  }

  const m = data?.metrics || {};
  const logs = data?.recent_logs || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
          Platform Administration Overview
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Real-time database statistics and moderation activity.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
          <div className="text-xs text-slate-500">Registered Users</div>
          <div className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-1">
            {m.total_users || 0}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">{m.active_users} active accounts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
          <div className="text-xs text-slate-500">Total Experiences</div>
          <div className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-1">
            {m.total_experiences || 0}
          </div>
          <div className="text-[11px] text-purple-400 mt-1">{m.published_experiences} published</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
          <div className="text-xs text-slate-500">Quiz Submissions</div>
          <div className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-1">
            {m.total_quiz_submissions || 0}
          </div>
          <div className="text-[11px] text-purple-400 mt-1">Calculated server-side</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
          <div className="text-xs text-slate-500">Open Reports</div>
          <div className="font-heading text-2xl font-black text-rose-500 mt-1">
            {m.open_reports || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Requiring safety review</div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
          <div className="text-xs text-slate-500">Anonymous Responses</div>
          <div className="font-heading text-xl font-bold text-pink-400 mt-1">
            {m.total_anonymous_responses || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Mode A & Mode B records</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
          <div className="text-xs text-slate-500">Poll Votes Recorded</div>
          <div className="font-heading text-xl font-bold text-cyan-400 mt-1">
            {m.total_poll_votes || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Validated vote records</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
          <div className="text-xs text-slate-500">Quizzes vs Anon vs Polls</div>
          <div className="font-heading text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            {m.quizzes_count} Q · {m.anonymous_count} A · {m.polls_count} P
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Format distribution</div>
        </div>
      </div>

      {/* Audit Log Stream Preview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
          Recent Administrative Audit Actions
        </h3>
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E0D17] border border-slate-100 dark:border-[#272542] text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-mono text-[11px] font-bold text-pink-400">
                    {log.action}
                  </div>
                  <div className="text-slate-500">
                    By {log.admin_user_id} · Target: {log.target_type} ({log.target_id})
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No audit events recorded yet.</p>
        )}
      </div>
    </div>
  );
}
