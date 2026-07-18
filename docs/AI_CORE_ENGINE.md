# AI Core Engine

**Status:** Phase 3 — Website, App, Landing, Brand, Content on LayerRunner  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018–D-022, `docs/WEBSITE_BUILDER_DESIGN_ENGINE.md`

---

## Goal

Power every AI product with one reusable pipeline:

```
Business Idea → Strategy → Design → Assets → Generation → Quality Check → Final Output
```

Website Builder, Web App Builder, Landing Page Builder, Brand Designer, and Content Studio execute through `LayerRunner` via `ProductEngineAdapter`. Existing UIs and APIs stay unchanged.

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
    brand-designer.ts      # Phase 3
    content-studio.ts      # Phase 3
    derive-layers.ts       # deterministic Core mappings for plugin products
  runtime/index.ts
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
| `website-builder` | `lib/deepseek.ts` → `generateWebsite` | `plugins/website` |
| `webapp-builder` | `lib/webapp-generator.ts` | `plugins/webapp` |
| `landing-page-builder` | `lib/landing-page-generator.ts` | `plugins/landing-page` |
| `brand-designer` | `lib/brand-identity-generator.ts` | `plugins/brand-identity` (API: `/api/brand-identity`) |
| `content-studio` | `lib/content-generator.ts` | `plugins/content-studio` |

### Plugin products mapping (Phase 2–3)

| Core layer | Mapping |
|------------|---------|
| Idea | plugin `analyze` → `CoreBusinessProfile` |
| Strategy | plugin `plan` → `CoreProductStrategy` |
| Design | Derived from plan/style (brand palette/typography for Brand Designer) |
| Assets | Pending placeholder manifest |
| Generation | plugin `generate` |
| Quality | plugin `validate` |
| Finalize | plugin `export` + return output |

---

## ProductEngineAdapter

Thin bridge from Core → existing product plugins/generators. Register via `registerProductEngineAdapter`. Create a **fresh adapter instance per run** when the adapter holds session state.

---

## Database

Migration: `supabase/migrations/033_ai_runs.sql` — `ai_runs` ledger + `ai-assets` bucket.  
Production product routes do **not** write `ai_runs` yet.

---

## What Phase 3 does **not** do

- Does not rewrite Brand / Content UI or APIs
- Does not rename `/api/brand-identity` (Core id is `brand-designer`)
- Does not migrate Video / Marketing / Logo / Image
- Does not add `/api/ai-core/*` routes yet

---

## Next phases

1. ~~Phase 1 — Website Builder~~ **done**
2. ~~Phase 2 — Landing + App Builder~~ **done**
3. ~~Phase 3 — Brand + Content~~ **done**
4. **Phase 4** — Video + Marketing  
5. **Phase 5** — `/api/ai-core/runs` + unified registry  
6. **Phase 6** — Hardening / metrics / BYOK  
