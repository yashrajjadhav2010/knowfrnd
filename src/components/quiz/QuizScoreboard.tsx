import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Sparkles, 
  RotateCw, 
  User, 
  Award, 
  Calendar,
  X,
  Flame
} from 'lucide-react';
import { api } from '../../lib/api';
import { sounds } from '../../lib/sound';

export interface ScoreboardEntry {
  rank: number;
  id: string;
  participant_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  submitted_at: string;
  submission_reference: string;
}

interface QuizScoreboardProps {
  quizId: string;
  currentParticipantName?: string;
  quizTitle?: string;
  creatorName?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function QuizScoreboard({
  quizId,
  currentParticipantName,
  quizTitle,
  creatorName,
  onClose,
  isModal = false,
}: QuizScoreboardProps) {
  const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScoreboard = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
      sounds.playCuteTap();
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await api.getQuizScoreboard(quizId);
      setEntries(res.scoreboard || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load scoreboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchScoreboard();
    }
  }, [quizId]);

  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  const getRankBadge = (percentage: number) => {
    if (percentage === 100) return 'Soulmate Tier 🏆';
    if (percentage >= 80) return 'Best Friend 💖';
    if (percentage >= 60) return 'Close Friend ⭐';
    if (percentage >= 40) return 'Casual Buddy ✌️';
    return 'Acquaintance 🌱';
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-purple-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black uppercase tracking-wider shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Official Bestie Score Board</span>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900">
            {quizTitle ? `Scoreboard: ${quizTitle}` : 'Quiz Leaderboard'}
          </h3>
          <p className="text-xs text-slate-700 font-semibold">
            {creatorName ? (
              <span>Created with ❤️ by <strong className="text-purple-800 font-bold">{creatorName}</strong> · </span>
            ) : null}
            <span>{entries.length} friend{entries.length === 1 ? '' : 's'} ranked</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchScoreboard(true)}
            disabled={refreshing || loading}
            title="Refresh Leaderboard"
            className="p-2.5 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-800">Calculating rank leaderboard...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold text-center">
          {error}
        </div>
      ) : entries.length === 0 ? (
        <div className="py-12 px-4 rounded-3xl bg-purple-50/60 border-2 border-dashed border-purple-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-3xl shadow-sm">
            🏆
          </div>
          <h4 className="font-heading font-black text-base text-slate-900">
            No Scores Recorded Yet!
          </h4>
          <p className="text-xs text-slate-700 font-semibold max-w-sm mx-auto">
            Be the very first responder to take this quiz and lock in 1st place on the scoreboard!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium (When 2 or more players exist) */}
          {entries.length >= 2 && (
            <div className="pt-2 pb-4">
              <div className="text-center mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 inline-block">
                  ★ Podium Champions ★
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end max-w-md mx-auto pt-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-700 flex items-center justify-center font-black text-base shadow-sm relative">
                    🥈
                    <span className="absolute -bottom-2 px-1.5 py-0.2 rounded-full bg-slate-200 border border-slate-400 text-[9px] font-black text-slate-800">
                      #2
                    </span>
                  </div>
                  <div className="w-full mt-3 p-3 rounded-2xl bg-slate-100 border-2 border-slate-300 text-center shadow-sm">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {top2 ? top2.participant_name : '-'}
                    </p>
                    <p className="text-[11px] font-extrabold text-purple-700">
                      {top2 ? `${top2.percentage}%` : '-'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-600">
                      {top2 ? `${top2.score}/${top2.total_questions}` : ''}
                    </p>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center -mt-4">
                  <div className="relative">
                    <Crown className="w-6 h-6 text-amber-500 mx-auto -mb-1 animate-bounce" />
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-800 flex items-center justify-center font-black text-xl shadow-md relative">
                      🥇
                      <span className="absolute -bottom-2 px-2 py-0.2 rounded-full bg-amber-400 text-white font-black text-[9px] shadow-sm">
                        #1
                      </span>
                    </div>
                  </div>
                  <div className="w-full mt-3 p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/90 border-2 border-amber-400 text-center shadow-md ring-2 ring-amber-300/40">
                    <p className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {top1.participant_name}
                    </p>
                    <p className="text-sm font-black text-amber-700 font-heading">
                      {top1.percentage}%
                    </p>
                    <p className="text-[10px] font-extrabold text-amber-900">
                      {top1.score}/{top1.total_questions} correct
                    </p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-800 flex items-center justify-center font-black text-base shadow-sm relative">
                    🥉
                    <span className="absolute -bottom-2 px-1.5 py-0.2 rounded-full bg-amber-200 border border-amber-400 text-[9px] font-black text-amber-900">
                      #3
                    </span>
                  </div>
                  <div className="w-full mt-3 p-3 rounded-2xl bg-amber-50/70 border-2 border-amber-300 text-center shadow-sm">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {top3 ? top3.participant_name : '-'}
                    </p>
                    <p className="text-[11px] font-extrabold text-purple-700">
                      {top3 ? `${top3.percentage}%` : '-'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-600">
                      {top3 ? `${top3.score}/${top3.total_questions}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Participant Leaderboard Table */}
          <div className="rounded-2xl border-2 border-purple-200 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-purple-100/80 border-b-2 border-purple-200 text-slate-900 font-black">
                    <th className="py-3 px-3 sm:px-4 text-center w-14">Rank</th>
                    <th className="py-3 px-3 sm:px-4">Friend / Participant</th>
                    <th className="py-3 px-3 sm:px-4 text-center">Score</th>
                    <th className="py-3 px-3 sm:px-4 text-center">Percentage</th>
                    <th className="py-3 px-3 sm:px-4 hidden sm:table-cell">Tier Badge</th>
                    <th className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {entries.map((entry) => {
                    const isCurrentUser =
                      currentParticipantName &&
                      entry.participant_name.trim().toLowerCase() ===
                        currentParticipantName.trim().toLowerCase();

                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-pink-100/70 font-extrabold ring-2 ring-pink-400/50'
                            : 'hover:bg-purple-50/50'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-3 sm:px-4 text-center">
                          {entry.rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400 text-white font-black text-xs shadow-sm">
                              🥇
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-300 text-slate-900 font-black text-xs shadow-sm">
                              🥈
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-200 text-amber-900 font-black text-xs shadow-sm">
                              🥉
                            </span>
                          ) : (
                            <span className="font-black text-slate-700 text-xs">
                              #{entry.rank}
                            </span>
                          )}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-xs sm:text-sm">
                              {entry.participant_name}
                            </span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                                YOU ★
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-3 px-3 sm:px-4 text-center font-black text-purple-800">
                          {entry.score} / {entry.total_questions}
                        </td>

                        {/* Percentage */}
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                              entry.percentage === 100
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : entry.percentage >= 80
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : entry.percentage >= 60
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : 'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}
                          >
                            {entry.percentage}%
                          </span>
                        </td>

                        {/* Tier */}
                        <td className="py-3 px-3 sm:px-4 hidden sm:table-cell text-xs font-bold text-slate-800">
                          {getRankBadge(entry.percentage)}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell text-[11px] font-semibold text-slate-600">
                          {new Date(entry.submitted_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl border-3 border-purple-300 p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border-2 border-purple-200 p-6 sm:p-8 shadow-xl">
      {content}
    </div>
  );
}
