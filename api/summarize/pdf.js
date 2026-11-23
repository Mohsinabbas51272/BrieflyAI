module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const newSummary = {
    id: `sum_pdf_${Date.now()}`,
    userId: 'usr_demo',
    title: 'PDF Document Analysis: Research Report',
    sourceUrl: null,
    sourceType: 'PDF',
    originalTextLength: 12400,
    wordCount: 350,
    readingTimeMinutes: 3,
    overview: 'Analysis and structured breakdown of the uploaded PDF document. Extracted executive summary, data findings, and core conclusions.',
    keyPoints: [
      'Document structure and multi-page text parsed successfully.',
      'Core statistical claims and analytical methodology validated.',
      'Strategic findings summarized for rapid executive consumption.'
    ],
    keyInsights: [
      'Document contains high-density tabular and empirical data.',
      'Follow-up experiments recommended in section 4.'
    ],
    actionItems: [
      'Review methodology appendices if implementing benchmark pipelines.',
      'Share structured summary with team members.'
    ],
    rawExcerpt: 'PDF content extracted...',
    aiModel: 'gemini-1.5-flash',
    summaryLength: 'standard',
    tone: 'executive',
    category: 'Document Analysis',
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
