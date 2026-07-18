# Launch Blockers

**Phase 13** (supersedes Phase 12 status for go-live tracking)  
**Date:** 2026-07-18  
**Related:** D-032, `docs/PRODUCTION_LAUNCH_REPORT.md`, `docs/FINAL_GO_LIVE_CHECKLIST.md`, `docs/STAGING_TEST_REPORT.md`

---

## Status summary

| Severity | Open | Notes |
|----------|------|-------|
| CRITICAL | See below | Ops / UAT on production host |
| HIGH | See below | Clear before or at launch |
| MEDIUM | Known limitations | Honest copy |

**Public launch decision: NO-GO** until CRITICAL cleared and `FINAL_GO_LIVE_CHECKLIST.md` signed.

---

## CRITICAL (must clear before public launch)

| ID | Blocker | Clearance | Status |
|----|---------|-----------|--------|
| B1 | Manual UAT not signed for all 7 Core products | `FINAL_GO_LIVE_CHECKLIST.md` §E | **OPEN** |
| B2 | Production `SUPABASE_SERVICE_ROLE_KEY` + storage buckets | `npm run verify:golive -- --production` | **OPEN** |
| B3 | Migrations through `033` applied on production DB | `ai_runs` + Core tables probe | **OPEN** |
| B4 | Auth redirects for production domain | Supabase Auth settings | **OPEN** |
| B5 | `PRODUCTION_BASE_URL` routing/SSL/UAT HTTP not run | `verify:golive` + `smoke:uat` | **OPEN** |
| B6 | `NEXT_PUBLIC_SITE_URL` must be https public domain (not localhost) | Production env | **OPEN** until prod env set |

None are AI Core architecture defects. `npm run build` and product code smokes pass.

---

## HIGH (strongly recommended)

| ID | Item | Status |
|----|------|--------|
| H1 | Credits before success / no refund (D-014) | OPEN — backlog |
| H3 | Upstash unset | OPEN until set in prod |
| H5 | PayPal live + webhook (if monetizing day-one) | OPEN / N/A free-only |
| H7 | Sentry unset | OPEN optional — logs OK |

---

## MEDIUM / known limitations

| ID | Item |
|----|------|
| K1 | Video Studio ≠ MP4 |
| K2 | Publish HTML vs ZIP Next.js |
| K3 | SEO/Performance on site builders only |
| K6 | Structured logger without Sentry |

---

## Cleared tooling (Phases 11–13)

| ID | Item |
|----|------|
| H2 | Website stream double-charge fixed |
| P12 | Staging verify / journey smoke |
| P13 | `verify:golive`, `smoke:uat`, go-live report + checklist |

---

## Clearance recipe

```bash
# Production project env from .env.example
npm run db:apply
npm run verify:golive -- --production
# Paid day-one:
npm run verify:golive -- --production --paid

$env:PRODUCTION_BASE_URL="https://your-domain"
npm run verify:golive -- --production
npm run smoke:uat
# Complete FINAL_GO_LIVE_CHECKLIST.md §E UAT
```

---

## Go / no-go

- [ ] CRITICAL cleared  
- [ ] `PRODUCTION_LAUNCH_REPORT.md` signed  
- [ ] `FINAL_GO_LIVE_CHECKLIST.md` complete  
- [x] `npm run build` green on Phase 13 commit  

**Decision:** ☐ GO   ☑ **NO-GO**

**Sign-off:** ________________  **Date:** __________
