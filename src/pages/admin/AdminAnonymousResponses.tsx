import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminAnonymousResponses() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminAnonymousResponses()
      .then((res) => setResponses(res.responses || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
          Anonymous Response Moderation & Audit
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Supervised moderation records. Inspect response text, privacy modes, and disclosed identity records where permitted.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-500/30 text-xs text-pink-300 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-pink-400 shrink-0" />
        <span>
          <strong>Audit Compliance Notice:</strong> Viewing anonymous response records is audited and logged in the tamper-proof platform audit log.
        </span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading anonymous records...</div>
        ) : responses.length > 0 ? (
          responses.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pb-3 border-b border-slate-100 dark:border-[#272542]/50">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {r.experience_title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Ref: {r.response_reference}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      r.privacy_mode === 'mode_b'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        : 'bg-pink-500/10 text-pink-400 border border-pink-500/30'
                    }`}
                  >
                    {r.privacy_mode === 'mode_b' ? 'Mode B: Full Anonymity' : 'Mode A: Admin-Audited'}
                  </span>

                  <span className="text-[11px] text-slate-400">
                    {new Date(r.submitted_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Response Answers */}
              <div className="space-y-2 text-xs">
                {r.answers?.map((ans: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-100 dark:border-[#272542] space-y-1">
                    <div className="text-[11px] font-semibold text-purple-400">
                      {ans.question_text || `Question #${idx + 1}`}
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 italic">
                      "{ans.response_text || 'No text submitted'}"
                    </div>
                  </div>
                ))}
              </div>

              {/* Administrative Identity Disclosure Inspection */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <span className="font-semibold text-slate-300">Identity Audit: </span>
                  <span className="text-slate-400">{r.identity_note}</span>
                  {r.has_disclosed_name && (
                    <span className="ml-2 font-bold text-pink-400">
                      (Disclosed Name: "{r.disclosed_name}")
                    </span>
                  )}
                </div>

                <div className="font-semibold text-emerald-400">
                  Status: {r.moderation_status}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-[#272542] rounded-2xl">
            No anonymous responses in database.
          </div>
        )}
      </div>
    </div>
  );
}
