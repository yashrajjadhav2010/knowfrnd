import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, Users, ArrowRight } from 'lucide-react';
import { BRAND } from '../../config/brand';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>{BRAND.poweredBy}</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Social Experiences Built for Honest Connections
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          {BRAND.name} was created to give friends a playful, safe space to test how well they know each other, share unfiltered thoughts, and spark unforgettable conversations.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            Server-Authoritative Truth
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            No faking scores or cheating quizzes. Answer keys are strictly protected on the backend, making your friend score cards genuinely accurate.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            Ethical Anonymity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We reject predatory deanonymization tactics. You choose between Mode A (platform-audited) and Mode B (100% zero-identity anonymity).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            Backed by Y Series
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Built as part of the Y Series consumer product collective, dedicated to creating next-generation digital experiences for the social web.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 to-pink-950/40 border border-purple-500/30 text-center space-y-4">
        <h2 className="font-heading font-bold text-xl text-white">
          Ready to test your friendships?
        </h2>
        <p className="text-xs text-purple-200/80 max-w-md mx-auto">
          Start with a quiz or open a truth box today. It's completely free.
        </p>
        <Link
          to="/create"
          className="inline-flex px-6 py-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all"
        >
          Create an Experience
        </Link>
      </div>
    </div>
  );
}
