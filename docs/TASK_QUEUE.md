# Trend Business AI — Task Queue

**Living work queue.** Priorities from `PROJECT_AUDIT.md`.  
**Statuses:** `Completed` | `In Progress` | `Pending` | `Future`  
**Rule:** Do not start Pending/Future implementation without approval.  
**Last updated:** 2026-07-17 (H06 smoke partial — generate/ZIP PASS; auth session blocked)  

---

## Priority legend

- **High** — Stability, honesty, launch blockers  
- **Medium** — Product clarity and maintainability  
- **Low** — Cleanup and polish  

---

## High Priority

| ID | Task | Status | Notes |
|----|------|--------|-------|
| H01 | Confirm Supabase migrations `001`–`030` applied on each environment | Completed (configured env) | Local `.env.local` Supabase: `public.schema_migrations` has all **30** IDs; table probes OK; `npm run db:verify` PASS. Separate staging/prod not configured locally — re-verify when those URLs are available. |
| H02 | Confirm required env (`SUPABASE_*`, `DEEPSEEK_API_KEY`, `NEXT_PUBLIC_SITE_URL`, service role, Upstash for prod) | Completed (local audit) | See H02 notes below. Local gaps: `NEXT_PUBLIC_SITE_URL`. Prod blockers if launching from this file: service role + Upstash + SITE_URL. Anon key length WARN. |
| H03 | Commit/reconcile Website Builder SSR slim-list fix (no full blueprint on list) | **Completed — verified** | Static verification **PASS** (10/10). On `cursor/docs-ssot-audit-plan` @ `f1f5549`. Merge to `main` still open. |
| H04 | Commit/reconcile React 19–safe theme migration (no client script crash) | **Completed — verified** | Removed `next-themes`; cookie SSR class + custom provider (no `<script>`). On `cursor/docs-ssot-audit-plan`. Merge to `main` still open. |
| H05 | Commit/reconcile generation file-cap + soft-pass (prevent runaway loops) | **Completed — verified** | `MAX_WEBSITE_FILES=18`, scaffold, lean merge, soft-pass. On branch `d51845f`. |
| H06 | Authenticated smoke: `/dashboard/website-builder` loads + generate → save → download | **Completed — partial** | See H06 notes. Unauth redirect + health PASS. **In-process generate→ZIP PASS** (18 files, ~77s). **HTTP auth session blocked** (signup requires email confirm; anon key len WARN). Not an app-code blocker. |
| H07 | Fix Live Preview honesty: replace frozen “Live Preview” UI with Download/Deploy messaging (or equivalent honesty) | Pending | UI copy only unless F01 accepted |
| H08 | Policy: keep `WEBSITE_PREVIEW_BUILDER_ENABLED=false` in production until security redesign | Pending | Not a duplicate of H07 — env/policy vs UI |

---

## Medium Priority

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M01 | Align Website Builder / marketing copy with ZIP/code delivery | Pending | Product honesty |
| M02 | Hide placeholder AI providers (Gemini/Grok/Llama) in production UI | Pending | |
| M03 | Collapse duplicate routes (`brand-designer` vs `brand-studio`, `creative-studio` vs `image-generator`, etc.) | Pending | Redirects OK |
| M04 | Update root README to match current multi-product reality | Pending | Docs only OK anytime |
| M05 | Real generation progress (avoid fake stuck ~90% feel) | Pending | Prefer server events / clearer status |
| M06 | Credit fairness: don’t punish users when AI fails mid-run | Pending | Billing path |
| M07 | Staging E2E for auth + Website Builder + billing (when PayPal configured) | Pending | |

---

## Low Priority

| ID | Task | Status | Notes |
|----|------|--------|-------|
| L01 | Remove orphan empty App Router directories | Pending | Dead code |
| L02 | Remove unused platform dashboard scaffolds | Pending | |
| L03 | Normalize naming (`deepseek.ts` facade, slug vs product id) | Pending | Careful, wide touch |
| L04 | Consolidate dual product engines (dedicated vs generic workspace) | Pending | Design first |
| L05 | Dashboard bundle performance budgets | Pending | |
| L06 | Archive/consolidate root phase report markdown into `docs/` index | Pending | |
| L07 | Remove empty plugin stub dirs + empty `app/api/test-generation/` | Pending | Dead code |
| L08 | Commit `docs/` pack to `main` so SSOT is on remote | Pending | Docs-only commit OK when approved |

---

## Completed (reference)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| C01 | Phase 1 full project audit | Completed | `PROJECT_AUDIT.md` |
| C02 | Docs SSOT pack | Completed | Blueprint, Constitution, Status, Queue, Decisions, Roadmap |
| C03 | Core auth + dashboard shell | Completed | In product |
| C04 | Website Builder code generation + ZIP | Completed | Preview not included |
| C05 | ProviderManager + DeepSeek/OpenAI/Claude | Completed | |
| C06 | Billing schema + PayPal adapters (code) | Completed | Env-gated |
| C07 | SEO / AI Search / Growth modules | Completed | Core present |
| C08 | Security baseline (RLS, rate limits, headers) | Completed | Ongoing vigilance |
| C09 | Profile API content-type / PUT fixes | Completed | See FIX_REPORT (historical) |
| C10 | Generation runaway file-tree mitigation (WT) | Completed | Landed as H05 (local WT; commit/push pending) |
| C11 | H01 migrations `001`–`030` on configured env | Completed | Staging/prod separate URLs not verified |
| C12 | H02 env configuration audit (local `.env.local`) | Completed | Prod gaps documented; staging/prod hosting env not separately audited |
| C13 | H03 Website Builder SSR slim-list (no full blueprint on list) | Completed | On feature branch `f1f5549`; merge to `main` pending |
| C14 | H04 React 19–safe theme (no next-themes script) | Completed | On feature branch; merge to `main` pending |
| C15 | H05 generation file-cap + soft-pass | Completed | On branch |
| C16 | H06 Website Builder smoke | Completed (partial) | Generate+ZIP PASS; cookie-auth HTTP path blocked by email confirm / env |

---

## In Progress

| ID | Task | Status | Notes |
|----|------|--------|-------|
| I01 | Docs as single source of truth | In Progress | This folder |
| I02 | Production ops readiness | In Progress | H01+H02 local audits done; fill SITE_URL/service role/Upstash before prod; E2E open |

---

## Future Versions

| ID | Task | Status | Notes |
|----|------|--------|-------|
| F01 | Safe Live Preview (sandboxed; no arbitrary npm install) | Future | Decision required |
| F02 | One-click deploy integration (e.g. Vercel) optional | Future | Not required for ZIP product |
| F03 | Durable AI job queue + SSE/progress | Future | |
| F04 | Pro plan live + marketing price update | Future | |
| F05 | Encrypt AI provider keys at rest | Future | |
| F06 | Team invite email (ESP) | Future | |
| F07 | True image/video media generation | Future | Beyond concepts |
| F08 | Gemini/Grok/Llama real adapters | Future | Only if product needs |
| F09 | Hosted live website product mode | Future | Major promise change — needs decision |

---

## Execution order (recommended after approval)

1. ~~H01~~ … ~~H06~~ (smoke partial) → next: **H07–H08**  
2. H07–H08 (preview honesty/policy)  
3. M01–M03 (clarity)  
4. Re-run H06 with confirmed test user when email confirm / full anon JWT available  
5. Then Medium/Low / Future per `ROADMAP.md`  

---

**Wait for approval before implementing any Pending/Future application tasks.**

### H01 verification notes (2026-07-17)

| Check | Result |
|-------|--------|
| Environment | `.env.local` → `SUPABASE_DB_URL` (Supabase pooler `aws-1-us-east-1`) |
| Repo files | 30 SQL migrations `001`…`030` |
| `public.schema_migrations` | **30/30** applied; none missing; no extras |
| Table probes (core + billing + growth) | All expected tables **present** |
| `npm run db:verify` (021–024 platform) | **PASS** |
| Official `supabase_migrations.schema_migrations` | Only 001–008 rows (CLI history incomplete; project uses `public.schema_migrations` via `db:apply`) |
| Staging / separate production | **Not verified** — no additional env files/URLs available locally |
| App code changes | **None** |

### H02 verification notes (2026-07-17)

**Scope:** Local `.env.local` only (no `.env.production` / `.env.staging` on disk). Values never logged; status only.

| Variable | Local status | Severity |
|----------|--------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | **SET** (valid `*.supabase.co` HTTPS URL) | OK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **SET** but **len=46** (classic Supabase anon JWTs are usually 100+ chars) | **WARN** — confirm full anon key in Supabase Dashboard → Settings → API |
| `DEEPSEEK_API_KEY` | **SET** | OK for default AI |
| `SUPABASE_DB_URL` | **SET** (used by H01 / `db:apply`) | OK for ops |
| `NEXT_PUBLIC_SITE_URL` | **MISSING** | **Gap** — local falls back to `http://localhost:3000` via `getOptionalSiteUrl`; **required for Vercel production** (`lib/env.ts`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **MISSING** | **Prod / billing gap** — needed for admin client + PayPal webhook fulfillment |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | **MISSING** | **Prod recommended** — without them, production rate limits are per-instance memory only |
| `WEBSITE_PREVIEW_BUILDER_ENABLED` | unset | OK / H08-aligned (treated as off) |
| PayPal (`PAYPAL_*`) | all **MISSING** | Expected until billing go-live |
| Optional AI (`OPENAI_*`, `ANTHROPIC_*`, stubs) | **MISSING** | OK — DeepSeek is default; placeholders stay disabled |

**Keys present in `.env.local` (4):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DEEPSEEK_API_KEY`, `SUPABASE_DB_URL`.

**Production readiness from this file alone:** **Not launch-ready** until SITE_URL + service role (+ Upstash recommended) are set in the real hosting env. Re-run H02 against staging/prod dashboards when those targets exist.

### H03 verification notes (2026-07-17)

| Check | Result |
|-------|--------|
| HEAD bug | Fallback `select("*")` + first-row full `blueprint` on SSR |
| Fix file | `components/dashboard/product-engine/website-product-page.tsx` only |
| List path | `WEBSITE_LIST_COLUMNS` (no blueprint) |
| Fallback | `WEBSITE_LIST_COLUMNS_CORE` (no blueprint) — never `select("*")` |
| Detail | Client `GET /api/website-builder/[id]` uses `select("*")` (correct) |
| List API | `GET /api/website-builder` uses `WEBSITE_LIST_COLUMNS` |
| Static verification | **PASS** (10/10 assertions) |
| Git | Pushed on `cursor/docs-ssot-audit-plan` @ `f1f5549` (merge to `main` still open) |

### H04 verification notes (2026-07-17)

| Check | Result |
|-------|--------|
| Problem | `next-themes` injected client `<script>` → React 19 crash |
| Solution | Custom provider + cookie SSR class; remove `next-themes` |
| Files | `lib/theme/theme.ts`, `theme-provider.tsx`, `theme-toggle.tsx`, `app/layout.tsx`, `package.json`, `package-lock.json` |
| Helpers | `resolveServerThemeClass` light/dark/system/undefined → PASS |
| Contracts | No `next-themes` imports; no script render; layout cookie class; toggle uses local `useTheme` |
| Lockfile | `next-themes` removed (surgical −11 lines) |
| `tsc --noEmit` | PASS |
| Out of scope | `next.config.ts`, generation (H05), other WT diffs |
| Git | Landed on `cursor/docs-ssot-audit-plan` (merge to `main` still open) |

### H05 verification notes (2026-07-17)

| Check | Result |
|-------|--------|
| Problem | Unbounded 50–180 file plans → hangs / soft-stuck progress |
| Cap | `MAX_WEBSITE_FILES = 18` via `capPlannedFiles` |
| Scaffold | Static configs/utils skip DeepSeek (`buildWebsiteScaffold`) |
| Merge | Lean core + few feature extras (no full production balloon) |
| Soft-pass | Final generate warns via `logger`; plugin `validateWebsite` always save-safe |
| Prompts | Shared guides enforce 18-file hard limit |
| Tests | Cap 83→18; SaaS merge 26→18; scaffold validate; soft-pass; `tsc --noEmit` PASS |
| Live authenticated generate → save → download | Deferred to **H06** |
| Out of scope | Progress UX (M05), `next.config.ts`, theme/SSR |
| Git | Local WT ready; commit when approved |

### H06 verification notes (2026-07-17)

| Check | Result |
|-------|--------|
| Server `/api/health` | **PASS** (~312ms after restart) |
| Unauth `/dashboard/website-builder` | **PASS** — 307 → `/login?redirect=…` (13ms) |
| Sign-up session | **BLOCKED** — Supabase returns user without session (email confirmation required) |
| Sign-in | **BLOCKED** — `Email not confirmed` |
| Anon key | **WARN** — length 46 (H02); may be incomplete vs classic JWT |
| HTTP generate → save → download | **NOT RUN** (no cookie session) |
| In-process `generateWebsite` (DeepSeek) | **PASS** — 18 files in ~77s; soft-pass logged 5 import warnings |
| ZIP from generated files | **PASS** — ~21KB written under `.tmp/` |
| App code changes | **None** — blockers are env/ops (email confirm + anon key), not application bugs |
| Follow-up | Provide confirmed test user **or** disable email confirm in Supabase Auth settings, then re-run HTTP path |
