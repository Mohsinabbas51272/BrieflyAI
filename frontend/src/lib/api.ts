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

// Handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
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

// Summarize endpoints
export const summarizeApi = {
  summarizeUrl: async (data: {
    url: string;
    modelPreference?: string;
    summaryLength?: string;
    tone?: string;
  }): Promise<{ summary: Summary; remainingToday: number | string; dailyUsageCount: number; plan: string }> => {
    const res = await apiClient.post('/summarize/url', data);
    return res.data;
  },
  summarizeYoutube: async (data: {
    url: string;
    modelPreference?: string;
    summaryLength?: string;
    tone?: string;
  }): Promise<{ summary: Summary; remainingToday: number | string; dailyUsageCount: number; plan: string }> => {
    const res = await apiClient.post('/summarize/youtube', data);
    return res.data;
  },
  summarizePdf: async (
    file: File,
    options?: { modelPreference?: string; summaryLength?: string; tone?: string }
  ): Promise<{ summary: Summary; remainingToday: number | string; dailyUsageCount: number; plan: string }> => {
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
    return res.data;
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
    const res = await apiClient.get('/history', {
      params: {
        ...params,
        isFavorite: params?.isFavorite ? 'true' : undefined,
      },
    });
    return res.data;
  },
  getById: async (id: string): Promise<Summary> => {
    const res = await apiClient.get(`/history/${id}`);
    return res.data;
  },
  toggleFavorite: async (id: string): Promise<Summary> => {
    const res = await apiClient.patch(`/history/${id}/favorite`);
    return res.data;
  },
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await apiClient.delete(`/history/${id}`);
    return res.data;
  },
};

// Subscription endpoints
export const subscriptionApi = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const res = await apiClient.get('/subscription/status');
    return res.data;
  },
  getPlans: async (): Promise<PlanFeature[]> => {
    const res = await apiClient.get('/subscription/plans');
    return res.data;
  },
  upgrade: async (): Promise<{ success: boolean; message: string; user: User }> => {
    const res = await apiClient.post('/subscription/upgrade');
    return res.data;
  },
  downgrade: async (): Promise<{ success: boolean; message: string; user: User }> => {
    const res = await apiClient.post('/subscription/downgrade');
    return res.data;
  },
};

// Admin endpoints
export const adminApi = {
  getMetrics: async (): Promise<AdminMetrics> => {
    const res = await apiClient.get('/admin/metrics');
    return res.data;
  },
  getUsers: async (page = 1, limit = 20): Promise<{ users: any[]; meta: any }> => {
    const res = await apiClient.get('/admin/users', { params: { page, limit } });
    return res.data;
  },
  updatePlan: async (userId: string, plan: 'FREE' | 'PRO') => {
    const res = await apiClient.patch(`/admin/users/${userId}/plan`, { plan });
    return res.data;
  },
  updateRole: async (userId: string, role: 'USER' | 'ADMIN') => {
    const res = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },
};
