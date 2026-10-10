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
  AlertCircle,
  Trophy,
  Wand2
} from 'lucide-react';
import { api } from '../../lib/api';
import { BRAND } from '../../config/brand';
import { ShareModal } from '../../components/common/ShareModal';
import { ReportModal } from '../../components/common/ReportModal';
import { QuizScoreboard } from '../../components/quiz/QuizScoreboard';
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
  const [scoreboardModalOpen, setScoreboardModalOpen] = useState(false);

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

  const [nameError, setNameError] = useState<string | null>(null);

  const handleStartQuiz = () => {
    if (!participantName.trim()) {
      setNameError('Please enter your name. Your name is compulsory for safety & audit.');
      sounds.playPop();
      return;
    }
    setNameError(null);
    sounds.playSparkle();
    setHasStarted(true);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    if (!participantName.trim()) {
      setError('Your name is compulsory before submitting this quiz.');
      return;
    }
    setSubmitting(true);
    setError(null);
    sounds.playSparkle();

    try {
      const res = await api.submitQuiz(quiz.id, {
        participant_name: participantName.trim(),
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
        <div className="w-12 h-12 rounded-full border-4 border-sky-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-800 font-bold">Loading quiz experience...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-heading font-black text-lg text-slate-900">
          Quiz Not Available
        </h2>
        <p className="text-xs text-rose-700 font-bold">{error || 'Experience could not be found.'}</p>
        <Link
          to="/explore"
          className="inline-flex px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
        >
          Explore Other Experiences
        </Link>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIdx];
  const allAnswered = questions.every((q: any) => selectedAnswers[q.id]);
  const creatorName = quiz.creator_name || quiz.creator?.public_display_name || 'Bestie';

  // ==============================================================================
  // VIEW 1: RESULT SCREEN (Calculated securely on server)
  // ==============================================================================
  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 min-h-[85vh] space-y-8">
        <div className="rounded-3xl bg-white border-2 border-sky-300 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top subtle badge */}
          <div className="flex items-center justify-between text-xs text-slate-800 font-bold mb-6">
            <span className="font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
              ✨ QUIZ BY {creatorName}
            </span>
            <span className="text-slate-800 font-bold">{BRAND.poweredBy}</span>
          </div>

          {/* Score Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-xs font-black shadow-sm">
              <Award className="w-4 h-4 text-pink-600" />
              <span>{result.rank_badge}</span>
            </div>

            <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 bg-clip-text text-transparent font-heading">
              {result.percentage}%
            </div>

            <p className="text-xs sm:text-sm text-slate-900 font-extrabold">
              {result.participant_name} scored <strong className="text-purple-800 font-black">{result.score}</strong> out of{' '}
              <strong className="text-purple-800 font-black">{result.total_questions}</strong> on <strong className="text-purple-900 underline decoration-purple-300">{creatorName}</strong>'s quiz!
            </p>

            <p className="text-sm font-bold text-slate-900 italic max-w-sm mx-auto bg-pink-50 p-3 rounded-2xl border border-pink-200">
              "{result.feedback}"
            </p>

            {/* Pookie Sticker Stamp Selector */}
            <div className="pt-4 border-t border-pink-200 max-w-sm mx-auto">
              <span className="text-xs font-black text-pink-800 block mb-2">
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
              className="py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Score</span>
            </button>

            {quiz.settings.retake_allowed && (
              <button
                onClick={handleRetake}
                className="py-3 px-4 rounded-xl text-xs font-bold border-2 border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
            )}
          </div>

          {/* Answer Breakdown (If enabled by creator) */}
          {result.breakdown && result.breakdown.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-slate-900">
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
                      className={`p-3 rounded-xl border-2 text-xs flex items-start gap-2.5 ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                          : 'border-rose-300 bg-rose-50 text-rose-950'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">
                          {idx + 1}. {q.question_text}
                        </div>
                        <div className="text-[11px] font-bold text-slate-700">
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
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-800 font-bold">
            <Link to="/explore" className="hover:text-purple-600 transition-colors">
              More Quizzes
            </Link>
            <button
              onClick={() => setReportModalOpen(true)}
              className="hover:text-rose-600 transition-colors flex items-center gap-1 font-bold text-slate-800 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-800" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Live Score Board & Rankings */}
        <QuizScoreboard
          quizId={quiz.id}
          currentParticipantName={result.participant_name}
          quizTitle={quiz.title}
          creatorName={creatorName}
        />

        {/* Attractive Create Your Own Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden text-center space-y-4">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto text-2xl shadow-inner border border-white/30">
            ✨
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full border border-white/30 inline-block">
              Want to test your own besties? 💖
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-black leading-tight">
              Create Your Own Pookie Quiz in Seconds!
            </h3>
            <p className="text-xs sm:text-sm text-purple-100 font-semibold max-w-md mx-auto">
              Design a custom trivia challenge with private answer keys, secret truths, or cute polls and share with your friends.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/create?type=quiz"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-purple-900 font-black text-xs hover:bg-pink-50 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-pink-600" />
              <span>Create Your Quiz Now 🎀</span>
            </Link>

            <Link
              to="/create?type=anonymous"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-purple-900/40 hover:bg-purple-900/60 text-white font-black text-xs border border-white/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open Anonymous Box 💌</span>
            </Link>
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

          <div className="kawaii-card p-6 sm:p-8 text-center space-y-5 relative z-10 bg-white shadow-xl">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-300 text-sky-950 text-xs font-black shadow-sm mx-auto">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Created with ❤️ by <strong className="underline decoration-pink-400">{creatorName}</strong> ★</span>
              </div>
              <h1 className="font-heading text-2xl font-black text-slate-900 leading-tight">
                {quiz.title}
              </h1>
              <p className="text-xs text-slate-800 font-semibold max-w-sm mx-auto">
                {quiz.description || `Test your knowledge to see how well you truly know ${creatorName}!`}
              </p>
            </div>

            <div className="pt-2 space-y-3 text-left">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5 flex items-center justify-between">
                  <span>Your Name / Nickname <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-pink-700 font-extrabold uppercase bg-pink-100 px-2 py-0.5 rounded-full border border-pink-300">
                    Compulsory
                  </span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={participantName}
                    onChange={(e) => {
                      setParticipantName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleStartQuiz();
                    }}
                    placeholder="Enter your name (required for safety & audit)..."
                    className="kawaii-input w-full pl-10 pr-3 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                {nameError ? (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{nameError}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-700 font-semibold mt-1">
                    🔒 Compulsory for responder identification in the admin panel and safety verification.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleStartQuiz}
                className="kawaii-btn-primary w-full py-3.5 text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer font-black shadow-md"
              >
                <span>Start Quiz ({questions.length} questions) ★</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCuteTap();
                  setScoreboardModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 flex items-center justify-center gap-2 font-black text-xs transition-all shadow-sm cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>🏆 View Live Score Board & Rankings</span>
              </button>
            </div>

            <div className="text-[11px] text-sky-950 pt-3 border-t-2 border-dashed border-sky-200 font-bold">
              {BRAND.poweredBy} · Instant private scoring
            </div>
          </div>
        </div>

        {/* Scoreboard Modal on Welcome Screen */}
        {scoreboardModalOpen && (
          <QuizScoreboard
            quizId={quiz.id}
            currentParticipantName={participantName}
            quizTitle={quiz.title}
            creatorName={creatorName}
            isModal={true}
            onClose={() => setScoreboardModalOpen(false)}
          />
        )}
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

        <div className="kawaii-card p-6 sm:p-8 space-y-6 relative z-10 bg-white shadow-xl">
          {/* Progress Bar & Counter */}
          <div>
            <div className="flex items-center justify-between text-xs text-sky-950 mb-2 font-black">
              <span className="flex items-center gap-1.5">
                <span className="text-purple-800">✨ Quiz by {creatorName}</span>
                <span className="text-slate-400">·</span>
                <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
              </span>
              <span className="bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full border border-sky-300 font-black">
                {Math.round(((currentQuestionIdx + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-sky-100 overflow-hidden border border-sky-300">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-pink-500 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentQuestionIdx + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5 text-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 px-3.5 py-1 bg-sky-100 rounded-full border border-sky-300 inline-block shadow-sm">
              {quiz.title} ★
            </span>
            <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900 leading-snug pt-1">
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
                  className={`w-full p-4 rounded-2xl text-xs sm:text-sm font-extrabold text-left border-2 transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-100/90 text-sky-950 shadow-md ring-2 ring-sky-400 scale-[1.01]'
                      : 'border-sky-200 bg-white text-slate-900 hover:border-sky-400 hover:bg-sky-50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-black border ${
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-600'
                          : 'bg-sky-100 text-sky-800 border-sky-300'
                      }`}
                    >
                      {optIdx + 1}
                    </span>
                    <span className="leading-snug">{opt.option_text}</span>
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
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 border border-sky-200 bg-white shadow-sm disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentQuestionIdx < questions.length - 1 ? (
              <button
                type="button"
                disabled={!currentSelectedOpt}
                onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                className="kawaii-btn-primary px-6 py-2.5 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40 font-black"
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
