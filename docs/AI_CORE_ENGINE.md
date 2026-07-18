# AI Core Engine

**Status:** Phase 2 — Website + Web App + Landing Page on LayerRunner  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018, D-019, D-020, D-021, `docs/WEBSITE_BUILDER_DESIGN_ENGINE.md`

---

## Goal

Power every AI product with one reusable pipeline:

```
Business Idea → Strategy → Design → Assets → Generation → Quality Check → Final Output
```

Website Builder, Web App Builder, and Landing Page Builder execute through `LayerRunner` via `ProductEngineAdapter`. Existing UIs and APIs stay unchanged.

---

## Package layout

```
lib/ai-core/
  index.ts                 # public barrel (+ registers adapters)
  adapter.ts               # ProductEngineAdapter + runner I/O types
  registry.ts              # productId → adapter map
  adapters/
    website-builder.ts     # Phase 1
    webapp-builder.ts      # Phase 2
    landing-page-builder.ts # Phase 2
    derive-layers.ts       # deterministic Core mappings for plugin products
  runtime/index.ts         # re-exports existing lib/ai engine/providers
  layers/
    types.ts
    schemas.ts
    runner.ts
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

Result includes `usage`, `generationTimeMs`, and `provider`.

---

## Registered products

| Product id | Entry generator | Plugin reuse |
|------------|-----------------|--------------|
| `website-builder` | `lib/deepseek.ts` → `generateWebsite` | `plugins/website` layers + generate/quality |
| `webapp-builder` | `lib/webapp-generator.ts` | `plugins/webapp` analyze/plan/generate/validate/export |
| `landing-page-builder` | `lib/landing-page-generator.ts` | `plugins/landing-page` analyze/plan/generate/validate/export |

### Web App / Landing mapping (Phase 2)

These products do not have Design Engine AI layers yet. Adapters map existing plugin stages onto Core:

| Core layer | Web App / Landing |
|------------|-------------------|
| Idea | `analyze*` → `CoreBusinessProfile` |
| Strategy | `plan*` (blueprint + files) → `CoreProductStrategy` |
| Design | Derived from `designStyle` / `colorStyle` + blueprint |
| Assets | Pending placeholder manifest from pages/sections |
| Generation | existing `generate*` |
| Quality | existing `validate*` |
| Finalize | existing `export*` (ZIP progress) + return output |

UI routes (`/api/webapp-builder`, `/api/landing-page-builder`) are unchanged.

---

## ProductEngineAdapter

Thin bridge from Core → existing product plugins/generators. Register via `registerProductEngineAdapter`. Create a **fresh adapter instance per run** when the adapter holds session state.

---

## Database

Migration: `supabase/migrations/033_ai_runs.sql` — `ai_runs` ledger + `ai-assets` bucket.  
Production product routes do **not** write `ai_runs` yet.

---

## What Phase 2 does **not** do

- Does not rewrite App / Landing UI or APIs
- Does not add Design Engine AI layers to App / Landing (deterministic Core design/assets)
- Does not migrate Brand, Content, Video
- Does not add `/api/ai-core/*` routes yet

---

## Next phases

1. ~~Phase 1 — Website Builder~~ **done**
2. ~~Phase 2 — Landing + App Builder~~ **done**
3. **Phase 3** — Brand + Content  
4. **Phase 4** — Video + Marketing  
5. **Phase 5** — `/api/ai-core/runs` + unified registry  
6. **Phase 6** — Hardening / metrics / BYOK  
