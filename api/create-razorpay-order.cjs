module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Mock response for now
    const mockOrder = {
      id: `order_${Date.now()}`,
      amount: parseInt(amount),
      currency,
      receipt: `receipt_${Date.now()}`,
      status: 'created'
    };

    return res.status(200).json(mockOrder);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    });
  }
};