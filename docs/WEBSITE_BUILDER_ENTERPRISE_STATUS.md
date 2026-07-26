# Website Builder — Enterprise Production Status

**Date:** 2026-07-26  
**Scope:** Website Builder only (generation, preview, publish, management, public endpoints)

---

## Executive summary

Enterprise hardening batches resolved all **Critical** and **High** security/data-integrity findings from the 2026-07 enterprise audit. Automated verification (`smoke:website-*`, `verify:website-*`, `verify:wb-launch`) passes in local mode.

**Production readiness: ~94%** — code and contracts are launch-ready; remaining gap is **host ops** (Upstash, migration 072, production env verify).

---

## Resolved (by severity)

### Critical
| ID | Fix |
|----|-----|
| SSRF via lead webhooks | Owner integrations loaded from DB only; `lib/website/url-safety.ts` blocks private/HTTP URLs |
| CMS kind DB mismatch | `lib/website/cms-kinds.ts` maps app ↔ DB kinds in repository |
| `maxDuration=900` vs platform limits | `lib/website/route-limits.ts` — 300s on Vercel, 900s self-hosted, env override |
| Missing distributed rate limits | Fail-closed in production without Upstash; per-user mutation limits on publish/deploy/manage |

### High (selected)
- Domain `verification_token` hidden via RLS + `website_active_domains_public` view (migration 072)
- A/B metrics only for running experiments matching `generationId`
- Demo experiment seeding disabled in production
- Unified publish quality gates (`/publish` + `/deploy` → `runPublishingAction`)
- Session insert failure aborts SSE stream
- Delete confirmations, visual editor dirty state, brand logo resolution
- Rate limits on marketplace/design-platform/template-intelligence POST routes

### Medium / Low (selected)
- Dead npm-compile preview code removed (`LIVE_PREVIEW_ENABLED` path)
- SSE `complete` sends summary only; client fetches full generation
- Sitemap/robots use `resolvePublishedAbsoluteUrl`
- `use-website-publish` hook consolidates client publish flow
- Visual editor renders `imageUrl`; management delete confirmations

---

## Required before GO

1. Apply `supabase/migrations/072_website_enterprise_hardening.sql` on production DB
2. Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` on production host
3. Run `npm run verify:wb-launch -- --production` against production env (must be 0 failures)
4. Configure `TURNSTILE_SECRET_KEY` if public lead forms are enabled
5. Confirm `NEXT_PUBLIC_SITE_URL` is canonical HTTPS production domain

---

## Known non-blocking debt

| Item | Notes |
|------|-------|
| `website-builder-tool.tsx` size | ~3.9k lines; functional but should be split into lazy panels in a follow-up |
| Vercel 300s generation cap | Very large multi-file sites may need background job queue (future) |
| `/publish` + `/deploy` routes | Intentionally dual for backward compatibility; shared engine |

---

## Verification commands

```bash
node scripts/smoke-website-ai.mjs
node scripts/smoke-website-publish.mjs
node scripts/smoke-website-design-engine.mjs
npm run verify:website-publish-gates
npm run verify:website-experiments
npm run verify:wb-launch
npm run verify:wb-launch -- --production
```
