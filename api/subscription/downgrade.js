module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    success: true,
    message: 'Switched to Free tier.',
    user: {
      id: 'usr_demo',
      email: 'demo@brieflyai.com',
      name: 'Demo User',
      role: 'USER',
      plan: 'FREE',
      dailyUsageCount: 0
    }
  });
};
