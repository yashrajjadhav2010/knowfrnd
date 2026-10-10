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
                  <span className="text-xs text-slate-800 dark:text-slate-300 font-bold">Total Friends Tested</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {responseDetails.summary?.total_submissions || 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
                  <span className="text-xs text-slate-800 dark:text-slate-300 font-bold">Average Score</span>
                  <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
                    {responseDetails.summary?.average_score || 0}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
                  <span className="text-xs text-slate-800 dark:text-slate-300 font-bold">Highest Score</span>
                  <div className="text-2xl font-black text-pink-600 dark:text-pink-400 mt-1">
                    {responseDetails.summary?.highest_score || 0}%
                  </div>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
                <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-4">
                  Leaderboard & Submissions
                </h3>

                {responseDetails.submissions?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b-2 border-slate-200 dark:border-[#272542] text-slate-900 dark:text-slate-200 font-black">
                          <th className="pb-3 font-extrabold">Friend Nickname</th>
                          <th className="pb-3 font-extrabold">Score</th>
                          <th className="pb-3 font-extrabold">Percentage</th>
                          <th className="pb-3 font-extrabold">Date Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#272542]/50">
                        {responseDetails.submissions.map((sub: any) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a192e]/40">
                            <td className="py-3 font-black text-slate-900 dark:text-slate-100">
                              {sub.participant_name || 'Anonymous Friend'}
                            </td>
                            <td className="py-3 font-extrabold text-purple-700 dark:text-purple-300">
                              {sub.score} / {sub.total_questions}
                            </td>
                            <td className="py-3 font-black text-slate-900 dark:text-white">
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-black border border-purple-200">
                                {sub.percentage}%
                              </span>
                            </td>
                            <td className="py-3 text-slate-700 dark:text-slate-300 font-semibold">
                              {new Date(sub.submitted_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold py-6 text-center">
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
              <div className="p-4 rounded-2xl bg-pink-100 dark:bg-pink-950/40 border border-pink-300 dark:border-pink-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-pink-950 dark:text-pink-200 font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-pink-600 dark:text-pink-400" />
                  <span>
                    <strong className="font-black text-pink-900 dark:text-pink-300">Anonymity Protection Active:</strong> Responders are protected by platform privacy rules. Identities are never disclosed to creators.
                  </span>
                </div>
                <span className="text-[11px] font-bold text-pink-800 dark:text-pink-400 shrink-0">
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
                      <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 font-semibold pb-2 border-b border-slate-100 dark:border-[#272542]/50">
                        <span className="font-mono">Ref: {r.response_reference}</span>
                        <span>{new Date(r.submitted_at).toLocaleString()}</span>
                      </div>

                      <div className="space-y-3">
                        {r.answers?.map((ans: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="text-[11px] font-black text-purple-800 dark:text-purple-300">
                              Q: {ans.question_text || `Question #${idx + 1}`}
                            </div>
                            <p className="text-xs text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-[#0B0B12] p-3 rounded-xl border border-slate-200 dark:border-[#272542] font-semibold italic">
                              "{ans.response_text || 'No text provided'}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-xs text-slate-700 dark:text-slate-300 font-bold border border-dashed border-slate-200 dark:border-[#272542] rounded-2xl">
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
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    Live Vote Distribution
                  </h3>
                  <span className="text-xs text-cyan-800 dark:text-cyan-300 font-black">
                    Total Votes: {responseDetails.poll?.total_votes || 0}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border-2 border-cyan-200 dark:border-cyan-500/30 space-y-2">
                    <span className="text-[11px] font-black text-cyan-800 dark:text-cyan-300 uppercase tracking-wider">
                      Choice A
                    </span>
                    <div className="font-heading font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                      {responseDetails.poll?.option_a}
                    </div>
                    <div className="text-3xl font-black text-cyan-800 dark:text-cyan-400 font-heading">
                      {responseDetails.poll?.percent_a}%
                    </div>
                    <div className="text-xs text-slate-800 dark:text-slate-300 font-bold">
                      {responseDetails.poll?.votes_a} votes
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border-2 border-purple-200 dark:border-purple-500/30 space-y-2">
                    <span className="text-[11px] font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      Choice B
                    </span>
                    <div className="font-heading font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                      {responseDetails.poll?.option_b}
                    </div>
                    <div className="text-3xl font-black text-purple-800 dark:text-purple-400 font-heading">
                      {responseDetails.poll?.percent_b}%
                    </div>
                    <div className="text-xs text-slate-800 dark:text-slate-300 font-bold">
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
