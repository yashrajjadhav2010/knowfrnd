import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Vote, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck,
  AlertCircle,
  User 
} from 'lucide-react';
import { api } from '../../lib/api';
import { BRAND } from '../../config/brand';
import { ShareModal } from '../../components/common/ShareModal';
import { ReportModal } from '../../components/common/ReportModal';
import { sounds } from '../../lib/sound';

export function PollPlayPage() {
  const { slugOrId } = useParams<{ slugOrId: string }>();

  const [experience, setExperience] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voting state
  const [voterName, setVoterName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userSelection, setUserSelection] = useState<'A' | 'B' | null>(null);
  const [tally, setTally] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (!slugOrId) return;
    setLoading(true);
    api.getExperience(slugOrId)
      .then((res) => {
        if (res.experience.type !== 'poll') {
          setError('This experience is not a poll.');
        } else {
          setExperience(res.experience);
          if (res.experience.poll) {
            setTally(res.experience.poll);
          }
          // Check if previously voted in local storage
          const storedVote = localStorage.getItem(`vybe_poll_vote_${res.experience.id}`);
          if (storedVote === 'A' || storedVote === 'B') {
            setHasVoted(true);
            setUserSelection(storedVote);
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load poll.');
      })
      .finally(() => setLoading(false));
  }, [slugOrId]);

  const handleVote = async (option: 'A' | 'B') => {
    if (!experience || hasVoted || submitting) return;

    if (!voterName.trim()) {
      setNameError('Please enter your name first. Voter name is compulsory for safety and audit.');
      sounds.playPop();
      return;
    }
    setNameError(null);
    setSubmitting(true);
    setError(null);

    // Persistent voter reference stored per device
    let voterRef = localStorage.getItem('vybe_voter_ref');
    if (!voterRef) {
      voterRef = `v_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('vybe_voter_ref', voterRef);
    }

    try {
      sounds.playSparkle();
      const res = await api.votePoll(experience.id, {
        selected_option: option,
        voter_name: voterName.trim(),
        voter_reference: voterRef,
      });

      setHasVoted(true);
      setUserSelection(option);
      setTally(res.tally);
      localStorage.setItem(`vybe_poll_vote_${experience.id}`, option);
    } catch (err: any) {
      setError(err.message || 'Failed to register vote.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-800 font-bold">Loading poll experience...</p>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-heading font-black text-lg text-slate-900">
          Poll Unavailable
        </h2>
        <p className="text-xs text-rose-700 font-bold">{error || 'Poll not found'}</p>
        <Link
          to="/explore"
          className="inline-flex px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-sm"
        >
          Explore Experiences
        </Link>
      </div>
    );
  }

  const poll = experience.poll;
  const totalVotes = tally ? tally.total_votes : 0;
  const percentA = tally ? tally.percent_a : 50;
  const percentB = tally ? tally.percent_b : 50;
  const creatorName = experience.creator_name || experience.creator?.public_display_name || 'Bestie';

  return (
    <div className="max-w-xl mx-auto px-4 py-12 min-h-[85vh]">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-cyan-200 shadow-xl space-y-6">
        {/* Header with Creator Name Banner */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
            🧋
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-900 text-xs font-black shadow-sm mx-auto">
            <span>✨ Poll Created by <strong className="text-cyan-900 underline decoration-cyan-400">{creatorName}</strong></span>
          </div>

          <h1 className="font-heading text-2xl font-black text-slate-900 leading-tight">
            {experience.title}
          </h1>

          {experience.description && (
            <p className="text-xs text-slate-800 font-semibold max-w-md mx-auto">
              {experience.description}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Compulsory Voter Name Input Gate */}
        {!hasVoted ? (
          <div className="p-4 rounded-2xl bg-cyan-50/80 border-2 border-cyan-200 text-left space-y-2.5">
            <label className="block text-xs font-black text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Your Name / Voter Nickname</span>
                <span className="text-rose-500">*</span>
              </span>
              <span className="text-[10px] text-cyan-900 font-extrabold uppercase bg-cyan-100 px-2.5 py-0.5 rounded-full border border-cyan-300">
                Compulsory
              </span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-cyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={voterName}
                onChange={(e) => {
                  setVoterName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="Enter your name before choosing Option A or B..."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white border-2 border-cyan-300 rounded-xl focus:outline-none focus:border-cyan-600 placeholder:text-slate-400"
              />
            </div>
            {nameError ? (
              <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{nameError}</span>
              </p>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-cyan-900 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                <span>🔒 Compulsory for safety audit and administrator panel verification.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-cyan-50 border-2 border-cyan-200 text-center text-xs font-black text-cyan-900 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600" />
            <span>Vote successfully recorded as <strong className="underline">{voterName || 'Verified Voter'}</strong></span>
          </div>
        )}

        {/* Voting Options Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* OPTION A */}
          <button
            type="button"
            disabled={hasVoted || submitting}
            onClick={() => handleVote('A')}
            className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
              userSelection === 'A'
                ? 'border-cyan-500 bg-cyan-100 ring-2 ring-cyan-400 shadow-md scale-[1.02]'
                : 'border-cyan-200 bg-cyan-50/50 hover:border-cyan-400 hover:bg-cyan-50'
            }`}
          >
            {hasVoted && (
              <div
                className="absolute inset-0 bg-cyan-200/50 transition-all duration-700 pointer-events-none"
                style={{ width: `${percentA}%` }}
              />
            )}

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-800">
                  Option A
                </span>
                {userSelection === 'A' && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-700" />
                )}
              </div>

              <div className="font-heading font-extrabold text-base text-slate-900 leading-snug">
                {poll?.option_a}
              </div>

              {hasVoted && (
                <div className="pt-2 text-2xl font-black text-cyan-800 font-heading">
                  {percentA}%
                  <span className="text-[11px] font-extrabold text-slate-800 ml-1.5">
                    ({tally?.votes_a} votes)
                  </span>
                </div>
              )}
            </div>
          </button>

          {/* OPTION B */}
          <button
            type="button"
            disabled={hasVoted || submitting}
            onClick={() => handleVote('B')}
            className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
              userSelection === 'B'
                ? 'border-purple-500 bg-purple-100 ring-2 ring-purple-400 shadow-md scale-[1.02]'
                : 'border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            {hasVoted && (
              <div
                className="absolute inset-0 bg-purple-200/50 transition-all duration-700 pointer-events-none"
                style={{ width: `${percentB}%` }}
              />
            )}

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-800">
                  Option B
                </span>
                {userSelection === 'B' && (
                  <CheckCircle2 className="w-4 h-4 text-purple-700" />
                )}
              </div>

              <div className="font-heading font-extrabold text-base text-slate-900 leading-snug">
                {poll?.option_b}
              </div>

              {hasVoted && (
                <div className="pt-2 text-2xl font-black text-purple-800 font-heading">
                  {percentB}%
                  <span className="text-[11px] font-extrabold text-slate-800 ml-1.5">
                    ({tally?.votes_b} votes)
                  </span>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Voting instructions or stats */}
        <div className="text-center text-xs font-extrabold text-slate-900">
          {hasVoted ? (
            <span>Total Community Votes: <strong className="text-cyan-800 font-black">{totalVotes}</strong></span>
          ) : (
            <span>Enter your name above, then tap either choice to cast your vote!</span>
          )}
        </div>

        {/* Action bar */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Poll</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="text-[11px] font-bold text-slate-600 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={experience.title}
        sharePath={`/poll/${experience.slug}`}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="experience"
        targetId={experience.id}
        targetTitle={experience.title}
      />
    </div>
  );
}
