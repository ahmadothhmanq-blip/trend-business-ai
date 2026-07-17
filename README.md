# Trend Business AI

Multi-product AI SaaS for business creation, design, content, and strategy. Generate websites (preview, AI improve, public URL, ZIP), brand systems, campaigns, and intelligence from one authenticated workspace.

**Product truth today:** Website Builder supports in-platform live preview, natural-language AI editing, public URL publish (`/w/{slug}`), and Next.js ZIP export. Custom domains are not included yet. See [`docs/WEBSITE_BUILDER_DEPLOYMENT_READY.md`](./docs/WEBSITE_BUILDER_DEPLOYMENT_READY.md).

## Tech stack

| Layer | Choice |
|-------|--------|
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn-style components |
| Auth / DB | Supabase Auth + Postgres + RLS |
| AI | ProviderManager — DeepSeek default; OpenAI/Claude supported |
| Billing | PayPal adapters (env-gated) |

## Product areas

- **Create** — Website Builder, Landing Page Builder, App Builder (source + ZIP)
- **Design** — Logo Maker, Brand Studio, Image Generator
- **Content** — Video Studio, Content Studio, Social Media
- **Business** — Marketing, Business Intelligence, Feasibility Study, Agents, Ideas, Reports
- **Platform** — Billing, team/orgs, usage, SEO / AI Search / Growth tools

## Documentation (SSOT)

Start here for planning and agent work:

| Doc | Purpose |
|-----|---------|
| [`docs/TASK_QUEUE.md`](./docs/TASK_QUEUE.md) | Prioritized tasks |
| [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md) | Living status |
| [`docs/DECISIONS_LOG.md`](./docs/DECISIONS_LOG.md) | Product/architecture decisions |
| [`docs/AUTONOMOUS_EXECUTION.md`](./docs/AUTONOMOUS_EXECUTION.md) | Agent execution loop |
| [`docs/AI_DEVELOPMENT_CONSTITUTION.md`](./docs/AI_DEVELOPMENT_CONSTITUTION.md) | Binding rules |
| [`docs/README.md`](./docs/README.md) | Full docs index |

## Getting started

```bash
npm install
cp .env.example .env.local   # if present; otherwise create .env.local
```

Minimum local env:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DEEPSEEK_API_KEY=
SUPABASE_DB_URL=             # for migrations / db scripts
```

Production also needs `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and preferably Upstash Redis for rate limits. Details: `docs/TASK_QUEUE.md` (H02 notes).

Apply migrations (30 SQL files under `supabase/migrations/`):

```bash
npm run db:apply
npm run db:verify
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run type-check` | `tsc --noEmit` |
| `npm run db:apply` | Apply SQL migrations |
| `npm run db:verify` | Verify platform DB objects |
| `npm run verify` | Repo verification script |

## Project layout (high level)

```
app/                 # Marketing, auth, dashboard, API routes
components/          # Marketing + dashboard UI
lib/                 # AI, billing, SEO, products, Supabase helpers
plugins/             # Product generation pipelines
supabase/migrations/ # Schema 001–030
docs/                # Living source of truth
```

## License

MIT
