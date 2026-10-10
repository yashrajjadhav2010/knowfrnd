import React, { useState } from 'react';
import { Heart, Sparkles, MessageCircle, PlusCircle, ArrowUp } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { Link } from 'react-router-dom';

const CUTE_REACTIONS = [
  { emoji: '🎀', label: 'Bow' },
  { emoji: '💖', label: 'Sparkle Heart' },
  { emoji: '🍓', label: 'Strawberry' },
  { emoji: '🧋', label: 'Boba' },
  { emoji: '✨', label: 'Sparkles' },
  { emoji: '🧸', label: 'Teddy' },
];

export function PookieFloatingBar() {
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const triggerReaction = (emoji: string, label: string) => {
    sounds.playPop();

    // Spawn 2-3 particles
    const p1 = { id: Date.now() + Math.random(), emoji, x: Math.random() * 60 + 20 };
    const p2 = { id: Date.now() + Math.random() + 1, emoji, x: Math.random() * 60 + 20 };
    setFloatingParticles((prev) => [...prev.slice(-8), p1, p2]);

    setToastMessage(`Sent ${label} ${emoji}!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 1800);

    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== p1.id && p.id !== p2.id));
    }, 1500);
  };

  const scrollToTop = () => {
    sounds.playCuteTap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Particles Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingParticles.map((p) => (
          <span
            key={p.id}
            className="absolute text-2xl sm:text-3xl animate-float-cute"
            style={{ left: `${p.x}%`, bottom: '70px' }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-pink-500/30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
        {/* Expanded Reaction Buttons Pill */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 border-2 border-pink-200 shadow-xl shadow-pink-500/15 backdrop-blur-md">
          {CUTE_REACTIONS.map((item) => (
            <button
              key={item.emoji}
              onClick={() => triggerReaction(item.emoji, item.label)}
              title={`Tap to send ${item.label}`}
              className="w-8 h-8 rounded-full hover:bg-pink-100 flex items-center justify-center text-base transition-transform hover:scale-125 active:scale-95 cursor-pointer"
            >
              {item.emoji}
            </button>
          ))}

          <div className="w-[1px] h-5 bg-pink-200 mx-0.5" />

          {/* Quick Create CTA button */}
          <Link
            to="/create"
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:opacity-95 transition-all hover:scale-105"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Quiz</span>
          </Link>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            title="Scroll to top"
            className="w-7 h-7 rounded-full text-slate-400 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
