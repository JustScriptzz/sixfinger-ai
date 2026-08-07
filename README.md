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

## Deploy to Railway

1. Push this repo to GitHub
2. New Railway project → Deploy from GitHub repo
3. Add env vars: `API_KEY`, optionally `PORT`
4. Done — Railway auto-detects Node.js via Nixpacks
