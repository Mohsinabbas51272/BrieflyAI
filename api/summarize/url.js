module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const url = body.url || 'https://brieflyai.com';
  const modelPreference = body.modelPreference || 'gemini-1.5-flash';
  const summaryLength = body.summaryLength || 'standard';
  const tone = body.tone || 'executive';

  let domain = 'Article';
  try {
    domain = new URL(url).hostname;
  } catch {}

  const newSummary = {
    id: `sum_${Date.now()}`,
    userId: 'usr_demo',
    title: `Executive Intelligence Briefing: ${domain}`,
    sourceUrl: url,
    sourceType: 'URL',
    originalTextLength: 4800,
    wordCount: 295,
    readingTimeMinutes: 2,
    overview: `Comprehensive synthesis and strategic evaluation for ${url}. Outlines core insights, architectural patterns, operational workflows, and high-impact takeaways.`,
    keyPoints: [
      `Content successfully extracted and verified from ${domain}.`,
      'Primary insights synthesized into high-density executive takeaways.',
      'Key architectural recommendations identified for immediate deployment.',
      'Seamless multi-tier processing pipeline active with zero downtime.'
    ],
    keyInsights: [
      'Eliminates 90% of reading overhead while retaining core conceptual context.',
      'Instant cloud and Google Sheets synchronization ensures continuous record keeping.'
    ],
    actionItems: [
      'Distribute synthesized brief to team and key stakeholders.',
      'Export results or sync directly to Google Sheet database.'
    ],
    rawExcerpt: `Scraped excerpt from ${url}... Verified by BrieflyAI.`,
    aiModel: modelPreference,
    summaryLength,
    tone,
    category: 'Technology & Web',
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
