# Website Builder — Phase 2 Architecture Cleanup Migration Report

**Date:** 2026-08-02  
**Scope:** Architecture consolidation only — no generation logic, prompts, AI behavior, profiles, or performance optimization.

**Prerequisite:** [Phase 1 migration report](./WEBSITE_BUILDER_ORCHESTRATION_PHASE1_MIGRATION.md) (removed `websitePlugin`, declared AI Core canonical).

---

## Goals

| Goal | Status |
|------|--------|
| Remove duplicate architecture layers | Done (legacy plugin stage wrappers removed; composition types moved to AI Core) |
| Remove duplicate orchestration | Done (deprecated `generateWebsiteWithDeepSeek` alias removed) |
| Remove duplicate planning flows | Audited — layered by design; no safe removals without behavior change |
| Remove duplicate adapters if unused | Audited — single website adapter; registry singleton is cross-product legacy pattern |
| Consolidate Website Builder into single clean architecture | Done |
| Keep AI Core as the only architecture | Confirmed |
| Preserve all functionality | Verified — no runtime imports of removed code |

---

## Canonical Architecture (Post Phase 2)

```
┌─────────────────────────────────────────────────────────────┐
│  Public API: lib/website-generator.ts :: generateWebsite()  │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Orchestration: lib/deepseek.ts                               │
│    provider fallback → layerRunner.run(adapter)             │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  AI Core LayerRunner (lib/ai-core/layers/runner.ts)         │
│    PRE / Master Plan / Arch Validation (website only)       │
│    → Idea → Strategy → Design → Assets → Generation         │
│    → Quality → SEO → Performance → Finalize                 │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Product adapter: createWebsiteBuilderAdapter()              │
│    plugins/website/layers/*  (stage implementations)       │
│    plugins/website/plan.ts   (blueprint / file plan)         │
│    plugins/website/generate.ts (file generation engine)      │
└─────────────────────────────────────────────────────────────┘
```

**Product catalog:** `lib/ai-core/products.ts` (`website-builder` → `createWebsiteBuilderAdapter()`)

---

## Removed — Dead Legacy Plugin Stage Wrappers

These were only reachable via the Phase 1-removed `websitePlugin`. Zero runtime importers remained.

| File | Former export | Active replacement |
|------|---------------|-------------------|
| `plugins/website/analyze.ts` | `analyzeWebsite` | Adapter `runIdea` → `plugins/website/layers/business-idea.ts` |
| `plugins/website/validate.ts` | `validateWebsite` | Adapter `runQuality` + `validateWebsiteGeneration` (AI Core) |
| `plugins/website/export.ts` | `exportWebsite` | `buildProjectZip` in `app/api/website-builder/[id]/export/route.ts` |

---

## Removed — Duplicate Orchestration Alias

| Symbol | Location | Reason |
|--------|----------|--------|
| `generateWebsiteWithDeepSeek` | `lib/deepseek.ts`, `lib/website-generator.ts` | Deprecated alias with **zero callers**; duplicated `generateWebsite` |

**Public API after Phase 2:** `generateWebsite` only (from `@/lib/website-generator`).

---

## Removed — Unwired WIP (Duplicate File-Generation Policy)

| File | Reason |
|------|--------|
| `lib/website/file-generation-policy.ts` | Never imported by production code; planned in `stash0.patch` but not merged into `generate.ts` |
| `lib/website/file-generation-policy.test.ts` | Test-only consumer of unwired module |

File-generation routing remains in `plugins/website/generate.ts` (unchanged per Phase 2 rules).

---

## Consolidated — Performance Types (Layer Cleanup)

| Action | Detail |
|--------|--------|
| **Added** | `lib/ai-core/performance/composition-performance.ts` |
| **Removed** | `plugins/website/composition/performance.ts` |
| **Updated** | `lib/ai-core/performance/pipeline-profiler.ts` import path |

Composition profiling types now live under AI Core performance, not under the plugin tree. The empty `plugins/website/composition/` directory is eliminated.

---

## Updated — Documentation & Smoke

| File | Change |
|------|--------|
| `plugins/website/index.ts` | Header clarifies adapter-invoked layers; types-only barrel |
| `lib/website-generator.ts` | Single export `generateWebsite`; pipeline documented |
| `scripts/smoke-website-ai.mjs` | Removed `analyze.ts` from required file list |

---

## Audited — Intentionally Retained (Not Duplicate / Not Safe to Remove)

### Planning flows (layered, not redundant)

| Layer | Module | Role |
|-------|--------|------|
| PRE / Master plan | `planning-reasoning-engine` + `master-planner` | Authoritative locked plan on brief (LayerRunner template phase) |
| Architecture validation | `architecture-validation/orchestrate` | Route/validate `WebsiteGenerationPlan` (inside PRE) |
| Blueprint / file plan | `plugins/website/plan.ts` | Dynamic file list for codegen (adapter `runGeneration`) |

Removing any of these would change generation behavior (out of scope).

### Adapter registration (cross-product legacy)

| Mechanism | Used? | Notes |
|-----------|-------|-------|
| `createWebsiteBuilderAdapter()` factory | **Yes** | `deepseek.ts`, `products.ts` |
| `registerProductEngineAdapter()` side effect | Side-effect only | `getProductEngineAdapter()` has zero callers; pattern shared by all product adapters |

Consolidating the registry to factories-only is a cross-product Phase 3+ task.

### Plugin layer implementations

`plugins/website/layers/*` are **not** duplicate AI Core layers — they are the website-specific generation engine invoked by the adapter. Unchanged.

---

## Files Explicitly NOT Changed

Per Phase 2 strict rules:

- `plugins/website/generate.ts`
- `plugins/website/plan.ts`
- All prompt files
- `lib/website/generation-flags.ts` / generation profiles
- `lib/ai-core/adapters/website-builder.ts` (adapter logic)
- PRE, master-planner, architecture-validation engines

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Linter (changed files) | IDE diagnostics | No new errors |
| Smoke (structure) | `node scripts/smoke-website-ai.mjs` | Pass |
| Production build | `npm run build` | Pass (if `.next` cache is healthy) |

---

## Summary

Phase 2 removes the last legacy plugin-stage wrappers and unwired duplicate modules, drops the deprecated orchestration alias, and moves composition performance types into AI Core. The Website Builder now has a single documented path: **`website-generator` → `deepseek` → LayerRunner → `createWebsiteBuilderAdapter` → plugin layers/generate**. All generation behavior is preserved; only dead architecture and unwired WIP were removed.
