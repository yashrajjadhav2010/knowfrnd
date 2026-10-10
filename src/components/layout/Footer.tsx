import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart } from 'lucide-react';
import { BRAND } from '../../config/brand';

export function Footer() {
  return (
    <footer className="border-t border-purple-200/60 bg-white/70 backdrop-blur-md transition-colors py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 p-[2px]">
                <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                </div>
              </div>
              <span className="font-heading font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                {BRAND.name}
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {BRAND.description}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3 h-3 text-pink-400" />
                {BRAND.poweredBy}
              </span>
            </div>
          </div>

          {/* Social Experiences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Experiences
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/create?type=quiz" className="hover:text-purple-500 transition-colors">
                  Know Your Friend Quiz
                </Link>
              </li>
              <li>
                <Link to="/create?type=anonymous" className="hover:text-purple-500 transition-colors">
                  Anonymous Answers Box
                </Link>
              </li>
              <li>
                <Link to="/create?type=poll" className="hover:text-purple-500 transition-colors">
                  This or That Polls
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-purple-500 transition-colors">
                  Trending Community VYBEs
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/about" className="hover:text-purple-500 transition-colors">
                  About & Mission
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-purple-500 transition-colors">
                  Creator Dashboard
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-rose-500 transition-colors flex items-center gap-1">
                  <Shield className="w-3 h-3 text-rose-500" />
                  Report Inappropriate Content
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/privacy" className="hover:text-purple-500 transition-colors">
                  Privacy Policy (Mode A & B)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-purple-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/community-guidelines" className="hover:text-purple-500 transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-[#272542]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
            <span aria-hidden="true" className="mx-1">·</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{BRAND.poweredBy}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Crafted for true social connections</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
