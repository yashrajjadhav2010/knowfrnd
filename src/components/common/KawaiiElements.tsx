import React from 'react';

export function KawaiiBear({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`relative select-none inline-block ${className}`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform hover:scale-105 duration-300"
      >
        {/* Soft Shadow below bear */}
        <ellipse cx="80" cy="148" rx="45" ry="8" fill="#BAE6FD" opacity="0.6" />

        {/* Left Ear */}
        <circle cx="44" cy="48" r="18" fill="#FDE047" stroke="#38BDF8" strokeWidth="4" />
        <circle cx="44" cy="48" r="9" fill="#F472B6" />

        {/* Right Ear */}
        <circle cx="116" cy="48" r="18" fill="#FDE047" stroke="#38BDF8" strokeWidth="4" />
        <circle cx="116" cy="48" r="9" fill="#F472B6" />

        {/* Tiny Pink Hair Ribbon on Right Ear */}
        <g transform="translate(108, 30)">
          <path d="M-6 4 C-12 -2, -14 10, -4 6 Z" fill="#F472B6" />
          <path d="M6 4 C12 -2, 14 10, 4 6 Z" fill="#F472B6" />
          <circle cx="0" cy="5" r="3.5" fill="#FDA4AF" />
        </g>

        {/* Bear Head Base */}
        <rect
          x="30"
          y="38"
          width="100"
          height="92"
          rx="46"
          fill="#FFFBEB"
          stroke="#38BDF8"
          strokeWidth="4.5"
        />

        {/* Cheeks - Soft Pink Blush */}
        <ellipse cx="48" cy="94" rx="8" ry="5.5" fill="#FDA4AF" opacity="0.85" />
        <ellipse cx="112" cy="94" rx="8" ry="5.5" fill="#FDA4AF" opacity="0.85" />

        {/* Eyes with Anime Sparkles */}
        {/* Left Eye */}
        <ellipse cx="58" cy="80" rx="6" ry="7.5" fill="#1E293B" />
        <circle cx="56" cy="77" r="2.5" fill="#FFFFFF" />
        <circle cx="60" cy="83" r="1.2" fill="#FFFFFF" />

        {/* Right Eye */}
        <ellipse cx="102" cy="80" rx="6" ry="7.5" fill="#1E293B" />
        <circle cx="100" cy="77" r="2.5" fill="#FFFFFF" />
        <circle cx="104" cy="83" r="1.2" fill="#FFFFFF" />

        {/* Cute Snout muzzle background */}
        <ellipse cx="80" cy="92" rx="16" ry="12" fill="#FFFFFF" />

        {/* Nose */}
        <ellipse cx="80" cy="88" rx="4.5" ry="3.5" fill="#F472B6" />

        {/* W-Shaped Kawaii Smile */}
        <path
          d="M74 94 C76 98, 79 98, 80 94 C81 98, 84 98, 86 94"
          stroke="#334155"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Little Paws peeking up */}
        <ellipse
          cx="42"
          cy="126"
          rx="10"
          ry="8"
          fill="#FFFBEB"
          stroke="#38BDF8"
          strokeWidth="3.5"
        />
        <ellipse
          cx="118"
          cy="126"
          rx="10"
          ry="8"
          fill="#FFFBEB"
          stroke="#38BDF8"
          strokeWidth="3.5"
        />
      </svg>
    </div>
  );
}

export function CloudDecoration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      <path
        d="M20 50 H80 A16 16 0 0 0 88 28 A20 20 0 0 0 54 18 A18 18 0 0 0 24 30 A16 16 0 0 0 20 50 Z"
        fill="#FFFFFF"
        opacity="0.9"
        filter="drop-shadow(0 4px 10px rgba(125, 211, 252, 0.25))"
      />
      {/* Kawaii Face on Cloud */}
      <circle cx="45" cy="34" r="1.8" fill="#38BDF8" />
      <circle cx="61" cy="34" r="1.8" fill="#38BDF8" />
      <path d="M51 38 C52.5 40 53.5 40 55 38" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="40" cy="36" rx="2" ry="1.2" fill="#F472B6" opacity="0.6" />
      <ellipse cx="66" cy="36" rx="2" ry="1.2" fill="#F472B6" opacity="0.6" />
    </svg>
  );
}

export function GinghamRibbon({ title = "KNOW YOUR FRIEND'S QUIZ" }: { title?: string }) {
  return (
    <div className="relative inline-flex items-center justify-center my-2">
      {/* Hanging Strings from top */}
      <div className="absolute -top-6 left-6 w-[2px] h-6 bg-sky-300"></div>
      <div className="absolute -top-6 right-6 w-[2px] h-6 bg-sky-300"></div>

      {/* Decorative Wooden/Pink Pin at top */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-pink-400 border-2 border-white shadow-sm z-10 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-pink-200"></div>
      </div>

      {/* Plaid / Gingham style Ribbon badge */}
      <div className="relative px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500 text-white font-black text-sm sm:text-base tracking-wider shadow-lg border-2 border-white flex items-center gap-2">
        <span className="text-yellow-300 text-sm">★</span>
        <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] uppercase tracking-wide">{title}</span>
        <span className="text-yellow-300 text-sm">★</span>
      </div>
    </div>
  );
}
