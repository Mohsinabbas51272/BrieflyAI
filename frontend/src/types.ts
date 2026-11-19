export type Role = 'USER' | 'ADMIN';
export type Plan = 'FREE' | 'PRO';
export type SourceType = 'URL' | 'YOUTUBE' | 'PDF';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  plan: Plan;
  dailyUsageCount: number;
  lastUsageDate?: string;
  geminiApiKey?: string | null;
  openaiApiKey?: string | null;
  hasGeminiKey?: boolean;
  hasOpenaiKey?: boolean;
  createdAt?: string;
}

export interface Summary {
  id: string;
  userId: string;
  title: string;
  sourceUrl?: string | null;
  sourceType: SourceType;
  originalTextLength: number;
  wordCount: number;
  readingTimeMinutes: number;
  overview: string;
  keyPoints: string[];
  keyInsights: string[];
  actionItems: string[];
  rawExcerpt?: string | null;
  aiModel: string;
  summaryLength: string;
  tone: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SubscriptionStatus {
  plan: Plan;
  isPro: boolean;
  dailyUsageCount: number;
  dailyLimit: number | 'Unlimited';
  remainingToday: number | 'Unlimited';
  percentageUsed: number;
  subscription?: {
    id: string;
    plan: Plan;
    status: string;
    currentPeriodEnd?: string;
  } | null;
}

export interface PlanFeature {
  id: string;
  name: string;
  price: number;
  billing: string;
  features: string[];
  highlight: boolean;
}

export interface AdminMetrics {
  overview: {
    totalUsers: number;
    totalSummaries: number;
    proUsers: number;
    freeUsers: number;
    conversionRate: number;
    totalTokensProcessed: number;
  };
  distribution: {
    bySourceType: {
      URL: number;
      YOUTUBE: number;
      PDF: number;
    };
  };
  recentSummaries: Summary[];
}
