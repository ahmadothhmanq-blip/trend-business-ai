# Website Builder — Deployment Readiness Pack

**Date:** 2026-07-17  
**Goal:** Clear every launch blocker from `WEBSITE_BUILDER_LAUNCH_STATUS.md` that can be specified in-repo, and give operators an exact production checklist.  
**Constraint:** No Website Builder business-feature changes. Ops / config / docs / verify only.  
**Verify command:** `npm run verify:wb-launch` (local) · `npm run verify:wb-launch -- --production` (host env)

---

## 1. Exact required environment variables

Set these on the **production host** (e.g. Vercel → Production). Values must not be placeholders.

### P0 — must set (Website Builder cannot launch without these)

| Variable | Required value | Why |
|----------|----------------|-----|
| `NEXT_PUBLIC_SITE_URL` | `https://your-production-domain` (no trailing slash, **not** localhost) | Auth confirm/reset redirects (`lib/actions/auth.ts`); absolute publish URLs; fail-closed on Vercel production if missing (`lib/env.ts`) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Auth + data API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Full **anon** or **publishable** key from Dashboard → Settings → API | Browser/server user client. Confirm real key (legacy JWT usually `eyJ…` and long; new `sb_…` keys also valid) |
| `SUPABASE_SERVICE_ROLE_KEY` | Full **service_role** key (server-only) | Credit/billing admin writes (`lib/billing/*`). **Never** prefix with `NEXT_PUBLIC_` |
| `DEEPSEEK_API_KEY` | Valid DeepSeek API key | Default AI provider for Website Builder generation/improve |

### P0 — flags (must be intentional)

| Variable | Production setting | Why |
|----------|-------------------|-----|
| `WEBSITE_PREVIEW_BUILDER_ENABLED` | **unset** or `false` | D-004 — npm compile builder must stay off |
| `WEBSITE_PUBLISH_ENABLED` | unset or `true` to offer `/w/{slug}`; `false` to kill-switch public hosting | Default ON when unset |
| `BILLING_OPTIONAL` | **unset** or `false` | Must not be `true` in real production |

### P1 — strongly recommended

| Variable | Production setting | Why |
|----------|-------------------|-----|
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL | Distributed AI/auth rate limits |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token | Paired with URL |
| `SUPABASE_DB_URL` | Session/direct Postgres URI | Ops: `npm run db:apply` / launch verify SQL |
| `LOG_LEVEL` | `info` | Production logs |

### Optional (not required for Website Builder default path)

| Variable | Notes |
|----------|-------|
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, … | Extra providers; DeepSeek alone is enough for default WB |
| `PAYPAL_*` | Billing checkout — separate from WB generate if credits already granted |

### Copy-paste host checklist

```bash
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_KEY
WEBSITE_PREVIEW_BUILDER_ENABLED=false
# WEBSITE_PUBLISH_ENABLED=true
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 2. Authentication — production requirements (verified from app)

| Requirement | App contract | Operator action |
|-------------|--------------|-----------------|
| Email/password auth | Supabase Auth via `lib/actions/auth.ts` | Use production Supabase project |
| Confirm before session | Signup with no session → redirect `/login?message=confirm-email` | Keep confirm-email enabled (or accept risk if you disable it in Dashboard) |
| Confirm redirect | `emailRedirectTo = {NEXT_PUBLIC_SITE_URL}/auth/callback` | Supabase → Authentication → URL config: add `https://YOUR_DOMAIN/auth/callback` to redirect allow-list |
| Password reset | `redirectTo = {SITE_URL}/auth/callback?next=/reset-password` | Same allow-list; test once with real inbox |
| Session model | Cookie SSR (`@supabase/ssr`); APIs use `requireUser()` cookies — **not** Bearer | No special client Bearer setup |
| Dashboard protection | Unauthenticated `/dashboard/*` → login | Already implemented (`proxy` / middleware) |

**Mailbox proof (P0, not automatable in CI):**

1. Sign up with a real inbox on production URL  
2. Open confirmation email (link must hit production `/auth/callback`, not localhost)  
3. Sign in → open `/dashboard/website-builder`  

Until that works, **do not** announce Website Builder to public users.

---

## 3. Supabase — production configuration (verified)

### Project

| Check | Required |
|-------|----------|
| Production (or dedicated staging) Supabase project | Yes — not a disposable toy project for public traffic |
| API URL + anon + service_role from **same** project | Yes |
| Auth site URL / redirects match `NEXT_PUBLIC_SITE_URL` | Yes |

### Database (Website Builder)

Apply migrations on the production DB through **`031_website_publications`** (`npm run db:apply` with production `SUPABASE_DB_URL`).

| Object | Required |
|--------|----------|
| `public.website_generations` | Yes |
| `public.website_publications` | Yes (publish + `/w/{slug}`) |
| `public.projects` | Yes (workspace link) |
| `public.credit_balances` | Yes |
| `public.consume_credits` RPC | Yes (generate/improve usage) |

### RLS / access (expected behavior)

| Surface | Expected |
|---------|----------|
| `/api/website-builder/*` | Authenticated owner only |
| `/api/website-builder/{id}/live-preview` | Authenticated owner only |
| `/w/{slug}` | Public HTML only when `website_publications.status = 'published'` and publish enabled |

### Current configured-DB evidence (dev project)

As of launch-status audit: tables + `consume_credits` **present** on the DB behind local `SUPABASE_DB_URL`. Re-verify on the **host** project with:

```bash
npm run verify:wb-launch -- --production
```

---

## 4. AI provider — production configuration (verified)

| Item | Requirement |
|------|-------------|
| Default provider | **DeepSeek** (`lib/ai/provider-config.ts`) |
| Required secret | `DEEPSEEK_API_KEY` |
| Used by | Generate + NL improve (`/api/website-builder/stream` and fallback POST) |
| Credits | Each generate/improve calls `enforceAiUsage` → `consume_credits` |
| Failures | Missing key → generation error; insufficient credits → **402**; rate limit → **429** |
| Unsafe preview | Keep `WEBSITE_PREVIEW_BUILDER_ENABLED=false` (unrelated to LLM, security) |

**Operator proof:** one production generate completing to `event: complete` (or JSON 200) after deploy.

---

## 5. Final deployment readiness checklist

Complete on the **production host**. Check every P0 box before GO.

### A. Environment (P0)

**Operator checklist:** [`WEBSITE_BUILDER_PRODUCTION_ENV_CHECKLIST.md`](./WEBSITE_BUILDER_PRODUCTION_ENV_CHECKLIST.md)

| ☐ | Action |
|---|--------|
| ☐ | Complete `WEBSITE_BUILDER_PRODUCTION_ENV_CHECKLIST.md` on the host |
| ☐ | Set all P0 variables from §1 on the host |
| ☐ | `NEXT_PUBLIC_SITE_URL` is HTTPS production origin |
| ☐ | Anon key confirmed from Dashboard (not truncated) |
| ☐ | Service role set server-only |
| ☐ | `DEEPSEEK_API_KEY` set |
| ☐ | Preview builder off; publish flag intentional |
| ☐ | Run `npm run verify:wb-launch -- --production` → **0 FAIL** |

### B. Auth / email (P0)

| ☐ | Action |
|---|--------|
| ☐ | Supabase redirect allow-list includes `{SITE_URL}/auth/callback` |
| ☐ | SMTP / email delivery working |
| ☐ | Signup → confirm email → login → `/dashboard/website-builder` proven with real inbox |
| ☐ | Password reset email lands on production callback |

### C. Database (P0)

| ☐ | Action |
|---|--------|
| ☐ | Migrations through `031` applied on production DB |
| ☐ | `website_publications` + `consume_credits` verified |
| ☐ | Publish API returns 200 (not table-missing 503) |

### D. AI (P0)

| ☐ | Action |
|---|--------|
| ☐ | Production generate completes |
| ☐ | Production improve (NL) completes |
| ☐ | Vendor budget/alert set (recommended) |

### E. Security (P0)

| ☐ | Action |
|---|--------|
| ☑ | No service role in client env (verified by `verify:wb-launch`) |
| ☑ | Unpublished `/w/{slug}` → 404 (local E2E 2026-07-18) |
| ☐ | Kill-switch known: `WEBSITE_PUBLISH_ENABLED=false` (ops drill on host) |

### F. Deploy + journey (P0)

| ☐ | Action |
|---|--------|
| ☑ | `npm run build` succeeds for launch commit (PASS 2026-07-18) |
| ☐ | App deployed; `/api/health` OK on production URL |
| ☑ | Full journey locally: login → create → generate → preview → improve → publish → open `/w/{slug}` → ZIP → unpublish → 404 (`scripts/e2e-website-builder-journey.mjs`, 2026-07-18) |
| ☐ | Repeat full journey on **production/staging** with real mailbox |
| ☑ | Marketing/FAQ updated to mention preview + AI improve + public URL + ZIP (`lib/constants/marketing-content.ts`, 2026-07-18) |

### G. P1 (launch day)

| ☐ | Action |
|---|--------|
| ☐ | Upstash configured |
| ☐ | Error monitoring on stream / publish / `/w` |
| ☐ | Support macros (confirm email, credits, unpublish) |
| ☐ | Rollback: prior deploy + publish kill-switch |

---

## 6. Go / No-Go

| Condition | Decision |
|-----------|----------|
| Any §5 A–F P0 unchecked | **NO-GO** |
| `verify:wb-launch --production` has FAIL | **NO-GO** |
| Mailbox confirm unproven | **NO-GO** |
| All P0 checked + verify PASS | **GO** — open Website Builder to real customers |

---

## 7. What this pack does **not** do

- Does not deploy to Vercel for you  
- Does not create Supabase keys or SMTP  
- Does not change generate / preview / publish product code  
- Marketing Phase 1 honesty copy is updated in `lib/constants/marketing-content.ts` (remaining gates are host env / auth mailbox / deploy)

---

*Related: `WEBSITE_BUILDER_LAUNCH_STATUS.md`, `WEBSITE_BUILDER_LAUNCH_CHECKLIST.md`, `WEBSITE_PUBLISH_ARCHITECTURE.md`, `.env.example`*
