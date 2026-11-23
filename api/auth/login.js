module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const email = (body.email || '').toLowerCase().trim();
  const isPro = email.includes('pro');
  const isAdmin = email.includes('admin');

  const user = {
    id: isAdmin ? 'usr_admin' : isPro ? 'usr_pro' : 'usr_demo',
    email: email || 'demo@brieflyai.com',
    name: isAdmin ? 'System Admin' : isPro ? 'Alex Rivera (Pro)' : 'Demo User',
    role: isAdmin ? 'ADMIN' : 'USER',
    plan: isPro || isAdmin ? 'PRO' : 'FREE',
    dailyUsageCount: 0
  };

  return res.status(200).json({
    user,
    accessToken: `token_${user.id}_${Date.now()}`
  });
};
