import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UrlExtractorService } from './extractors/url-extractor.service';
import { YoutubeExtractorService } from './extractors/youtube-extractor.service';
import { PdfExtractorService } from './extractors/pdf-extractor.service';
import { AiService } from './ai/ai.service';
import { Plan, SourceType } from '@prisma/client';

@Injectable()
export class SummarizeService {
  constructor(
    private prisma: PrismaService,
    private urlExtractor: UrlExtractorService,
    private youtubeExtractor: YoutubeExtractorService,
    private pdfExtractor: PdfExtractorService,
    private aiService: AiService,
  ) {}

  // 1. Check and increment usage
  private async checkAndIncrementUsage(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const now = new Date();
    const lastDate = new Date(user.lastUsageDate);
    let dailyCount = user.dailyUsageCount;

    if (
      now.getFullYear() !== lastDate.getFullYear() ||
      now.getMonth() !== lastDate.getMonth() ||
      now.getDate() !== lastDate.getDate()
    ) {
      dailyCount = 0;
    }

    if (user.plan === Plan.FREE && dailyCount >= 5) {
      throw new ForbiddenException(
        'You have reached your Free daily limit of 5 summaries. Upgrade to BrieflyAI Pro for unlimited summaries and priority models!'
      );
    }

    // Increment
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        dailyUsageCount: dailyCount + 1,
        lastUsageDate: now,
      },
      select: {
        id: true,
        dailyUsageCount: true,
        plan: true,
        geminiApiKey: true,
        openaiApiKey: true,
      },
    });

    return updatedUser;
  }

  // 2. Summarize URL
  async summarizeUrl(
    userId: string,
    url: string,
    options?: { modelPreference?: string; summaryLength?: string; tone?: string }
  ) {
    const user = await this.checkAndIncrementUsage(userId);
    const extracted = await this.urlExtractor.extractFromUrl(url);

    const generated = await this.aiService.generateSummary({
      title: extracted.title,
      content: extracted.content,
      modelPreference: options?.modelPreference,
      summaryLength: options?.summaryLength,
      tone: options?.tone,
      userGeminiKey: user.geminiApiKey || undefined,
      userOpenaiKey: user.openaiApiKey || undefined,
    });

    const summary = await this.prisma.summary.create({
      data: {
        userId,
        title: generated.title || extracted.title,
        sourceUrl: url,
        sourceType: SourceType.URL,
        originalTextLength: extracted.content.length,
        wordCount: extracted.wordCount,
        readingTimeMinutes: generated.readingTimeMinutes,
        overview: generated.overview,
        keyPoints: generated.keyPoints,
        keyInsights: generated.keyInsights,
        actionItems: generated.actionItems,
        rawExcerpt: extracted.content.slice(0, 1500),
        aiModel: generated.aiModelUsed,
        summaryLength: options?.summaryLength || 'standard',
        tone: generated.tone,
        category: generated.category,
      },
    });

    await this.prisma.usageLog.create({
      data: {
        userId,
        sourceType: SourceType.URL,
        aiModel: generated.aiModelUsed,
        tokensUsed: generated.tokensUsed,
      },
    });

    return {
      summary,
      remainingToday: user.plan === Plan.PRO ? 'Unlimited' : Math.max(0, 5 - user.dailyUsageCount),
      dailyUsageCount: user.dailyUsageCount,
      plan: user.plan,
    };
  }

  // 3. Summarize YouTube
  async summarizeYoutube(
    userId: string,
    url: string,
    options?: { modelPreference?: string; summaryLength?: string; tone?: string }
  ) {
    const user = await this.checkAndIncrementUsage(userId);
    const extracted = await this.youtubeExtractor.extractTranscript(url);

    const generated = await this.aiService.generateSummary({
      title: extracted.title,
      content: extracted.content,
      modelPreference: options?.modelPreference,
      summaryLength: options?.summaryLength,
      tone: options?.tone,
      userGeminiKey: user.geminiApiKey || undefined,
      userOpenaiKey: user.openaiApiKey || undefined,
    });

    const summary = await this.prisma.summary.create({
      data: {
        userId,
        title: generated.title || extracted.title,
        sourceUrl: url,
        sourceType: SourceType.YOUTUBE,
        originalTextLength: extracted.content.length,
        wordCount: extracted.wordCount,
        readingTimeMinutes: generated.readingTimeMinutes,
        overview: generated.overview,
        keyPoints: generated.keyPoints,
        keyInsights: generated.keyInsights,
        actionItems: generated.actionItems,
        rawExcerpt: extracted.content.slice(0, 1500),
        aiModel: generated.aiModelUsed,
        summaryLength: options?.summaryLength || 'standard',
        tone: generated.tone,
        category: generated.category,
      },
    });

    await this.prisma.usageLog.create({
      data: {
        userId,
        sourceType: SourceType.YOUTUBE,
        aiModel: generated.aiModelUsed,
        tokensUsed: generated.tokensUsed,
      },
    });

    return {
      summary,
      remainingToday: user.plan === Plan.PRO ? 'Unlimited' : Math.max(0, 5 - user.dailyUsageCount),
      dailyUsageCount: user.dailyUsageCount,
      plan: user.plan,
    };
  }

  // 4. Summarize PDF
  async summarizePdf(
    userId: string,
    fileBuffer: Buffer,
    filename: string,
    options?: { modelPreference?: string; summaryLength?: string; tone?: string }
  ) {
    const user = await this.checkAndIncrementUsage(userId);
    const extracted = await this.pdfExtractor.extractFromBuffer(fileBuffer, filename);

    const generated = await this.aiService.generateSummary({
      title: extracted.title,
      content: extracted.content,
      modelPreference: options?.modelPreference,
      summaryLength: options?.summaryLength,
      tone: options?.tone,
      userGeminiKey: user.geminiApiKey || undefined,
      userOpenaiKey: user.openaiApiKey || undefined,
    });

    const summary = await this.prisma.summary.create({
      data: {
        userId,
        title: generated.title || extracted.title,
        sourceUrl: filename,
        sourceType: SourceType.PDF,
        originalTextLength: extracted.content.length,
        wordCount: extracted.wordCount,
        readingTimeMinutes: generated.readingTimeMinutes,
        overview: generated.overview,
        keyPoints: generated.keyPoints,
        keyInsights: generated.keyInsights,
        actionItems: generated.actionItems,
        rawExcerpt: extracted.content.slice(0, 1500),
        aiModel: generated.aiModelUsed,
        summaryLength: options?.summaryLength || 'standard',
        tone: generated.tone,
        category: generated.category,
      },
    });

    await this.prisma.usageLog.create({
      data: {
        userId,
        sourceType: SourceType.PDF,
        aiModel: generated.aiModelUsed,
        tokensUsed: generated.tokensUsed,
      },
    });

    return {
      summary,
      remainingToday: user.plan === Plan.PRO ? 'Unlimited' : Math.max(0, 5 - user.dailyUsageCount),
      dailyUsageCount: user.dailyUsageCount,
      plan: user.plan,
    };
  }
}
