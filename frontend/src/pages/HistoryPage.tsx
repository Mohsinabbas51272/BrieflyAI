import React, { useState, useEffect } from 'react';
import { Summary } from '../types';
import { historyApi } from '../lib/api';
import { SummaryCard } from '../components/SummaryCard';
import {
  Search,
  Star,
  Globe,
  Youtube,
  FileText,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

interface HistoryPageProps {
  onViewSummary: (summary: Summary) => void;
  setCurrentTab: (tab: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onViewSummary,
  setCurrentTab,
}) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'URL' | 'YOUTUBE' | 'PDF'>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchSummaries = async () => {
    setIsLoading(true);
    try {
      const res = await historyApi.list({
        search: searchTerm.trim() || undefined,
        sourceType: sourceFilter === 'ALL' ? undefined : sourceFilter,
        isFavorite: onlyFavorites ? true : undefined,
        limit: 50,
      });
      setSummaries(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSummaries();
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm, sourceFilter, onlyFavorites]);

  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await historyApi.toggleFavorite(id);
      setSummaries((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this summary from your history?')) return;
    try {
      await historyApi.delete(id);
      setSummaries((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const sortedSummaries = [...summaries].sort((a, b) => {
    const tA = new Date(a.createdAt).getTime();
    const tB = new Date(b.createdAt).getTime();
    return sortOrder === 'desc' ? tB - tA : tA - tB;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Summary History & Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Browse, search, and manage all your generated executive summaries.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('summarize')}
          className="self-start sm:self-auto flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Summary</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, keywords, or topics..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 pl-10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Sort & Refresh */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>

            <button
              onClick={() => fetchSummaries()}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh list"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200 dark:border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Filter:
          </span>

          {[
            { id: 'ALL', label: 'All Sources' },
            { id: 'URL', label: 'Web Articles', icon: Globe },
            { id: 'YOUTUBE', label: 'YouTube Videos', icon: Youtube },
            { id: 'PDF', label: 'PDF Documents', icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = sourceFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSourceFilter(item.id as any)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ml-auto ${
              onlyFavorites
                ? 'bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30 font-semibold'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${onlyFavorites ? 'text-amber-500 fill-amber-400' : ''}`} />
            <span>Favorites Only</span>
          </button>
        </div>
      </div>

      {/* Grid of Summaries */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      ) : sortedSummaries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/20">
          <Sparkles className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No summaries found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || sourceFilter !== 'ALL' || onlyFavorites
              ? 'No results matched your search criteria. Try adjusting filters.'
              : 'Start by generating your first executive summary!'}
          </p>
          <button
            onClick={() => setCurrentTab('summarize')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Generate a Summary</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedSummaries.map((summary) => (
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
  );
};
