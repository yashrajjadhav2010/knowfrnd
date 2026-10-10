import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layers, 
  PlusCircle, 
  Share2, 
  MessageSquare, 
  Trash2, 
  ExternalLink, 
  HelpCircle, 
  Vote,
  AlertTriangle 
} from 'lucide-react';
import { api } from '../../lib/api';
import { ShareModal } from '../../components/common/ShareModal';

export function DashboardExperiences() {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedShare, setSelectedShare] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchMyExperiences = async () => {
    setLoading(true);
    try {
      const res = await api.getMyExperiences({
        type: typeFilter === 'all' ? undefined : typeFilter,
      });
      setExperiences(res.experiences || []);
    } catch (err) {
      console.error('Failed to load my experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyExperiences();
  }, [typeFilter]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteExperience(id);
      setDeleteConfirmId(null);
      fetchMyExperiences();
    } catch (err) {
      console.error('Failed to archive experience:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            My Experiences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your created quizzes, anonymous boxes, and polls.
          </p>
        </div>
        <Link
          to="/create"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center gap-1.5 shadow-md shadow-purple-600/20 hover:opacity-95 transition-all self-start"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create New</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#141324] border border-slate-200 dark:border-[#272542] w-fit">
        {[
          { id: 'all', label: 'All' },
          { id: 'quiz', label: 'Quizzes' },
          { id: 'anonymous', label: 'Anonymous Boxes' },
          { id: 'poll', label: 'Polls' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              typeFilter === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-[#141324]" />
          ))}
        </div>
      ) : experiences.length > 0 ? (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-purple-500">
                    {exp.type}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{exp.status}</span>
                  <span aria-hidden="true">·</span>
                  <span>{exp.response_count} responses</span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">{exp.description}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedShare(exp)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-[#272542] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c1b33] text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Share Link"
                >
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => navigate(`/dashboard/responses?id=${exp.id}`)}
                  className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Responses ({exp.response_count})</span>
                </button>

                <a
                  href={`/${exp.type}/${exp.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-slate-200 dark:border-[#272542] text-slate-400 hover:text-white hover:bg-slate-50 dark:hover:bg-[#1c1b33] transition-colors"
                  title="Open Public Page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {deleteConfirmId === exp.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(exp.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
                    title="Archive Experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-[#272542] space-y-3">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
            No experiences found in this filter
          </h3>
          <Link
            to="/create"
            className="inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white"
          >
            Create Your First Experience
          </Link>
        </div>
      )}

      {selectedShare && (
        <ShareModal
          isOpen={Boolean(selectedShare)}
          onClose={() => setSelectedShare(null)}
          title={selectedShare.title}
          sharePath={`/${selectedShare.type}/${selectedShare.slug}`}
          experienceType={selectedShare.type}
        />
      )}
    </div>
  );
}
