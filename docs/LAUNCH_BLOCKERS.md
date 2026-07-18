# Launch Blockers

**Phase 12**  
**Date:** 2026-07-18  
**Related:** D-031, `docs/STAGING_TEST_REPORT.md`, `docs/KNOWN_ISSUES.md`, `docs/FINAL_LAUNCH_CHECKLIST.md`

Track items that **block public launch**. Updated from local `verify:staging` runs.

---

## Status summary

| Severity | Open | Notes |
|----------|------|-------|
| CRITICAL | 5 | Ops / staging UX — not AI Core defects |
| HIGH | 4 | Clear before or at launch |
| MEDIUM | Known limitations | Honest copy required |

**Public launch decision: NO-GO** until CRITICAL cleared and `STAGING_TEST_REPORT.md` manual matrix signed.

---

## CRITICAL (must clear before public launch)

| ID | Blocker | Evidence | Status |
|----|---------|----------|--------|
| B1 | Full manual UX journey not signed on staging host | `STAGING_TEST_REPORT.md` §2–3 empty | **OPEN** |
| B2 | `SUPABASE_SERVICE_ROLE_KEY` missing on local staging-equivalent | `verify:staging -- --strict` → `service_role`, `storage` | **OPEN** |
| B3 | Migration `033` (`ai_runs` + `ai-assets`) not applied on connected DB | `ai_runs_table` fail/warn | **OPEN** |
| B4 | Auth redirect URLs for real staging/production domain | Ops checklist | **OPEN** |
| B5 | `STAGING_BASE_URL` HTTP journey not run against a deploy | `http_staging` warn | **OPEN** |

None of B1–B5 are AI Core architecture defects. Product code smoke and `npm run build` pass.

---

## HIGH (strongly recommended before launch)

| ID | Item | Status |
|----|------|--------|
| H1 | Credits charged before AI success / no refund (D-014) | OPEN — backlog |
| H3 | Upstash unset → weaker multi-instance rate limits | OPEN |
| H5 | PayPal sandbox not validated (if monetizing day-one) | OPEN / N/A free-only |
| H6 | Storage buckets not listed/verified without service role | OPEN with B2 |

---

## MEDIUM / known limitations (do not block if copy is honest)

| ID | Item |
|----|------|
| K1 | Video Studio ≠ MP4 render |
| K2 | Website publish is static HTML host; ZIP is Next.js source |
| K3 | SEO/Performance layers on Website / App / Landing only |
| K6 | Sentry optional — structured logger only |

---

## Cleared in Phase 11–12

| ID | Item | Resolution |
|----|------|------------|
| H2 | Website stream double-charge | Fixed Phase 11 |
| P12-tooling | No staging verify path | `verify:staging`, `smoke:staging`, docs |
| P12-false-fail | REST `/` 401 treated as DB down | Table probe is authoritative |

---

## Clearance recipe

```bash
# On staging project
# 1. Set .env.staging / Vercel Preview env from .env.staging.example
# 2. npm run db:apply   # through 033+
# 3. Confirm buckets via verify
npm run verify:staging -- --strict

$env:STAGING_BASE_URL="https://your-staging-host"
npm run smoke:staging
npm run smoke:core-products

# 4. Complete manual matrix in STAGING_TEST_REPORT.md
# 5. Flip CRITICAL rows here to CLEARED
```

---

## Go / no-go

- [ ] All CRITICAL rows cleared or accepted with date  
- [ ] `STAGING_TEST_REPORT.md` automated + manual signed  
- [x] `npm run build` green on Phase 12 commit  
- [ ] `docs/FINAL_LAUNCH_CHECKLIST.md` day-of items done  

**Decision:** ☐ GO   ☑ **NO-GO** (staging UX + strict env)

**Sign-off:** ________________  **Date:** __________
