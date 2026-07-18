# AI Core Engine

**Status:** Phase 6 — Template Engine + Industry Intelligence  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018–D-025

---

## Goal

Power every AI product with one reusable pipeline:

```
Template (industry) → Idea → Strategy → Design → Assets → Generation → Quality → Finalize
```

Public product flow remains:

```
Business Idea → Strategy → Design → Assets → Generation → Quality Check → Finalize
```

Industry template selection runs at pipeline start (does not change product APIs).

---

## Phase 6 — AI Template Engine

Package: `lib/ai-core/templates/`

| Module | Role |
|--------|------|
| `industries.ts` | Industry Intelligence profiles |
| `select.ts` | Choose industry from explicit id / keywords / default |
| `apply.ts` | Enrich `CoreBrief` with layout, sections, preset, features |

### Industry profiles

| Id | Layout style | Design preset |
|----|--------------|---------------|
| `restaurant` | editorial-hero | luxury |
| `ecommerce` | commerce-grid | modern |
| `saas` | product-saas | modern |
| `real-estate` | property-showcase | corporate |
| `automotive` | vehicle-showroom | modern |
| `agency` | studio-portfolio | minimal |
| `business` | corporate-trust | corporate |

Each profile defines: **layout style**, **sections**, **design preset**, **required features**, suggested pages, content tone.

Selection sources:

1. **explicit** — `industry` / `industryId` on brief or `/api/ai-core/runs`
2. **keyword** — scored against prompt, theme, features, nested plugin fields
3. **default** — `business`

Website Builder adapter merges selected sections/features into the business profile and applies preset/layout/pattern on the design system.

---

## Unified product registry

Canonical catalog: `lib/ai-core/products.ts`

| Canonical id | Aliases |
|--------------|---------|
| `website-builder` | — |
| `app-builder` | `webapp-builder` |
| `landing-page-builder` | — |
| `brand-designer` | `brand-identity` |
| `content-studio` | — |
| `video-studio` | — |
| `marketing-ai` | `marketing-strategy`, `marketing` |

---

## APIs

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/ai-core/products` | Product catalog |
| `GET` | `/api/ai-core/industries` | Industry profiles |
| `POST` | `/api/ai-core/runs` | Start Core run (`industry` optional) |
| `GET` | `/api/ai-core/runs/[id]` | Fetch run |
| `POST` | `/api/ai-core/runs/[id]/continue` | Continue run |

Existing product APIs (`/api/website-builder`, `/api/webapp-builder`, …) are unchanged.

Example:

```json
{
  "productId": "website-builder",
  "prompt": "Luxury sushi restaurant in Dubai Marina",
  "industry": "restaurant"
}
```

Artifacts include `templateSelection` (persisted on `ai_runs`).

---

## Compatibility

- Generators and product routes are not rewritten.
- Template enrichment is Core-internal (LayerRunner + adapters).
- Legacy product ids remain valid aliases.

---

## Next

Hardening / metrics / BYOK / streaming runs (optional future work).
