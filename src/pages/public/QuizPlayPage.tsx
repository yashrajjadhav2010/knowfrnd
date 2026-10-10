import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  HelpCircle, 
  Share2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  User, 
  Award,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { BRAND } from '../../config/brand';
import { ShareModal } from '../../components/common/ShareModal';
import { ReportModal } from '../../components/common/ReportModal';
import { sounds } from '../../lib/sound';
import { KawaiiBear, GinghamRibbon, CloudDecoration } from '../../components/common/KawaiiElements';

export function QuizPlayPage() {
  const { slugOrId } = useParams<{ slugOrId: string }>();

  const [quiz, setQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Participant state
  const [participantName, setParticipantName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<string>('🎀');

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (!slugOrId) return;
    setLoading(true);
    api.getExperience(slugOrId)
      .then((res) => {
        if (res.experience.type !== 'quiz') {
          setError('This experience is not a quiz.');
        } else {
          setQuiz(res.experience);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load quiz.');
      })
      .finally(() => setLoading(false));
  }, [slugOrId]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    sounds.playCuteTap();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);
    sounds.playSparkle();

    try {
      const res = await api.submitQuiz(quiz.id, {
        participant_name: participantName.trim() || 'A Friend',
        answers: selectedAnswers,
      });

      setResult(res.result);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7C3AED', '#EC4899', '#22D3EE', '#FBBF24'],
        });
      } catch (cErr) {
        // Fallback if canvas blocked
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setResult(null);
    setHasStarted(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading quiz experience...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">
          Quiz Not Available
        </h2>
        <p className="text-xs text-slate-500">{error || 'Experience could not be found.'}</p>
        <Link
          to="/explore"
          className="inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white"
        >
          Explore Other Experiences
        </Link>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIdx];
  const allAnswered = questions.every((q: any) => selectedAnswers[q.id]);

  // ==============================================================================
  // VIEW 1: RESULT SCREEN (Calculated securely on server)
  // ==============================================================================
  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 min-h-[85vh]">
        <div className="rounded-3xl bg-white dark:bg-[#141324] border border-purple-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top subtle badge */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
            <span className="font-semibold uppercase tracking-wider text-purple-500">
              {BRAND.name} RESULTS
            </span>
            <span>{BRAND.poweredBy}</span>
          </div>

          {/* Score Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
              <Award className="w-4 h-4 text-pink-400" />
              <span>{result.rank_badge}</span>
            </div>

            <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 bg-clip-text text-transparent font-heading">
              {result.percentage}%
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.participant_name} scored <strong className="text-purple-400">{result.score}</strong> out of{' '}
              <strong className="text-purple-400">{result.total_questions}</strong> questions correct
            </p>

            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic max-w-sm mx-auto">
              "{result.feedback}"
            </p>

            {/* Pookie Sticker Stamp Selector */}
            <div className="pt-4 border-t border-pink-200 max-w-sm mx-auto">
              <span className="text-xs font-bold text-pink-600 block mb-2">
                Stamp Your Score Card with a Vibe Sticker 🎀:
              </span>
              <div className="flex items-center justify-center gap-2 p-2 rounded-2xl bg-pink-50 border-2 border-pink-200">
                {['🎀', '💖', '🍓', '🧸', '💅', '💌', '✨', '🧋'].map((stk) => (
                  <button
                    key={stk}
                    type="button"
                    onClick={() => {
                      setSelectedSticker(stk);
                      sounds.playPop();
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-transform ${
                      selectedSticker === stk
                        ? 'bg-pink-300 scale-125 ring-2 ring-pink-500 shadow-sm'
                        : 'hover:scale-110 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {stk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              onClick={() => setShareModalOpen(true)}
              className="py-3 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 hover:opacity-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Score</span>
            </button>

            {quiz.settings.retake_allowed && (
              <button
                onClick={handleRetake}
                className="py-3 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#272542] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c1b33] flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
            )}
          </div>

          {/* Answer Breakdown (If enabled by creator) */}
          {result.breakdown && result.breakdown.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-[#272542]">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
                Question Breakdown
              </h4>
              <div className="space-y-2.5">
                {questions.map((q: any, idx: number) => {
                  const bd = result.breakdown.find((b: any) => b.question_id === q.id);
                  const isCorrect = bd?.is_correct;
                  const chosenOption = q.options.find((o: any) => o.id === bd?.selected_option_id);

                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-rose-500/30 bg-rose-500/5'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {idx + 1}. {q.question_text}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Your choice: {chosenOption?.option_text || 'Skipped'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer controls */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-[#272542] flex items-center justify-between text-xs text-slate-400">
            <Link to="/explore" className="hover:text-purple-400 transition-colors">
              More Quizzes
            </Link>
            <button
              onClick={() => setReportModalOpen(true)}
              className="hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Share Modal */}
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={quiz.title}
          sharePath={`/quiz/${quiz.slug}`}
          resultScore={{
            percentage: result.percentage,
            score: result.score,
            total: result.total_questions,
            badge: result.rank_badge,
          }}
        />

        {/* Report Modal */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="experience"
          targetId={quiz.id}
          targetTitle={quiz.title}
        />
      </div>
    );
  }

  // ==============================================================================
  // VIEW 2: WELCOME / NICKNAME SCREEN
  // ==============================================================================
  if (!hasStarted) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 min-h-[80vh] flex flex-col items-center justify-center relative">
        <CloudDecoration className="absolute top-4 -left-12 w-32 opacity-75 hidden sm:block" />
        <CloudDecoration className="absolute top-8 -right-10 w-28 opacity-75 hidden sm:block" />

        {/* Mascot Peeking */}
        <div className="-mb-8 z-20">
          <KawaiiBear className="w-24 h-24 sm:w-28 sm:h-28" />
        </div>

        {/* Hanging sign card */}
        <div className="w-full relative pt-4">
          <div className="absolute top-0 left-10 w-1.5 h-8 bg-sky-300 rounded-full" />
          <div className="absolute top-0 right-10 w-1.5 h-8 bg-sky-300 rounded-full" />
          <div className="absolute -top-2 left-[36px] w-4 h-4 rounded-full bg-pink-400 border-2 border-white shadow-sm" />
          <div className="absolute -top-2 right-[36px] w-4 h-4 rounded-full bg-pink-400 border-2 border-white shadow-sm" />

          <div className="kawaii-card p-6 sm:p-8 text-center space-y-5 relative z-10 bg-white">
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 px-3 py-1 bg-sky-50 rounded-full border border-sky-200 inline-block">
                QUIZ BY {quiz.creator?.public_display_name || 'BESTIE'} ★
              </span>
              <h1 className="font-heading text-2xl font-black text-slate-800 leading-tight">
                {quiz.title}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {quiz.description || 'Answer each question carefully to test how well you know them!'}
              </p>
            </div>

            <div className="pt-2 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Nickname 💖
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Enter your name or bestie alias..."
                    className="kawaii-input w-full pl-10 pr-3 py-3 text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playSparkle();
                  setHasStarted(true);
                }}
                className="kawaii-btn-primary w-full py-4 text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Quiz ({questions.length} questions) ★</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-slate-500 pt-3 border-t-2 border-dashed border-sky-100 font-medium">
              {BRAND.poweredBy} · Instant private scoring
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // VIEW 3: INTERACTIVE QUIZ QUESTIONS
  // ==============================================================================
  const currentSelectedOpt = selectedAnswers[currentQ?.id];

  return (
    <div className="max-w-xl mx-auto px-4 py-8 min-h-[80vh] relative">
      <CloudDecoration className="absolute -top-4 -left-16 w-32 opacity-75 hidden sm:block" />

      {/* Mascot Peeking from top of the question card */}
      <div className="flex justify-center -mb-8 z-20 relative">
        <KawaiiBear className="w-20 h-20 sm:w-24 sm:h-24" />
      </div>

      <div className="relative pt-4">
        {/* Hanging Strings and Pink Pins */}
        <div className="absolute top-0 left-12 w-1.5 h-8 bg-sky-300 rounded-full" />
        <div className="absolute top-0 right-12 w-1.5 h-8 bg-sky-300 rounded-full" />
        <div className="absolute -top-2 left-[44px] w-4 h-4 rounded-full bg-pink-400 border-2 border-white shadow-sm" />
        <div className="absolute -top-2 right-[44px] w-4 h-4 rounded-full bg-pink-400 border-2 border-white shadow-sm" />

        <div className="kawaii-card p-6 sm:p-8 space-y-6 relative z-10 bg-white">
          {/* Progress Bar & Counter */}
          <div>
            <div className="flex items-center justify-between text-xs text-sky-700 mb-2 font-bold">
              <span>
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
              <span>
                {Math.round(((currentQuestionIdx + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-sky-100 overflow-hidden border border-sky-200">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-pink-400 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentQuestionIdx + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5 text-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 px-3 py-1 bg-sky-50 rounded-full border border-sky-200 inline-block">
              {quiz.title} ★
            </span>
            <h2 className="font-heading text-lg sm:text-xl font-black text-slate-800 leading-snug pt-1">
              {currentQ.question_text}
            </h2>
          </div>

          {/* Options - Clean, tactile rounded buttons like user image */}
          <div className="space-y-3">
            {currentQ.options.map((opt: any, optIdx: number) => {
              const isSelected = currentSelectedOpt === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full p-4 rounded-2xl text-xs sm:text-sm font-bold text-left border-2 transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-md ring-2 ring-sky-300 scale-[1.01]'
                      : 'border-sky-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-black">
                      {optIdx + 1}
                    </span>
                    <span>{opt.option_text}</span>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation / Submit footer */}
          <div className="pt-4 border-t-2 border-dashed border-sky-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentQuestionIdx < questions.length - 1 ? (
              <button
                type="button"
                disabled={!currentSelectedOpt}
                onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                className="kawaii-btn-primary px-6 py-2.5 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={handleSubmitQuiz}
                className="kawaii-btn-pink px-6 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>{submitting ? 'Scoring...' : 'Submit Answers ★'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
