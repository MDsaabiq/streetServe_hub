export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({ 
    message: 'API working',
    amount: req.body?.amount || 0,
    timestamp: new Date().toISOString()
  });
}
