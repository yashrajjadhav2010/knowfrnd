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
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Server-validated participant scores across all published quizzes.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading submissions...</div>
        ) : submissions.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#272542] text-slate-400">
                <th className="pb-3 font-semibold">Quiz</th>
                <th className="pb-3 font-semibold">Participant Nickname</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold">Percentage</th>
                <th className="pb-3 font-semibold">Reference Token</th>
                <th className="pb-3 font-semibold text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#272542]/50">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a192e]/40">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {s.quiz_title}
                  </td>
                  <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">
                    {s.participant_display_name || 'Anonymous'}
                  </td>
                  <td className="py-3 text-purple-400 font-semibold">
                    {s.score} / {s.total_questions}
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {s.percentage}%
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    {s.submission_reference}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    {new Date(s.submitted_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">No submissions found.</div>
        )}
      </div>
    </div>
  );
}
