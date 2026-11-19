import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptionApi } from '../lib/api';
import { SubscriptionStatus, PlanFeature } from '../types';
import confetti from 'canvas-confetti';
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Clock,
  Infinity as InfinityIcon,
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<PlanFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchStatusAndPlans = async () => {
    setIsLoading(true);
    try {
      const [statusRes, plansRes] = await Promise.all([
        subscriptionApi.getStatus(),
        subscriptionApi.getPlans(),
      ]);
      setStatus(statusRes);
      setPlans(plansRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndPlans();
  }, [user]);

  const handleUpgrade = async () => {
    setActionLoading(true);
    setNotification(null);
    try {
      const res = await subscriptionApi.upgrade();
      setNotification(res.message);
      await refreshUser();
      await fetchStatusAndPlans();

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      setNotification(err.response?.data?.message || 'Upgrade failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!confirm('Are you sure you want to switch back to the Free plan (5 summaries/day limit)?')) return;
    setActionLoading(true);
    setNotification(null);
    try {
      const res = await subscriptionApi.downgrade();
      setNotification(res.message);
      await refreshUser();
      await fetchStatusAndPlans();
    } catch (err: any) {
      setNotification(err.response?.data?.message || 'Downgrade failed');
    } finally {
      setActionLoading(false);
    }
  };

  const isPro = status?.isPro || user?.plan === 'PRO';
  const dailyCount = status?.dailyUsageCount || user?.dailyUsageCount || 0;
  const freeLimit = 5;
  const percentage = Math.min(100, Math.round((dailyCount / freeLimit) * 100));

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
          <Crown className="h-3.5 w-3.5 text-amber-400" />
          Subscription & Daily Quota
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Flexible Plans for Modern Thinkers
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Start free with 5 summaries per day, or upgrade to BrieflyAI Pro for unlimited synthesis and priority AI models.
        </p>
      </div>

      {notification && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center text-xs font-semibold text-emerald-300 animate-in fade-in">
          {notification}
        </div>
      )}

      {/* Active Usage Meter Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Subscription
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isPro ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isPro ? 'BRIEFLYAI PRO' : 'STARTER FREE TIER'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {isPro ? 'Unlimited Summarization Enabled' : 'Free Quota: 5 Summaries / Day'}
            </h3>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Today's Consumption:</span>
            <div className="text-2xl font-black text-white">
              {isPro ? (
                <span className="flex items-center gap-1 sm:justify-end text-amber-400">
                  <InfinityIcon className="h-6 w-6" />
                  <span>Unlimited</span>
                </span>
              ) : (
                `${dailyCount} of ${freeLimit} used`
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar for Free Users */}
        {!isPro ? (
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Quota Used ({percentage}%)</span>
              <span>{Math.max(0, freeLimit - dailyCount)} summaries remaining today</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage >= 100 ? 'bg-rose-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Daily quota automatically resets at midnight.
            </p>
          </div>
        ) : (
          <div className="pt-6 flex items-center gap-3 text-xs text-emerald-400 bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/20">
            <Check className="h-4 w-4 shrink-0" />
            <span>
              Your Pro subscription is fully active. Enjoy unrestricted executive summaries across URLs, YouTube, and PDFs with zero rate limits!
            </span>
          </div>
        )}
      </div>

      {/* Pricing Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <div className={`relative flex flex-col justify-between rounded-3xl border p-8 shadow-xl transition ${
          !isPro ? 'border-indigo-500/50 bg-slate-900/90' : 'border-slate-800 bg-slate-900/40'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Starter Free</h3>
              {!isPro && (
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                  Current Plan
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              Essential executive summarization for personal reading, articles, and quick video recaps.
            </p>

            <div className="space-y-3 border-t border-slate-800 pt-6">
              {[
                '5 summaries per day',
                'Website & Article URL scraping',
                'YouTube video transcripts',
                'PDF document synthesis (up to 5MB)',
                '5 Key Takeaway Points',
                'Short Overview & Action Items',
                'History library & search',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            {isPro ? (
              <button
                type="button"
                onClick={handleDowngrade}
                disabled={actionLoading}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Switch to Free Plan
              </button>
            ) : (
              <div className="text-center py-2.5 rounded-2xl bg-slate-800/60 text-xs font-semibold text-slate-400 border border-slate-800">
                Current Plan
              </div>
            )}
          </div>
        </div>

        {/* Pro Plan */}
        <div className={`relative flex flex-col justify-between rounded-3xl border p-8 shadow-2xl transition ${
          isPro
            ? 'border-amber-500/50 bg-gradient-to-b from-slate-900 to-amber-950/20'
            : 'border-indigo-500 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900'
        }`}>
          {/* Popular badge */}
          <div className="absolute -top-3.5 right-8">
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1 text-[11px] font-extrabold text-white shadow-lg uppercase tracking-wider">
              MOST POPULAR
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400 fill-amber-400" />
                <h3 className="text-lg font-bold text-white">BrieflyAI Pro</h3>
              </div>
              {isPro && (
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                  Active
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-white">$19</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              Unrestricted power for executives, researchers, developers, and consultants who need instant synthesis.
            </p>

            <div className="space-y-3 border-t border-slate-800 pt-6">
              {[
                'Unlimited summaries per day',
                'Priority Gemini 1.5 Pro & GPT-4o models',
                'Large PDF documents up to 50MB',
                'Custom Tone & Depth Controls',
                'Export to Markdown (.md), PDF & JSON',
                'Custom BYO Gemini & OpenAI Keys',
                'Team analytics & admin insights',
                'Zero cooldowns & priority execution',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            {isPro ? (
              <div className="text-center py-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300">
                ✓ Pro Membership Active
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Upgrade to BrieflyAI Pro</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
