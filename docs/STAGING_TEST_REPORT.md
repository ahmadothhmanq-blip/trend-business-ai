# Staging Test Report

**Phase 12**  
**Date:** 2026-07-18  
**Related:** D-031, `docs/STAGING_SETUP.md`, `docs/LAUNCH_BLOCKERS.md`

---

## Scope

Validate staging (or local staging-equivalent env) before public launch:

1. Staging setup (env, DB, storage, AI)  
2. Real user journey (signup → generate → export/publish)  
3. All seven Core products  
4. Production checks (errors, logs, limits, credits, billing)

---

## Automated verification (this machine — 2026-07-18)

| Command | Result | Notes |
|---------|--------|-------|
| `npm run verify:staging` | **PASS** (0 fail, 6 warn) | Local `.env.local` |
| `npm run verify:staging -- --strict` | **FAIL** | Missing service role, `ai_runs`, bucket list |
| `npm run smoke:staging` | **PASS** (checklist mode) | `STAGING_BASE_URL` unset — HTTP skipped |
| `npm run smoke:core-products` | **PASS** | 7 products / 38 files |
| `npm run smoke:ai-core` | **PASS** | 63 files |
| `npm run build` | **PASS** | Next.js 16.2.9 |

### `verify:staging` detail (non-strict)

| Check | Level | Message |
|-------|-------|---------|
| site_url | ok | `http://localhost:3000` |
| supabase_public | ok | configured |
| service_role | warn | missing |
| ai_provider | ok | DeepSeek key present |
| ai_live | ok | DeepSeek `/models` accepts key |
| preview_builder | ok | disabled |
| billing | warn | PayPal unset |
| upstash | warn | unset |
| database / profiles | ok | PostgREST reachable |
| ai_runs_table | warn | missing — apply migration `033` |
| storage | warn | skipped without service role |
| http_staging | warn | `STAGING_BASE_URL` unset |

---

## 1. Staging setup checklist

| Check | Status | Evidence |
|-------|--------|----------|
| Staging env configured (`.env.staging` / Preview env) | ☐ Partial | Local `.env.local` used; deploy Preview still needed |
| `NEXT_PUBLIC_SITE_URL` points at staging host | ☐ | Localhost only so far |
| Supabase public + service role | ☐ | Public ok; **service role missing locally** |
| Database reachable + migrations applied | ☐ Partial | `profiles` ok; **`ai_runs` missing** |
| Buckets: avatars, generation-uploads, website-assets, ai-assets | ☐ | Needs service role to list |
| AI provider key valid | ☑ | DeepSeek live probe OK |
| PayPal **sandbox** (if billing QA) | ☐ | Unset |
| Preview builder disabled | ☑ | false |
| Auth redirect URLs include staging | ☐ | Ops on staging host |

---

## 2. Real user flow (manual)

| Step | Status | Notes |
|------|--------|-------|
| New user signup | ☐ | Requires deployed staging + Auth redirects |
| Login / logout | ☐ | |
| Dashboard loads (credits visible) | ☐ | Needs service role / billing tables |
| Select service | ☐ | |
| Enter business idea (One Prompt) | ☐ | |
| Pipeline: Idea → Strategy → Design → Assets → Generation → Quality | ☐ | |
| Pipeline: SEO → Performance | ☐ | Website / App / Landing |
| View result → Save → Export/Publish | ☐ | |

Automated gates only cover unauthenticated HTTP when `STAGING_BASE_URL` is set.

---

## 3. Product matrix (manual)

| Product | Generate | View | Save | Export/Publish | Surface smoke |
|---------|----------|------|------|----------------|---------------|
| Website Builder | ☐ | ☐ | ☐ | ☐ | code smoke ☑ |
| App Builder | ☐ | ☐ | ☐ | ☐ | code smoke ☑ |
| Landing Page Builder | ☐ | ☐ | ☐ | ☐ | code smoke ☑ |
| Video Studio | ☐ | ☐ | ☐ | ☐ | code smoke ☑ |
| Brand Designer | ☐ | ☐ | ☐ | ☐ | code smoke ☑ |
| Content Studio | ☐ | ☐ | ☐ | ☐ | code smoke ☑ |
| Marketing AI | ☐ | ☐ | ☐ | ☐ | code smoke ☑ |

---

## 4. Production checks (staging)

| Check | Status | Notes |
|-------|--------|-------|
| Error handling | ☐ Manual | |
| Logs | ☐ Manual | |
| API rate limits | ☐ | Upstash unset locally |
| Credits usage | ☐ | Needs service role |
| Zero credits → 402 | ☐ | |
| Billing readiness | ☐ | PayPal sandbox unset |

---

## Verdict

| Area | Result |
|------|--------|
| Automated gates (local non-strict) | **PASS** |
| Strict staging sign-off | **FAIL** — see `LAUNCH_BLOCKERS.md` |
| Manual UX | **Not started** on a deployed staging host |
| Ready for public launch | **NO** until CRITICAL blockers clear |

**Blocking fix applied in Phase 12:** `verify-staging` no longer false-fails when Supabase `/rest/v1/` returns 401 (table probe is authoritative).

**Tester:** automated agent run  **Date:** 2026-07-18
