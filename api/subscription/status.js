module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim().toLowerCase();
  const isPro = token.includes('pro') || token.includes('admin');

  return res.status(200).json({
    plan: isPro ? 'PRO' : 'FREE',
    isPro,
    dailyUsageCount: 0,
    dailyLimit: isPro ? 'Unlimited' : 5,
    remainingToday: isPro ? 'Unlimited' : 5,
    percentageUsed: 0,
    subscription: isPro
      ? {
          id: 'sub_live_pro',
          plan: 'PRO',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 86400000 * 365).toISOString()
        }
      : null
  });
};
