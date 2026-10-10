import React, { useEffect, useState } from 'react';
import { HelpCircle, Award, Clock } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminSubmissions()
      .then((res) => setSubmissions(res.submissions || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
          Quiz Submissions & Score Verifications
        </h2>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          Server-validated participant scores across all published quizzes.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-700 font-bold">Loading submissions...</div>
        ) : submissions.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-[#272542] text-slate-900 dark:text-slate-200 font-black">
                <th className="pb-3 font-extrabold">Quiz</th>
                <th className="pb-3 font-extrabold">Participant Nickname</th>
                <th className="pb-3 font-extrabold">Score</th>
                <th className="pb-3 font-extrabold">Percentage</th>
                <th className="pb-3 font-extrabold">Reference Token</th>
                <th className="pb-3 font-extrabold text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#272542]/50">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a192e]/40">
                  <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                    {s.quiz_title}
                  </td>
                  <td className="py-3 text-slate-900 dark:text-slate-100 font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                    <span>{s.participant_display_name || 'Anonymous'}</span>
                  </td>
                  <td className="py-3 text-purple-700 dark:text-purple-300 font-extrabold">
                    {s.score} / {s.total_questions}
                  </td>
                  <td className="py-3 font-black text-slate-900 dark:text-white">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-black border border-purple-200">
                      {s.percentage}%
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {s.submission_reference}
                  </td>
                  <td className="py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">
                    {new Date(s.submitted_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-xs text-slate-600 font-bold">No submissions found.</div>
        )}
      </div>
    </div>
  );
}
