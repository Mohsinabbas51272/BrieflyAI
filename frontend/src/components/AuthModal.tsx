import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, ShieldCheck, Crown, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, quickDemoLogin, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your full name');
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    }
  };

  const handleQuickDemo = async (type: 'free' | 'pro' | 'admin') => {
    setError(null);
    try {
      await quickDemoLogin(type);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Quick login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30 mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isSignUp ? 'Create your account' : 'Welcome to BrieflyAI'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSignUp
              ? 'Start summarizing URLs, YouTube, and PDFs in seconds'
              : 'Sign in to access your dashboard and saved summaries'}
          </p>
        </div>

        {/* 1-Click Demo Personas */}
        <div className="mb-6 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/20 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-2.5 text-center">
            ⚡ Quick 1-Click Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('free')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center group"
            >
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition" />
              <span className="text-[11px] font-bold text-slate-900 dark:text-white">Free User</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">5/day quota</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('pro')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 hover:border-amber-500/60 transition text-center group"
            >
              <Crown className="h-4 w-4 text-amber-500 dark:text-amber-400 mb-1 group-hover:scale-110 transition" />
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Pro User</span>
              <span className="text-[9px] text-amber-700 dark:text-amber-400/80">Unlimited</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-950/20 hover:border-purple-500/60 transition text-center group"
            >
              <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition" />
              <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Admin</span>
              <span className="text-[9px] text-purple-700 dark:text-purple-400/80">Full control</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase">
            Or continue with email
          </span>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>{isSignUp ? 'Already have an account? ' : "Don't have an account? "}</span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up Free'}
          </button>
        </div>
      </div>
    </div>
  );
};
