import { PrismaClient, Role, Plan, SourceType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.usageLog.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash('AdminPass123!', 10);
  const hashedUserPassword = await bcrypt.hash('DemoPass123!', 10);
  const hashedProPassword = await bcrypt.hash('ProPass123!', 10);

  // 1. Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@brieflyai.com',
      passwordHash: hashedAdminPassword,
      name: 'Sarah Chen (Admin)',
      role: Role.ADMIN,
      plan: Plan.PRO,
      dailyUsageCount: 2,
    },
  });

  // 2. Demo Free User
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@brieflyai.com',
      passwordHash: hashedUserPassword,
      name: 'Alex Rivera',
      role: Role.USER,
      plan: Plan.FREE,
      dailyUsageCount: 2,
    },
  });

  // 3. Demo Pro User
  const proUser = await prisma.user.create({
    data: {
      email: 'pro@brieflyai.com',
      passwordHash: hashedProPassword,
      name: 'Marcus Vance',
      role: Role.USER,
      plan: Plan.PRO,
      dailyUsageCount: 7,
    },
  });

  await prisma.subscription.create({
    data: {
      userId: proUser.id,
      plan: Plan.PRO,
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 4. Seed initial realistic summaries for demoUser
  await prisma.summary.create({
    data: {
      userId: demoUser.id,
      title: 'State of AI Agents in 2026: Autonomous Workflows and Multi-Agent Orchestration',
      sourceUrl: 'https://news.ycombinator.com/item?id=398271',
      sourceType: SourceType.URL,
      originalTextLength: 4820,
      wordCount: 420,
      readingTimeMinutes: 3,
      category: 'Artificial Intelligence',
      aiModel: 'gemini-1.5-flash',
      summaryLength: 'standard',
      tone: 'executive',
      isFavorite: true,
      overview: 'Autonomous AI agents have matured from experimental prompt chains into production-grade systems coordinating multi-step software development, customer support, and financial analysis. Enterprise adoption focuses on reliability guards, deterministic workflows, and asynchronous message passing.',
      keyPoints: [
        'Shift from single monolithic models to collaborative swarms of lightweight task-specialized agents.',
        'Deterministic state machines and guardrails reduce hallucination risk in production environments.',
        'Context window efficiency has improved 4x through dynamic retrieval augmented generation (RAG) pruning.',
        'Security frameworks now enforce strict least-privilege sandboxing for tool execution.',
        'Enterprise ROI is highest in automated triage, developer productivity, and document synthesis.'
      ],
      keyInsights: [
        'Latency remains the primary UX barrier for interactive multi-agent chat interactions.',
        'Human-in-the-loop validation patterns are transitioning from veto power to audit log review.'
      ],
      actionItems: [
        'Audit internal repetitive workflows suitable for agentic automation pipelines.',
        'Implement standardized structured schema outputs (JSON Schema) for all external API integrations.',
        'Establish automated evaluation benchmarks for prompt regression testing.'
      ],
      rawExcerpt: 'As artificial intelligence continues its rapid trajectory, the transition from basic LLM completions to autonomous agents represents the most consequential architectural shift...',
    },
  });

  await prisma.summary.create({
    data: {
      userId: demoUser.id,
      title: 'Next-Gen Frontend Architectures: React Server Components & Streaming SSR',
      sourceUrl: 'https://www.youtube.com/watch?v=k5jG2w8D3-4',
      sourceType: SourceType.YOUTUBE,
      originalTextLength: 6200,
      wordCount: 510,
      readingTimeMinutes: 4,
      category: 'Software Engineering',
      aiModel: 'gpt-4o-mini',
      summaryLength: 'detailed',
      tone: 'technical',
      isFavorite: true,
      overview: 'This comprehensive technical keynote dissects modern frontend rendering paradigms, comparing React Server Components (RSC) with islands architecture. The speaker emphasizes progressive enhancement, minimal client bundle transfer, and zero-bundle server utilities.',
      keyPoints: [
        'React Server Components eliminate client JavaScript overhead for static and read-only subtrees.',
        'Suspense boundaries allow granular streaming hydration, preventing blank screen states on heavy pages.',
        'Data colocation directly inside async components simplifies backend API dependency chains.',
        'Caching primitives must be carefully configured to avoid stale session state leaks.',
        'Hybrid hybrid rendering architectures outperform traditional Single Page Apps (SPA) on core web vitals.'
      ],
      keyInsights: [
        'Bundle size directly correlates with mobile conversion rates; RSC reduces initial payload by up to 60%.',
        'Developer mental model shifts from state mutation to immutable server-rendered views.'
      ],
      actionItems: [
        'Audit client bundle sizes and identify component trees suitable for server-only rendering.',
        'Refactor deep nested suspense boundaries to stream high-priority hero elements first.',
        'Configure Edge caching headers on frequently visited marketing pages.'
      ],
      rawExcerpt: 'Welcome everyone! Today we are diving deep into the future of frontend engineering. Why are companies migrating from traditional client-heavy SPAs to streaming server components?...',
    },
  });

  await prisma.summary.create({
    data: {
      userId: demoUser.id,
      title: 'Global SaaS Financial Benchmark Report Q1 2026',
      sourceUrl: 'q1-2026-saas-benchmarks.pdf',
      sourceType: SourceType.PDF,
      originalTextLength: 12400,
      wordCount: 580,
      readingTimeMinutes: 5,
      category: 'Finance & SaaS',
      aiModel: 'gemini-1.5-pro',
      summaryLength: 'detailed',
      tone: 'executive',
      isFavorite: false,
      overview: 'An extensive benchmark report analyzing 350+ B2B SaaS companies. Key metrics highlight net revenue retention (NRR) stabilization at 108%, a resurgence in customer lifetime value (LTV), and capital efficiency metrics becoming the primary investor hurdle rate.',
      keyPoints: [
        'Median Rule of 40 performance shifted from growth-at-all-costs to 25% growth + 15% free cash flow margin.',
        'Annual Contract Value (ACV) increased 14% year-over-year driven by usage-based AI feature tiering.',
        'Customer Acquisition Cost (CAC) payback periods widened to 18 months for middle-market deals.',
        'Gross revenue retention (GRR) averaged 91%, showing sustained software stickiness.',
        'Pricing models are rapidly adopting hybrid subscriptions: base seat license + metered AI credits.'
      ],
      keyInsights: [
        'Companies providing measurable AI productivity features saw 22% higher expansion revenue.',
        'Security compliance (SOC2 Type II, ISO 27001) is now table stakes even for seed-stage B2B vendors.'
      ],
      actionItems: [
        'Review pricing tiers to incorporate metered token/credit usage alongside recurring subscriptions.',
        'Focus customer success motions on accounts with NRR expansion potential prior to 90-day renewal windows.',
        'Streamline enterprise security questionnaires to accelerate 18-month sales velocity.'
      ],
      rawExcerpt: 'This quarterly SaaS index analyzes performance across enterprise, mid-market, and high-velocity product-led growth organizations worldwide...',
    },
  });

  // Seed usage logs
  await prisma.usageLog.createMany({
    data: [
      { userId: demoUser.id, sourceType: SourceType.URL, aiModel: 'gemini-1.5-flash', tokensUsed: 980 },
      { userId: demoUser.id, sourceType: SourceType.YOUTUBE, aiModel: 'gpt-4o-mini', tokensUsed: 1350 },
      { userId: proUser.id, sourceType: SourceType.PDF, aiModel: 'gemini-1.5-pro', tokensUsed: 2600 },
      { userId: proUser.id, sourceType: SourceType.URL, aiModel: 'gpt-4o', tokensUsed: 1450 },
      { userId: admin.id, sourceType: SourceType.URL, aiModel: 'gemini-1.5-flash', tokensUsed: 1100 },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
