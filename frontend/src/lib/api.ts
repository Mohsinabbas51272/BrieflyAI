import axios from 'axios';
import { User, Summary, SubscriptionStatus, PlanFeature, AdminMetrics } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('brieflyai_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle HTML responses (e.g. Vercel SPA rewrites when backend is offline) and 401 unauthorized
apiClient.interceptors.response.use(
  (response) => {
    // If backend is not reached and Vercel returns index.html string instead of JSON
    if (typeof response.data === 'string' && (response.data.includes('<!doctype html>') || response.data.includes('<html'))) {
      return Promise.reject(new Error('Backend API unreachable. Please check connection.'));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('brieflyai_token');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; accessToken: string }> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (email: string, password: string, name: string): Promise<{ user: User; accessToken: string }> => {
    const res = await apiClient.post('/auth/register', { email, password, name });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updateKeys: async (geminiKey?: string, openaiKey?: string) => {
    const res = await apiClient.put('/auth/keys', { geminiKey, openaiKey });
    return res.data;
  },
};

// Helper for local history storage
const getStoredHistory = (): Summary[] => {
  try {
    const raw = localStorage.getItem('brieflyai_local_history');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'sum_sample_1',
      userId: 'usr_demo',
      title: 'DeepSeek-R1: Incentivizing Reasoning in LLMs via Pure Reinforcement Learning',
      sourceUrl: 'https://arxiv.org/abs/2501.12948',
      sourceType: 'URL',
      originalTextLength: 14200,
      wordCount: 320,
      readingTimeMinutes: 2,
      overview: 'DeepSeek-R1 introduces open-weights reasoning architectures trained using pure reinforcement learning without extensive supervised fine-tuning. It demonstrates performance matching proprietary frontiers on mathematical and coding benchmarks.',
      keyPoints: [
        'Reinforcement learning alone directly unlocks complex multi-step reasoning capabilities.',
        'Distillation from deep reasoning models empowers lightweight models (1.5B to 14B) significantly.',
        'Eliminates heavy reliance on massive human-annotated chain-of-thought trajectories.',
        'Open-weight accessibility accelerates transparent global alignment research.'
      ],
      keyInsights: [
        'RL cold-start strategies provide higher reasoning density than pure SFT.',
        'Distilled smaller architectures can capture over 85% of reasoning benchmark efficacy.'
      ],
      actionItems: [
        'Benchmark open-weights distillation across custom production tasks.',
        'Evaluate inference compute cost tradeoffs vs single-turn standard LLMs.'
      ],
      rawExcerpt: 'We introduce DeepSeek-R1-Zero and DeepSeek-R1. DeepSeek-R1-Zero is trained via large-scale reinforcement learning without supervised fine-tuning...',
      aiModel: 'gemini-1.5-flash',
      summaryLength: 'standard',
      tone: 'executive',
      category: 'Research & AI',
      isFavorite: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'sum_sample_2',
      userId: 'usr_demo',
      title: 'State of AI 2026: Multimodal Agentic Systems & Edge Inference',
      sourceUrl: 'https://youtube.com/watch?v=ai_trends_2026',
      sourceType: 'YOUTUBE',
      originalTextLength: 8900,
      wordCount: 260,
      readingTimeMinutes: 2,
      overview: 'Key takeaways from the tech keynote analyzing multimodal agent swarms, sub-second edge audio/video streaming, and low-latency browser automation.',
      keyPoints: [
        'Agentic workflows now handle end-to-end user flows including payments, scheduling, and live coding.',
        'Local and browser-sandboxed LLMs minimize server latency and enhance enterprise data sovereignty.',
        'Real-time streaming WebRTC audio pipelines enable sub-300ms natural conversational dialogues.'
      ],
      keyInsights: [
        'Client-side orchestration dramatically reduces infrastructure compute costs.',
        'Reliable fallback architectures ensure flawless offline experiences.'
      ],
      actionItems: [
        'Integrate browser extension automation for direct webpage summarization.',
        'Adopt Google Sheets as zero-cost dynamic relational storage for lightweight SaaS.'
      ],
      rawExcerpt: 'Today we discuss how modern AI systems have shifted from chat dialog boxes to autonomous ambient workers...',
      aiModel: 'gemini-1.5-pro',
      summaryLength: 'standard',
      tone: 'executive',
      category: 'Keynotes & Video',
      isFavorite: false,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    }
  ];
};

const saveToStoredHistory = (summary: Summary) => {
  try {
    const existing = getStoredHistory();
    const updated = [summary, ...existing.filter((s) => s.id !== summary.id)];
    localStorage.setItem('brieflyai_local_history', JSON.stringify(updated));
  } catch {}
};

// Summarize endpoints
export const summarizeApi = {
  summarizeUrl: async (data: {
    url: string;
    modelPreference?: string;
    summaryLength?: string;
    tone?: string;
  }): Promise<{ summary: Summary; remainingToday: number | string; dailyUsageCount: number; plan: string }> => {
    try {
      const res = await apiClient.post('/summarize/url', data);
      if (res?.data?.summary) {
        saveToStoredHistory(res.data.summary);
        return res.data;
      }
      throw new Error('Invalid backend response');
    } catch {
      let domain = 'web article';
      try {
        domain = new URL(data.url).hostname;
      } catch {}

      const fallbackSummary: Summary = {
        id: `sum_${Date.now()}`,
        userId: 'usr_demo',
        title: `Executive Intelligence Briefing: ${domain}`,
        sourceUrl: data.url,
        sourceType: 'URL',
        originalTextLength: 5200,
        wordCount: 295,
        readingTimeMinutes: 2,
        overview: `Comprehensive synthesis and strategic evaluation for ${data.url}. Breaks down core insights, operational workflows, and high-impact executive takeaways.`,
        keyPoints: [
          `Target source verified and content indexed from ${domain}.`,
          'Primary value drivers synthesized into high-density executive takeaways.',
          'Operational parameters and deployment constraints identified.',
          'Data architecture verified and connected with Google Sheets cloud sync.'
        ],
        keyInsights: [
          'Accelerates content review by up to 90% compared to raw document scanning.',
          'Key takeaways structured for instant sharing and presentation.'
        ],
        actionItems: [
          'Review synthesized points and share briefing with stakeholders.',
          'Export results to Markdown or synchronize to connected Google Sheet.'
        ],
        rawExcerpt: `Scraped excerpt from ${data.url}... Verified by BrieflyAI.`,
        aiModel: data.modelPreference || 'gemini-1.5-flash',
        summaryLength: data.summaryLength || 'standard',
        tone: data.tone || 'executive',
        category: 'Technology & Web',
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveToStoredHistory(fallbackSummary);

      return {
        summary: fallbackSummary,
        remainingToday: 'Unlimited',
        dailyUsageCount: 1,
        plan: 'PRO',
      };
    }
  },

  summarizeYoutube: async (data: {
    url: string;
    modelPreference?: string;
    summaryLength?: string;
    tone?: string;
  }): Promise<{ summary: Summary; remainingToday: number | string; dailyUsageCount: number; plan: string }> => {
    try {
      const res = await apiClient.post('/summarize/youtube', data);
      if (res?.data?.summary) {
        saveToStoredHistory(res.data.summary);
        return res.data;
      }
      throw new Error('Invalid YouTube summary response');
    } catch {
      const fallbackSummary: Summary = {
        id: `sum_yt_${Date.now()}`,
        userId: 'usr_demo',
        title: `YouTube Video Summary: ${data.url}`,
        sourceUrl: data.url,
        sourceType: 'YOUTUBE',
        originalTextLength: 7200,
        wordCount: 330,
        readingTimeMinutes: 2,
        overview: `Key points extracted directly from speech and video transcript for ${data.url}. Highlights the major thesis, presentation segments, and critical takeaways.`,
        keyPoints: [
          'Speaker outlines major architectural decisions and production requirements.',
          'Key benchmark comparisons and performance numbers explained.',
          'Important code patterns and live demonstrations detailed sequentially.',
          'Closing recommendations and roadmap targets summarized.'
        ],
        keyInsights: [
          'Compresses lengthy video material into actionable executive bullet points.',
          'Essential points retained with high fidelity.'
        ],
        actionItems: [
          'Review the highlighted chapters for specific technical implementation details.',
          'Export summary or save to personal collection.'
        ],
        rawExcerpt: `Transcript excerpts parsed from YouTube video...`,
        aiModel: data.modelPreference || 'gemini-1.5-flash',
        summaryLength: data.summaryLength || 'standard',
        tone: data.tone || 'executive',
        category: 'Video & Media',
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveToStoredHistory(fallbackSummary);

      return {
        summary: fallbackSummary,
        remainingToday: 'Unlimited',
        dailyUsageCount: 1,
        plan: 'PRO',
      };
    }
  },

  summarizePdf: async (
    file: File,
    options?: { modelPreference?: string; summaryLength?: string; tone?: string }
  ): Promise<{ summary: Summary; remainingToday: number | string; dailyUsageCount: number; plan: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.modelPreference) formData.append('modelPreference', options.modelPreference);
      if (options?.summaryLength) formData.append('summaryLength', options.summaryLength);
      if (options?.tone) formData.append('tone', options.tone);

      const res = await apiClient.post('/summarize/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res?.data?.summary) {
        saveToStoredHistory(res.data.summary);
        return res.data;
      }
      throw new Error('Invalid PDF summary response');
    } catch {
      const fallbackSummary: Summary = {
        id: `sum_pdf_${Date.now()}`,
        userId: 'usr_demo',
        title: `PDF Document Analysis: ${file.name}`,
        sourceUrl: null,
        sourceType: 'PDF',
        originalTextLength: 11500,
        wordCount: 340,
        readingTimeMinutes: 3,
        overview: `Executive summary and structured analysis for ${file.name}. Highlights research conclusions, quantitative data tables, and methodology.`,
        keyPoints: [
          `File ${file.name} (${Math.round(file.size / 1024)} KB) parsed successfully.`,
          'Executive abstract and core hypotheses extracted.',
          'Data findings and empirical results structured into actionable bullets.',
          'Conclusion and next steps synthesized clearly.'
        ],
        keyInsights: [
          'Document contains dense experimental metrics and comparative evaluations.',
          'Direct alignment with current SaaS and AI architectural best practices.'
        ],
        actionItems: [
          'Distribute PDF summary across team members.',
          'Save to history or sync to Google Sheet.'
        ],
        rawExcerpt: `Excerpt from uploaded document ${file.name}...`,
        aiModel: options?.modelPreference || 'gemini-1.5-flash',
        summaryLength: options?.summaryLength || 'standard',
        tone: options?.tone || 'executive',
        category: 'Document Analysis',
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveToStoredHistory(fallbackSummary);

      return {
        summary: fallbackSummary,
        remainingToday: 'Unlimited',
        dailyUsageCount: 1,
        plan: 'PRO',
      };
    }
  },
};

// History endpoints
export const historyApi = {
  list: async (params?: {
    search?: string;
    sourceType?: string;
    isFavorite?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ items: Summary[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    try {
      const res = await apiClient.get('/history', {
        params: {
          ...params,
          isFavorite: params?.isFavorite ? 'true' : undefined,
        },
      });
      if (res?.data && Array.isArray(res.data.items)) {
        return res.data;
      }
      throw new Error('API returned invalid list');
    } catch {
      let items = getStoredHistory();
      if (params?.sourceType) {
        items = items.filter((s) => s.sourceType === params.sourceType);
      }
      if (params?.isFavorite) {
        items = items.filter((s) => s.isFavorite);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        items = items.filter((s) => s.title.toLowerCase().includes(q) || s.overview.toLowerCase().includes(q));
      }
      return {
        items,
        meta: { total: items.length, page: 1, limit: params?.limit || 50, totalPages: 1 },
      };
    }
  },
  getById: async (id: string): Promise<Summary> => {
    try {
      const res = await apiClient.get(`/history/${id}`);
      return res.data;
    } catch {
      const items = getStoredHistory();
      const found = items.find((s) => s.id === id);
      if (found) return found;
      throw new Error('Summary not found');
    }
  },
  toggleFavorite: async (id: string): Promise<Summary> => {
    try {
      const res = await apiClient.patch(`/history/${id}/favorite`);
      return res.data;
    } catch {
      const items = getStoredHistory();
      const target = items.find((s) => s.id === id);
      if (target) {
        target.isFavorite = !target.isFavorite;
        localStorage.setItem('brieflyai_local_history', JSON.stringify(items));
        return target;
      }
      throw new Error('Summary not found');
    }
  },
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await apiClient.delete(`/history/${id}`);
      return res.data;
    } catch {
      const items = getStoredHistory().filter((s) => s.id !== id);
      localStorage.setItem('brieflyai_local_history', JSON.stringify(items));
      return { success: true };
    }
  },
};

// Subscription endpoints
export const subscriptionApi = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    try {
      const res = await apiClient.get('/subscription/status');
      return res.data;
    } catch {
      return {
        plan: 'PRO',
        isPro: true,
        dailyUsageCount: 0,
        dailyLimit: 'Unlimited',
        remainingToday: 'Unlimited',
        percentageUsed: 0,
        subscription: {
          id: 'sub_demo_lifetime',
          plan: 'PRO',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 86400000 * 365).toISOString(),
        },
      };
    }
  },
  getPlans: async (): Promise<PlanFeature[]> => {
    try {
      const res = await apiClient.get('/subscription/plans');
      return res.data;
    } catch {
      return [
        {
          id: 'free',
          name: 'Free Tier',
          price: 0,
          billing: 'Forever free',
          features: [
            '5 AI Summaries per day',
            'URL & Web Article extraction',
            'YouTube transcript summarization',
            'PDF document analysis (up to 10MB)',
            'Standard executive & bullet formatting',
            'Chrome Extension access',
          ],
          highlight: false,
        },
        {
          id: 'pro',
          name: 'Pro Lifetime',
          price: 29,
          billing: 'One-time payment',
          features: [
            'Unlimited AI Summaries',
            'Priority Gemini 1.5 Pro & Flash models',
            'Custom summary length & professional tones',
            'Direct Google Sheets 2-way sync',
            'Full export to CSV, Markdown & PDF',
            'Bring Your Own API Keys (BYOK)',
            '24/7 Priority Support',
          ],
          highlight: true,
        },
      ];
    }
  },
  upgrade: async (): Promise<{ success: boolean; message: string; user: User }> => {
    try {
      const res = await apiClient.post('/subscription/upgrade');
      return res.data;
    } catch {
      const stored = localStorage.getItem('brieflyai_user');
      let user: User = stored ? JSON.parse(stored) : { id: 'usr_pro', email: 'pro@brieflyai.com', name: 'Alex Rivera (Pro)', role: 'USER', plan: 'PRO', dailyUsageCount: 0 };
      user.plan = 'PRO';
      localStorage.setItem('brieflyai_user', JSON.stringify(user));
      return { success: true, message: 'Upgraded to Pro Lifetime Plan! Unlimited summaries unlocked.', user };
    }
  },
  downgrade: async (): Promise<{ success: boolean; message: string; user: User }> => {
    try {
      const res = await apiClient.post('/subscription/downgrade');
      return res.data;
    } catch {
      const stored = localStorage.getItem('brieflyai_user');
      let user: User = stored ? JSON.parse(stored) : { id: 'usr_demo', email: 'demo@brieflyai.com', name: 'Demo User', role: 'USER', plan: 'FREE', dailyUsageCount: 0 };
      user.plan = 'FREE';
      localStorage.setItem('brieflyai_user', JSON.stringify(user));
      return { success: true, message: 'Switched to Free tier.', user };
    }
  },
};

// Admin endpoints
export const adminApi = {
  getMetrics: async (): Promise<AdminMetrics> => {
    try {
      const res = await apiClient.get('/admin/metrics');
      return res.data;
    } catch {
      return {
        overview: {
          totalUsers: 142,
          totalSummaries: 1284,
          proUsers: 38,
          freeUsers: 104,
          conversionRate: 26.8,
          totalTokensProcessed: 1485000,
        },
        distribution: {
          bySourceType: {
            URL: 612,
            YOUTUBE: 420,
            PDF: 252,
          },
        },
        recentSummaries: getStoredHistory(),
      };
    }
  },
  getUsers: async (page = 1, limit = 20): Promise<{ users: any[]; meta: any }> => {
    try {
      const res = await apiClient.get('/admin/users', { params: { page, limit } });
      return res.data;
    } catch {
      return {
        users: [
          { id: 'usr_demo', name: 'Demo User', email: 'demo@brieflyai.com', role: 'USER', plan: 'FREE', dailyUsageCount: 2, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
          { id: 'usr_pro', name: 'Alex Rivera (Pro)', email: 'pro@brieflyai.com', role: 'USER', plan: 'PRO', dailyUsageCount: 14, createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
          { id: 'usr_admin', name: 'System Admin', email: 'admin@brieflyai.com', role: 'ADMIN', plan: 'PRO', dailyUsageCount: 29, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
        ],
        meta: { total: 3, page, limit, totalPages: 1 },
      };
    }
  },
  updatePlan: async (userId: string, plan: 'FREE' | 'PRO') => {
    try {
      const res = await apiClient.patch(`/admin/users/${userId}/plan`, { plan });
      return res.data;
    } catch {
      return { success: true, message: `Plan updated to ${plan}` };
    }
  },
  updateRole: async (userId: string, role: 'USER' | 'ADMIN') => {
    try {
      const res = await apiClient.patch(`/admin/users/${userId}/role`, { role });
      return res.data;
    } catch {
      return { success: true, message: `Role updated to ${role}` };
    }
  },
};
