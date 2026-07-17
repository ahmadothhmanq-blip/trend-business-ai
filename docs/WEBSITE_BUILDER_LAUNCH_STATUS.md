# Website Builder — Final Launch Status Report

**Date:** 2026-07-17  
**Checklist:** `docs/WEBSITE_BUILDER_LAUNCH_CHECKLIST.md`  
**Evidence base:** Local app + `.env.local` + configured Supabase DB + authenticated E2E (2026-07-17)  
**Code changes in this review:** None  

---

## Verdict

| Decision | Result |
|----------|--------|
| **Go / No-Go for real public customers** | **NO-GO** |
| Phase 1 product loop (local) | **Working** |
| Production / public launch | **Blocked** — ops, auth email, hosting deploy, marketing honesty |

**What remains (short):** production env (HTTPS `SITE_URL`, service role, confirmed anon key), working customer email confirmation, production/staging deploy + mailbox E2E, update marketing copy that still denies live publish, Upstash recommended.

**Deployment pack:** Exact env vars, auth/Supabase/AI production requirements, and final ship checklist → [`WEBSITE_BUILDER_DEPLOYMENT_READY.md`](./WEBSITE_BUILDER_DEPLOYMENT_READY.md).  
**Operator verify:** `npm run verify:wb-launch` · production: `npm run verify:wb-launch -- --production`

---

## Status legend

| Status | Meaning |
|--------|---------|
| **DONE** | Verified on the current project evidence |
| **BLOCKED** | Missing or failing; prevents safe public launch |
| **TODO** | Not verified yet, or remaining non-code ops work |

---

## 1. Environment variables

### P0

| Item | Status | Evidence / notes |
|------|--------|------------------|
| `NEXT_PUBLIC_SITE_URL` | **BLOCKED** (for public) | Local **DONE** as `http://localhost:3000`. Not a production HTTPS origin. Public customers cannot use localhost redirects. |
| `NEXT_PUBLIC_SUPABASE_URL` | **DONE** | Set to `*.supabase.co` in `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **BLOCKED** | Present but **len=46** — atypical for classic Supabase anon JWTs. Must confirm full key in Dashboard before launch. |
| `SUPABASE_SERVICE_ROLE_KEY` | **BLOCKED** | **MISSING** in `.env.local`. Required for production billing/admin credit paths. |
| `DEEPSEEK_API_KEY` | **DONE** | Set; real generate/improve E2E succeeded |
| `WEBSITE_PUBLISH_ENABLED` | **DONE** | Unset → default **ON** (intentional for Phase 1). Confirm same intent on host. |
| `WEBSITE_PREVIEW_BUILDER_ENABLED` | **DONE** | Unset → **off** (D-004 aligned) |

### P1

| Item | Status | Evidence / notes |
|------|--------|------------------|
| `UPSTASH_REDIS_REST_URL` | **TODO** | Missing — per-instance rate limits only |
| `UPSTASH_REDIS_REST_TOKEN` | **TODO** | Missing |
| `SUPABASE_DB_URL` / migrate access | **DONE** (ops local) | Set; used for migration/table checks |
| `LOG_LEVEL` | **TODO** | Not set (optional) |

### Verify after deploy

| Item | Status | Evidence / notes |
|------|--------|------------------|
| `GET /api/health` on production URL | **BLOCKED** | Local health **DONE** (`200 ok`). No Vercel/production URL verified (no `.vercel` / deploy config found). |
| No localhost leftovers in auth/public URLs | **BLOCKED** | `SITE_URL` is localhost today |
| Service role not in `NEXT_PUBLIC_*` | **DONE** | No `NEXT_PUBLIC_*` service-role leak detected |

**§1 gate:** **BLOCKED**

---

## 2. Authentication / email setup

### P0

| Item | Status | Evidence / notes |
|------|--------|------------------|
| Email confirmation enabled as intended | **DONE** (project behavior) | Signup returns user **without** session → confirm-email gate active |
| Custom SMTP / proven email delivery | **BLOCKED** | Not verified. Automated signup could not complete mailbox confirm; E2E used DB confirm (ops), not customer email |
| Auth redirect allow-list includes `{SITE_URL}/auth/callback` | **TODO** | Must be set in Supabase for production origin (not verified in Dashboard) |
| Password reset redirect works | **TODO** | Not mailbox-tested on production URL |
| Fresh signup receives confirmation email | **BLOCKED** | Not proven; later signups hit **email rate limit** |
| After confirm → login → Website Builder | **BLOCKED** (mailbox path) | Login **DONE** only after ops confirm of test user. Real mailbox path unproven |
| Unauth `/dashboard/website-builder` → login | **DONE** | Observed **307** redirect |

### P1

| Item | Status | Evidence / notes |
|------|--------|------------------|
| Emails use production branding / non-localhost links | **BLOCKED** | `SITE_URL` still localhost |
| Auth rate limits under signup spike | **TODO** | Rate limit already hit during QA — needs production tuning awareness |
| Support path for missing confirmation email | **TODO** | Not documented for support |

**§2 gate:** **BLOCKED**

---

## 3. Database migrations

### P0

| Item | Status | Evidence / notes |
|------|--------|------------------|
| Migrations through `031_website_publications` | **DONE** (configured DB) | `website_publications` table exists; publish E2E worked. `schema_migrations` row naming for 031 not found (project may use alternate tracking) — **TODO** to confirm prod migrate history |
| `website_generations` exists | **DONE** | Verified via DB probe |
| `website_publications` exists | **DONE** | Verified; full column set previously confirmed |
| `projects` exists | **DONE** | Verified |
| `credit_balances` + `consume_credits` | **DONE** | Table + RPC present; generate consumed usage successfully |
| RLS / ownership for generations | **DONE** (behavior) | Unauth API 401; live-preview owner-scoped in code. Formal RLS audit **TODO** |

### Ops verify

| Item | Status | Evidence / notes |
|------|--------|------------------|
| `npm run db:verify` on production | **TODO** | Not run against a separate prod target this review |
| Publish returns 200 (not missing-table 503) | **DONE** (local/configured DB) | Publish + public URL E2E PASS |

**§3 gate:** **DONE** for configured Supabase used in E2E · **TODO/BLOCKED** until same state proven on the **public production** project if different

---

## 4. AI provider production configuration

### P0

| Item | Status | Evidence / notes |
|------|--------|------------------|
| Primary provider key valid | **DONE** (this env) | DeepSeek generate + improve succeeded |
| Generate completes (`complete` / 200) | **DONE** | Journey PASS |
| Credits deduct / clear `402` | **TODO** | Deduct path exercised (generate ran); zero-balance `402` not explicitly tested |
| AI `429` under burst | **TODO** | Not load-tested |

### P1

| Item | Status | Evidence / notes |
|------|--------|------------------|
| Fallback providers configured | **TODO** | `OPENAI_API_KEY` etc. missing — OK if DeepSeek-only is intentional |
| Cost alert / budget cap on vendor | **TODO** | Ops dashboard — not verified |
| Timeout expectations documented | **DONE** | Readiness report + journey (~1–2 min generate) |
| `BILLING_OPTIONAL` not `true` in production | **DONE** (local) | Unset. Must remain unset/`false` on host |

**§4 gate:** **DONE** for local AI · **TODO** for production host key + credit edge cases

---

## 5. Security checks

### P0

| Item | Status | Evidence / notes |
|------|--------|------------------|
| Preview builder off | **DONE** | Env unset; D-004 |
| Live preview auth + ownership | **DONE** | Route uses `requireUser` + `user_id` match; unauth API 401 |
| `/w/{slug}` only when published | **DONE** | Unpublished → 404; published → 200 in E2E |
| Scripts stripped / CSP headers | **DONE** (code + sanitize path) | `sanitizePreviewHtml` + `livePreviewResponseHeaders()` |
| Service role not in browser bundle | **DONE** | Key missing locally; not in `NEXT_PUBLIC_*` |
| Emergency disable via `WEBSITE_PUBLISH_ENABLED=false` | **DONE** (code) | Documented; not runtime-flipped in this review (**TODO** ops drill) |

### P1

| Item | Status | Evidence / notes |
|------|--------|------------------|
| Abuse / takedown process | **TODO** | Unpublish exists in product; process/docs for support **TODO** |
| Upstash active | **TODO** | Missing |
| No secrets in git | **DONE** (expected) | `.env.local` not for commit; no production deploy secrets found in repo |
| Marketing does not promise unsafe npm preview | **DONE** | Marketing denies hosted compile; aligned with D-004 |

**§5 gate:** **DONE** for product security posture · **TODO** abuse ops + Upstash

---

## 6. Final user journey testing

Checklist requires **staging/production + real mailbox**. Local E2E used a confirmed test user.

### P0 — customer journey

| Step | Status | Evidence / notes |
|------|--------|------------------|
| Sign up | **BLOCKED** | Creates user but no session without email confirm; mailbox unproven |
| Confirm email | **BLOCKED** | Not proven via real inbox |
| Login | **DONE** (test user) | Password login after ops confirm |
| Open Website Builder | **DONE** | Authenticated API + tool flow |
| Create website | **DONE** | E2E |
| AI generation | **DONE** | E2E |
| Preview | **DONE** | E2E |
| AI improvement | **DONE** | E2E (after normalize fix) |
| Publish | **DONE** | E2E |
| Open public URL | **DONE** | E2E |
| Unpublish | **TODO** | Not run in final journey |
| ZIP export | **TODO** | Implemented; not exercised in final journey |

### P1 — regression

| Item | Status |
|------|--------|
| Second improve (multi-iteration) | **TODO** |
| Cross-user ID isolation | **TODO** (code-enforced; not dual-user tested) |
| Mobile viewport preview | **TODO** |
| Credits block at 0 balance | **TODO** |

**§6 gate:** **BLOCKED** for public (mailbox signup/confirm) · core product loop **DONE** locally

---

## 7. Deployment readiness

### P0 — ship gate

| Item | Status | Evidence / notes |
|------|--------|------------------|
| `npm run build` clean | **TODO** | Not re-run in this status review |
| Production deploy of Phase 1 | **BLOCKED** | Branch `cursor/docs-ssot-audit-plan`; no Vercel project dir; no production URL |
| Custom domain matches `SITE_URL` | **BLOCKED** | No production domain; SITE_URL is localhost |
| Supabase is production project | **TODO** | Using `wbmwzkxxypfgrlnexcxe.supabase.co` — confirm this is the intended public project |
| Rollback plan | **TODO** | Mechanism exists (`WEBSITE_PUBLISH_ENABLED=false`); written runbook **TODO** |
| Marketing matches Phase 1 | **BLOCKED** | `lib/constants/marketing-content.ts` FAQ still says Website Builder does **not** publish a live URL / ZIP-only — **out of date** vs D-017 publish |

### P1 — day-0 ops

| Item | Status |
|------|--------|
| Monitor stream/publish/`/w` | **TODO** |
| On-call owner | **TODO** |
| Support macros | **TODO** |
| Post-launch smoke scheduled | **TODO** |

**§7 gate:** **BLOCKED**

---

## Gate summary

| Gate | Status |
|------|--------|
| §1 Environment variables | **BLOCKED** |
| §2 Authentication / email | **BLOCKED** |
| §3 Database migrations | **DONE** (current DB) / confirm prod target |
| §4 AI provider | **DONE** (local) / host keys **TODO** |
| §5 Security checks | **DONE** (product) / ops **TODO** |
| §6 Final user journey | **BLOCKED** (mailbox) / loop **DONE** locally |
| §7 Deployment readiness | **BLOCKED** |

**Go / No-Go:** **NO-GO** — do not open Website Builder to real public customers yet.

---

## Remaining before real customers (ordered)

### Must fix (P0 blockers)

1. **Set production env vars** using [`WEBSITE_BUILDER_PRODUCTION_ENV_CHECKLIST.md`](./WEBSITE_BUILDER_PRODUCTION_ENV_CHECKLIST.md) (HTTPS `SITE_URL`, full anon key, `SUPABASE_SERVICE_ROLE_KEY`, `DEEPSEEK_API_KEY`, flags).  
2. **Deploy** Phase 1 to that HTTPS host and redeploy after `NEXT_PUBLIC_*` changes.  
3. **Prove auth email:** signup → inbox confirm → login → `/dashboard/website-builder`.  
4. **Configure Supabase redirect URLs** for production `/auth/callback`.  
6. ~~**Update marketing/FAQ**~~ **DONE** (2026-07-18) — Phase 1 preview / AI improve / public URL / ZIP reflected in `marketing-content.ts`.  
7. ~~**Local journey including unpublish + ZIP**~~ **DONE** (2026-07-18) — E2E PASS through unpublish→404 + ZIP.  
8. **Re-run full journey on staging/production** with a real mailbox.

### Should do before or at launch (P1)

9. Configure **Upstash** for distributed rate limits.  
10. Confirm **credits `402`** and burst **`429`** behavior.  
11. Support/abuse runbook (unpublish, confirmation email help).  
12. Monitoring + on-call for stream/publish/public routes.  
13. ~~`npm run build`~~ **DONE** locally (2026-07-18); keep CI green on launch commit.

### Already good enough (do not re-build)

- Phase 1 product loop: generate → preview → improve → publish → public URL (local E2E **PASS**)  
- DB tables + `consume_credits` on configured project  
- Safe preview/publish architecture (no npm builder)  
- Publish default-on / preview-builder-off flags  

---

*Status report only — no code changes. Re-run this audit after staging deploy + mailbox E2E.*
