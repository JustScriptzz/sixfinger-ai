# SixFinger AI

AI chat interface — identical to Claude.ai's UI, powered by the SixFinger backend.

## Stack
- **Backend**: Node.js + Express (SSE streaming proxy)
- **Frontend**: Anthropic's real CSS from CDN + vanilla JS
- **API**: `re.sixfinger.live`

## Local setup

```bash
npm install
cp .env.example .env   # add your API_KEY
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import on [vercel.com](https://vercel.com) → New Project → select `sixfinger-ai`
3. Add env var: `API_KEY=your_key`
4. Deploy
