import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SummaryDetailModal } from './components/SummaryDetailModal';
import { AuthModal } from './components/AuthModal';
import { DashboardPage } from './pages/DashboardPage';
import { SummarizePage } from './pages/SummarizePage';
import { HistoryPage } from './pages/HistoryPage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { Summary } from './types';
import { historyApi } from './lib/api';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeSummary, setActiveSummary] = useState<Summary | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('brieflyai_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  // Sync dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('brieflyai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('brieflyai_theme', 'light');
    }
  }, [darkMode]);

  // If user is not authenticated on startup, auto open demo auth modal
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    }
  }, [isAuthenticated]);

  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await historyApi.toggleFavorite(id);
      if (activeSummary && activeSummary.id === id) {
        setActiveSummary(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        openAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardPage
              setCurrentTab={setCurrentTab}
              onViewSummary={(summary) => setActiveSummary(summary)}
            />
          )}

          {currentTab === 'summarize' && (
            <SummarizePage
              setCurrentTab={setCurrentTab}
              onViewSummary={(summary) => setActiveSummary(summary)}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              setCurrentTab={setCurrentTab}
              onViewSummary={(summary) => setActiveSummary(summary)}
            />
          )}

          {currentTab === 'pricing' && <PricingPage />}

          {currentTab === 'settings' && <SettingsPage />}

          {currentTab === 'admin' && (
            user?.role === 'ADMIN' ? (
              <AdminPage />
            ) : (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 text-center max-w-md mx-auto my-12 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Administrator Access Required</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  This panel is restricted to users with the ADMIN role. Switch to the Admin demo account in the top navbar profile menu.
                </p>
              </div>
            )
          )}
        </main>
      </div>

      {/* Summary Detail Modal */}
      <SummaryDetailModal
        summary={activeSummary}
        onClose={() => setActiveSummary(null)}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
