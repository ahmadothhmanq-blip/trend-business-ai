# Website Builder Validation Ladder

This document defines the **canonical validation phases** for Website Builder. Each validator runs at a specific pipeline stage. New validators must map to one of these rungs — do not add parallel validation paths without updating this ladder.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Rung 0 — Architecture Plan (PRE)                                       │
│  validateWebsiteGenerationPlan · architecture-validation/orchestrate      │
│  When: Before file generation · Blocks on failure (3 attempts)          │
├─────────────────────────────────────────────────────────────────────────┤
│  Rung 1 — Pipeline Schema                                               │
│  pipeline-validate.ts · plugins/website/plan.ts                         │
│  When: Blueprint / analysis / plan assembly · Schema + structural       │
├─────────────────────────────────────────────────────────────────────────┤
│  Rung 2 — Per-File Generation                                           │
│  lib/ai/validator.ts · validateGeneratedProject (per file)              │
│  When: During plugins/website/generate.ts · Retry on failure          │
├─────────────────────────────────────────────────────────────────────────┤
│  Rung 3 — Project Delivery                                              │
│  generation-validation.ts · validateWebsiteGeneration                   │
│  When: After files assembled · Adapter + generate.ts                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Rung 4 — Quality Assurance                                             │
│  QASHE (quality-assurance) + plugin layers/quality.ts                   │
│  When: Adapter runQuality · Optional improve pass                       │
├─────────────────────────────────────────────────────────────────────────┤
│  Rung 5 — Copilot / Edit Commit (L0 + L1)                               │
│  lib/website/validation/post-command.ts                                 │
│  When: Blueprint mutations via platform/commit · L0 blocks, L1 warns    │
├─────────────────────────────────────────────────────────────────────────┤
│  Rung 6 — Export                                                        │
│  prepare-export.ts · validateGeneratedProject                             │
│  When: ZIP download · Scaffold injection + remediation                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Rung 7 — Publish Gates                                                 │
│  lib/website/publish-gates.ts                                           │
│  When: Publish / deploy · Conversion, design critic, final quality      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Rung Details

### Rung 0 — Architecture Plan Validation

| Property | Value |
|----------|-------|
| Module | `lib/ai-core/architecture-validation/` |
| Entry | `validateAndRouteWebsiteGeneration()` |
| Trigger | PRE / Planning & Reasoning Engine |
| Severity | **Blocking** — throws `ArchitectureValidationFailure` |
| Retries | 3 attempts with `applyArchitectureCorrectionsToBrief` |
| Checks | Industry ↔ layout family, editorial guards, forbidden templates, structure/template TI alignment |

### Rung 1 — Pipeline Schema Validation

| Property | Value |
|----------|-------|
| Module | `plugins/website/pipeline-validate.ts` |
| Trigger | `plan.ts` during blueprint and file planning |
| Severity | **Blocking** at plan stage |
| Checks | Analysis shape, blueprint completeness, planned file list |

### Rung 2 — Per-File Validation

| Property | Value |
|----------|-------|
| Module | `lib/ai/validator.ts` |
| Trigger | `generateJsonWithValidation` in file generation loops |
| Severity | **Retry** — up to 3 LLM attempts per file |
| Checks | JSON schema, file path conventions, content shape |

### Rung 3 — Project Delivery Validation

| Property | Value |
|----------|-------|
| Module | `lib/ai-core/website-builder/generation-validation.ts` |
| Entry | `validateWebsiteGeneration()` |
| Trigger | After all files generated; adapter `runGeneration` completion |
| Severity | **Warning / issue list** — does not block save by default |
| Checks | Required pages, home page, asset coverage, SEO basics |

### Rung 4 — Quality Assurance

| Property | Value |
|----------|-------|
| Modules | `quality-assurance/qashe-engine.ts`, `plugins/website/layers/quality.ts` |
| Trigger | Adapter `runQuality` layer |
| Severity | **Advisory** — improve pass optional per generation profile |
| Checks | Structure, responsive, SEO, content, brand, media dimensions |

### Rung 5 — Copilot Commit Validation

| Property | Value |
|----------|-------|
| Module | `lib/website/validation/post-command.ts` |
| Trigger | `lib/website/platform/commit.ts` before persist |
| L0 | **Blocking** — no files, missing/empty `app/page.tsx`, no components |
| L1 | **Warning only** — reuses `validateWebsiteGeneration` issue filter |

### Rung 6 — Export Validation

| Property | Value |
|----------|-------|
| Module | `lib/website/prepare-export.ts` |
| Trigger | `GET /api/website-builder/[id]/export` |
| Severity | **Blocking** for export — returns error if project invalid |
| Checks | `validateGeneratedProject`, image remediation, scaffold injection |

### Rung 7 — Publish Gates

| Property | Value |
|----------|-------|
| Module | `lib/website/publish-gates.ts`, `publish-quality.ts` |
| Trigger | Publish and deploy API routes |
| Severity | **Blocking** for publish when gates fail |
| Checks | Conversion optimizer, design critic, final quality, SEO performance |

## Rules for Contributors

1. **One validator per rung** — extend the existing module; do not add a parallel check at the same stage.
2. **Blocking vs advisory** — only Rung 0, 1, 2 (retry), 5-L0, 6, and 7 may block user-facing actions.
3. **Import direction** — validators in `lib/website/validation/` may call `ai-core` engines; `ai-core` must not import `lib/website/platform/*` for validation (use contracts/types).
4. **Tests** — architecture validation tests live in `architecture-validation.test.ts`; add rung-specific tests beside the validator module.

## Related Architecture

- **Canonical generation path:** `lib/website-generator.ts` → `layerRunner` → `createWebsiteBuilderAdapter()`
- **Shared types:** `lib/website/types/`
- **Shared contracts:** `lib/website/contracts/`
- **API facade:** `lib/website/generation-api.ts`
