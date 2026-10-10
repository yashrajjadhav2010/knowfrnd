import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, 
  HelpCircle, 
  Vote, 
  Award, 
  Clock, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../../lib/api';
import { BRAND } from '../../config/brand';

export function DashboardResponses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedExpId = searchParams.get('id');

  const [myExperiences, setMyExperiences] = useState<any[]>([]);
  const [activeExpId, setActiveExpId] = useState<string | null>(selectedExpId);
  const [responseDetails, setResponseDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch user's experiences list to populate selector
  useEffect(() => {
    api.getMyExperiences()
      .then((res) => {
        const list = res.experiences || [];
        setMyExperiences(list);
        if (!activeExpId && list.length > 0) {
          setActiveExpId(list[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Fetch responses for the active experience
  useEffect(() => {
    if (!activeExpId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    api.getResponses(activeExpId)
      .then((data) => setResponseDetails(data))
      .catch((err) => setError(err.message || 'Failed to load responses'))
      .finally(() => setLoading(false));
  }, [activeExpId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            Responses & Submissions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View friend answers, quiz score leaderboards, and poll totals for your experiences.
          </p>
        </div>

        {/* Experience Selector Dropdown */}
        {myExperiences.length > 0 && (
          <select
            value={activeExpId || ''}
            onChange={(e) => {
              setActiveExpId(e.target.value);
              setSearchParams({ id: e.target.value });
            }}
            className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 shadow-sm"
          >
            {myExperiences.map((exp) => (
              <option key={exp.id} value={exp.id}>
                [{exp.type.toUpperCase()}] {exp.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 rounded-2xl bg-slate-200 dark:bg-[#141324]" />
          <div className="h-48 rounded-2xl bg-slate-200 dark:bg-[#141324]" />
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      ) : !responseDetails ? (
        <div className="text-center py-20 text-xs text-slate-400">
          No experience selected.
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================================================================ */}
          {/* 1. QUIZ RESPONSES VIEW */}
          {/* ================================================================ */}
          {responseDetails.type === 'quiz' && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
                  <span className="text-xs text-slate-500">Total Friends Tested</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {responseDetails.summary?.total_submissions || 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
                  <span className="text-xs text-slate-500">Average Score</span>
                  <div className="text-2xl font-black text-purple-500 mt-1">
                    {responseDetails.summary?.average_score || 0}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
                  <span className="text-xs text-slate-500">Highest Score</span>
                  <div className="text-2xl font-black text-pink-500 mt-1">
                    {responseDetails.summary?.highest_score || 0}%
                  </div>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-4">
                  Leaderboard & Submissions
                </h3>

                {responseDetails.submissions?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-[#272542] text-slate-400">
                          <th className="pb-3 font-semibold">Friend Nickname</th>
                          <th className="pb-3 font-semibold">Score</th>
                          <th className="pb-3 font-semibold">Percentage</th>
                          <th className="pb-3 font-semibold">Date Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#272542]/50">
                        {responseDetails.submissions.map((sub: any) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a192e]/40">
                            <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                              {sub.participant_name || 'Anonymous Friend'}
                            </td>
                            <td className="py-3 font-semibold text-purple-400">
                              {sub.score} / {sub.total_questions}
                            </td>
                            <td className="py-3 font-bold text-slate-900 dark:text-white">
                              {sub.percentage}%
                            </td>
                            <td className="py-3 text-slate-400">
                              {new Date(sub.submitted_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No submissions received yet. Share your quiz link with friends!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 2. ANONYMOUS RESPONSES VIEW */}
          {/* STRICT SECURITY: RESPONDER IDENTITY IS NEVER DISPLAYED HERE! */}
          {/* ================================================================ */}
          {responseDetails.type === 'anonymous' && (
            <div className="space-y-6">
              {/* Privacy Notice Banner */}
              <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-pink-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-pink-400" />
                  <span>
                    <strong>Anonymity Protection Active:</strong> Responders are protected by platform privacy rules. Identities are never disclosed to creators.
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-pink-400 shrink-0">
                  {responseDetails.summary?.total_responses || 0} Responses
                </span>
              </div>

              {/* Response Cards Grid */}
              {responseDetails.responses?.length > 0 ? (
                <div className="space-y-4">
                  {responseDetails.responses.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-100 dark:border-[#272542]/50">
                        <span className="font-mono">Ref: {r.response_reference}</span>
                        <span>{new Date(r.submitted_at).toLocaleString()}</span>
                      </div>

                      <div className="space-y-3">
                        {r.answers?.map((ans: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="text-[11px] font-semibold text-purple-400">
                              Q: {ans.question_text || `Question #${idx + 1}`}
                            </div>
                            <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0B0B12] p-3 rounded-xl border border-slate-100 dark:border-[#272542]">
                              "{ans.response_text || 'No text provided'}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-[#272542] rounded-2xl">
                  No anonymous responses received yet.
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* 3. POLL RESPONSES VIEW */}
          {/* ================================================================ */}
          {responseDetails.type === 'poll' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    Live Vote Distribution
                  </h3>
                  <span className="text-xs text-cyan-400 font-semibold">
                    Total Votes: {responseDetails.poll?.total_votes || 0}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      Choice A
                    </span>
                    <div className="font-heading font-bold text-base text-white">
                      {responseDetails.poll?.option_a}
                    </div>
                    <div className="text-3xl font-black text-cyan-400 font-heading">
                      {responseDetails.poll?.percent_a}%
                    </div>
                    <div className="text-xs text-slate-400">
                      {responseDetails.poll?.votes_a} votes
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                      Choice B
                    </span>
                    <div className="font-heading font-bold text-base text-white">
                      {responseDetails.poll?.option_b}
                    </div>
                    <div className="text-3xl font-black text-purple-400 font-heading">
                      {responseDetails.poll?.percent_b}%
                    </div>
                    <div className="text-xs text-slate-400">
                      {responseDetails.poll?.votes_b} votes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
