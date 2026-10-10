import React from 'react';
import { BRAND } from '../../config/brand';

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Effective October 2026 · {BRAND.poweredBy}
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] rounded-2xl p-6 sm:p-8 shadow-sm">
        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By creating an account, publishing a quiz, submitting an anonymous response, or voting on a poll on {BRAND.name}, you agree to abide by these Terms of Service and our Community Guidelines.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            2. Prohibited Conduct
          </h2>
          <p>
            You agree not to use {BRAND.name} to harass, bully, defame, impersonate, doxx, or threaten any individual. Content that violates our standards will be promptly unpublished, and violating accounts will be suspended.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            3. User-Generated Content
          </h2>
          <p>
            You retain ownership of questions and responses you post. By sharing experiences publicly, you grant {BRAND.name} a license to display, score, and format your content for platform participants.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            4. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that engage in spam, harassment, or attempts to circumvent server-side access controls.
          </p>
        </section>
      </div>
    </div>
  );
}
