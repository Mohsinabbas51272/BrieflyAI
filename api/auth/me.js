module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim().toLowerCase();

  const isPro = token.includes('pro');
  const isAdmin = token.includes('admin');

  const user = {
    id: isAdmin ? 'usr_admin' : isPro ? 'usr_pro' : 'usr_demo',
    email: isAdmin ? 'admin@brieflyai.com' : isPro ? 'pro@brieflyai.com' : 'demo@brieflyai.com',
    name: isAdmin ? 'System Admin' : isPro ? 'Alex Rivera (Pro)' : 'Demo User',
    role: isAdmin ? 'ADMIN' : 'USER',
    plan: isPro || isAdmin ? 'PRO' : 'FREE',
    dailyUsageCount: 0
  };

  return res.status(200).json(user);
};
