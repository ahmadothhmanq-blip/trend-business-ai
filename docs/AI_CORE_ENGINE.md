# AI Core Engine

**Status:** Phase 5 — unified registry + `/api/ai-core/runs`  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018–D-024

---

## Goal

Power every AI product with one reusable pipeline:

```
Business Idea → Strategy → Design → Assets → Generation → Quality Check → Finalize
```

Existing product APIs and UIs remain unchanged. Generators are not rewritten — adapters connect existing plugins to `LayerRunner`.

---

## Unified product registry

Canonical catalog: `lib/ai-core/products.ts`

| Canonical id | Aliases | Entry (existing) |
|--------------|---------|------------------|
| `website-builder` | — | `lib/deepseek.ts` |
| `app-builder` | `webapp-builder` | `lib/webapp-generator.ts` |
| `landing-page-builder` | — | `lib/landing-page-generator.ts` |
| `brand-designer` | `brand-identity` | `lib/brand-identity-generator.ts` |
| `content-studio` | — | `lib/content-generator.ts` |
| `video-studio` | — | `lib/video-generator.ts` |
| `marketing-ai` | `marketing-strategy`, `marketing` | `lib/workspace/service.ts` (marketing) |

```ts
import {
  listAiCoreProducts,
  resolveAiCoreProduct,
  createAdapterForProduct,
  layerRunner,
} from "@/lib/ai-core";
```

---

## Generic run API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/ai-core/products` | List registered products + pipeline |
| `POST` | `/api/ai-core/runs` | Start a Core run (persists `ai_runs`) |
| `GET` | `/api/ai-core/runs/[id]` | Fetch a run |
| `POST` | `/api/ai-core/runs/[id]/continue` | Continue a prior run |

### POST `/api/ai-core/runs`

```json
{
  "productId": "app-builder",
  "prompt": "Build a SaaS dashboard for freelancers",
  "mode": "generate",
  "language": "English",
  "theme": "modern",
  "features": ["auth", "billing"],
  "input": {
    "appType": "saas",
    "designStyle": "modern",
    "colorStyle": "blue"
  }
}
```

Response includes `run`, `output`, `progressEvents`, `layersExecuted`.

Product-specific fields go in `input` (see existing plugin inputs). Defaults are applied when omitted.

### POST `/api/ai-core/runs/[id]/continue`

```json
{
  "continueInstruction": "Add a pricing page and improve the hero CTA"
}
```

Creates a child run (`parent_run_id`) with prior artifacts.

---

## Persistence

Migration: `supabase/migrations/033_ai_runs.sql`

- Table `public.ai_runs` — brief, artifacts, layers_executed, provider, usage, lineage
- Storage bucket `ai-assets`
- TypeScript: `AiRun` in `types/database.ts`

If the table is missing, run APIs return **503** with a migration hint.

---

## Package layout

```
lib/ai-core/
  index.ts
  products.ts              # unified catalog (Phase 5)
  brief-builder.ts         # API request → CoreBrief
  validations.ts
  runs/service.ts          # execute / continue / get + persist
  adapters/
    website-builder.ts
    webapp-builder.ts
    landing-page-builder.ts
    brand-designer.ts
    content-studio.ts
    video-studio.ts
    marketing-ai.ts
    derive-layers.ts
  layers/runner.ts
  registry.ts
  runtime/
```

API routes:

```
app/api/ai-core/products/route.ts
app/api/ai-core/runs/route.ts
app/api/ai-core/runs/[id]/route.ts
app/api/ai-core/runs/[id]/continue/route.ts
```

---

## Compatibility

- Product dashboards and `/api/website-builder`, `/api/webapp-builder`, etc. keep working.
- Core id `app-builder` aliases `webapp-builder` (adapter module id remains `webapp-builder`).
- Core id `brand-designer` aliases `brand-identity` (HTTP route unchanged).

---

## Next

**Phase 6** — Hardening / metrics / BYOK / richer run listing & streaming.
