# AI Core Engine

**Status:** Phase 1 — Website Builder on LayerRunner  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** Website Design Engine (D-018), `docs/WEBSITE_BUILDER_DESIGN_ENGINE.md`, D-019 / D-020

---

## Goal

Power every AI product with one reusable pipeline:

```
Business Idea → Strategy → Design → Assets → Generation → Quality Check → Final Output
```

Website Builder execution now goes through `LayerRunner` via `ProductEngineAdapter`. UI, preview, ZIP, and publish are unchanged.

---

## Package layout

```
lib/ai-core/
  index.ts                 # public barrel (+ registers Website adapter)
  adapter.ts               # ProductEngineAdapter + runner I/O types
  registry.ts              # productId → adapter map
  adapters/
    website-builder.ts     # Phase 1 Website Builder adapter
  runtime/index.ts         # re-exports existing lib/ai engine/providers
  layers/
    types.ts               # generic Core* layer contracts
    schemas.ts             # JSON schemas for provider validation
    runner.ts              # LayerRunner orchestration
```

Import:

```ts
import {
  layerRunner,
  createWebsiteBuilderAdapter,
  type ProductEngineAdapter,
  type CoreBrief,
} from "@/lib/ai-core";
```

---

## LayerRunner

`LayerRunner.run(adapter, input, options)` executes enabled layers in order:

1. `idea` → `businessProfile`
2. `strategy` → `strategy`
3. `design` → `designSystem`
4. `assets` → `assetManifest`
5. `generation` → product output (**required**)
6. `quality` → `qualityReport`
7. `finalize` → delivery payload

A layer runs only when `adapter.layers.<name> === true` **and** the corresponding `run*` method exists.

Progress lines are prefixed: `[idea] …`, `[strategy] …`, etc.

Result includes `usage`, `generationTimeMs`, and `provider`.

---

## Website Builder (Phase 1)

| Piece | Role |
|-------|------|
| `createWebsiteBuilderAdapter()` | Fresh per-run adapter (session state for analysis/plan) |
| `lib/deepseek.ts` → `generateWebsite` | Provider fallback loop + `layerRunner.run` |
| `plugins/website/layers/*` | Reused Idea / Strategy / Design / Assets / Quality |
| `plugins/website/plan.ts` + `generate.ts` | Blueprint/files + code gen (skip assets/quality when Core already ran them) |
| Stream / route + `persistWebsiteGeneration` | Unchanged — preview, ZIP, publish |

Flow:

```
Business Idea → Strategy → Design → Assets → Website Generation → Quality Check → Preview / ZIP / Publish
```

Production entry remains `/api/website-builder/stream` and `/api/website-builder` (no UI rewrite).

---

## ProductEngineAdapter

Thin bridge from Core → existing product plugins/generators:

| Field / method | Purpose |
|----------------|---------|
| `productId`, `label` | Identity |
| `layers` | Enablement flags (`generation: true` required) |
| `runIdea?` … `runAssets?` | Optional upstream layers |
| `runGeneration` | Required product generation |
| `runQuality?` | Optional QA |
| `finalize?` | Optional persist/delivery mapping |

Adapters are registered via `registerProductEngineAdapter`. Phase 1 registers `website-builder`.

---

## Database

Migration: `supabase/migrations/033_ai_runs.sql`

- Table `public.ai_runs` — Core run ledger (`brief`, `artifacts`, `layers_executed`, provider/usage, lineage)
- RLS: users CRUD own rows
- Storage bucket `ai-assets` for future shared assets (Website continues using `website-assets`)

TypeScript type: `AiRun` in `types/database.ts`

Phase 1 does **not** yet write production Website runs into `ai_runs`.

---

## What Phase 1 does **not** do

- Does not rewrite Website Builder UI
- Does not change preview / ZIP / publish contracts
- Does not migrate Landing, App, Brand, Content, Video
- Does not add `/api/ai-core/*` routes yet

---

## Next phases (not implemented)

1. ~~**Phase 1** — Website Builder adapter on LayerRunner~~ **done**
2. **Phase 2** — Landing + App Builder  
3. **Phase 3** — Brand + Content  
4. **Phase 4** — Video + Marketing  
5. **Phase 5** — `/api/ai-core/runs` + unified registry  
6. **Phase 6** — Hardening / metrics / BYOK  

---

## Runtime reuse

`lib/ai-core/runtime` re-exports the existing stack (`AIGenerationEngine`, `providerManager`, adapters, generator helpers). Website generation now prefers Core `layerRunner`; other products still call `providerManager.runPlugin` until later phases.
