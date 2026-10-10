import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  HelpCircle, 
  MessageSquare, 
  Vote, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Share2,
  Check,
  Heart,
  Wand2,
  User
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ShareModal } from '../../components/common/ShareModal';
import { sounds } from '../../lib/sound';
import { KawaiiBear, GinghamRibbon, CloudDecoration } from '../../components/common/KawaiiElements';

type ExperienceType = 'quiz' | 'anonymous' | 'poll';

interface QuestionDraft {
  question_text: string;
  question_type: 'multiple_choice' | 'short_text' | 'yes_no';
  options: string[];
  correct_option_index: number;
  is_required: boolean;
}

const CUTE_TEMPLATES = [
  {
    id: 'pookie_quiz',
    name: 'Are You My Pookie or Just an NPC? 🎀',
    type: 'quiz' as ExperienceType,
    desc: 'The ultimate friendship vibe check for your real inner circle.',
    title: 'Are You My Pookie or Just an NPC? 🎀',
    description: 'Answer honestly to prove if you really know my chaotic daily routine! No guessing.',
    theme: 'pink',
    questions: [
      {
        question_text: 'What drink order instantly revives my soul?',
        question_type: 'multiple_choice' as const,
        options: ['Iced Strawberry Matcha with oat milk 🍓', 'Caramel Macchiato extra sweet', 'Brown Sugar Boba 🧋', 'Red Bull on ice ⚡'],
        correct_option_index: 0,
        is_required: true,
      },
      {
        question_text: 'If I text you at 2:14 AM "WAKE UP", what do you do?',
        question_type: 'multiple_choice' as const,
        options: ['Call immediately asking what happened 📱', 'Text back "on my way" with no questions', 'Leave me on delivered until 11 AM 💀', 'Reply with a cat meme'],
        correct_option_index: 0,
        is_required: true,
      },
      {
        question_text: 'What is my most unhinged guilty pleasure?',
        question_type: 'multiple_choice' as const,
        options: ['Watching 3-hour YouTube drama essays at 3 AM 🍿', 'Buying cute stationary I never use 🎀', 'Stalking random profiles from 2018', 'Singing musical theater in the shower'],
        correct_option_index: 0,
        is_required: true,
      },
      {
        question_text: 'What is my actual love language?',
        question_type: 'multiple_choice' as const,
        options: ['Sending 45 TikToks a day without context', 'Buying me sweet treats', 'Bullying each other affectionately', 'Sitting in comfortable silence'],
        correct_option_index: 1,
        is_required: true,
      },
    ],
  },
  {
    id: 'secret_truth',
    name: 'Midnight Pookie Confessions 💌',
    type: 'anonymous' as ExperienceType,
    desc: 'Super cute anonymous truth box for secrets and warm compliments.',
    title: 'Midnight Pookie Confessions 💌',
    description: 'Leave me an honest secret, a sweet compliment, or something you were too shy to say out loud!',
    theme: 'violet',
    privacy_mode: 'mode_b' as const,
    questions: [
      {
        question_text: 'What was your genuine first impression of me vs right now?',
        question_type: 'short_text' as const,
        options: [],
        correct_option_index: 0,
        is_required: true,
      },
      {
        question_text: 'What song or memory reminds you of me whenever you hear it?',
        question_type: 'short_text' as const,
        options: [],
        correct_option_index: 0,
        is_required: true,
      },
      {
        question_text: 'If you could give me one piece of advice right now, what would it be?',
        question_type: 'short_text' as const,
        options: [],
        correct_option_index: 0,
        is_required: false,
      },
    ],
  },
  {
    id: 'sweet_poll',
    name: 'Iced Matcha vs Brown Sugar Boba 🧋',
    type: 'poll' as ExperienceType,
    desc: 'Settle the greatest sweet drink debate once and for all.',
    title: 'Iced Strawberry Matcha 🍓 vs Brown Sugar Boba 🧋',
    description: 'Which one are we getting on our next bestie walk?',
    theme: 'pink',
    optionA: 'Iced Strawberry Matcha 🍓',
    optionB: 'Brown Sugar Tiger Boba 🧋',
  },
];

export function CreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, switchRole } = useAuth();

  const [type, setType] = useState<ExperienceType>(
    (searchParams.get('type') as ExperienceType) || 'quiz'
  );

  // Common fields
  const [title, setTitle] = useState('');
  const [creatorName, setCreatorName] = useState(user?.public_display_name || '');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('violet');
  const [privacyMode, setPrivacyMode] = useState<'mode_a' | 'mode_b'>('mode_b');

  // Quiz / Anonymous Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      question_text: 'What is my favorite late night craving?',
      question_type: 'multiple_choice',
      options: ['Spicy Ramen with extra cheese', 'Cold pizza slice', 'Boba tea', 'French fries'],
      correct_option_index: 0,
      is_required: true,
    },
    {
      question_text: 'If I got a free flight anywhere tomorrow, where do I land?',
      question_type: 'multiple_choice',
      options: ['Tokyo', 'New York', 'Paris', 'Iceland'],
      correct_option_index: 0,
      is_required: true,
    },
    {
      question_text: 'What is something that instantly annoys me?',
      question_type: 'multiple_choice',
      options: ['Chewing loudly', 'Being left on read', 'Slow walkers', 'Tardiness'],
      correct_option_index: 1,
      is_required: true,
    },
  ]);

  // Poll options
  const [pollOptionA, setPollOptionA] = useState('Iced Matcha Latte 🍵');
  const [pollOptionB, setPollOptionB] = useState('Cold Brew Coffee ☕');

  // Submitting state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdExperience, setCreatedExperience] = useState<any | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Helper to add question
  const addQuestion = () => {
    if (questions.length >= 30) {
      setError('Quizzes have a maximum of 30 questions.');
      return;
    }
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: type === 'anonymous' ? 'short_text' : 'multiple_choice',
        options: type === 'quiz' ? ['', '', '', ''] : [],
        correct_option_index: 0,
        is_required: true,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (type === 'quiz' && questions.length <= 3) {
      setError('A quiz must have at least 3 questions.');
      return;
    }
    if (type === 'anonymous' && questions.length <= 1) {
      setError('An anonymous box must have at least 1 question.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question_text = text;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correct_option_index = optIndex;
    setQuestions(updated);
  };

  const handleSubmit = async (status: 'published' | 'draft' = 'published') => {
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title for your experience.');
      return;
    }

    if (!creatorName.trim()) {
      setError('Please provide your name as the Quiz Creator. Responders will see this on their screen!');
      return;
    }

    // Validation
    if (type === 'quiz') {
      if (questions.length < 3) {
        setError('Quizzes must contain at least 3 questions.');
        return;
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question_text.trim()) {
          setError(`Question #${i + 1} is empty.`);
          return;
        }
        const validOptions = q.options.filter((o) => o.trim().length > 0);
        if (validOptions.length < 2) {
          setError(`Question #${i + 1} must have at least 2 valid answer options.`);
          return;
        }
      }
    } else if (type === 'anonymous') {
      if (questions.length < 1) {
        setError('Please add at least one question.');
        return;
      }
    } else if (type === 'poll') {
      if (!pollOptionA.trim() || !pollOptionB.trim()) {
        setError('Both Option A and Option B are required for a poll.');
        return;
      }
    }

    // If unauthenticated, ensure demo creator role is activated
    if (!isAuthenticated) {
      await switchRole('creator');
    }

    setSubmitting(true);

    try {
      const payload: any = {
        type,
        title: title.trim(),
        description: description.trim(),
        creator_name: creatorName.trim(),
        settings: {
          creator_name: creatorName.trim(),
        },
        theme,
        status,
        privacy_mode: privacyMode,
      };

      if (type === 'quiz' || type === 'anonymous') {
        payload.questions = questions.map((q) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options.filter((o) => o.trim().length > 0),
          correct_option_index: q.correct_option_index,
          is_required: q.is_required,
        }));
      } else if (type === 'poll') {
        payload.poll = {
          option_a: pollOptionA.trim(),
          option_b: pollOptionB.trim(),
        };
      }

      const res = await api.createExperience(payload);
      setCreatedExperience(res.experience);
      setShareModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create experience.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadTemplate = (tpl: (typeof CUTE_TEMPLATES)[0]) => {
    sounds.playSparkle();
    setType(tpl.type);
    setTitle(tpl.title);
    setDescription(tpl.description);
    setTheme(tpl.theme);
    if (tpl.type === 'quiz' || tpl.type === 'anonymous') {
      setQuestions(tpl.questions as QuestionDraft[]);
      if ((tpl as any).privacy_mode) {
        setPrivacyMode((tpl as any).privacy_mode);
      }
    } else if (tpl.type === 'poll') {
      setPollOptionA((tpl as any).optionA || '');
      setPollOptionB((tpl as any).optionB || '');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen relative">
      <CloudDecoration className="absolute top-6 -left-12 w-32 opacity-75 hidden sm:block" />
      <CloudDecoration className="absolute top-12 -right-8 w-28 opacity-75 hidden sm:block" />

      {/* Header with Mascot Peeking */}
      <div className="mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <GinghamRibbon title="CREATE YOUR FRIEND'S QUIZ" />
          <h1 className="font-heading text-3xl font-black text-slate-800 tracking-tight mt-1">
            Build Your Own Quiz ★
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Personalize 3 to 30 questions, pick correct answers, and invite friends to test their score!
          </p>
        </div>
        <div className="shrink-0">
          <KawaiiBear className="w-20 h-20 sm:w-24 sm:h-24" />
        </div>
      </div>

      {/* Cute Instant Templates Selector Banner */}
      <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-sky-100 via-pink-50 to-sky-100 border-2 border-sky-300 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎀</span>
            <span className="font-heading font-extrabold text-xs text-slate-900">
              Pookie Preset Inspiration (Click to Auto-fill)
            </span>
          </div>
          <span className="text-[10px] text-sky-800 font-extrabold bg-white px-2.5 py-1 rounded-full border border-sky-300 shadow-sm">
            1-Click Magic ✨
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CUTE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleLoadTemplate(tpl)}
              className="p-3.5 rounded-2xl border-2 border-sky-200 bg-white hover:bg-sky-50 hover:border-sky-400 text-left transition-all shadow-sm group cursor-pointer hover:scale-[1.02]"
            >
              <div className="font-heading font-extrabold text-xs text-sky-800 group-hover:text-pink-600 line-clamp-1">
                {tpl.name}
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-normal">
                {tpl.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Experience Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          {
            id: 'quiz',
            label: 'Know Your Friend Quiz',
            desc: '3 to 30 custom questions with private correct answer keys.',
            icon: HelpCircle,
            color: 'text-sky-500',
          },
          {
            id: 'anonymous',
            label: 'Anonymous Answers',
            desc: 'Truth box with Mode A & Mode B privacy controls.',
            icon: MessageSquare,
            color: 'text-pink-500',
          },
          {
            id: 'poll',
            label: 'This or That Poll',
            desc: '2 choices for friendly debates with live vote counts.',
            icon: Vote,
            color: 'text-amber-500',
          },
        ].map((t) => {
          const Icon = t.icon;
          const active = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setType(t.id as ExperienceType);
                if (t.id === 'quiz' && questions.length === 0) {
                  setQuestions([
                    {
                      question_text: '',
                      question_type: 'multiple_choice',
                      options: ['', '', '', ''],
                      correct_option_index: 0,
                      is_required: true,
                    },
                  ]);
                }
              }}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                active
                  ? 'border-sky-500 bg-sky-50 shadow-md ring-2 ring-sky-300 scale-[1.02]'
                  : 'border-sky-100 bg-white hover:border-sky-300 hover:shadow-sm'
              }`}
            >
              <Icon className={`w-6 h-6 ${t.color} mb-2`} />
              <div className="font-heading font-extrabold text-sm text-slate-900">
                {t.label}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {t.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Box */}
      <div className="space-y-6 bg-white border-3 border-dashed border-sky-300 rounded-3xl p-6 sm:p-8 shadow-md">
        {/* Basic Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'quiz'
                  ? 'How Well Do You Actually Know Me?'
                  : type === 'anonymous'
                  ? 'My Anonymous Truth Box 💬'
                  : 'Oat Milk Matcha vs Cold Brew ☕'
              }
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Quiz Creator Name</span>
                <span className="text-rose-500">*</span>
              </span>
              <span className="text-[10px] text-pink-700 font-extrabold uppercase bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-300">
                Shown to Responders
              </span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Enter your name (e.g. Alex, Sarah, Bestie Queen)..."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-purple-500 placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-700 font-semibold mt-1">
              💖 Responders will see this clearly on their screen as: "Created with ❤️ by {creatorName.trim() || 'Your Name'}"
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Description / Kicker (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell your friends what this is about..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </div>

        {/* PRIVACY MODE TOGGLE FOR ANONYMOUS */}
        {type === 'anonymous' && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-700" />
              <h4 className="font-heading font-black text-xs text-slate-900">
                Privacy Mode Configuration
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  privacyMode === 'mode_a'
                    ? 'border-pink-500 bg-pink-100/70 ring-2 ring-pink-400'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-pink-700">Mode A: Platform Safety Audited (Standard)</span>
                  <input
                    type="radio"
                    name="privacy_mode"
                    checked={privacyMode === 'mode_a'}
                    onChange={() => setPrivacyMode('mode_a')}
                    className="accent-pink-600"
                  />
                </div>
                <p className="text-[11px] text-slate-700 font-medium">
                  100% anonymous to the creator. Responder name is compulsory for safety & anti-harassment purposes, visible exclusively to administrators in the Admin Panel.
                </p>
              </label>

              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  privacyMode === 'mode_b'
                    ? 'border-purple-500 bg-purple-100/70 ring-2 ring-purple-400'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-purple-700">Mode B: Supervised Moderation</span>
                  <input
                    type="radio"
                    name="privacy_mode"
                    checked={privacyMode === 'mode_b'}
                    onChange={() => setPrivacyMode('mode_b')}
                    className="accent-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-700 font-medium">
                  Anonymous to the public creator. Verified responder name is audited in the platform admin panel for user safety.
                </p>
              </label>
            </div>
          </div>
        )}

        {/* QUIZ BUILDER */}
        {type === 'quiz' && (
          <div className="space-y-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-sm text-slate-900">
                  Questions ({questions.length} / 30)
                </h3>
                <p className="text-[11px] text-slate-700 font-bold">
                  Select the radio button next to the correct answer. The key stays completely hidden on our server.
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-5">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-xs text-purple-700">
                      Question #{qIdx + 1}
                    </span>
                    {questions.length > 3 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        className="p-1 rounded text-slate-600 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={q.question_text}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder="e.g. What is my secret talent?"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                  />

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-black text-slate-800">
                      Answer Choices (Pick the correct one):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-xl border-2 text-xs transition-colors ${
                            q.correct_option_index === optIdx
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                              : 'border-slate-200 bg-white text-slate-900 font-semibold'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correct_option_index === optIdx}
                            onChange={() => setCorrectOption(qIdx, optIdx)}
                            className="accent-emerald-600 cursor-pointer"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="w-full bg-transparent text-xs text-slate-900 font-bold focus:outline-none placeholder:text-slate-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANONYMOUS QUESTIONS BUILDER */}
        {type === 'anonymous' && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-[#272542]">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                Questions ({questions.length})
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-[#272542] bg-slate-50/50 dark:bg-[#0E0D17] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-pink-500">
                      Question #{qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={q.question_text}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder="e.g. What is something you never had the courage to tell me?"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* THIS OR THAT POLL BUILDER */}
        {type === 'poll' && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-[#272542]">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              The Two Choices
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/30 space-y-2">
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Choice A
                </label>
                <input
                  type="text"
                  value={pollOptionA}
                  onChange={(e) => setPollOptionA(e.target.value)}
                  placeholder="e.g. Iced Matcha Latte 🍵"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#141324] border border-cyan-500/40 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/30 space-y-2">
                <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Choice B
                </label>
                <input
                  type="text"
                  value={pollOptionB}
                  onChange={(e) => setPollOptionB(e.target.value)}
                  placeholder="e.g. Cold Brew on Ice ☕"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#141324] border border-purple-500/40 text-slate-900 dark:text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-200 dark:border-[#272542] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#272542] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-white shadow-lg shadow-purple-600/20 hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{submitting ? 'Publishing...' : 'Publish Experience'}</span>
          </button>
        </div>
      </div>

      {/* Share Modal Trigger on Success */}
      {createdExperience && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            navigate(`/${createdExperience.type}/${createdExperience.slug}`);
          }}
          title={createdExperience.title}
          sharePath={`/${createdExperience.type}/${createdExperience.slug}`}
          experienceType={createdExperience.type}
        />
      )}
    </div>
  );
}
