import React, { useEffect, useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, Ban, User } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers(query);
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search);
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await api.updateAdminUserStatus(id, nextStatus);
      fetchUsers(search);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            User Directory & Moderation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect verified Clerk accounts, roles, and enforce platform suspensions.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchUsers(e.target.value);
            }}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#141324] border border-slate-200 dark:border-[#272542] shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading directory...</div>
        ) : users.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#272542] text-slate-400">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Clerk ID</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Experiences</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#272542]/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a192e]/40">
                  <td className="py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {u.public_display_name}
                    </div>
                    <div className="text-[11px] text-slate-400">@{u.username}</div>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    {u.clerk_user_id}
                  </td>
                  <td className="py-3">
                    <span
                      className={`font-semibold capitalize ${
                        u.role === 'admin' ? 'text-pink-500' : 'text-slate-400'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                    {u.experiences_count || 0}
                  </td>
                  <td className="py-3">
                    <span
                      className={`font-semibold capitalize ${
                        u.account_status === 'active' ? 'text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {u.account_status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleStatus(u.id, u.account_status)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          u.account_status === 'suspended'
                            ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                            : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                        }`}
                      >
                        {u.account_status === 'suspended' ? 'Reactivate' : 'Suspend Account'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">No users found.</div>
        )}
      </div>
    </div>
  );
}
