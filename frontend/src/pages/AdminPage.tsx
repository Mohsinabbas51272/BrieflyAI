import React, { useState, useEffect } from 'react';
import { adminApi } from '../lib/api';
import { AdminMetrics } from '../types';
import {
  ShieldCheck,
  Users,
  FileText,
  TrendingUp,
  Sparkles,
  Globe,
  Youtube,
  RefreshCw,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [mRes, uRes] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getUsers(1, 50),
      ]);
      setMetrics(mRes);
      setUsers(uRes.users);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePlanChange = async (userId: string, newPlan: 'FREE' | 'PRO') => {
    try {
      await adminApi.updatePlan(userId, newPlan);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
      );
      setActionMsg(`User plan updated to ${newPlan}`);
      setTimeout(() => setActionMsg(null), 3000);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update plan');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    try {
      await adminApi.updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setActionMsg(`User role updated to ${newRole}`);
      setTimeout(() => setActionMsg(null), 3000);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update role');
    }
  };

  const urlCount = metrics?.distribution?.bySourceType?.URL || 0;
  const ytCount = metrics?.distribution?.bySourceType?.YOUTUBE || 0;
  const pdfCount = metrics?.distribution?.bySourceType?.PDF || 0;
  const totalDistribution = urlCount + ytCount + pdfCount || 1;

  const urlPct = Math.round((urlCount / totalDistribution) * 100);
  const ytPct = Math.round((ytCount / totalDistribution) * 100);
  const pdfPct = Math.round((pdfCount / totalDistribution) * 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Portal
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">BrieflyAI System Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Platform Metrics & User Management
          </h1>
        </div>

        <button
          onClick={() => fetchData()}
          className="flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionMsg && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-center text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          ✓ {actionMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Total Registered Users</span>
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics?.overview.totalUsers ?? '...'}
          </span>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {metrics?.overview.proUsers ?? 0} Pro / {metrics?.overview.freeUsers ?? 0} Free
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Total Summaries Generated</span>
            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics?.overview.totalSummaries ?? '...'}
          </span>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Lifetime platform syntheses</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Pro Conversion Rate</span>
            <TrendingUp className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics?.overview.conversionRate ?? 0}%
          </span>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Subscribers to total users</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>AI Tokens Processed</span>
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics?.overview.totalTokensProcessed ? `${Math.round(metrics.overview.totalTokensProcessed / 1000)}k` : '0'}
          </span>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tokens analyzed across engines</p>
        </div>
      </div>

      {/* Breakdown by Source Type */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Summarization Breakdown by Source
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Web URLs & Articles
              </span>
              <span>{urlCount} summaries ({urlPct}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style={{ width: `${urlPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Youtube className="h-3.5 w-3.5 text-rose-500" /> YouTube Transcripts
              </span>
              <span>{ytCount} summaries ({ytPct}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${ytPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-amber-500" /> PDF Documents
              </span>
              <span>{pdfCount} summaries ({pdfPct}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pdfPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Registered Users</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View user activity, adjust plans (FREE/PRO), and assign administrative privileges.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-4">Plan Status</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Daily Usage</th>
                <th className="py-3 px-4">Summaries</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/40 transition">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.plan === 'PRO'
                          ? 'bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {u.plan}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {u.dailyUsageCount} {u.plan === 'FREE' ? '/ 5' : '(unlimited)'}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {u._count?.summaries ?? 0}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {/* Toggle Plan button */}
                    <button
                      onClick={() => handlePlanChange(u.id, u.plan === 'PRO' ? 'FREE' : 'PRO')}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      Set {u.plan === 'PRO' ? 'FREE' : 'PRO'}
                    </button>
                    {/* Toggle Role button */}
                    <button
                      onClick={() => handleRoleChange(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      Set {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
