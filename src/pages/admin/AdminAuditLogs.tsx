import React, { useEffect, useState } from 'react';
import { ShieldAlert, Clock, Activity } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminAuditLogs()
      .then((res) => setLogs(res.audit_logs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
          Platform Security & Audit Trail
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Append-only immutable record of all administrative actions, permission queries, and moderation decisions.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#272542] text-slate-400">
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Admin Actor</th>
                <th className="pb-3 font-semibold">Target Record</th>
                <th className="pb-3 font-semibold">Metadata</th>
                <th className="pb-3 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#272542]/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a192e]/40">
                  <td className="py-3 font-mono font-bold text-pink-400">
                    {log.action}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-300">
                    {log.admin_user_id}
                  </td>
                  <td className="py-3 text-slate-400">
                    {log.target_type} ({log.target_id})
                  </td>
                  <td className="py-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                    {JSON.stringify(log.metadata)}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">No audit events recorded.</div>
        )}
      </div>
    </div>
  );
}
