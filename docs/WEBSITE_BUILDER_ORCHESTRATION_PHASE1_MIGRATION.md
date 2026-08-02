# Website Builder — Phase 1 Architecture Cleanup Migration Report

**Date:** 2026-08-02  
**Scope:** Orchestration cleanup only — no generation logic, prompts, AI behavior, or performance changes.

---

## Goals

| Goal | Status |
|------|--------|
| Make AI Core the only official Website Builder orchestration path | Done |
| Identify legacy entry points no longer used | Done (see below) |
| Remove duplicate orchestration only if completely unused | Done (`websitePlugin` removed) |
| Preserve all existing functionality | Verified via type-check + build |
| Migration report listing every change | This document |

---

## Canonical Orchestration Path (Official)

```
API / platform services
  → lib/website-generator.ts :: generateWebsite()
    → lib/deepseek.ts :: generateWebsite()
      → layerRunner.run(createWebsiteBuilderAdapter(), …)
        → lib/ai-core/adapters/website-builder.ts
          → plugins/website/plan.ts
          → plugins/website/generate.ts
          → plugins/website/layers/*
```

**Active callers (unchanged):**

| Caller | Import |
|--------|--------|
| `app/api/website-builder/route.ts` | `@/lib/website-generator` |
| `app/api/website-builder/stream/route.ts` | `@/lib/website-generator` |
| `app/api/website-builder/[id]/optimize/route.ts` | `@/lib/website-generator` |
| `lib/website/platform/services/edit-service.ts` | `@/lib/website-generator` |
| `lib/ai-core/runs/service.ts` | `layerRunner` + product adapter registry |
| `lib/ai-core/products.ts` | `createWebsiteBuilderAdapter` (product id: `website-builder`) |

---

## Legacy Entry Points Identified

### Removed (dead orchestration)

| Entry point | Location | Reason |
|-------------|----------|--------|
| `websitePlugin` | `plugins/website/index.ts` | `AIPlugin` wrapper for `providerManager.runPlugin()` — **zero runtime importers** |

**Previous dead flow (no longer exported):**

```
providerManager.runPlugin(websitePlugin)
  → analyze → plan → generate → validate → export
```

### Retained but unreachable via plugin orchestration (not deleted)

These stage wrappers were only wired through `websitePlugin`. Functionality is preserved via AI Core adapter and API routes:

| Module | Function | Active replacement |
|--------|----------|-------------------|
| `plugins/website/analyze.ts` | `analyzeWebsite` | `analyzeBusinessIdea` via adapter `runIdea` layer |
| `plugins/website/validate.ts` | `validateWebsite` | `validateWebsiteGeneration` + quality layer in adapter |
| `plugins/website/export.ts` | `exportWebsite` | `buildProjectZip` in `app/api/website-builder/[id]/export/route.ts` |

**Not removed** — files remain for reference and smoke scripts; they are not orchestration entry points.

### Deprecated alias (kept for compatibility)

| Symbol | Location | Notes |
|--------|----------|-------|
| `generateWebsiteWithDeepSeek` | `lib/deepseek.ts` | Re-exports `generateWebsite`; no direct API callers found |

---

## Files Changed

### `plugins/website/index.ts`

- **Removed:** `websitePlugin` export and all `AIPlugin` / stage-handler imports (`analyzeWebsite`, `planWebsite`, `generateWebsite`, `validateWebsite`, `exportWebsite`).
- **Kept:** Type re-exports from `plugins/website/types` and `plugins/website/layers/types`.
- **Added:** Module header documenting canonical orchestration path.

### `lib/website-generator.ts`

- **Added:** Module header declaring this as the canonical public entry point and documenting the AI Core pipeline.
- **No behavioral changes** to exports.

### `lib/deepseek.ts`

- **Updated:** JSDoc on `generateWebsite` to reference `@/lib/website-generator` as canonical public API.
- **No behavioral changes** to generation, provider fallback, or profiler wiring.

### `docs/WEBSITE_BUILDER_ORCHESTRATION_PHASE1_MIGRATION.md`

- **Added:** This migration report.

---

## Files Explicitly NOT Changed

Per Phase 1 constraints:

- `plugins/website/generate.ts` — generation engine
- `plugins/website/plan.ts` — planning engine
- `lib/ai-core/adapters/website-builder.ts` — adapter layer logic
- All prompt files under `lib/ai/prompts/`
- Generation profiles / flags (`lib/website/generation-flags.ts`)
- Performance / composition WIP modules

---

## Stale Documentation (identified, not modified)

| Document | Issue |
|----------|-------|
| `DEEPSEEK_AUDIT_REPORT.md` | Still describes `websitePlugin` / `runPlugin` as active Website Builder path |

Update separately if audit docs should track live architecture.

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| TypeScript | `npm run type-check` | Pass |
| Production build | `npm run build` | Pass |
| Smoke (structure) | `node scripts/smoke-website-ai.mjs` | Pass |

---

## Summary

Phase 1 establishes **AI Core LayerRunner + `createWebsiteBuilderAdapter`** as the single official Website Builder orchestration path. The only code removed was `websitePlugin` — a completely unused `AIPlugin` wrapper with no runtime callers. All generation behavior, prompts, and API contracts are unchanged.
