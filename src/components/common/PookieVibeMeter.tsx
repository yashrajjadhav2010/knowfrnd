import React, { useState } from 'react';
import { Sparkles, Heart, Share2, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../../lib/sound';
import { BRAND } from '../../config/brand';

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  tagline: string;
  color: string;
  bgActive: string;
}

const POOKIE_MOODS: MoodOption[] = [
  {
    id: 'pookie',
    emoji: '🎀',
    label: 'Coquette Pookie',
    tagline: 'Soft, cute & wearing pink bows today',
    color: 'text-pink-400',
    bgActive: 'border-pink-500 bg-pink-500/15 ring-2 ring-pink-500',
  },
  {
    id: 'caffeinated',
    emoji: '☕',
    label: 'Caffeinated Chaos',
    tagline: '3 iced matchas deep and ready to conquer',
    color: 'text-amber-400',
    bgActive: 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500',
  },
  {
    id: 'main_character',
    emoji: '💅',
    label: 'Main Character',
    tagline: 'The world is literally my music video',
    color: 'text-purple-400',
    bgActive: 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500',
  },
  {
    id: 'lover',
    emoji: '💖',
    label: 'Certified Softie',
    tagline: 'Falling in love with fictional characters & besties',
    color: 'text-rose-400',
    bgActive: 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500',
  },
  {
    id: 'cozy',
    emoji: '🧸',
    label: 'Bed Burrito',
    tagline: 'Do not disturb, wrapped in 4 fluffy blankets',
    color: 'text-cyan-400',
    bgActive: 'border-cyan-500 bg-cyan-500/15 ring-2 ring-cyan-500',
  },
  {
    id: 'boba',
    emoji: '🧋',
    label: 'Boba Desperate',
    tagline: 'Needs brown sugar pearls or will cry',
    color: 'text-emerald-400',
    bgActive: 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500',
  },
];

export function PookieVibeMeter() {
  const [selectedMood, setSelectedMood] = useState<string>('pookie');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [soundActive, setSoundActive] = useState(sounds.isEnabled());
  const [copiedVibe, setCopiedVibe] = useState(false);

  const handleSelectMood = (mood: MoodOption) => {
    setSelectedMood(mood.id);
    sounds.playPop();

    // Spawn cute floating particles
    const newParticle = {
      id: Date.now() + Math.random(),
      emoji: mood.emoji,
      x: Math.random() * 80 + 10,
    };
    setFloatingEmojis((prev) => [...prev.slice(-6), newParticle]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1500);
  };

  const handleShareVibe = async () => {
    sounds.playSparkle();
    const active = POOKIE_MOODS.find((m) => m.id === selectedMood) || POOKIE_MOODS[0];
    const text = `Today my official vibe is ${active.emoji} ${active.label}! ("${active.tagline}"). Check your pookie vibe on ${BRAND.name}: ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedVibe(true);
      setTimeout(() => setCopiedVibe(false), 2500);
    } catch {}
  };

  const current = POOKIE_MOODS.find((m) => m.id === selectedMood) || POOKIE_MOODS[0];

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-pink-50/70 to-purple-50/80 border border-pink-200/80 shadow-2xl shadow-pink-500/10 backdrop-blur-xl overflow-hidden text-slate-800">
      {/* Background ambient cute glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Emojis Animation Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map((item) => (
          <span
            key={item.id}
            className="absolute text-2xl animate-float-cute"
            style={{ left: `${item.x}%`, bottom: '20px' }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-pink-200/60 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎀</span>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-1.5">
              <span>Daily Pookie Mood Check</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 font-bold border border-pink-300">
                LIVE
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Tap how you're feeling right now & see your vibe
            </p>
          </div>
        </div>

        {/* Audio Effects Toggle */}
        <button
          onClick={() => setSoundActive(sounds.toggleSound())}
          className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 transition-colors flex items-center gap-1 text-xs"
          title="Toggle cute sound effects"
        >
          {soundActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
          <span className="text-[10px] hidden sm:inline">{soundActive ? 'SFX On' : 'Muted'}</span>
        </button>
      </div>

      {/* Mood Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {POOKIE_MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleSelectMood(mood)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 group relative ${
                isSelected
                  ? mood.bgActive
                  : 'border-purple-100 bg-white hover:border-pink-300 hover:shadow-md hover:scale-[1.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl transition-transform group-hover:scale-125">
                  {mood.emoji}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                )}
              </div>
              <div className="font-heading font-bold text-xs text-slate-900">
                {mood.label}
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {mood.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Mood Showcase Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-cyan-500/15 border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-pink-300 flex items-center justify-center text-xl shrink-0 shadow-sm">
            {current.emoji}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Current Vibe: {current.label}</span>
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
            </div>
            <p className="text-[11px] text-slate-600">
              "{current.tagline}"
            </p>
          </div>
        </div>

        <button
          onClick={handleShareVibe}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedVibe ? 'Copied to Clipboard! ✨' : 'Share My Vibe'}</span>
        </button>
      </div>
    </div>
  );
}
