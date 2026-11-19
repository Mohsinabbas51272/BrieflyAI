import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Crown, Sun, Moon, LogOut, User, ShieldCheck, Plus, ChevronDown, Check } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  openAuthModal,
}) => {
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isPro = user?.plan === 'PRO';
  const dailyCount = user?.dailyUsageCount || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Briefly<span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  HUB
                </span>
              </div>
              <p className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block -mt-1">
                Executive AI Summaries
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Plan Badge */}
              <div
                onClick={() => setCurrentTab('pricing')}
                className={`hidden md:flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isPro
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {isPro ? (
                  <>
                    <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>PRO • Unlimited</span>
                  </>
                ) : (
                  <>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Free Plan: {Math.max(0, 5 - dailyCount)}/5 left today</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline text-[11px]">Upgrade</span>
                  </>
                )}
              </div>

              {/* Quick New Summary Button */}
              <button
                onClick={() => setCurrentTab('summarize')}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Summary</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/90 px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-800/60 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {user?.name?.slice(0, 2).toUpperCase() || 'AI'}
                  </div>
                  <span className="hidden text-xs font-medium lg:inline-block max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          user?.plan === 'PRO' ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {user?.plan} PLAN
                        </span>
                        {user?.role === 'ADMIN' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-700 dark:text-purple-300">
                            <ShieldCheck className="h-3 w-3" /> ADMIN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Demo Switcher */}
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 px-1">
                        Demo Account Switcher
                      </p>
                      <button
                        onClick={() => {
                          quickDemoLogin('free');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                      >
                        <span>Demo User (Free Plan)</span>
                        {user?.email === 'demo@brieflyai.com' && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                      <button
                        onClick={() => {
                          quickDemoLogin('pro');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                      >
                        <span>Pro User (Marcus)</span>
                        {user?.email === 'pro@brieflyai.com' && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                      <button
                        onClick={() => {
                          quickDemoLogin('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                      >
                        <span>Admin User (Sarah)</span>
                        {user?.email === 'admin@brieflyai.com' && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setCurrentTab('settings');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                      >
                        <User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        Settings & API Keys
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition"
                      >
                        <LogOut className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={openAuthModal}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              Sign In
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
