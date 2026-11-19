import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan, Role, SourceType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const [
      totalUsers,
      totalSummaries,
      proUsers,
      freeUsers,
      urlCount,
      youtubeCount,
      pdfCount,
      totalTokensAgg,
      recentSummaries,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.summary.count(),
      this.prisma.user.count({ where: { plan: Plan.PRO } }),
      this.prisma.user.count({ where: { plan: Plan.FREE } }),
      this.prisma.summary.count({ where: { sourceType: SourceType.URL } }),
      this.prisma.summary.count({ where: { sourceType: SourceType.YOUTUBE } }),
      this.prisma.summary.count({ where: { sourceType: SourceType.PDF } }),
      this.prisma.usageLog.aggregate({
        _sum: { tokensUsed: true },
      }),
      this.prisma.summary.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    const totalTokens = totalTokensAgg._sum.tokensUsed || 0;
    const conversionRate = totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0;

    return {
      overview: {
        totalUsers,
        totalSummaries,
        proUsers,
        freeUsers,
        conversionRate,
        totalTokensProcessed: totalTokens,
      },
      distribution: {
        bySourceType: {
          URL: urlCount,
          YOUTUBE: youtubeCount,
          PDF: pdfCount,
        },
      },
      recentSummaries,
    };
  }

  async getUsers(page: number = 1, limit: number = 20) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          dailyUsageCount: true,
          lastUsageDate: true,
          createdAt: true,
          _count: {
            select: { summaries: true },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserPlan(userId: string, plan: Plan) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: { id: true, email: true, name: true, plan: true, role: true },
    });

    return updated;
  }

  async updateUserRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, plan: true, role: true },
    });

    return updated;
  }
}
