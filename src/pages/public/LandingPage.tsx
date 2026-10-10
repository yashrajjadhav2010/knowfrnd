import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  HelpCircle, 
  MessageSquare, 
  Vote, 
  ArrowRight, 
  Share2, 
  ShieldCheck, 
  Heart, 
  Lock, 
  Users, 
  ChevronRight,
  TrendingUp,
  Award,
  Wand2
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import { api } from '../../lib/api';
import { PookieVibeMeter } from '../../components/common/PookieVibeMeter';
import { PookieFortuneCookie } from '../../components/common/PookieFortuneCookie';
import { PookieNameGenerator } from '../../components/common/PookieNameGenerator';
import { KawaiiBear, CloudDecoration, GinghamRibbon } from '../../components/common/KawaiiElements';

export function LandingPage() {
  const [popularExperiences, setPopularExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExperiences()
      .then((res) => setPopularExperiences(res.experiences || []))
      .catch((err) => console.error('Failed to load experiences:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Whimsical Floating Cloud Accents */}
      <CloudDecoration className="absolute top-12 left-6 w-32 md:w-44 opacity-80 animate-pulse-soft hidden sm:block" />
      <CloudDecoration className="absolute top-28 right-8 w-28 md:w-40 opacity-75 animate-pulse-soft" />
      <CloudDecoration className="absolute top-[480px] left-12 w-28 opacity-60 hidden md:block" />

      {/* HERO SECTION - SKY BLUE PASTEL, HANGING SIGN, KAWAII BEAR */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
        {/* Soft Sky & Peach Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-tr from-sky-200/50 via-pink-200/40 to-yellow-100/40 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Cute Gingham Hanging Badge / Kicker */}
              <div className="flex flex-col items-center lg:items-start">
                <GinghamRibbon title="KNOW YOUR FRIEND'S QUIZ" />
              </div>

              {/* Primary Headline with playful cute aesthetics */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
                How well do your besties{' '}
                <span className="bg-gradient-to-r from-sky-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                  actually know you?
                </span>{' '}
                🎀
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Create cute quizzes, share your link with friends, collect honest answers, and see who takes 1st place on your friend leaderboard!
              </p>

              {/* CTAs - Big, rounded, cheerful buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/create?type=quiz"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-sky-400/35 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer border-2 border-white"
                >
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                  <span>Create Your Quiz (100% Free) 🎀</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/explore"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm border-2 border-sky-300 bg-white/95 text-sky-800 hover:bg-sky-50 hover:border-sky-400 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Quizzes & Polls</span>
                  <ChevronRight className="w-4 h-4 text-sky-500" />
                </Link>
              </div>

              {/* Micro Proof Badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 text-xs text-slate-700 font-bold">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border-2 border-emerald-300 text-emerald-800 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>100% Free & Unlimited</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border-2 border-sky-300 text-sky-800 shadow-sm">
                  <Lock className="w-4 h-4 text-sky-500" />
                  <span>Private Answers</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border-2 border-pink-300 text-pink-700 shadow-sm">
                  <Share2 className="w-4 h-4 text-pink-500" />
                  <span>Instant WhatsApp Link</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Kawaii Hanging Board */}
            <div className="lg:col-span-5 relative">
              {/* Mascot Peeking Over The Hanging Sign */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20">
                <KawaiiBear className="w-28 h-28 sm:w-32 sm:h-32" />
              </div>

              {/* Main Hanging Card */}
              <div className="relative pt-10">
                {/* Hanging Pins and Strings */}
                <div className="absolute top-2 left-12 w-1.5 h-10 bg-sky-300 rounded-full" />
                <div className="absolute top-2 right-12 w-1.5 h-10 bg-sky-300 rounded-full" />
                <div className="absolute -top-1 left-[44px] w-4 h-4 rounded-full bg-pink-400 border-2 border-white shadow-sm" />
                <div className="absolute -top-1 right-[44px] w-4 h-4 rounded-full bg-pink-400 border-2 border-white shadow-sm" />

                {/* The Kawaii Dashed Border Signboard */}
                <div className="kawaii-card p-6 sm:p-7 relative z-10 text-center space-y-4">
                  <div className="inline-block px-4 py-1 rounded-full bg-sky-100 text-sky-700 font-extrabold text-[11px] tracking-wider uppercase border border-sky-200">
                    QUESTION 1 OF 5 ✨
                  </div>

                  <h3 className="font-heading font-black text-xl text-slate-800 leading-snug">
                    "If I could only eat one food for the rest of my life, what is it?" 🍓
                  </h3>

                  {/* Four cute choices matching user reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-left">
                    <div className="p-3 rounded-2xl border-2 border-sky-400 bg-sky-50/90 text-xs font-bold text-sky-900 flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.02] transition-transform">
                      <span>1. Cheesy Pizza 🍕</span>
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                    </div>

                    <div className="p-3 rounded-2xl border-2 border-pink-300 bg-pink-50/80 text-xs font-bold text-pink-900 flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.02] transition-transform">
                      <span>2. Spicy Ramen 🍜</span>
                      <span className="w-2 h-2 rounded-full bg-pink-400" />
                    </div>

                    <div className="p-3 rounded-2xl border-2 border-amber-300 bg-amber-50/80 text-xs font-bold text-amber-900 flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.02] transition-transform">
                      <span>3. Strawberry Bingsu 🍓</span>
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>

                    <div className="p-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 text-xs font-bold text-emerald-900 flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.02] transition-transform">
                      <span>4. French Fries 🍟</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  </div>

                  {/* Quick Play Input Simulator */}
                  <div className="pt-3 border-t-2 border-dashed border-sky-200 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="Your Name: e.g. Alex"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-sky-50/60 border-2 border-sky-200 text-slate-800 font-bold select-none"
                    />
                    <Link
                      to="/create?type=quiz"
                      className="px-4 py-2 rounded-xl text-xs font-black bg-sky-500 text-white shadow-sm shrink-0 hover:bg-sky-600 transition-colors cursor-pointer"
                    >
                      Play / Make
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POOKIE ELEMENT 1: DAILY MOOD VIBE CHECK */}
      <section className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <PookieVibeMeter />
      </section>

      {/* POOKIE ELEMENT 2 & 3: FORTUNE COOKIE & AESTHETIC PASS GENERATOR */}
      <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PookieFortuneCookie />
          <PookieNameGenerator />
        </div>
      </section>

      {/* HOW IT WORKS - COLORFUL & SIMPLE */}
      <section className="py-16 border-y-2 border-purple-100 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-2xl mb-1 inline-block">🌸</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              How {BRAND.name} Works
            </h2>
            <p className="text-sm text-slate-600">
              Four simple, fun steps to spark honest laughter, secret confessions, and friendly rivalries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Experience',
                desc: 'Pick between Know Your Friend Quiz, Anonymous Question Box, or This or That Polls.',
                icon: HelpCircle,
                badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
                emoji: '🎀',
              },
              {
                step: '02',
                title: 'Customize Questions',
                desc: 'Add between 3 to 30 personalized questions, pick correct answers, and set your theme.',
                icon: Sparkles,
                badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
                emoji: '✨',
              },
              {
                step: '03',
                title: 'Share Your Link',
                desc: 'Drop your custom link into WhatsApp, Instagram Stories, Snapchat, or group chats.',
                icon: Share2,
                badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
                emoji: '💌',
              },
              {
                step: '04',
                title: 'Discover Responses',
                desc: 'Watch real-time submissions roll in, check leaderboards, and share your score cards.',
                icon: Award,
                badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
                emoji: '🏆',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-6 rounded-3xl bg-white border-2 border-purple-100 shadow-sm relative group hover:border-pink-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${s.badgeColor}`}>
                      Step {s.step}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* POPULAR EXPERIENCES FROM REAL DATABASE (ZERO DUMMY DATA) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-pink-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>COMMUNITY EXPERIENCES</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                Live Experiences 🎀
              </h2>
            </div>
            <Link
              to="/explore"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>View All Experiences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-3xl bg-pink-100/60 border border-pink-200" />
              ))}
            </div>
          ) : popularExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularExperiences.slice(0, 3).map((exp) => (
                <div
                  key={exp.id}
                  className="p-6 rounded-3xl bg-white border-2 border-purple-100 hover:border-pink-300 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-700 font-bold mb-2">
                      <span className="uppercase font-black tracking-wider text-pink-600">
                        {exp.type}
                      </span>
                      <span className="font-semibold text-slate-700">{exp.response_count} responses</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-base text-slate-900 line-clamp-1 mb-1">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2">
                      {exp.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-700 font-bold">
                      by {exp.creator?.public_display_name || 'Creator'}
                    </span>
                    <Link
                      to={`/${exp.type}/${exp.slug}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm hover:opacity-95"
                    >
                      {exp.type === 'poll' ? 'Vote' : 'Play'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* REAL EMPTY STATE - NO DUMMY FAKE CARDS - BRIGHT, COLORFUL, DELIGHTFUL */
            <div className="text-center py-12 px-6 rounded-3xl bg-gradient-to-r from-pink-100 via-purple-100 to-cyan-100 border-2 border-pink-200 shadow-md max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white text-pink-600 flex items-center justify-center mx-auto shadow-sm text-2xl">
                🎀
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Ready To Start The First VYBE? ✨
                </h3>
                <p className="text-xs text-slate-700 max-w-sm mx-auto mt-1">
                  There are no experiences created yet. Build a quiz, secret truth box, or poll in 60 seconds and share the link with your besties!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link
                  to="/create?type=quiz"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-pink-500/20 hover:opacity-95 hover:scale-105 transition-all"
                >
                  Create Bestie Quiz 🎀
                </Link>
                <Link
                  to="/create?type=anonymous"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-pink-600 border border-pink-300 hover:bg-pink-50 shadow-sm transition-all"
                >
                  Truth Box 💌
                </Link>
                <Link
                  to="/create?type=poll"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-cyan-700 border border-cyan-300 hover:bg-cyan-50 shadow-sm transition-all"
                >
                  This or That 🧋
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FINAL CALL TO ACTION - VIBRANT & BRIGHT */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full blur-3xl pointer-events-none" />

            <h2 className="font-heading text-3xl sm:text-4xl font-black text-white mb-4">
              Ready To Put Your Friendships To The Test? 🎀
            </h2>
            <p className="text-sm sm:text-base text-purple-100 max-w-xl mx-auto mb-8 font-medium">
              Build your customized quiz in less than 2 minutes, drop it into your favorite group chat, and find out who truly knows your secrets.
            </p>

            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm bg-white text-purple-700 shadow-xl shadow-purple-950/20 hover:bg-purple-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Get Started Now</span>
            </Link>

            <div className="mt-6 text-xs text-purple-100 font-bold">
              {BRAND.poweredBy} · Free & Open to All Friends
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
