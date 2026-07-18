# AI Core Engine

**Status:** Phase 10 — Production Launch Prep (Core pipeline stable at Phase 9 UX)  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018–D-029

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

Phase 10 does **not** change this pipeline. It hardens auth, billing, security, and launch ops around it. Existing product APIs remain compatible.

---

## Phase 10 — Production launch (ops)

| Area | Docs / code |
|------|-------------|
| Launch guide | `docs/PRODUCTION_LAUNCH.md` |
| Checklist | `docs/LAUNCH_CHECKLIST.md` |
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
