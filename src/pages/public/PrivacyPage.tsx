import React from 'react';
import { Shield, Lock, Eye, AlertCircle } from 'lucide-react';
import { BRAND } from '../../config/brand';

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-2">
          <Shield className="w-4 h-4 text-pink-400" />
          <span>PRIVACY CHARTER</span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
          Privacy Policy & Anonymity Architecture
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Last Updated: October 2026 · {BRAND.poweredBy}
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] rounded-2xl p-6 sm:p-8 shadow-sm">
        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            1. Overview & Core Philosophy
          </h2>
          <p>
            {BRAND.name} ("we", "platform", "service"), backed by {BRAND.companyName}, is committed to transparent, ethical data practices. We believe social experiences must never rely on deceitful tracking, hidden fingerprinting, or deceptive promises of privacy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            2. Anonymous Response Modes Explained
          </h2>
          <p>
            When answering anonymous questions, we operate under two distinctly separated modes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>
              <strong className="text-white">Mode A (Anonymous to Creator, Disclosed to Platform):</strong> Responders may optionally provide a name solely for safety moderation. This identity is stored in an isolated structure that is <em>technically and logically inaccessible to the experience creator</em>. Only authorized administrators with recorded audit trails may inspect this data during investigations.
            </li>
            <li>
              <strong className="text-white">Mode B (Full Anonymity to Both Creator and Platform):</strong> Absolutely zero names, user IDs, or unnecessary telemetry are requested or stored. No fingerprinting techniques are ever employed to de-anonymize responders.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            3. Private Quiz Answer Keys
          </h2>
          <p>
            Correct answer keys created by users are stored securely in backend database tables protected by Row Level Security (RLS). Correct answers are never sent in public quiz payload responses and are only evaluated server-side when answers are submitted.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            4. Creator Data Access & Isolation
          </h2>
          <p>
            Creators are strictly scoped to viewing submissions, answer texts, and poll tallies belonging to their own experiences. Creators can never inspect other creators' private drafts or view responder identities from anonymous truth boxes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            5. Content Moderation & Audit Logging
          </h2>
          <p>
            All administrative actions, account suspensions, and content moderation steps are appended to an immutable audit trail with timestamp and reason to prevent arbitrary misuse of power.
          </p>
        </section>
      </div>
    </div>
  );
}
