module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'PATCH') {
    return res.status(200).json({
      id: 'sum_1',
      isFavorite: true,
      updatedAt: new Date().toISOString()
    });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true, message: 'Summary deleted' });
  }

  const mockItems = [
    {
      id: 'sum_1',
      userId: 'usr_demo',
      title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning',
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
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'sum_2',
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
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];

  return res.status(200).json({
    items: mockItems,
    meta: {
      total: mockItems.length,
      page: 1,
      limit: 50,
      totalPages: 1
    }
  });
};
