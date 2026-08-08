export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const API_BASE = process.env.API_BASE || 'https://re.sixfinger.live/v1';
  const API_KEY  = process.env.API_KEY  || '';

  try {
    const upstream = await fetch(`${API_BASE}/models`, {
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
      },
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch models' });
  }
}
