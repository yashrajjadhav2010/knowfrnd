import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Filter, HelpCircle, MessageSquare, Vote, ArrowRight, User } from 'lucide-react';
import { api } from '../../lib/api';
import { BRAND } from '../../config/brand';
import { sounds } from '../../lib/sound';

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async (type: string, search: string) => {
    setLoading(true);
    try {
      const res = await api.getExperiences({
        type: type === 'all' ? undefined : type,
        search: search.trim() || undefined,
      });
      setExperiences(res.experiences || []);
    } catch (err) {
      console.error('Failed to load experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(typeFilter, searchQuery);
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    fetchList(typeFilter, searchQuery);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh]">
      {/* Page Header */}
      <div className="max-w-2xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 border border-pink-300 text-pink-700 text-xs font-bold mb-2 shadow-sm">
          <span>🎀</span>
          <span>COMMUNITY FEED & POOKIE PICKS</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900">
          Explore Social Experiences
        </h1>
        <p className="text-sm text-slate-600 mt-2 font-medium">
          Take community-created quizzes, answer anonymous truth boxes, and vote in the latest debates with your friends!
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border-2 border-purple-100 shadow-sm w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All VYBEs ✨', icon: null },
            { id: 'quiz', label: 'Quizzes 🎀', icon: HelpCircle },
            { id: 'anonymous', label: 'Anonymous Boxes 💌', icon: MessageSquare },
            { id: 'poll', label: 'Polls 🧋', icon: Vote },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playCuteTap();
                  setTypeFilter(tab.id);
                  setSearchParams(tab.id === 'all' ? {} : { type: tab.id });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-pink-500/20 scale-105'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-pink-50'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-2xl bg-white border-2 border-purple-100 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-pink-400 shadow-sm"
          />
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-pink-100/50 border border-pink-200" />
          ))}
        </div>
      ) : experiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-6 rounded-3xl bg-white border-2 border-purple-100 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-500/10 transition-all flex flex-col justify-between shadow-sm group"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold mb-2">
                  <span className="font-extrabold uppercase tracking-wider text-pink-700">
                    {exp.type}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-slate-800">{exp.response_count} responses</span>
                </div>

                <h3 className="font-heading font-extrabold text-base text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-800 line-clamp-2 mt-1.5 leading-relaxed font-semibold">
                  {exp.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                    {exp.creator?.public_display_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs text-slate-900 font-black">
                    {exp.creator?.public_display_name}
                  </span>
                </div>

                <Link
                  to={`/${exp.type}/${exp.slug}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-95 transition-all flex items-center gap-1 shadow-sm hover:scale-105"
                >
                  <span>{exp.type === 'poll' ? 'Vote' : 'Play'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ZERO DUMMY DATA EMPTY STATE */
        <div className="text-center py-16 px-6 bg-gradient-to-br from-white via-pink-50 to-purple-50 border-2 border-pink-200 rounded-3xl space-y-4 shadow-lg shadow-pink-500/5 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-400 to-purple-500 text-white flex items-center justify-center mx-auto shadow-md shadow-pink-500/20 text-3xl">
            🎀
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-slate-900">
              Clean Canvas — No Experiences Yet! ✨
            </h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 font-medium">
              Create your own customized quiz, truth box, or poll in 60 seconds and share it with your besties!
            </p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-95 shadow-md shadow-purple-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Create First Experience</span>
            <Sparkles className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
