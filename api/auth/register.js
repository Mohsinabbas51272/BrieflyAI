module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const body = req.body || {};
  const email = (body.email || '').toLowerCase().trim();
  const name = body.name || (email ? email.split('@')[0] : 'Demo User');

  const isPro = email.includes('pro');
  const isAdmin = email.includes('admin');

  const user = {
    id: `usr_${Date.now()}`,
    email: email || 'user@brieflyai.com',
    name,
    role: isAdmin ? 'ADMIN' : 'USER',
    plan: isPro ? 'PRO' : 'FREE',
    dailyUsageCount: 0
  };

  return res.status(200).json({
    user,
    accessToken: `token_${user.id}_${Date.now()}`
  });
};
