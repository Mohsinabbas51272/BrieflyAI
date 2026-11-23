module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { slug } = req.query;
  const id = Array.isArray(slug) ? slug[0] : slug;
  const action = Array.isArray(slug) && slug.length > 1 ? slug[1] : null;

  if (action === 'favorite') {
    return res.status(200).json({
      id: id || 'sum_1',
      isFavorite: true,
      updatedAt: new Date().toISOString()
    });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true, message: 'Summary deleted' });
  }

  return res.status(200).json({
    id: id || 'sum_1',
    userId: 'usr_demo',
    title: 'Executive Intelligence Briefing',
    sourceUrl: 'https://arxiv.org/abs/2501.12948',
    sourceType: 'URL',
    originalTextLength: 14200,
    wordCount: 320,
    readingTimeMinutes: 2,
    overview: 'DeepSeek-R1 introduces open-weights reasoning architectures trained using pure reinforcement learning without extensive supervised fine-tuning.',
    keyPoints: [
      'Reinforcement learning alone directly unlocks complex multi-step reasoning capabilities.',
      'Distillation from deep reasoning models empowers lightweight models significantly.'
    ],
    keyInsights: [
      'RL cold-start strategies provide higher reasoning density than pure SFT.'
    ],
    actionItems: [
      'Benchmark open-weights distillation across custom production tasks.'
    ],
    rawExcerpt: 'We introduce DeepSeek-R1-Zero and DeepSeek-R1...',
    aiModel: 'gemini-1.5-flash',
    summaryLength: 'standard',
    tone: 'executive',
    category: 'Research & AI',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};
