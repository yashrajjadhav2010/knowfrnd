import React, { useState } from 'react';
import { Sparkles, Heart, RefreshCw, Copy, Check, Share2 } from 'lucide-react';
import { sounds } from '../../lib/sound';
import confetti from 'canvas-confetti';

interface FortuneItem {
  fortune: string;
  category: 'Affirmation' | 'Friendship Dare' | 'Secret Vibe' | 'Lucky Sign';
  luckyColor: string;
  emoji: string;
}

const FORTUNES: FortuneItem[] = [
  {
    fortune: 'Your bestie actually likes your unhinged 3-minute voice notes more than anyone else in this world 💖',
    category: 'Affirmation',
    luckyColor: 'Strawberry Pink',
    emoji: '🍓',
  },
  {
    fortune: 'Dare: Send a selfie with zero filter to your 2nd most recent chat with the caption "official pookie alert" 🎀',
    category: 'Friendship Dare',
    luckyColor: 'Pastel Lilac',
    emoji: '🎀',
  },
  {
    fortune: 'You will unexpectedly be treated to an iced drink within the next 48 hours. Claim it! 🧋',
    category: 'Lucky Sign',
    luckyColor: 'Matcha Green',
    emoji: '🧋',
  },
  {
    fortune: 'Someone secretly adores how deeply you care about the smallest funny memories you share ✨',
    category: 'Secret Vibe',
    luckyColor: 'Golden Peach',
    emoji: '✨',
  },
  {
    fortune: 'Dare: Ask your closest friend: "If our friendship was a movie genre, what would it be?" 🎬',
    category: 'Friendship Dare',
    luckyColor: 'Cotton Candy Blue',
    emoji: '💌',
  },
  {
    fortune: 'Your aura is giving main character energy and your friends feel protected and hyped around you 💅',
    category: 'Affirmation',
    luckyColor: 'Neon Violet',
    emoji: '💅',
  },
  {
    fortune: 'An overdue cozy gossip session with blankets and sweet snacks is calling your name tonight 🧸',
    category: 'Lucky Sign',
    luckyColor: 'Warm Caramel',
    emoji: '🧸',
  },
  {
    fortune: 'Dare: Text your group chat: "Quick question: what is my most iconic trait?" and wait 5 minutes 🌸',
    category: 'Friendship Dare',
    luckyColor: 'Cherry Blossom Pink',
    emoji: '🌸',
  },
];

export function PookieFortuneCookie() {
  const [isCracked, setIsCracked] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<FortuneItem>(FORTUNES[0]);
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const crackCookie = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    sounds.playCookieCrunch();

    // Select random fortune
    const random = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    setCurrentFortune(random);
    setIsCracked(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F472B6', '#C084FC', '#FDE047', '#38BDF8'],
      });
    } catch {}

    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  const resetCookie = () => {
    sounds.playCuteTap();
    setIsCracked(false);
    setCopied(false);
  };

  const copyFortune = async () => {
    sounds.playCuteTap();
    const text = `🥠 My Pookie Fortune of the day: "${currentFortune.fortune}" (Lucky Color: ${currentFortune.luckyColor}) ✨`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50/90 via-pink-50/80 to-purple-50/90 border-2 border-pink-200/90 shadow-xl shadow-pink-500/10 overflow-hidden text-slate-800">
      {/* Decorative Pastel Glows */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-yellow-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-pink-200/70 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-bounce">🥠</span>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-1.5">
              <span>Daily Friendship Fortune Cookie</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold uppercase">
                Crack Me!
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              Tap the cookie to unlock your daily secret vibe or bestie dare
            </p>
          </div>
        </div>

        {isCracked && (
          <button
            onClick={resetCookie}
            className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 hover:border-pink-300 text-pink-600 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 hover:scale-105"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Crack Another</span>
          </button>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="flex flex-col items-center justify-center py-4">
        {!isCracked ? (
          <div className="text-center space-y-4">
            <button
              onClick={crackCookie}
              className={`group relative p-8 rounded-3xl bg-white/90 border-2 border-dashed border-amber-300 hover:border-pink-400 transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer max-w-sm mx-auto flex flex-col items-center justify-center ${
                isAnimating ? 'animate-wiggle' : ''
              }`}
            >
              <div className="text-7xl sm:text-8xl transition-transform group-hover:scale-110 drop-shadow-md select-none">
                🥠
              </div>
              <div className="mt-4 font-heading font-extrabold text-sm text-pink-600 group-hover:text-purple-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>TAP TO CRACK OPEN</span>
                <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                A wholesome fortune or spicy bestie dare awaits you
              </p>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Cracked Cookie & Slip */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-pink-300/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 font-extrabold text-[10px] tracking-wide uppercase flex items-center gap-1">
                  <span>{currentFortune.emoji}</span>
                  <span>{currentFortune.category}</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Lucky Color: <strong className="text-pink-600">{currentFortune.luckyColor}</strong>
                </span>
              </div>

              {/* Fortune Text Slip */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 via-purple-50 to-amber-50 border border-pink-200 text-center font-heading font-bold text-base sm:text-lg text-slate-900 leading-relaxed shadow-inner">
                "{currentFortune.fortune}"
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={copyFortune}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-100 hover:bg-pink-200 text-pink-700 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard! ✨' : 'Copy Fortune'}</span>
                </button>

                <button
                  onClick={crackCookie}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Crack New Cookie</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
