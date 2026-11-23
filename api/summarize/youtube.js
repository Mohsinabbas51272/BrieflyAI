module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const url = body.url || 'https://youtube.com';
  const modelPreference = body.modelPreference || 'gemini-1.5-flash';
  const summaryLength = body.summaryLength || 'standard';
  const tone = body.tone || 'executive';

  const newSummary = {
    id: `sum_yt_${Date.now()}`,
    userId: 'usr_demo',
    title: `YouTube Video Summary: ${url}`,
    sourceUrl: url,
    sourceType: 'YOUTUBE',
    originalTextLength: 6200,
    wordCount: 310,
    readingTimeMinutes: 2,
    overview: `Key points extracted directly from video speech and transcript at ${url}. Highlights the major thesis, presentation sections, and key timestamps.`,
    keyPoints: [
      'Comprehensive overview of speaker discussion points.',
      'Important examples and demonstrations extracted chronologically.',
      'Conclusions and final recommendations outlined with precision.'
    ],
    keyInsights: [
      'Saves viewers 80%+ of viewing time while retaining all pivotal context.',
      'Ideal for lectures, technical presentations, and product teardowns.'
    ],
    actionItems: [
      'Review highlighted timestamp segments for deep dive.',
      'Save summary to personal library for rapid reference.'
    ],
    rawExcerpt: `Transcript excerpts parsed from YouTube video...`,
    aiModel: modelPreference,
    summaryLength,
    tone,
    category: 'Video & Media',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return res.status(200).json({
    summary: newSummary,
    remainingToday: 'Unlimited',
    dailyUsageCount: 1,
    plan: 'PRO'
  });
};
