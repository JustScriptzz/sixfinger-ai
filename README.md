# SixFinger AI

A chat web app backed by the SixFinger API (`re.sixfinger.live`).

## Stack
- Static `index.html` (vanilla JS, no build step)
- `/api/models.js`, `/api/chat.js` — Vercel serverless functions that proxy the backend
  and keep the API key server-side only
- Streaming responses via SSE

## Deploy on Vercel

1. Import this repo on [vercel.com](https://vercel.com) → New Project
2. Add environment variable: `API_KEY` = your SixFinger key
   (optional: `API_BASE`, defaults to `https://re.sixfinger.live/v1`)
3. Deploy

**Important:** if the deployed site can't load models or send messages, check that
`API_KEY` is actually set in the Vercel project's Environment Variables — that's the
most common cause of failures.

## Local dev

```bash
npm i -g vercel   # once
vercel dev
```
`vercel dev` runs the `/api` functions locally exactly as they run in production.
