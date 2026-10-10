import React, { useEffect, useState } from 'react';
import { Search, Eye, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminExperiences() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminExperiences({
        type: type === 'all' ? undefined : type,
        search: search.trim() || undefined,
      });
      setExperiences(res.experiences || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [type]);

  const handleModerate = async (id: string, newStatus: string) => {
    try {
      await api.moderateAdminExperience(id, newStatus);
      fetchExperiences();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            Experience Moderation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit and moderate all quizzes, truth boxes, and polls published across VYBE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Formats</option>
            <option value="quiz">Quizzes</option>
            <option value="anonymous">Anonymous Boxes</option>
            <option value="poll">Polls</option>
          </select>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading experiences...</div>
        ) : experiences.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#272542] text-slate-400">
                <th className="pb-3 font-semibold">Title & Slug</th>
                <th className="pb-3 font-semibold">Creator</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Responses</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#272542]/50">
              {experiences.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a192e]/40">
                  <td className="py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {exp.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      /{exp.type}/{exp.slug}
                    </div>
                  </td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">
                    {exp.owner?.name || 'Unknown'}
                  </td>
                  <td className="py-3">
                    <span className="uppercase text-[11px] font-bold text-purple-400">
                      {exp.type}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {exp.response_count}
                  </td>
                  <td className="py-3">
                    <span
                      className={`font-semibold capitalize ${
                        exp.status === 'published'
                          ? 'text-emerald-400'
                          : exp.status === 'flagged'
                          ? 'text-rose-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {exp.status}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-1.5">
                    {exp.status !== 'published' && (
                      <button
                        onClick={() => handleModerate(exp.id, 'published')}
                        className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold"
                      >
                        Publish / Restore
                      </button>
                    )}
                    {exp.status !== 'flagged' && (
                      <button
                        onClick={() => handleModerate(exp.id, 'flagged')}
                        className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 text-xs font-semibold"
                      >
                        Flag Content
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            No experiences found in directory.
          </div>
        )}
      </div>
    </div>
  );
}
