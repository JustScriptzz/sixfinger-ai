export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const API_BASE = process.env.API_BASE || 'https://re.sixfinger.live/v1';
  const API_KEY  = process.env.API_KEY  || '';
  const body = req.body || {};
  const wantStream = body.stream !== false;

  try {
    const upstream = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
      },
      body: JSON.stringify({ ...body, stream: wantStream }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      res.status(upstream.status).send(txt);
      return;
    }

    if (!wantStream) {
      const data = await upstream.json();
      res.status(200).json(data);
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Chat request failed' });
    } else {
      res.end();
    }
  }
}
