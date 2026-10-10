import React from 'react';
import { HeartHandshake, Shield, Sparkles } from 'lucide-react';
import { BRAND } from '../../config/brand';

export function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-2">
          <HeartHandshake className="w-4 h-4 text-pink-400" />
          <span>RESPECT & SAFETY</span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
          Community Guidelines
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Keeping {BRAND.name} safe, fun, and empowering for everyone.
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] rounded-2xl p-6 sm:p-8 shadow-sm">
        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            1. Zero Tolerance for Bullying & Harassment
          </h2>
          <p>
            Anonymity is a superpower for honesty, not a weapon for cruelty. We maintain a strict zero-tolerance policy against targeted harassment, slurs, hateful speech, and unwanted sexual content.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            2. No Doxxing or Private Information
          </h2>
          <p>
            Never post telephone numbers, residential addresses, real-world locations, or private communications without consent. Any experience violating this will be immediately removed and reported.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            3. Reporting & Moderation
          </h2>
          <p>
            Every experience features a dedicated "Report" action. Our moderation team reviews flagged records and acts swiftly to maintain a positive social atmosphere.
          </p>
        </section>
      </div>
    </div>
  );
}
