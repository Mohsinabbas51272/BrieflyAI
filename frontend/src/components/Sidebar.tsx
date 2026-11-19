import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  History,
  CreditCard,
  Settings,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();
  const isPro = user?.plan === 'PRO';
  const dailyCount = user?.dailyUsageCount || 0;
  const freeLimit = 5;
  const percentage = Math.min(100, Math.round((dailyCount / freeLimit) * 100));

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'summarize', name: 'Summarize Studio', icon: Sparkles },
    { id: 'history', name: 'History & Library', icon: History },
    { id: 'pricing', name: 'Usage & Plans', icon: CreditCard },
    { id: 'settings', name: 'API Keys & Settings', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    navigation.push({ id: 'admin', name: 'Admin Dashboard', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-4 flex flex-col justify-between shrink-0 hidden md:flex transition-colors">
      {/* Navigation List */}
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Navigation
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{item.name}</span>
              {item.id === 'admin' && (
                <span className="ml-auto rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  ADMIN
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Usage Quota Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 p-4 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isPro ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
              <Zap className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {isPro ? 'Pro Active' : 'Daily Quota'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {isPro ? 'Unlimited' : `${dailyCount}/${freeLimit}`}
          </span>
        </div>

        {!isPro ? (
          <>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden my-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage >= 100 ? 'bg-rose-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-indigo-600 dark:bg-indigo-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              {Math.max(0, freeLimit - dailyCount)} summaries remaining today. Resets daily.
            </p>
            <button
              onClick={() => setCurrentTab('pricing')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition active:scale-95"
            >
              Upgrade to Pro
            </button>
          </>
        ) : (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Unlimited summarization with priority AI processing enabled.
          </p>
        )}
      </div>
    </aside>
  );
};
