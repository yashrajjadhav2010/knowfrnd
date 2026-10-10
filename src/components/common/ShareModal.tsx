import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Send, 
  Sparkles, 
  Smartphone,
  ExternalLink 
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import { sounds } from '../../lib/sound';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sharePath: string; // e.g. /quiz/how-well-do-you-know-kairo
  experienceType?: 'quiz' | 'anonymous' | 'poll';
  resultScore?: {
    percentage: number;
    score: number;
    total: number;
    badge: string;
    sticker?: string;
  };
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  sharePath,
  experienceType = 'quiz',
  resultScore,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Compute full share URL
  const origin = window.location.origin;
  const fullUrl = `${origin}${sharePath}`;

  const shareText = resultScore
    ? `I just scored ${resultScore.percentage}% on "${title}"! Can you beat my score? Check it out on ${BRAND.name}:`
    : `Hey! Take my "${title}" on ${BRAND.name}:`;

  const handleCopy = async () => {
    sounds.playPop();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | ${BRAND.name}`,
          text: shareText,
          url: fullUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${fullUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#131221] border border-[#272542] shadow-2xl p-6 text-white overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#272542]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Share Your VYBE</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shareable Card Snapshot Preview */}
        <div className="my-5 p-4 rounded-xl bg-gradient-to-br from-purple-950/60 via-[#18172b] to-[#121124] border border-purple-500/30 relative shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-purple-300 mb-2">
            <span className="font-semibold uppercase tracking-wider">{BRAND.name} EXPERIENCE</span>
            <span>{BRAND.poweredBy}</span>
          </div>

          <h4 className="font-heading font-bold text-base text-white line-clamp-1 mb-1">
            {title}
          </h4>

          {resultScore ? (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-purple-500/20">
              <div className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                {resultScore.percentage}%
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white">{resultScore.badge}</div>
                <div className="text-slate-400 text-[10px]">
                  {resultScore.score} of {resultScore.total} questions correct
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1">
              Tap to answer and see how well you rank among friends!
            </p>
          )}
        </div>

        {/* Copy Link Input */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-medium text-slate-300">Direct Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={fullUrl}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#0B0B12] border border-[#272542] text-slate-200 focus:outline-none focus:border-purple-500 select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Buttons Grid */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-300">Share to Socials</div>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#1d3d29] hover:bg-[#255236] text-emerald-300 text-xs font-semibold transition-colors border border-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#192233] hover:bg-[#202f48] text-cyan-300 text-xs font-semibold transition-colors border border-cyan-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Twitter / X</span>
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#1b253b] hover:bg-[#243353] text-blue-300 text-xs font-semibold transition-colors border border-blue-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-white/5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>More Share Options</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
