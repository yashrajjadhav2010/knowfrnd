import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowRight } from 'lucide-react';
import { BRAND } from '../../config/brand';

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="text-7xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent font-heading">
        404
      </div>

      <div className="space-y-2">
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
          VYBE Not Found
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The quiz, truth box, or page you're searching for may have been archived or moved.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
