# AudioAid Web App

Full-stack app based on **React + Vite + Express**, Web Audio EQ, plus **in-browser pure-tone hearing check**.

| Path | Feature |
|------|---------|
| `/` | Music upload + 6-band peaking EQ + saved profiles |
| `/test` | Audiometric-style tone test → compensation curve |
| `/voice` | How to use **Bolna** voice agent in `../VOICE-aGENTS` |

## Run (Windows)

```powershell
cd VOICE-aGENTS\audioaid-app
copy .env.example .env
npm install
npm run dev
```

Open http://localhost:5000

## API

- `GET /api/health` — storage mode (`memory` or `supabase`)
- `GET/POST/DELETE /api/profiles` — EQ presets
- `GET/POST /api/hearing-tests` — saved thresholds + compensation

## Supabase

1. Run `supabase/schema.sql` in Supabase SQL Editor.
2. Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env`.

## Voice agent

From the parent folder (`VOICE-aGENTS`), set `AUDIOAID_APP_URL=http://localhost:5000` and run `npm run call`.
