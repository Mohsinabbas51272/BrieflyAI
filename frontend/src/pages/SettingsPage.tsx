import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';
import {
  Key,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await authApi.updateKeys(
        geminiKey ? geminiKey : undefined,
        openaiKey ? openaiKey : undefined
      );
      setMessage({ type: 'success', text: 'API Keys updated successfully!' });
      await refreshUser();
      setGeminiKey('');
      setOpenaiKey('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update keys',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings & AI Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your account profile and configure personal Google Gemini or OpenAI API keys.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2.5 rounded-2xl p-4 text-xs font-semibold ${
            message.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
              : 'border border-rose-500/30 bg-rose-950/20 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-400" />
          User Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Name</span>
            <p className="text-sm font-bold text-white mt-1">{user?.name}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Email</span>
            <p className="text-sm font-bold text-white mt-1 truncate">{user?.email}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Current Plan</span>
            <p className="text-sm font-bold text-indigo-400 mt-1">{user?.plan} Tier</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Account Role</span>
            <p className="text-sm font-bold text-purple-400 mt-1">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* BYO AI Keys Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="h-4 w-4 text-indigo-400" />
            Bring Your Own (BYO) AI API Keys
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            BrieflyAI works automatically out of the box with our built-in engine. If you prefer to use your personal Google Gemini or OpenAI quotas for unlimited capacity, paste your API keys below.
          </p>
        </div>

        <form onSubmit={handleSaveKeys} className="space-y-5">
          {/* Gemini Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Google Gemini API Key
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {user?.hasGeminiKey ? '✓ Active (Key Configured)' : 'Not set (Using default)'}
              </span>
            </div>
            <div className="relative">
              <input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={user?.hasGeminiKey ? 'Enter new key to update...' : 'AIzaSy...'}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Get your key from Google AI Studio (aistudio.google.com).
            </p>
          </div>

          {/* OpenAI Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                OpenAI API Key
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {user?.hasOpenaiKey ? '✓ Active (Key Configured)' : 'Not set (Using default)'}
              </span>
            </div>
            <div className="relative">
              <input
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={user?.hasOpenaiKey ? 'Enter new key to update...' : 'sk-proj-...'}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showOpenai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Get your key from platform.openai.com/api-keys.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving || (!geminiKey && !openaiKey)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving Keys...' : 'Save & Validate API Keys'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
