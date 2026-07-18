# AI Core Engine

**Status:** Phase 4 — + Video Studio + Marketing AI on LayerRunner  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018–D-023, `docs/WEBSITE_BUILDER_DESIGN_ENGINE.md`

---

## Goal

Power every AI product with one reusable pipeline:

```
Business Idea → Strategy → Design → Assets → Generation → Quality Check → Final Output
```

Registered products execute through `LayerRunner` via `ProductEngineAdapter`. Existing UIs and APIs stay unchanged.

---

## Package layout

```
lib/ai-core/
  index.ts
  adapter.ts
  registry.ts
  adapters/
    website-builder.ts
    webapp-builder.ts
    landing-page-builder.ts
    brand-designer.ts
    content-studio.ts
    video-studio.ts        # Phase 4
    marketing-ai.ts        # Phase 4
    derive-layers.ts
  runtime/index.ts
  layers/
    types.ts
    schemas.ts
    runner.ts
```

---

## Registered products

| Product id | Entry | Plugin |
|------------|-------|--------|
| `website-builder` | `lib/deepseek.ts` | `plugins/website` |
| `webapp-builder` | `lib/webapp-generator.ts` | `plugins/webapp` |
| `landing-page-builder` | `lib/landing-page-generator.ts` | `plugins/landing-page` |
| `brand-designer` | `lib/brand-identity-generator.ts` | `plugins/brand-identity` |
| `content-studio` | `lib/content-generator.ts` | `plugins/content-studio` |
| `video-studio` | `lib/video-generator.ts` | `plugins/video-studio` |
| `marketing-ai` | `lib/workspace/service.ts` (type `marketing`) | `marketingPlugin` |

### Marketing note

Dashboard product registry id remains `marketing-strategy` / workspace type `marketing`. Core adapter id is `marketing-ai`. API path stays `/api/workspaces/marketing`.

---

## Layer mapping (plugin products)

| Core layer | Mapping |
|------------|---------|
| Idea | plugin `analyze` |
| Strategy | plugin `plan` |
| Design | Derived from plan/style |
| Assets | Pending placeholder manifest |
| Generation | plugin `generate` |
| Quality | plugin `validate` |
| Finalize | plugin `export` |

---

## Database

Migration `033_ai_runs.sql` — ledger ready; production routes do not write `ai_runs` yet.

---

## Next phases

1. ~~Phase 1–4~~ **done**
2. **Phase 5** — `/api/ai-core/runs` + unified registry  
3. **Phase 6** — Hardening / metrics / BYOK  
