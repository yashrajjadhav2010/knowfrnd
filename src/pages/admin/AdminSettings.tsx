import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { BRAND } from '../../config/brand';

export function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getAdminSettings()
      .then((res) => setSettings(res.settings || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: string, field: string) => {
    const updated = [...settings];
    const s = updated.find((item) => item.key === key);
    if (s && s.value) {
      s.value[field] = !s.value[field];
      setSettings(updated);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateAdminSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const general = settings.find((s) => s.key === 'general')?.value || {};
  const features = settings.find((s) => s.key === 'features')?.value || {};

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
          Platform Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage platform features, maintenance state, and default parameters.
        </p>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Platform settings updated and logged.</span>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm space-y-6 text-xs">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            General Branding
          </h3>
          <div>
            <label className="block text-slate-400 mb-1">Platform Brand Name</label>
            <input
              type="text"
              readOnly
              value={BRAND.name}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] text-slate-300 select-all"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Ecosystem Provider</label>
            <input
              type="text"
              readOnly
              value={BRAND.poweredBy}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] text-slate-300 select-all"
            />
          </div>
        </div>

        {/* Feature Flags */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#272542] space-y-3">
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            Feature Availability Flags
          </h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] cursor-pointer">
              <span>Enable Know Your Friend Quizzes</span>
              <input
                type="checkbox"
                checked={features.quizzes_enabled !== false}
                onChange={() => handleToggle('features', 'quizzes_enabled')}
                className="accent-purple-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] cursor-pointer">
              <span>Enable Anonymous Truth Boxes</span>
              <input
                type="checkbox"
                checked={features.anonymous_enabled !== false}
                onChange={() => handleToggle('features', 'anonymous_enabled')}
                className="accent-pink-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B0B12] border border-slate-200 dark:border-[#272542] cursor-pointer">
              <span>Enable This or That Polls</span>
              <input
                type="checkbox"
                checked={features.polls_enabled !== false}
                onChange={() => handleToggle('features', 'polls_enabled')}
                className="accent-cyan-400"
              />
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl font-semibold bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-1.5 shadow-md shadow-pink-600/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
