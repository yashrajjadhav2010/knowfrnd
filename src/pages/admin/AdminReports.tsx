import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('Under Review');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminReports();
      setReports(res.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateReport = async (id: string) => {
    setSaving(true);
    try {
      await api.updateAdminReport(id, {
        status: newStatus,
        resolution_notes: notes.trim() || undefined,
      });
      setActiveReportId(null);
      setNotes('');
      fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
          Content & Safety Reports
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Investigate reported harassment, bullying, spam, or community guideline violations.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading safety reports...</div>
        ) : reports.length > 0 ? (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pb-2 border-b border-slate-100 dark:border-[#272542]/50">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-rose-500">
                    [{rep.category}]
                  </span>
                  <span className="text-slate-400">Target: {rep.target_type} ({rep.target_id})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.status === 'New'
                        ? 'bg-rose-500/20 text-rose-400'
                        : rep.status === 'Resolved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {rep.status}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rep.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0B0B12] p-3 rounded-xl border border-slate-100 dark:border-[#272542]">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">
                  Reporter Statement (from {rep.reporter_reference}):
                </div>
                "{rep.description}"
              </div>

              {rep.resolution_notes && (
                <div className="text-xs text-slate-400 bg-purple-950/10 p-2.5 rounded-xl border border-purple-500/20">
                  <strong className="text-purple-300">Moderation Notes:</strong> {rep.resolution_notes}
                </div>
              )}

              {/* Action */}
              {activeReportId === rep.id ? (
                <div className="pt-2 space-y-3 text-xs border-t border-slate-100 dark:border-[#272542]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] text-white"
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Action Taken">Action Taken</option>
                      <option value="Dismissed">Dismissed</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Resolution notes..."
                      className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveReportId(null)}
                      className="px-3 py-1 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateReport(rep.id)}
                      disabled={saving}
                      className="px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold"
                    >
                      {saving ? 'Updating...' : 'Save Resolution'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveReportId(rep.id);
                      setNewStatus(rep.status);
                      setNotes(rep.resolution_notes || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1c1b33] text-slate-700 dark:text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Manage / Resolve Report
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-[#272542] rounded-2xl">
            No safety reports submitted. All clear!
          </div>
        )}
      </div>
    </div>
  );
}
