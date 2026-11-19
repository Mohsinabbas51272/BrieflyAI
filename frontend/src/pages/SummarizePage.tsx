import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Summary } from '../types';
import { summarizeApi } from '../lib/api';
import confetti from 'canvas-confetti';
import {
  Globe,
  Youtube,
  FileText,
  Sparkles,
  Upload,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Settings2,
  Clock,
  Lightbulb,
  CheckSquare,
  ListOrdered,
  Loader2,
} from 'lucide-react';

interface SummarizePageProps {
  onSummaryGenerated?: (summary: Summary) => void;
  onViewSummary: (summary: Summary) => void;
  setCurrentTab: (tab: string) => void;
}

export const SummarizePage: React.FC<SummarizePageProps> = ({
  onSummaryGenerated,
  onViewSummary,
  setCurrentTab,
}) => {
  const { refreshUser } = useAuth();

  // Tab: 'url' | 'youtube' | 'pdf'
  const [sourceType, setSourceType] = useState<'url' | 'youtube' | 'pdf'>('url');

  // Input states
  const [urlInput, setUrlInput] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Model & Options
  const [modelPreference, setModelPreference] = useState('gemini-1.5-flash');
  const [summaryLength, setSummaryLength] = useState('standard');
  const [tone, setTone] = useState('executive');

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Summary | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'points' | 'insights' | 'actions' | 'raw'>('overview');
  const [copied, setCopied] = useState(false);

  // Sample data presets for instant testing
  const sampleUrls = [
    { label: 'Hacker News Thread', url: 'https://news.ycombinator.com/' },
    { label: 'Wikipedia Artificial Intelligence', url: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
    { label: 'MDN Web Performance', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance' },
  ];

  const sampleYoutubes = [
    { label: 'Steve Jobs 2005 Stanford Speech', url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc' },
    { label: 'Veritasium Science Discovery', url: 'https://www.youtube.com/watch?v=bHIhgxav9LY' },
    { label: 'Next.js 14 Keynote', url: 'https://www.youtube.com/watch?v=k5jG2w8D3-4' },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setResult(null);

    // Validation
    if (sourceType === 'url' && !urlInput.trim()) {
      setError('Please enter a website or article URL');
      return;
    }
    if (sourceType === 'youtube' && !youtubeInput.trim()) {
      setError('Please enter a YouTube video URL');
      return;
    }
    if (sourceType === 'pdf' && !pdfFile) {
      setError('Please select or upload a PDF document');
      return;
    }

    setIsProcessing(true);
    setLoadingStep(1);

    const timer1 = setTimeout(() => setLoadingStep(2), 700);
    const timer2 = setTimeout(() => setLoadingStep(3), 1600);
    const timer3 = setTimeout(() => setLoadingStep(4), 2500);

    try {
      let res: any;

      if (sourceType === 'url') {
        res = await summarizeApi.summarizeUrl({
          url: urlInput.trim(),
          modelPreference,
          summaryLength,
          tone,
        });
      } else if (sourceType === 'youtube') {
        res = await summarizeApi.summarizeYoutube({
          url: youtubeInput.trim(),
          modelPreference,
          summaryLength,
          tone,
        });
      } else if (sourceType === 'pdf' && pdfFile) {
        res = await summarizeApi.summarizePdf(pdfFile, {
          modelPreference,
          summaryLength,
          tone,
        });
      }

      setResult(res.summary);
      if (onSummaryGenerated) onSummaryGenerated(res.summary);
      await refreshUser();

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to generate summary. Please check inputs.';
      setError(msg);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsProcessing(false);
      setLoadingStep(0);
    }
  };

  const copyMarkdown = () => {
    if (!result) return;
    const text = `# ${result.title}

## Overview
${result.overview}

## 5 Key Points
${result.keyPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Important Insights
${result.keyInsights?.map((ins) => `- ${ins}`).join('\n')}

## Action Items
${result.actionItems?.map((act) => `- [ ] ${act}`).join('\n')}

---
BrieflyAI Hub (${result.aiModel})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportMarkdown = () => {
    if (!result) return;
    const content = `# ${result.title}\n\n## Overview\n${result.overview}\n\n## 5 Key Points\n${result.keyPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n## Important Insights\n${result.keyInsights?.map((ins) => `- ${ins}`).join('\n')}\n\n## Action Items\n${result.actionItems?.map((act) => `- [ ] ${act}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSamplePdf = async () => {
    try {
      const res = await fetch('/sample-whitepaper.pdf');
      const blob = await res.blob();
      const file = new File([blob], 'brieflyai-sample-whitepaper.pdf', { type: 'application/pdf' });
      setPdfFile(file);
    } catch (e) {
      console.error('Failed to load sample PDF', e);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Studio Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            AI Summarize Studio
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            URLs • YouTube • PDFs
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Generate an AI Summary
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Transform any content into 5 key points, short overview, strategic insights, and action items.
        </p>
      </div>

      {/* Main Studio Input Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-md transition-colors">
        {/* Source Selector Tabs */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => setSourceType('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              sourceType === 'url'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Website / Article URL</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceType('youtube')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              sourceType === 'youtube'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <Youtube className="h-4 w-4" />
            <span>YouTube Video</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceType('pdf')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              sourceType === 'pdf'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>PDF Document</span>
          </button>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleGenerate} className="space-y-6">
          {sourceType === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Article or Webpage URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article-to-summarize"
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3.5 pl-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
                <Globe className="absolute left-4 top-4 h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>

              {/* Sample link chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500">Try sample:</span>
                {sampleUrls.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUrlInput(sample.url)}
                    className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sourceType === 'youtube' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                YouTube Video URL (Keynotes, Podcasts, Tutorials)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=UF8uR6Z6KLc"
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3.5 pl-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
                />
                <Youtube className="absolute left-4 top-4 h-4 w-4 text-rose-500" />
              </div>

              {/* Sample YouTube chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500">Try sample:</span>
                {sampleYoutubes.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setYoutubeInput(sample.url)}
                    className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sourceType === 'pdf' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload PDF Document (up to 15MB)
              </label>

              <div
                onClick={() => document.getElementById('pdf-file-input')?.click()}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-8 text-center cursor-pointer hover:border-amber-500 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition"
              >
                <input
                  id="pdf-file-input"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPdfFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition mb-3">
                  <Upload className="h-6 w-6" />
                </div>

                {pdfFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pdfFile.name}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to summarize
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Click to browse or drop your PDF here
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports whitepapers, financial statements, meeting notes & articles
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500">No PDF handy?</span>
                <button
                  type="button"
                  onClick={loadSamplePdf}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
                >
                  Load Sample BrieflyAI Whitepaper PDF
                </button>
              </div>
            </div>
          )}

          {/* AI Model & Generation Options Accordion */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Settings2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                AI Model & Summary Parameters
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Model Selector */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  AI Model
                </label>
                <select
                  value={modelPreference}
                  onChange={(e) => setModelPreference(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Fast)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Synthesis)</option>
                  <option value="gpt-4o-mini">OpenAI GPT-4o Mini (Balanced)</option>
                  <option value="gpt-4o">OpenAI GPT-4o (Executive Grade)</option>
                  <option value="smart-engine">Briefly Smart NLP Engine (Instant)</option>
                </select>
              </div>

              {/* Summary Length */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Summary Length
                </label>
                <select
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="concise">Concise (Quick scan)</option>
                  <option value="standard">Standard (Balanced overview)</option>
                  <option value="detailed">Detailed (Comprehensive deep dive)</option>
                </select>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="executive">Executive & Professional</option>
                  <option value="technical">Technical & Architectural</option>
                  <option value="casual">Casual & Conversational</option>
                  <option value="academic">Academic & Analytical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-300 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                {error.includes('Upgrade to BrieflyAI Pro') && (
                  <button
                    type="button"
                    onClick={() => setCurrentTab('pricing')}
                    className="mt-2 inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 underline"
                  >
                    Upgrade to BrieflyAI Pro now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Generate CTA Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            <span>
              {isProcessing
                ? 'Synthesizing Summary with AI...'
                : 'Generate Structured BrieflyAI Summary'}
            </span>
          </button>
        </form>
      </div>

      {/* Multi-stage Progress Stepper while processing */}
      {isProcessing && (
        <div className="rounded-3xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-950/20 p-6 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 animate-spin">
              <Loader2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Synthesis Pipeline Active</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Processing source and structuring intelligence...</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { step: 1, text: 'Connecting to origin source & downloading raw text/transcript...' },
              { step: 2, text: 'Filtering noise, HTML tags, and parsing content density...' },
              { step: 3, text: 'AI Model evaluating arguments, thesis & domain entities...' },
              { step: 4, text: 'Synthesizing 5 Key Points, Strategic Insights & Action Items...' },
            ].map((st) => (
              <div
                key={st.step}
                className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-300 ${
                  loadingStep >= st.step ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {loadingStep > st.step ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                ) : loadingStep === st.step ? (
                  <div className="h-4 w-4 rounded-full border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                )}
                <span>{st.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Generated Result Section */}
      {result && (
        <div className="rounded-3xl border border-slate-200 dark:border-indigo-500/40 bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
          {/* Result Header */}
          <div className="flex flex-col gap-3 p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:to-slate-950/40">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Successfully Summarized
                </span>
                <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300">
                  {result.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {result.readingTimeMinutes} min read ({result.wordCount} words)
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyMarkdown}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={exportMarkdown}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Export .MD</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewSummary(result)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                >
                  <span>Fullscreen View</span>
                </button>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {result.title}
            </h2>

            {result.sourceUrl && (
              <a
                href={result.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline max-w-2xl truncate"
              >
                <span className="truncate">{result.sourceUrl}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            )}
          </div>

          {/* Result Tab Navigation */}
          <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/20 overflow-x-auto">
            {[
              { id: 'overview', label: 'Executive Overview', icon: Sparkles },
              { id: 'points', label: '5 Key Points', icon: ListOrdered },
              { id: 'insights', label: 'Important Insights', icon: Lightbulb },
              { id: 'actions', label: 'Action Items', icon: CheckSquare },
              { id: 'raw', label: 'Raw Excerpt', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeResultTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Result Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {activeResultTab === 'overview' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20 p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Executive Synthesis
                  </h4>
                  <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                    {result.overview}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Key Highlights
                  </h4>
                  <div className="space-y-2">
                    {result.keyPoints?.slice(0, 3).map((pt, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-850/60 p-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-600/30 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {idx + 1}
                        </span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeResultTab === 'points' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    The 5 Core Takeaway Points
                  </h4>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    Complete 5 of 5 points
                  </span>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {result.keyPoints?.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850/70 p-5 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-600/20">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                          {point}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeResultTab === 'insights' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Critical Implications & Insights
                </h4>
                <div className="grid gap-4">
                  {result.keyInsights?.map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-950/10 p-5"
                    >
                      <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeResultTab === 'actions' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Actionable Steps
                </h4>
                <div className="grid gap-3">
                  {result.actionItems?.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/10 p-4"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeResultTab === 'raw' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Source text snippet</span>
                  <span>{result.originalTextLength} characters</span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-5 font-mono text-xs text-slate-700 dark:text-slate-400 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {result.rawExcerpt || 'No raw excerpt saved.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
