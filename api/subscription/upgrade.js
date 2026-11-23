module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    success: true,
    message: 'Upgraded to Pro Lifetime Plan! Enjoy unlimited summaries.',
    user: {
      id: 'usr_pro',
      email: 'pro@brieflyai.com',
      name: 'Alex Rivera (Pro)',
      role: 'USER',
      plan: 'PRO',
      dailyUsageCount: 0
    }
  });
};
