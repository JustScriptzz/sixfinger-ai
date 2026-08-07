import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = process.env.API_BASE || 'https://re.sixfinger.live/v1';
const API_KEY  = process.env.API_KEY  || '';

app.use(express.json({ limit: '4mb' }));
app.use(express.static(join(__dirname, 'public')));

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true }));

// ── GET /api/models ──────────────────────────────────────────────────────────
app.get('/api/models', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/models`, {
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
      },
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error('[models]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/chat  (streaming SSE proxy) ────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const upstream = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
      },
      body: JSON.stringify({ ...req.body, stream: true }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      return res.status(upstream.status).send(txt);
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const reader = upstream.body.getReader();
    const dec    = new TextDecoder();

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(dec.decode(value, { stream: true }));
        }
      } catch { /* client disconnected */ }
      res.end();
    };

    pump();
    req.on('close', () => reader.cancel().catch(() => {}));
  } catch (err) {
    console.error('[chat]', err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// ── POST /api/chat/nostream  (non-streaming fallback) ─────────────────────────
app.post('/api/chat/nostream', async (req, res) => {
  try {
    const upstream = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
      },
      body: JSON.stringify({ ...req.body, stream: false }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SPA catch-all ─────────────────────────────────────────────────────────────
app.get('*', (_, res) =>
  res.sendFile(join(__dirname, 'public', 'index.html'))
);

app.listen(PORT, () => console.log(`🚀  SixFinger AI  →  http://localhost:${PORT}`));
