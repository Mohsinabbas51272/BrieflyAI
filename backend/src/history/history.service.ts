import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SourceType } from '@prisma/client';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async listSummaries(
    userId: string,
    query: {
      search?: string;
      sourceType?: string;
      isFavorite?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.sourceType && ['URL', 'YOUTUBE', 'PDF'].includes(query.sourceType.toUpperCase())) {
      where.sourceType = query.sourceType.toUpperCase() as SourceType;
    }

    if (query.isFavorite === 'true') {
      where.isFavorite = true;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { overview: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.summary.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.summary.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSummaryById(userId: string, summaryId: string, isAdmin: boolean = false) {
    const summary = await this.prisma.summary.findUnique({
      where: { id: summaryId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    if (summary.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to view this summary');
    }

    return summary;
  }

  async toggleFavorite(userId: string, summaryId: string) {
    const summary = await this.prisma.summary.findUnique({
      where: { id: summaryId },
    });

    if (!summary || summary.userId !== userId) {
      throw new NotFoundException('Summary not found');
    }

    const updated = await this.prisma.summary.update({
      where: { id: summaryId },
      data: { isFavorite: !summary.isFavorite },
    });

    return updated;
  }

  async deleteSummary(userId: string, summaryId: string, isAdmin: boolean = false) {
    const summary = await this.prisma.summary.findUnique({
      where: { id: summaryId },
    });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    if (summary.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this summary');
    }

    await this.prisma.summary.delete({
      where: { id: summaryId },
    });

    return { success: true, message: 'Summary deleted successfully' };
  }
}
