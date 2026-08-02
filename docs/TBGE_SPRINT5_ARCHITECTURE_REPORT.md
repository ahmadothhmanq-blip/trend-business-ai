# TBGE Sprint 5 — Architecture Report

**Date:** August 2, 2026  
**Sprint:** TBGE Sprint 5 — Website Builder Integration  
**Scope:** Feature-flagged routing only — legacy path preserved  

---

## Executive Summary

Sprint 5 wires Website Builder to TBGE behind feature flags. Legacy generation is unchanged when flags are off. Primary TBGE mode replaces generation when `TBGE_ENABLED=1` + `TBGE_PLANNING=1` + `TBGE_ASSEMBLY=1`. Shadow mode runs legacy and TBGE in parallel and returns legacy output with comparison metrics.

| Criterion | Status |
|-----------|--------|
| Build | PASS |
| Type-check | PASS |
| Tests | PASS |
| Legacy unchanged (flags off) | CONFIRMED |
| Shadow mode | IMPLEMENTED |
| Live PlannerLlmClient | IMPLEMENTED |

---

## Integration Architecture

```
generateWebsite() [lib/website/orchestrator.ts]
  → resolveWebsiteTbgeRoute()
      ├── legacy (default) → layerRunner.run() [unchanged]
      ├── tbge-primary → runTbgeWebsiteGeneration()
      └── shadow → runLegacy ∥ runTbge → return legacy + metrics
```

### TBGE Pipeline (when active)

```
WebsiteGenerationInput
  → mapWebsiteInputToTbgeBrief()
  → createPlannerLlmClientFromProvider(AIProvider)
  → TbgeOrchestrator.run()
      → Master Planner (1 LLM call)
      → Assembly Engine (deterministic)
  → ComponentComposer.compose() [if TBGE_COMPOSER=1]
  → mapTbgeSpecToWebsiteProject()
  → TbgeIntegrationMetrics
```

---

## Module: `lib/tbge/integration/`

| File | Purpose |
|------|---------|
| `router.ts` | Feature-flag routing |
| `brief-mapper.ts` | Website input → TbgeBrief |
| `planner-llm-client.ts` | AIProvider → PlannerLlmClient |
| `result-mapper.ts` | TBGE output → GeneratedWebsiteProject |
| `run-website-generation.ts` | Full TBGE website run |
| `shadow-mode.ts` | Parallel legacy + TBGE comparison |
| `metrics.ts` | Time, LLM calls, quality scoring |

---

## Feature Flags

| Flag | Role |
|------|------|
| `TBGE_ENABLED` | Master switch |
| `TBGE_PLANNING` | Master Planner |
| `TBGE_ASSEMBLY` | Assembly Engine |
| `TBGE_COMPOSER` | Component Composer (optional) |
| `TBGE_SHADOW_MODE` | Parallel comparison (legacy returned) |
| `TBGE_LEGACY_FULL` | Force legacy only |

### Routing Matrix

| ENABLED | PLANNING | ASSEMBLY | SHADOW | Route |
|---------|----------|----------|--------|-------|
| off | * | * | * | legacy |
| on | on | on | off | **tbge-primary** |
| on | on | on | on | **shadow** |
| on | off | * | * | legacy |

---

## Shadow Mode Metrics

- Duration (legacy vs TBGE)
- File counts
- Path overlap ratio
- Quality scores (heuristic)
- TBGE LLM call count
- Logged via `console.info("[tbge-shadow] comparison", ...)`

---

## Modified Files

| File | Change |
|------|--------|
| `lib/website/orchestrator.ts` | Flag-gated routing hook only |
| `lib/tbge/index.ts` | Export integration API |
| `lib/tbge/flags/index.ts` | `TBGE_COMPOSER` flag (Sprint 4) |
| `.env.example` | Document flags |

**Not modified:** `plugins/website/*`, legacy prompts, database, adapter layer internals.

---

## Rollback

Set `TBGE_LEGACY_FULL=1` or leave all TBGE flags unset → 100% legacy behavior.
