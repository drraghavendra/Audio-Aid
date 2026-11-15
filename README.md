# ReDeliver AI · Voice Agents

**ReDeliver Assistant** is a multilingual voice agent for **failed delivery recovery**: reschedule, cancel, or update an address — with confirmation before any backend action.

Built for the **Build Out Loud** hackathon ([Wispr Flow](https://wisprflow.ai) × [Bolna](https://www.bolna.ai)):

| Tool | Role in this repo |
|------|-------------------|
| **Wispr Flow** | Speak prompts and edits in Cursor (build by voice) |
| **Bolna** | Runs the phone agent (STT → LLM → TTS) and telephony |
| **This codebase** | Agent prompt, API scripts, webhook stub, Day 2 business rules |

---

## Quick start

**Requirements:** Node.js 18+, a [Bolna](https://platform.bolna.ai) account and API key.

```powershell
cd VOICE-aGENTS
copy .env.example .env
# Edit .env — set BOLNA_API_KEY (never commit .env)

npm install
npm run verify
npm run agent:create -- --dry-run
npm run agent:create
```

After create, copy the returned `agent_id` into `.env` as `BOLNA_AGENT_ID`.

### Connect Bolna MCP in Cursor

```powershell
copy .cursor\mcp.json.example .cursor\mcp.json
```

Replace `YOUR_BOLNA_API_KEY` in `.cursor/mcp.json`, reload Cursor, then ask: *“List my Bolna agents.”*

Docs: [Bolna MCP quickstart](https://www.bolna.ai/docs/mcp-quickstart) · [Tool list](https://www.bolna.ai/docs/mcp-tool-list)

---

## How a call flows

```
Customer (phone) → Telephony → Bolna pipeline
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
                  STT             LLM             TTS
            (e.g. Soniox)    (system prompt)   (e.g. ElevenLabs)
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
                         Spoken reply to customer
```

**STT** — speech to text. **LLM** — intent, flow, languages. **TTS** — text to speech.

Default agent config uses **Soniox** (`stt-rt-v6`, `language: multi`) for English, Hindi, and Telugu code-switching. Override in `.env`:

```env
TRANSCRIBER_PROVIDER=deepgram
```

---

## NPM scripts

| Command | What it does |
|---------|----------------|
| `npm run verify` | Validate API key; show wallet balance |
| `npm run agent:create -- --dry-run` | Write `config/agent.export.json`; no API call |
| `npm run agent:create` | Create **ReDeliver Assistant** on Bolna |
| `npm run agent:update-prompt` | Push `prompts/system-prompt.md` to existing agent |
| `npm run agent:list` | List agents |
| `npm run agent:get` | Fetch agent by `BOLNA_AGENT_ID` or ID argument |
| `npm run call:dry-run` | Print outbound call payload (no charge) |
| `npm run call` | Place outbound call — **uses wallet credits** |
| `npm run execution:poll -- <id>` | Poll call until completed |
| `npm run webhook` | Local webhook on `http://localhost:8080/webhook` |
| `npm run wispr:transcribe -- file.wav` | Optional Wispr Flow REST STT (needs `WISPR_API_KEY`) |

**Test calls:** set `TEST_RECIPIENT_PHONE` to E.164 (e.g. `+919876543210`). Use consenting numbers only.

**Webhooks:** run `npm run webhook`, expose with ngrok, set `WEBHOOK_PUBLIC_URL` before `agent:create` if you want executions posted locally.

---

## Repository layout

```
VOICE-aGENTS/
├── prompts/system-prompt.md      # Edit agent behaviour here
├── config/
│   ├── agent.export.json         # Generated Bolna create payload
│   ├── test-scenarios.json       # Manual test scripts
│   └── dispositions.day2-placeholder.json
├── src/
│   ├── bolna/                    # REST client + buildAgentPayload()
│   ├── scripts/                    # CLI entrypoints
│   ├── webhook/server.js           # Execution receiver
│   ├── wispr/                      # Flow API helper
│   └── domain/delivery-resolution.js  # Confirm-before-update logic
└── .cursor/mcp.json.example
```

**Prompt workflow:** change `prompts/system-prompt.md` → `npm run agent:update-prompt` (or update via Bolna dashboard / MCP `update_agent`).

---

## Agent behaviour (Day 1)

Greeting (configurable): *Hello! I'm your delivery assistant.*

The system prompt enforces:

- Start in **English**; follow **Telugu** or **Hindi** if the customer switches
- Offer **reschedule**, **cancel**, or **address update**
- Repeat the customer’s **latest** choice and **ask for confirmation**
- **Never** invent order status or claim an update without backend confirmation
- Escalate edge cases to a human

Full prompt: [`prompts/system-prompt.md`](prompts/system-prompt.md)

---

## Test scenarios

Use [`config/test-scenarios.json`](config/test-scenarios.json) when testing in the playground or on a live call.

| Scenario | Pass if… |
|----------|-----------|
| **Time change** | Confirms **6 PM**, not 10 AM; does not say the order was updated |
| **Language switch** | Follows Telugu/Hindi; confirms final preference |

Run domain logic checks:

```powershell
node src/domain/delivery-resolution.test.js
```

---

## Day 1 checklist

- [ ] Understand STT, LLM, and TTS
- [ ] Create **ReDeliver Assistant** (`npm run agent:create` or dashboard)
- [ ] System prompt in repo matches Bolna agent
- [ ] Bolna MCP connected in Cursor
- [ ] Inspect MCP tools (`create_agent`, `get_agent`, `update_agent`, `start_outbound_call`, `get_execution`)
- [ ] Test delivery-time change scenario
- [ ] Test language switch

---

## Roadmap (this repo)

| Day | Focus |
|-----|--------|
| **1** | Agent config, prompt, MCP, manual tests *(current)* |
| **2** | Tool calling, webhooks, dispositions, write `delivery_actions` to Supabase |
| **Later** | More Node APIs + Supabase (auth, dashboard) — **no Spring Boot** |

`src/domain/delivery-resolution.js` is the reference for “confirm then act” before Day 2 tools exist.

---

## Why Bolna for ReDeliver (not LiveKit first)

For **outbound delivery calls** and **fast multilingual iteration**, Bolna gives you telephony, STT/LLM/TTS, and dashboard/API in one place. **LiveKit** is a strong choice when you need deep control over WebRTC, custom turn-taking, or in-app voice — not required for Day 1.

```
        ReDeliver AI (product)
                 │
         Node.js (this repo) ← webhooks, Bolna scripts, Supabase
                 │
         Supabase (Postgres) ← call feedback + delivery records
                 │
              Bolna (voice runtime)
                 │
            Phone customers
```

---

## Security

- Do not commit `.env` or API keys in `mcp.json`
- Bolna MCP can place calls and spend balance — confirm **⚠** tools before running
- Hackathon: **3+ test calls**, **45+ seconds**, **consenting** participants only

---

## Tech stack (summary)

| Layer | What you use |
|-------|----------------|
| **Voice on phone** | Bolna (Soniox STT → OpenAI LLM → ElevenLabs TTS) |
| **Build / edit** | Cursor + Wispr Flow desktop |
| **This repo** | Node.js 18 scripts + markdown prompts |
| **Database** | **Supabase** (Postgres) — optional until you set env vars |
| **Later** | Bolna dispositions → Node writes to Supabase |

Details and defaults: [`docs/PROJECT-CONTEXT.md`](docs/PROJECT-CONTEXT.md).

---

## Where to store feedback & context for later

Use **one place in the repo** so git and Cursor both see it:

| Store | Best for |
|-------|-----------|
| **[`docs/PROJECT-CONTEXT.md`](docs/PROJECT-CONTEXT.md)** | Decisions, agent IDs, test notes, hackathon feedback, Day 2 todos |
| **`prompts/system-prompt.md`** | Behaviour changes (what the agent says) |
| **`config/test-scenarios.json`** | Structured test cases |
| **Bolna dashboard → Executions** | Official transcripts, cost, recordings (source of truth for calls) |
| **`npm run webhook`** + **Supabase** `call_executions` | Auto-save Bolna payloads when Supabase env is set |
| **`npm run webhook`** + paste into PROJECT-CONTEXT | Backup notes if DB not wired yet |
| **`.cursor/rules/redelever.mdc`** | Short stack reminder so new chats know the project |
| **Notion** (optional, MCP) | Team sharing / submission write-up — link from PROJECT-CONTEXT |
| **Cursor chat** | Ephemeral — always copy important outcomes into PROJECT-CONTEXT |

After each test call: add an entry under **Test & feedback log** in `docs/PROJECT-CONTEXT.md`.

---

## Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run SQL from [`supabase/schema.sql`](supabase/schema.sql)
3. Add `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` to `.env`
4. Full steps: [`docs/SUPABASE.md`](docs/SUPABASE.md)

---

## Links

- [Bolna platform](https://platform.bolna.ai) · [API quickstart](https://www.bolna.ai/docs/quickstarts/api)
- [Bolna MCP on GitHub](https://github.com/bolna-ai/mcp)
- [Wispr Flow](https://wisprflow.ai) · [Flow API docs](https://api-docs.wisprflow.ai/quickstart)