# AI Core Engine

**Status:** Phase 13 — Production go-live prep (Core pipeline unchanged)  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018–D-032

---

## Pipeline

```
Business Idea
→ Strategy
→ Design System
→ Assets
→ Generation
→ Quality Check
→ SEO
→ Performance
→ Ready to Publish
```

User-facing One Prompt progress:

**Idea → Strategy → Design → Assets → Generation → Quality → Ready Product**

Phases 10–13 do **not** change this pipeline. They harden ops, audit, staging, and go-live prep around it. Existing product APIs remain compatible.

---

## Phase 13 — Production go-live

| Area | Docs / code |
|------|-------------|
| Go-live verify | `npm run verify:golive`, `lib/production/golive.ts` |
| Final UAT smoke | `npm run smoke:uat` |
| Launch report | `docs/PRODUCTION_LAUNCH_REPORT.md` |
| Go-live checklist | `docs/FINAL_GO_LIVE_CHECKLIST.md` |

---

## Phase 12 — Staging

| Area | Docs / code |
|------|-------------|
| Staging setup | `docs/STAGING_SETUP.md`, `.env.staging.example` |
| Staging verify | `npm run verify:staging`, `lib/production/staging.ts` |
| Journey smoke | `npm run smoke:staging` |
| Test report | `docs/STAGING_TEST_REPORT.md` |
| Launch blockers | `docs/LAUNCH_BLOCKERS.md` |

---

## Phase 11 — Final audit

| Area | Docs |
|------|------|
| Product audit | `docs/PHASE_11_FINAL_AUDIT.md` |
| Known issues | `docs/KNOWN_ISSUES.md` |
| Production readiness | `docs/PRODUCTION_READINESS_REPORT.md` |
| Final checklist | `docs/FINAL_LAUNCH_CHECKLIST.md` |

Critical fairness fix only: Website Builder stream fallback no longer double-charges credits after a billed stream attempt.

---

## Phase 10 — Production launch (ops)

| Area | Docs / code |
|------|-------------|
| Launch guide | `docs/PRODUCTION_LAUNCH.md` |
| Checklist | `docs/LAUNCH_CHECKLIST.md`, `docs/FINAL_LAUNCH_CHECKLIST.md` |
| Billing | `docs/BILLING_ARCHITECTURE.md`, `lib/billing/` |
| Security | `docs/SECURITY_PRODUCTION.md`, `lib/auth/ownership.ts` |
| Env readiness | `lib/production/readiness.ts`, `npm run verify:launch` |
| Product smoke | `npm run smoke:core-products` |
| Error monitoring prep | `lib/monitoring/errors.ts` |

---

## Product registry & run API

Canonical products: `website-builder`, `app-builder`, `landing-page-builder`, `brand-designer`, `content-studio`, `video-studio`, `marketing-ai`.

| Method | Path |
|--------|------|
| `GET` | `/api/ai-core/products` |
| `GET` | `/api/ai-core/industries` |
| `GET` | `/api/ai-core/design-presets` |
| `GET` | `/api/ai-core/runs` |
| `POST` | `/api/ai-core/runs` |
| `GET` | `/api/ai-core/runs/[id]` |
| `POST` | `/api/ai-core/runs/[id]/continue` |

---

## Compatibility

- Product dashboards and legacy `/api/*` generators unchanged  
- Billing remains PayPal-first (`paypal` + `card` hosted); credits gate AI usage  
- Phase 9 One Prompt UX remains the user-facing creation path  
