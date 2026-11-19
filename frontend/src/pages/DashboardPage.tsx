import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Summary } from '../types';
import { historyApi } from '../lib/api';
import { SummaryCard } from '../components/SummaryCard';
import {
  Sparkles,
  Zap,
  Clock,
  BookOpen,
  ArrowRight,
  Globe,
  Youtube,
  FileText,
  PlusCircle,
  Crown,
} from 'lucide-react';

interface DashboardPageProps {
  setCurrentTab: (tab: string) => void;
  onViewSummary: (summary: Summary) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setCurrentTab,
  onViewSummary,
}) => {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecent = async () => {
    setIsLoading(true);
    try {
      const res = await historyApi.list({ limit: 6 });
      setSummaries(Array.isArray(res?.items) ? res.items : []);
    } catch (e) {
      console.error(e);
      setSummaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [user]);

  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await historyApi.toggleFavorite(id);
      setSummaries((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this summary?')) return;
    try {
      await historyApi.delete(id);
      setSummaries((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const isPro = user?.plan === 'PRO';
  const dailyCount = user?.dailyUsageCount || 0;
  const freeLimit = 5;
  const remainingToday = isPro ? 'Unlimited' : Math.max(0, freeLimit - dailyCount);

  // Calculate total reading time saved
  const totalMinutesSaved = summaries.reduce((acc, curr) => acc + (curr.readingTimeMinutes || 3), 0) * 3;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50/90 via-white to-white dark:from-indigo-950/60 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
                <Sparkles className="h-3.5 w-3.5" />
                BrieflyAI Intelligent Engine
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isPro ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {isPro ? '★ PRO MEMBER' : 'FREE TIER'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.name || 'Explorer'}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Turn long articles, dense YouTube keynotes, and complex PDFs into clear executive overviews, 5 key points, and next actions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('summarize')}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Summary</span>
            </button>
            {!isPro && (
              <button
                onClick={() => setCurrentTab('pricing')}
                className="flex items-center gap-1.5 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition"
              >
                <Crown className="h-4 w-4 text-amber-500" />
                <span>Upgrade Pro</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Daily Quota */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Daily Quota</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {isPro ? 'Unlimited' : `${dailyCount} / ${freeLimit}`}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isPro ? 'Pro plan unlimited active' : `${remainingToday} left for today`}
          </p>
        </div>

        {/* Metric 2: Total Summaries */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Saved in Library</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{summaries.length}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">available</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Indexed & searchable anytime</p>
        </div>

        {/* Metric 3: Reading Time Saved */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Reading Time Saved</span>
            <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">~{totalMinutesSaved}</span>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">minutes</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Estimated cognitive time saved</p>
        </div>

        {/* Metric 4: AI Model Efficiency */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>AI Engine Status</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-900 dark:text-white truncate">Gemini & OpenAI</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ready for instant synthesis</p>
        </div>
      </div>

      {/* Quick Launch Cards (URL, YouTube, PDF) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setCurrentTab('summarize')}
          className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Website & Article URL</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Scrape & extract articles</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
            Paste any blog post, technical documentation, or news article link to extract core findings.
          </p>
        </div>

        <div
          onClick={() => setCurrentTab('summarize')}
          className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 hover:border-rose-400 dark:hover:border-rose-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition">
              <Youtube className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">YouTube Transcripts</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Keynotes, tutorials & talks</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
            Extract official and auto captions from YouTube videos into structured executive summaries.
          </p>
        </div>

        <div
          onClick={() => setCurrentTab('summarize')}
          className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">PDF Documents</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Reports, whitepapers & slides</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
            Upload financial statements, research papers, or contract briefs for instant synthesis.
          </p>
        </div>
      </div>

      {/* Recent Summaries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Summaries</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recently processed documents and links</p>
          </div>
          <button
            onClick={() => setCurrentTab('history')}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            <span>View All Library</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 animate-pulse" />
            ))}
          </div>
        ) : (!summaries || summaries.length === 0) ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-transparent">
            <Sparkles className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No summaries yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Ready to distill long texts? Try pasting an article URL, YouTube video, or uploading a PDF.
            </p>
            <button
              onClick={() => setCurrentTab('summarize')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Generate First Summary</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {summaries.map((summary) => (
              <SummaryCard
                key={summary.id}
                summary={summary}
                onView={onViewSummary}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
