import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new BadRequestException('User not found');

    // Check if daily count needs resetting
    const now = new Date();
    const lastDate = new Date(user.lastUsageDate);
    let dailyUsageCount = user.dailyUsageCount;

    if (
      now.getFullYear() !== lastDate.getFullYear() ||
      now.getMonth() !== lastDate.getMonth() ||
      now.getDate() !== lastDate.getDate()
    ) {
      dailyUsageCount = 0;
      await this.prisma.user.update({
        where: { id: userId },
        data: { dailyUsageCount: 0, lastUsageDate: now },
      });
    }

    const isPro = user.plan === Plan.PRO;
    const limit = 5;
    const remainingToday = isPro ? 999999 : Math.max(0, limit - dailyUsageCount);

    return {
      plan: user.plan,
      isPro,
      dailyUsageCount,
      dailyLimit: isPro ? 'Unlimited' : limit,
      remainingToday: isPro ? 'Unlimited' : remainingToday,
      percentageUsed: isPro ? 0 : Math.min(100, Math.round((dailyUsageCount / limit) * 100)),
      subscription: user.subscription,
    };
  }

  async upgradeToPro(userId: string) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { plan: Plan.PRO },
    });

    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: Plan.PRO,
        status: 'ACTIVE',
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        plan: Plan.PRO,
        status: 'ACTIVE',
        currentPeriodEnd: periodEnd,
        stripeCustomerId: `cus_mock_${userId.slice(0, 8)}`,
      },
    });

    return {
      success: true,
      message: 'Successfully upgraded to BrieflyAI Pro! Enjoy unlimited summaries and premium models.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        plan: updatedUser.plan,
      },
      subscription,
    };
  }

  async downgradeToFree(userId: string) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { plan: Plan.FREE },
    });

    await this.prisma.subscription.updateMany({
      where: { userId },
      data: {
        plan: Plan.FREE,
        status: 'CANCELED',
      },
    });

    return {
      success: true,
      message: 'Subscription downgraded to Free plan.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        plan: updatedUser.plan,
      },
    };
  }

  getPlans() {
    return [
      {
        id: 'free',
        name: 'Starter Free',
        price: 0,
        billing: 'forever',
        features: [
          '5 summaries per day',
          'Summarize Web URLs & Articles',
          'YouTube Video Transcripts',
          'PDF Document Summaries (up to 5MB)',
          '5 Key Takeaway Points',
          'Short Overview & Action Items',
          'Search & History Management',
        ],
        highlight: false,
      },
      {
        id: 'pro',
        name: 'BrieflyAI Pro',
        price: 19,
        billing: 'per month',
        features: [
          'Unlimited summaries per day',
          'Priority Gemini 1.5 Pro & GPT-4o models',
          'Large PDF support up to 50MB',
          'Custom Tone & Depth Controls',
          'Markdown, PDF & JSON Export',
          'Custom BYO-Key Support',
          'Admin & Team Analytics',
          'Priority Customer Support',
        ],
        highlight: true,
      },
    ];
  }
}
