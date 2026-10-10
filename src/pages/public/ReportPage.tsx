import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { BRAND } from '../../config/brand';

export function ReportPage() {
  const [targetType, setTargetType] = useState('experience');
  const [targetId, setTargetId] = useState('');
  const [category, setCategory] = useState('harassment');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      setError('Please provide a detailed explanation of the issue.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitReport({
        target_type: targetType,
        target_id: targetId.trim() || 'unspecified_url',
        category,
        description: description.trim(),
        reporter_contact: contact.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 space-y-1">
        <h1 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
          Report Content or User
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Help keep {BRAND.name} safe. Submissions are dispatched directly to our trust and safety moderators.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm">
        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-heading font-bold text-lg text-white">Report Logged</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Thank you for keeping {BRAND.name} safe. Our safety team is investigating this submission.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Content Link or Identifier
              </label>
              <input
                type="text"
                required
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="Paste the quiz, truth box, or poll link..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Violation Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              >
                <option value="harassment">Harassment or Bullying</option>
                <option value="inappropriate">Inappropriate or Explicit Content</option>
                <option value="privacy_violation">Privacy Violation / Doxxing</option>
                <option value="impersonation">Impersonation</option>
                <option value="spam">Spam or Abuse</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Description
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe why this content violates community guidelines..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Email (Optional)
              </label>
              <input
                type="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Incident Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
