import React, { useState } from 'react';
import { Sparkles, Heart, Award, Copy, Check, ArrowRight, Wand2 } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface VibeOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bgGrad: string;
  titles: string[];
  mottos: string[];
}

const AESTHETICS: VibeOption[] = [
  {
    id: 'bow',
    label: 'Coquette Bow',
    emoji: '🎀',
    color: 'text-pink-600',
    bgGrad: 'from-pink-100 via-rose-50 to-purple-100 border-pink-300',
    titles: [
      'Her Royal Softness & Ribbon Queen',
      'Certified Delicate Chaos Master',
      'First-Class Bow Ambassador',
    ],
    mottos: [
      'Everything in life can be resolved with a silk ribbon and iced tea.',
      'Soft on the outside, chaotic meme sender on the inside.',
    ],
  },
  {
    id: 'matcha',
    label: 'Strawberry Matcha',
    emoji: '🍓',
    color: 'text-rose-600',
    bgGrad: 'from-rose-100 via-pink-50 to-emerald-100 border-rose-300',
    titles: [
      'High-Priestess of Iced Oat Milk Lattes',
      'Supreme Berry Connoisseur',
      'The Sweetest Menace in the Group Chat',
    ],
    mottos: [
      'My patience lasts exactly as long as my iced drink stays cold.',
      'Fueled by sweet strawberries and fierce friendship loyalty.',
    ],
  },
  {
    id: 'cloud',
    label: 'Cozy Cloud Bear',
    emoji: '🧸',
    color: 'text-amber-600',
    bgGrad: 'from-amber-100 via-orange-50 to-pink-100 border-amber-300',
    titles: [
      'Grand Commander of Fluffy Blankets',
      'Professional Nap Enthusiast',
      'Bed Burrito Extraordinaire',
    ],
    mottos: [
      'Cancel the plans, warm up the cookies, and put on the comfort show.',
      'I will fight for my besties, but first let me take an 8-hour nap.',
    ],
  },
  {
    id: 'glitter',
    label: 'Main Character Glitter',
    emoji: '💅',
    color: 'text-purple-600',
    bgGrad: 'from-purple-100 via-fuchsia-50 to-pink-100 border-purple-300',
    titles: [
      'Dramatic Monologue Specialist',
      'CEO of Iconic Entrances',
      'The Sparkliest Problem You Will Ever Love',
    ],
    mottos: [
      'Life is a runway and the hallway to my fridge is the main stage.',
      'Never dim your sparkle just because others forgot their sunglasses.',
    ],
  },
  {
    id: 'boba',
    label: 'Boba Gamer',
    emoji: '🧋',
    color: 'text-cyan-600',
    bgGrad: 'from-cyan-100 via-teal-50 to-purple-100 border-cyan-300',
    titles: [
      'Brown Sugar Pearls Champion',
      'Chaotic Co-op Carry',
      'Late Night Discord Philosopher',
    ],
    mottos: [
      'Tapioca balls are scientifically proven to heal friendship drama.',
      'Just one more round, I swear (it is now 4:18 AM).',
    ],
  },
];

export function PookieNameGenerator() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('bow');
  const [generatedCard, setGeneratedCard] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'My Pookie';
    sounds.playSparkle();

    const vibe = AESTHETICS.find((v) => v.id === selectedVibe) || AESTHETICS[0];
    const randomTitle = vibe.titles[Math.floor(Math.random() * vibe.titles.length)];
    const randomMotto = vibe.mottos[Math.floor(Math.random() * vibe.mottos.length)];

    // Generate cute pseudo-stats
    const sweetness = Math.floor(Math.random() * 15) + 85; // 85-99%
    const chaos = Math.floor(Math.random() * 25) + 75; // 75-99%
    const loyalty = 100;
    const snackDesire = Math.floor(Math.random() * 10) + 90; // 90-99%

    setGeneratedCard({
      name: cleanName,
      vibe,
      title: `${cleanName} — ${randomTitle}`,
      motto: randomMotto,
      stats: { sweetness, chaos, loyalty, snackDesire },
    });

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#F472B6', '#C084FC', '#38BDF8'],
      });
    } catch {}
  };

  const handleCopyCard = async () => {
    if (!generatedCard) return;
    sounds.playCuteTap();
    const text = `🎀 Official Pookie Pass for ${generatedCard.name}!\n✨ Title: ${generatedCard.title}\n💬 Motto: "${generatedCard.motto}"\n📊 Stats: Sweetness ${generatedCard.stats.sweetness}% | Chaos ${generatedCard.stats.chaos}% | Loyalty ${generatedCard.stats.loyalty}% | Snack Desire ${generatedCard.stats.snackDesire}%\nCreate your friend quiz on VYBE!`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleMakeQuizWithVibe = () => {
    sounds.playCuteTap();
    navigate(`/create?type=quiz&title=${encodeURIComponent(`How Well Do You Know ${generatedCard.name}? 🎀`)}`);
  };

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-pink-50/90 via-purple-50/80 to-cyan-50/90 border-2 border-purple-200/90 shadow-xl shadow-purple-500/10 overflow-hidden text-slate-800">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-200/70 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-spin">✨</span>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-1.5">
              <span>Pookie Aesthetic Pass Generator</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold uppercase">
                Free & Cute
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              Type your name or your bestie's nickname to claim an official aesthetic badge
            </p>
          </div>
        </div>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerate} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Name or Bestie's Nickname 💖
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mia, Bubbles, Alex, Chloe..."
              maxLength={25}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-slate-400 shadow-sm"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pick Your Core Aesthetic 🎀
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {AESTHETICS.map((aes) => {
                const isSelected = selectedVibe === aes.id;
                return (
                  <button
                    key={aes.id}
                    type="button"
                    onClick={() => {
                      sounds.playCuteTap();
                      setSelectedVibe(aes.id);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-100/80 shadow-sm scale-105 ring-2 ring-purple-400'
                        : 'border-slate-200 bg-white hover:border-pink-300'
                    }`}
                  >
                    <div className="text-xl mb-0.5">{aes.emoji}</div>
                    <div className="text-[10px] font-bold text-slate-800 truncate">
                      {aes.label.split(' ')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-white shadow-md shadow-purple-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Generate My Pookie Pass ✨</span>
        </button>
      </form>

      {/* Generated Result Card */}
      {generatedCard && (
        <div className={`p-6 rounded-2xl bg-gradient-to-br ${generatedCard.vibe.bgGrad} border-2 shadow-lg animate-in fade-in zoom-in-95 duration-300 relative`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-pink-300 text-[10px] font-extrabold text-pink-700 uppercase tracking-wider">
                <span>{generatedCard.vibe.emoji}</span>
                <span>OFFICIAL POOKIE IDENTITY PASS</span>
              </div>
              <h4 className="font-heading font-black text-xl sm:text-2xl text-slate-900 mt-2">
                {generatedCard.title}
              </h4>
              <p className="text-xs text-slate-700 italic max-w-lg mt-1 font-medium">
                "{generatedCard.motto}"
              </p>
            </div>

            <div className="text-4xl sm:text-5xl shrink-0 p-3 bg-white/90 rounded-2xl border border-pink-200 shadow-sm self-start">
              {generatedCard.vibe.emoji}
            </div>
          </div>

          {/* Stat Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-pink-200/80">
            <div className="p-2.5 rounded-xl bg-white/90 border border-pink-200">
              <div className="text-[10px] text-slate-800 font-black">Sweetness</div>
              <div className="font-heading font-black text-sm text-pink-700">{generatedCard.stats.sweetness}%</div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${generatedCard.stats.sweetness}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-purple-200">
              <div className="text-[10px] text-slate-800 font-black">Chaos Level</div>
              <div className="font-heading font-black text-sm text-purple-700">{generatedCard.stats.chaos}%</div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${generatedCard.stats.chaos}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-rose-200">
              <div className="text-[10px] text-slate-800 font-black">Bestie Loyalty</div>
              <div className="font-heading font-black text-sm text-rose-700">{generatedCard.stats.loyalty}%</div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${generatedCard.stats.loyalty}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-cyan-200">
              <div className="text-[10px] text-slate-800 font-black">Snack Affinity</div>
              <div className="font-heading font-black text-sm text-cyan-700">{generatedCard.stats.snackDesire}%</div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${generatedCard.stats.snackDesire}%` }} />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-5 pt-3 border-t border-pink-200/80 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopyCard}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 border border-pink-300 hover:bg-pink-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-pink-500" />}
              <span>{copied ? 'Copied Pookie Pass! ✨' : 'Copy Pass Text'}</span>
            </button>

            <button
              onClick={handleMakeQuizWithVibe}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <span>Turn into a Friend Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
