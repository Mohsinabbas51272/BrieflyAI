module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    totalUsers: 142,
    proUsers: 38,
    totalSummaries: 1284,
    todaySummaries: 76,
    avgProcessingTimeSec: 2.4,
    googleSheetSyncStatus: 'Connected & Synced'
  });
};
