import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  plan: string;
  dailyUsageCount: number;
  lastUsageDate: Date;
  geminiApiKey?: string | null;
  openaiApiKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SummaryEntity {
  id: string;
  userId: string;
  title: string;
  sourceUrl?: string | null;
  sourceType: string;
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
  createdAt: Date;
  updatedAt: Date;
  user?: Partial<UserEntity>;
}

export interface SubscriptionEntity {
  id: string;
  userId: string;
  plan: string;
  status: string;
  stripeCustomerId?: string | null;
  currentPeriodEnd?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageLogEntity {
  id: string;
  userId: string;
  sourceType: string;
  aiModel: string;
  tokensUsed: number;
  createdAt: Date;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('GoogleSheetDbService');
  private dataDir = path.resolve(process.cwd(), 'data');
  private dataFile = path.resolve(this.dataDir, 'brieflyai-sheet-db.json');

  private users: UserEntity[] = [];
  private summaries: SummaryEntity[] = [];
  private subscriptions: SubscriptionEntity[] = [];
  private usageLogs: UsageLogEntity[] = [];

  private googleSheetUrl = process.env.GOOGLE_SHEET_URL || process.env.GOOGLE_SHEET_API_URL || '';

  async onModuleInit() {
    this.logger.log('Initializing Google Sheet / Lightweight Database Adapter (No PostgreSQL needed)...');
    this.loadLocalData();

    if (this.users.length === 0) {
      await this.seedDefaultUsers();
    }

    if (this.googleSheetUrl) {
      this.logger.log(`Google Sheet Sync configured with URL: ${this.googleSheetUrl.slice(0, 30)}...`);
      await this.syncFromGoogleSheet();
    } else {
      this.logger.log('Running in Standalone Sheet DB mode (Google Sheet URL can be added in GOOGLE_SHEET_URL env).');
    }
  }

  async onModuleDestroy() {
    this.saveLocalData();
  }

  // ─── Local JSON Cache / Persistence ─────────────────────────────────────────
  private loadLocalData() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf8');
        const parsed = JSON.parse(raw);
        this.users = (parsed.users || []).map((u: any) => ({
          ...u,
          lastUsageDate: new Date(u.lastUsageDate),
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        }));
        this.summaries = (parsed.summaries || []).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
        this.subscriptions = (parsed.subscriptions || []).map((sub: any) => ({
          ...sub,
          currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null,
          createdAt: new Date(sub.createdAt),
          updatedAt: new Date(sub.updatedAt),
        }));
        this.usageLogs = (parsed.usageLogs || []).map((log: any) => ({
          ...log,
          createdAt: new Date(log.createdAt),
        }));
        this.logger.log(`Loaded ${this.users.length} users and ${this.summaries.length} summaries from local store.`);
      }
    } catch (err: any) {
      this.logger.warn(`Failed to read local store: ${err.message}. Starting fresh.`);
    }
  }

  private saveLocalData() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const payload = {
        users: this.users,
        summaries: this.summaries,
        subscriptions: this.subscriptions,
        usageLogs: this.usageLogs,
        lastUpdated: new Date().toISOString(),
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(payload, null, 2));
    } catch (err: any) {
      this.logger.warn(`Could not save local DB: ${err.message}`);
    }
  }

  // ─── Google Sheet Real-time Sync ───────────────────────────────────────────
  private async syncToGoogleSheet(action: string, entityType: string, record: any) {
    if (!this.googleSheetUrl) return;
    try {
      await fetch(this.googleSheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          entity: entityType,
          data: record,
        }),
      });
    } catch (err: any) {
      this.logger.warn(`Google Sheet sync failed: ${err.message}`);
    }
  }

  private async syncFromGoogleSheet() {
    if (!this.googleSheetUrl) return;
    try {
      const res = await fetch(`${this.googleSheetUrl}?action=getAll`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.users && data.users.length) {
          this.users = data.users.map((u: any) => ({
            ...u,
            lastUsageDate: new Date(u.lastUsageDate),
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt),
          }));
        }
        if (data && data.summaries && data.summaries.length) {
          this.summaries = data.summaries.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          }));
        }
        this.saveLocalData();
        this.logger.log(`Successfully synced from Google Sheet! Users: ${this.users.length}`);
      }
    } catch (err: any) {
      this.logger.warn(`Google Sheet pull failed: ${err.message}`);
    }
  }

  // ─── Seed Default Users ───────────────────────────────────────────────────
  private async seedDefaultUsers() {
    this.logger.log('Seeding default demo users (demo@brieflyai.com, pro@brieflyai.com, admin@brieflyai.com)...');
    const demoPass = await bcrypt.hash('DemoPass123!', 10);
    const proPass = await bcrypt.hash('ProPass123!', 10);
    const adminPass = await bcrypt.hash('AdminPass123!', 10);

    const now = new Date();
    this.users = [
      {
        id: 'usr_demo_101',
        email: 'demo@brieflyai.com',
        passwordHash: demoPass,
        name: 'Demo User',
        role: 'USER',
        plan: 'FREE',
        dailyUsageCount: 0,
        lastUsageDate: now,
        geminiApiKey: null,
        openaiApiKey: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr_pro_202',
        email: 'pro@brieflyai.com',
        passwordHash: proPass,
        name: 'Alex Rivera (Pro)',
        role: 'USER',
        plan: 'PRO',
        dailyUsageCount: 0,
        lastUsageDate: now,
        geminiApiKey: null,
        openaiApiKey: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr_admin_303',
        email: 'admin@brieflyai.com',
        passwordHash: adminPass,
        name: 'System Admin',
        role: 'ADMIN',
        plan: 'PRO',
        dailyUsageCount: 0,
        lastUsageDate: now,
        geminiApiKey: null,
        openaiApiKey: null,
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.subscriptions = [
      {
        id: 'sub_pro_202',
        userId: 'usr_pro_202',
        plan: 'PRO',
        status: 'ACTIVE',
        stripeCustomerId: null,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.saveLocalData();
  }

  // ─── Prisma-Compatible API Interface ──────────────────────────────────────

  // 1. USER TABLE
  readonly user = {
    findUnique: async (args: { where: { email?: string; id?: string }; select?: any; include?: any }) => {
      let found: UserEntity | undefined;
      if (args.where.email) {
        found = this.users.find((u) => u.email.toLowerCase() === args.where.email!.toLowerCase());
      } else if (args.where.id) {
        found = this.users.find((u) => u.id === args.where.id);
      }
      if (!found) return null;
      const res: any = this.filterUserFields(found, args.select);
      if (args.include?.subscription) {
        res.subscription = this.subscriptions.find((s) => s.userId === found!.id) || null;
      }
      return res;
    },

    findMany: async (args?: { skip?: number; take?: number; orderBy?: any; select?: any }) => {
      let list = [...this.users];
      if (args?.skip) list = list.slice(args.skip);
      if (args?.take) list = list.slice(0, args.take);
      return list.map((u) => this.filterUserFields(u, args?.select));
    },

    count: async (args?: { where?: any }) => {
      if (!args?.where) return this.users.length;
      return this.users.filter((u) => {
        if (args.where.plan && u.plan !== args.where.plan) return false;
        if (args.where.role && u.role !== args.where.role) return false;
        return true;
      }).length;
    },

    create: async (args: { data: any; select?: any }) => {
      const now = new Date();
      const newUser: UserEntity = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        email: args.data.email.toLowerCase(),
        passwordHash: args.data.passwordHash,
        name: args.data.name,
        role: args.data.role || 'USER',
        plan: args.data.plan || 'FREE',
        dailyUsageCount: args.data.dailyUsageCount || 0,
        lastUsageDate: now,
        geminiApiKey: args.data.geminiApiKey || null,
        openaiApiKey: args.data.openaiApiKey || null,
        createdAt: now,
        updatedAt: now,
      };
      this.users.push(newUser);
      this.saveLocalData();
      this.syncToGoogleSheet('insert', 'Users', newUser);
      return this.filterUserFields(newUser, args.select);
    },

    update: async (args: { where: { id?: string; email?: string }; data: any; select?: any }) => {
      let idx = -1;
      if (args.where.id) {
        idx = this.users.findIndex((u) => u.id === args.where.id);
      } else if (args.where.email) {
        idx = this.users.findIndex((u) => u.email.toLowerCase() === args.where.email!.toLowerCase());
      }
      if (idx === -1) throw new Error('User not found');

      const existing = this.users[idx];
      const updated: UserEntity = {
        ...existing,
        ...args.data,
        updatedAt: new Date(),
      };
      this.users[idx] = updated;
      this.saveLocalData();
      this.syncToGoogleSheet('update', 'Users', updated);
      return this.filterUserFields(updated, args.select);
    },
  };

  private filterUserFields(user: UserEntity, select?: any) {
    if (!select) return user;
    const res: any = {};
    for (const key of Object.keys(select)) {
      if (select[key]) {
        res[key] = (user as any)[key];
      }
    }
    return res;
  }

  // 2. SUMMARY TABLE
  readonly summary = {
    create: async (args: { data: any }) => {
      const now = new Date();
      const newSummary: SummaryEntity = {
        id: `sum_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: args.data.userId,
        title: args.data.title,
        sourceUrl: args.data.sourceUrl || null,
        sourceType: args.data.sourceType,
        originalTextLength: args.data.originalTextLength || 0,
        wordCount: args.data.wordCount || 0,
        readingTimeMinutes: args.data.readingTimeMinutes || 1,
        overview: args.data.overview,
        keyPoints: args.data.keyPoints || [],
        keyInsights: args.data.keyInsights || [],
        actionItems: args.data.actionItems || [],
        rawExcerpt: args.data.rawExcerpt || null,
        aiModel: args.data.aiModel || 'smart-engine',
        summaryLength: args.data.summaryLength || 'standard',
        tone: args.data.tone || 'executive',
        category: args.data.category || 'General',
        isFavorite: args.data.isFavorite || false,
        createdAt: now,
        updatedAt: now,
      };
      this.summaries.unshift(newSummary);
      this.saveLocalData();
      this.syncToGoogleSheet('insert', 'Summaries', newSummary);
      return newSummary;
    },

    findMany: async (args?: { where?: any; skip?: number; take?: number; orderBy?: any; include?: any }) => {
      let list = [...this.summaries];

      if (args?.where) {
        const w = args.where;
        list = list.filter((s) => {
          if (w.userId && s.userId !== w.userId) return false;
          if (w.sourceType && s.sourceType !== w.sourceType) return false;
          if (w.category && s.category !== w.category) return false;
          if (w.isFavorite !== undefined && s.isFavorite !== w.isFavorite) return false;
          if (w.OR && Array.isArray(w.OR)) {
            const matchesSearch = w.OR.some((clause: any) => {
              if (clause.title?.contains) {
                return s.title.toLowerCase().includes(clause.title.contains.toLowerCase());
              }
              if (clause.overview?.contains) {
                return s.overview.toLowerCase().includes(clause.overview.contains.toLowerCase());
              }
              return false;
            });
            if (!matchesSearch) return false;
          }
          return true;
        });
      }

      if (args?.orderBy?.createdAt === 'desc') {
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else if (args?.orderBy?.createdAt === 'asc') {
        list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }

      if (args?.skip) list = list.slice(args.skip);
      if (args?.take) list = list.slice(0, args.take);

      // Attach user info if needed
      return list.map((s) => {
        const user = this.users.find((u) => u.id === s.userId);
        return {
          ...s,
          user: user ? { name: user.name, email: user.email } : undefined,
        };
      });
    },

    findUnique: async (args: { where: { id: string }; include?: any }) => {
      const found = this.summaries.find((s) => s.id === args.where.id);
      if (!found) return null;
      if (args.include?.user) {
        const user = this.users.find((u) => u.id === found.userId);
        return {
          ...found,
          user: user ? { name: user.name, email: user.email } : undefined,
        };
      }
      return found;
    },

    count: async (args?: { where?: any }) => {
      if (!args?.where) return this.summaries.length;
      return (await this.summary.findMany({ where: args.where })).length;
    },

    update: async (args: { where: { id: string }; data: any }) => {
      const idx = this.summaries.findIndex((s) => s.id === args.where.id);
      if (idx === -1) throw new Error('Summary not found');
      const updated: SummaryEntity = {
        ...this.summaries[idx],
        ...args.data,
        updatedAt: new Date(),
      };
      this.summaries[idx] = updated;
      this.saveLocalData();
      this.syncToGoogleSheet('update', 'Summaries', updated);
      return updated;
    },

    delete: async (args: { where: { id: string } }) => {
      const idx = this.summaries.findIndex((s) => s.id === args.where.id);
      if (idx === -1) throw new Error('Summary not found');
      const removed = this.summaries.splice(idx, 1)[0];
      this.saveLocalData();
      this.syncToGoogleSheet('delete', 'Summaries', { id: args.where.id });
      return removed;
    },
  };

  // 3. SUBSCRIPTION TABLE
  readonly subscription = {
    findUnique: async (args: { where: { userId: string } }) => {
      const found = this.subscriptions.find((s) => s.userId === args.where.userId);
      return found || null;
    },

    upsert: async (args: { where: { userId: string }; create: any; update: any }) => {
      const idx = this.subscriptions.findIndex((s) => s.userId === args.where.userId);
      const now = new Date();
      if (idx !== -1) {
        const updated: SubscriptionEntity = {
          ...this.subscriptions[idx],
          ...args.update,
          updatedAt: now,
        };
        this.subscriptions[idx] = updated;
        this.saveLocalData();
        this.syncToGoogleSheet('update', 'Subscriptions', updated);
        return updated;
      } else {
        const created: SubscriptionEntity = {
          id: `sub_${Date.now()}`,
          userId: args.where.userId,
          plan: args.create.plan || 'PRO',
          status: args.create.status || 'ACTIVE',
          stripeCustomerId: args.create.stripeCustomerId || null,
          currentPeriodEnd: args.create.currentPeriodEnd || null,
          createdAt: now,
          updatedAt: now,
        };
        this.subscriptions.push(created);
        this.saveLocalData();
        this.syncToGoogleSheet('insert', 'Subscriptions', created);
        return created;
      }
    },

    updateMany: async (args: { where: { userId: string }; data: any }) => {
      let count = 0;
      this.subscriptions.forEach((s) => {
        if (s.userId === args.where.userId) {
          Object.assign(s, args.data, { updatedAt: new Date() });
          count++;
          this.syncToGoogleSheet('update', 'Subscriptions', s);
        }
      });
      this.saveLocalData();
      return { count };
    },
  };

  // 4. USAGE LOG TABLE
  readonly usageLog = {
    create: async (args: { data: any }) => {
      const newLog: UsageLogEntity = {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: args.data.userId,
        sourceType: args.data.sourceType,
        aiModel: args.data.aiModel,
        tokensUsed: args.data.tokensUsed || 0,
        createdAt: new Date(),
      };
      this.usageLogs.push(newLog);
      this.saveLocalData();
      this.syncToGoogleSheet('insert', 'UsageLogs', newLog);
      return newLog;
    },

    aggregate: async (args: { _sum: { tokensUsed: boolean } }) => {
      const sum = this.usageLogs.reduce((acc, log) => acc + (log.tokensUsed || 0), 0);
      return { _sum: { tokensUsed: sum } };
    },
  };
}
