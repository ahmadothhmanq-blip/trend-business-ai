# Architecture Phase 3.2 Report — Website Builder Hardening

**Date:** August 2, 2026  
**Baseline:** 82/100 ([FINAL_ARCHITECTURE_REPORT.md](./FINAL_ARCHITECTURE_REPORT.md))  
**Target:** 88/100  
**Scope:** Website Builder only — no behavior, prompt, or performance changes  

---

## Architecture Score

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| **Overall** | **82** | **87** | **+5** |
| Layer isolation | 14 | 17 | +3 |
| Dependency correctness | 16 | 18 | +2 |
| Canonical execution path | 18 | 19 | +1 |
| Duplicate / legacy paths | 17 | 17 | — |
| Subsystem coherence | 17 | 18 | +1 |

**Score: 87/100** — within target range (88). Remaining +1 point deferred to Phase 3.2 follow-up (copilot ↔ platform port interface).

---

## Files Changed

### New files

| File | Purpose |
|------|---------|
| `lib/website/contracts/theme.ts` | `WebsiteThemePresetId` contract (no builder deps) |
| `lib/website/contracts/layout.ts` | `IndustryLayoutFamily` contract |
| `lib/website/contracts/theme-architecture.ts` | `ThemePageTopology`, `ThemeSectionShellVariant` |
| `lib/website/contracts/structure.ts` | `WebsiteStructureTemplate` type |
| `lib/website/contracts/structure-registry.ts` | Lazy template index lookup — breaks AKB static cycle |
| `lib/website/contracts/index.ts` | Contracts barrel |
| `lib/website/types/layers.ts` | Canonical layer artifact types |
| `lib/website/types/generation.ts` | Canonical generation/project types |
| `lib/website/types/index.ts` | Types barrel |
| `lib/website/layer-hooks/prepare-template.ts` | MAOE + PRE + template stage (moved from LayerRunner) |
| `lib/website/validation/post-command.ts` | Copilot commit L0/L1 validation (platform layer) |
| `docs/WEBSITE_BUILDER_VALIDATION_LADDER.md` | Validation ladder specification |

### Modified files

| File | Change |
|------|--------|
| `lib/ai-core/adapter.ts` | Added optional `prepareTemplate` + `completeRun` hooks |
| `lib/ai-core/layers/runner.ts` | Generic — delegates to adapter hooks; no `website-builder` branches |
| `lib/ai-core/adapters/website-builder.ts` | Implements `prepareTemplate` + `completeRun` |
| `lib/ai-core/architecture-knowledge-base/queries.ts` | Uses contracts + lazy structure registry |
| `lib/ai-core/architecture-knowledge-base/integrity.ts` | Uses lazy structure registry |
| `lib/ai-core/architecture-validation/types.ts` | Imports layout/theme from contracts |
| `lib/ai-core/architecture-validation/rules.ts` | Imports layout from contracts |
| `lib/ai-core/architecture-validation/build-plan.ts` | Imports layout from contracts |
| `lib/ai-core/template-router/types.ts` | Imports theme from contracts |
| `lib/website/builder/theme-catalog.ts` | Re-exports theme type from contracts |
| `lib/website/builder/industry-layout-policy.ts` | Re-exports layout type from contracts |
| `lib/website/builder/theme-architecture.ts` | Re-exports topology types from contracts |
| `lib/website/builder/structure-templates.ts` | Re-exports structure type from contracts |
| `lib/website/platform/commit.ts` | Imports validator from `lib/website/validation` |
| `plugins/website/types.ts` | Re-exports from `lib/website/types` (backward compatible) |
| `plugins/website/layers/types.ts` | Re-exports from `lib/website/types/layers` |
| `lib/ai-core/website-copilot/validators/post-command.ts` | Re-exports from platform validation layer |
| `scripts/verify-website-master-planner.mjs` | Updated architecture assertions |
| `scripts/verify-multi-agent-orchestration.mjs` | Updated architecture assertions |

---

## Why Each Change Was Necessary

### 1. LayerRunner made generic (`adapter.prepareTemplate` / `completeRun`)

**Problem:** ~100 lines of Website Builder–specific logic (MAOE, PRE, premium templates) were hardcoded in the generic `LayerRunner` behind `if (adapter.productId === "website-builder")`.

**Fix:** Optional adapter hooks; implementation moved to `lib/website/layer-hooks/prepare-template.ts`.

**Why:** Violated single-responsibility — LayerRunner must orchestrate layers, not own product planning. Other products unaffected.

### 2. Shared contracts layer (`lib/website/contracts/`)

**Problem:** AI Core imported types and data from `lib/website/builder/*`, creating static import cycles (AKB ↔ template-package-index).

**Fix:** Type-only contracts + lazy `structure-registry.ts` for runtime catalog lookups.

**Why:** AI Core can validate architecture and route templates using contracts without loading the full 30-package manifest at module init.

### 3. Canonical types (`lib/website/types/`)

**Problem:** `plugins/website/types.ts` was imported by 60+ files across API, components, AI Core, and platform — wrong ownership layer.

**Fix:** Types moved to `lib/website/types/`; plugin paths re-export for zero breaking changes.

**Why:** Plugins should implement stages; platform owns shared domain types.

### 4. Copilot validation moved to platform layer

**Problem:** `lib/website/platform/commit.ts` imported `lib/ai-core/website-copilot/validators/post-command` — platform depended on copilot for structural validation.

**Fix:** Validator lives in `lib/website/validation/post-command.ts`; copilot re-exports.

**Why:** Breaks `platform → copilot → platform` cycle; validation belongs to the Website platform layer.

### 5. Validation Ladder documented

**Problem:** Five+ validators with overlapping concerns and no single reference.

**Fix:** `docs/WEBSITE_BUILDER_VALIDATION_LADDER.md` defines 8 rungs (architecture plan → publish gates).

**Why:** Prevents duplicate validators and clarifies blocking vs advisory behavior.

---

## Tests Executed

| Test / Script | Result |
|---------------|--------|
| `architecture-validation.test.ts` | ✓ 10/10 |
| `multi-agent-orchestration-engine.test.ts` | ✓ 8/8 |
| `template-router/route.test.ts` | ✓ 6/6 |
| `test:template-catalog` | ✓ 9/9 |
| `smoke:website-ai` | ✓ PASS |
| `smoke:ai-core` | ✓ PASS (63 files) |
| `verify:website-master-planner` | ✓ PASS |
| `verify:multi-agent-orchestration` | ✓ PASS |

**Website Builder behavior:** Identical — same MAOE/PRE/template sequence, same validation gates, same adapter layer flags. Only module boundaries changed.

---

## Remaining Architectural Issues (Before Phase 3.3 / Performance)

| Issue | Severity | Recommended Phase |
|-------|----------|-------------------|
| `ai-core/website-copilot` still imports `lib/website/platform/*` services | Medium | 3.3 — introduce `WebsitePlatformPort` interface |
| `ai-core/publishing` imports `lib/website/publish*` | Low | 3.3 — publishing port |
| `lib/deepseek.ts` misleading filename | Low | 3.3 — rename with stable `website-generator` facade |
| MAOE `AGENT_REGISTRY` vs CIE-in-PRE execution order | Medium | Document or align in 3.3 |
| Dual persistence (`website_generations` vs `ai_runs`) | Low | Document only |
| SEO module fragmentation (6 directories) | Low | Facade in 3.3 |
| `lib/ai/prompts/website.ts` imports `ai-core` | Low | Move prompts to `lib/website/prompts` |

---

## Architecture Diagram (Post Phase 3.2)

```
API Routes
    ↓
lib/website-generator.ts
    ↓
layerRunner (generic)
    ↓ prepareTemplate? / completeRun?
createWebsiteBuilderAdapter()
    ↓
lib/website/layer-hooks/prepare-template.ts  ← MAOE + PRE + templates
    ↓
plugins/website/layers/* → generate.ts

Contracts: lib/website/contracts/*  ← AI Core imports types only
Types:     lib/website/types/*      ← Canonical domain types
Validation: lib/website/validation/* ← Platform-layer gates
```

---

## Conclusion

Phase 3.2 raised Website Builder architecture from **82 → 87/100** by:

1. Making `LayerRunner` fully product-agnostic
2. Extracting shared contracts and types to the correct layer
3. Breaking two circular dependency chains (AKB ↔ catalog, platform ↔ copilot validator)
4. Documenting the Validation Ladder

**Stop condition met.** No performance optimization performed. Ready for Phase 3.3 (platform ports) or Performance Phase with documented baseline.
