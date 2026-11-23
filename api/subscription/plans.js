module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json([
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      billing: 'Forever free',
      features: [
        '5 AI Summaries per day',
        'URL & Web Article extraction',
        'YouTube transcript summarization',
        'PDF document analysis (up to 10MB)',
        'Standard executive & bullet formatting',
        'Chrome Extension access'
      ],
      highlight: false
    },
    {
      id: 'pro',
      name: 'Pro Lifetime',
      price: 29,
      billing: 'One-time payment',
      features: [
        'Unlimited AI Summaries',
        'Priority Gemini 1.5 Pro & Flash models',
        'Custom summary length & professional tones',
        'Direct Google Sheets 2-way sync',
        'Full export to CSV, Markdown & PDF',
        'Bring Your Own API Keys (BYOK)',
        '24/7 Priority Support'
      ],
      highlight: true
    }
  ]);
};
