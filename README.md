# nina-web

Next.js frontend for NINA — onboarding, merchant dashboard, and marketing. Deploys separately from [Nina-AI](../Nina-AI) (FastAPI console + widget).

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- BFF proxy at `/api/nina/*` → FastAPI console

## Widget

The embed widget stays in **Nina-AI** (`src/nina/sdk/nina-bootstrap.js`) — vanilla JS, not part of this repo.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000/onboarding

### Environment

| Variable | Description |
|----------|-------------|
| `NINA_API_URL` | FastAPI console (default `http://127.0.0.1:8787`) |
| `NINA_CONSOLE_ADMIN_SECRET` | Server-only; proxies wizard/admin calls |
| `NEXT_PUBLIC_NINA_API_URL` | Public console URL for embed snippet |

Run the API from Nina-AI:

```bash
cd ../Nina-AI
$env:PYTHONPATH="src"; python -m nina.dev_launcher
```

## Design system

See `design-system/MASTER.md` and `design-system/pages/onboarding.md`.

## Repo layout

```
src/app/
  page.tsx              # Marketing home (minimal)
  onboarding/           # 3-step wizard
  dashboard/            # Merchant dashboard (WIP)
  api/nina/[...path]/   # BFF → console
src/components/
  onboarding/           # Step progress, journey rail, wizard
  layout/               # Site nav
src/lib/
  api-client.ts         # Typed envelope client
  types.ts
```

## Deploy

- **nina-web** → Vercel (or similar)
- **Nina-AI** → Render / your host for `/v1/query` + `/sdk`

Set `NINA_API_URL` to your production console URL.
