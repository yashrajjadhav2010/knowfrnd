import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  Lock, 
  Send, 
  CheckCircle2, 
  Share2, 
  ShieldAlert, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../../lib/api';
import { BRAND } from '../../config/brand';
import { ShareModal } from '../../components/common/ShareModal';
import { ReportModal } from '../../components/common/ReportModal';
import confetti from 'canvas-confetti';
import { sounds } from '../../lib/sound';

export function AnonymousPlayPage() {
  const { slugOrId } = useParams<{ slugOrId: string }>();

  const [experience, setExperience] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [responderName, setResponderName] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseRef, setResponseRef] = useState<string | null>(null);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (!slugOrId) return;
    setLoading(true);
    api.getExperience(slugOrId)
      .then((res) => {
        if (res.experience.type !== 'anonymous') {
          setError('This experience is not an anonymous question box.');
        } else {
          setExperience(res.experience);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load experience.');
      })
      .finally(() => setLoading(false));
  }, [slugOrId]);

  const handleTextChange = (qId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: text,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experience) return;

    const questions = experience.questions || [];
    const formattedAnswers = questions.map((q: any) => ({
      question_id: q.id,
      response_text: answers[q.id] || '',
    }));

    // Check required questions
    for (const q of questions) {
      if (q.is_required && (!answers[q.id] || !answers[q.id].trim())) {
        setError(`Please answer the required question: "${q.question_text}"`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.submitAnonymous(experience.id, {
        answers: formattedAnswers,
        responder_name: responderName.trim() || undefined,
        consent_given: consentGiven,
      });

      setResponseRef(res.response_reference);
      setSubmitted(true);
      sounds.playSparkle();
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#EC4899', '#F472B6', '#A855F7', '#FDE047'],
        });
      } catch {}
    } catch (err: any) {
      setError(err.message || 'Failed to deliver response.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-pink-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Opening anonymous truth box...</p>
      </div>
    );
  }

  if (error && !experience) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">
          Box Not Found
        </h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link
          to="/explore"
          className="inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white"
        >
          Explore Experiences
        </Link>
      </div>
    );
  }

  // SUCCESS CONFIRMATION
  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 min-h-[80vh] flex items-center">
        <div className="w-full p-8 rounded-3xl bg-white border-2 border-pink-200 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-pink-500/30 text-2xl">
            💌
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-black text-slate-900">
              Delivered Secretly! 💬
            </h2>
            <p className="text-xs text-slate-600">
              Your response was safely placed in{' '}
              <strong className="text-pink-600">{experience.creator?.public_display_name}'s</strong> box.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-[11px] text-pink-700 font-mono font-bold">
            Reference Token: {responseRef}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setShareModalOpen(true)}
              className="w-full py-3.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20 hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share This Truth Box</span>
            </button>

            <Link
              to="/create?type=anonymous"
              className="w-full py-3 rounded-2xl text-xs font-bold border-2 border-pink-200 bg-white text-pink-700 hover:bg-pink-50 transition-colors"
            >
              Open Your Own Anonymous Box 🎀
            </Link>
          </div>
        </div>

        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={experience.title}
          sharePath={`/anonymous/${experience.slug}`}
          experienceType="anonymous"
        />
      </div>
    );
  }

  const questions = experience.questions || [];
  const isModeB = experience.privacy_mode === 'mode_b';

  return (
    <div className="max-w-xl mx-auto px-4 py-12 min-h-[85vh]">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-pink-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-purple-500 text-white flex items-center justify-center mx-auto shadow-md shadow-pink-500/20 text-2xl">
            💌
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
            BY {experience.creator?.public_display_name}
          </span>
          <h1 className="font-heading text-2xl font-black text-slate-900">
            {experience.title}
          </h1>
          {experience.description && (
            <p className="text-xs text-slate-600 font-medium">
              {experience.description}
            </p>
          )}
        </div>

        {/* Transparent Privacy Notice */}
        <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Privacy Guarantee</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {isModeB ? (
              <>
                <strong className="text-slate-800 dark:text-slate-200">Mode B Active:</strong> This experience is completely anonymous to both the creator and the platform. No accounts, names, or device fingerprints are retained.
              </>
            ) : (
              <>
                <strong className="text-slate-800 dark:text-slate-200">Mode A Active:</strong> 100% anonymous to the creator. You may optionally provide a name for platform moderation; the creator will NEVER be able to see it.
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Answering Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {questions.map((q: any, idx: number) => (
            <div key={q.id} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                {idx + 1}. {q.question_text}{' '}
                {q.is_required && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={3}
                required={q.is_required}
                value={answers[q.id] || ''}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
                placeholder="Type your honest answer here..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>
          ))}

          {/* Mode A Optional Name Field with Consent Notice */}
          {!isModeB && (
            <div className="p-3.5 rounded-xl bg-pink-950/10 border border-pink-500/20 space-y-2.5">
              <label className="block text-xs font-semibold text-pink-300">
                Optional Disclosed Name (Platform Moderation Only)
              </label>
              <input
                type="text"
                value={responderName}
                onChange={(e) => setResponderName(e.target.value)}
                placeholder="Optional: Your name (Creator will NEVER see this)"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0B0B12] border border-[#272542] text-white focus:outline-none focus:border-pink-500"
              />
              {responderName.trim().length > 0 && (
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-400">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    required
                    className="accent-pink-500 mt-0.5"
                  />
                  <span>
                    I understand this name is stored separately and accessible only to platform administrators for safety investigations.
                  </span>
                </label>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 text-white shadow-lg shadow-pink-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Sending Secretly...' : 'Send Anonymous Answer'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-[#272542] flex items-center justify-between text-xs text-slate-400">
          <span>{BRAND.poweredBy}</span>
          <button
            onClick={() => setReportModalOpen(true)}
            className="hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>
      </div>

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
