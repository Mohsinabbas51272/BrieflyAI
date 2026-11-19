import React from 'react';
import { Summary } from '../types';
import {
  Globe,
  Youtube,
  FileText,
  Clock,
  Star,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface SummaryCardProps {
  summary: Summary;
  onView: (summary: Summary) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  onView,
  onToggleFavorite,
  onDelete,
}) => {
  const getSourceIcon = () => {
    switch (summary.sourceType) {
      case 'YOUTUBE':
        return <Youtube className="h-3.5 w-3.5 text-rose-500" />;
      case 'PDF':
        return <FileText className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Globe className="h-3.5 w-3.5 text-indigo-500" />;
    }
  };

  const getSourceBadgeStyle = () => {
    switch (summary.sourceType) {
      case 'YOUTUBE':
        return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
      case 'PDF':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      default:
        return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 shadow-sm dark:shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-indigo-500/10">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${getSourceBadgeStyle()}`}
            >
              {getSourceIcon()}
              <span>{summary.sourceType}</span>
            </span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
              {summary.category || 'General'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(summary.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
              title={summary.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Star
                className={`h-4 w-4 ${
                  summary.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                }`}
              />
            </button>
            <button
              onClick={() => onDelete(summary.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title="Delete summary"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onView(summary)}
          className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          {summary.title}
        </h3>

        {/* Metadata info */}
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {summary.readingTimeMinutes} min read
          </span>
          <span>•</span>
          <span>{summary.wordCount} words</span>
          <span>•</span>
          <span>{formatDate(summary.createdAt)}</span>
        </div>

        {/* Overview Excerpt */}
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
          {summary.overview}
        </p>

        {/* 5 Key Points Preview */}
        {summary.keyPoints && summary.keyPoints.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              5 Key Points Preview
            </p>
            <div className="space-y-1">
              {summary.keyPoints.slice(0, 2).map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {idx + 1}
                  </span>
                  <span className="line-clamp-1">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Card CTA */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
          <span className="font-mono text-[11px]">{summary.aiModel}</span>
        </div>

        <button
          onClick={() => onView(summary)}
          className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
        >
          <span>View Full Summary</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
