# TBGE Sprint 2 — Architecture Report

**Date:** August 2, 2026  
**Sprint:** TBGE Sprint 2 — Master Planner & GenerationSpec  
**Scope:** Planning only — no file generation, no Website Builder wiring  

---

## Executive Summary

Sprint 2 implements the TBGE Master Planner: a single LLM call produces a `PlanDraft`, which is validated and deterministically converted into a locked `GenerationSpec`. All planning is behind `TBGE_PLANNING=1` (requires `TBGE_ENABLED=1`). Legacy Website Builder pipeline is unchanged.

| Criterion | Status |
|-----------|--------|
| Build | PASS |
| Type-check | PASS |
| Unit tests (31) | PASS |
| Sprint 1 verification (7) | PASS |
| Sprint 2 verification (9) | PASS |
| Zero behavior change | CONFIRMED |

---

## Architecture Rules Compliance

| Rule | Implementation |
|------|----------------|
| TBGE is an engine, not a framework | Minimal DI; explicit pipeline stages; no plugin magic |
| LLM only for planning | `PlannerLlmClient.complete()` is the sole LLM boundary |
| GenerationSpec is single source of truth | All downstream phases consume locked `GenerationSpec` |
| No bypass after spec | Orchestrator locks spec before assembly; assembly reads spec only |
| Deterministic = no LLM | File graph, spec build, lock, adapter extend are pure code |
| Product-agnostic | `TbgeProductAdapter` + registry; website is one adapter |
| Zero regressions | No legacy files modified; flags default OFF |

---

## Planning Pipeline

```
Brief
  → adapter.normalizeBrief()        [deterministic]
  → buildMasterPlannerPrompts()     [deterministic]
  → PlannerLlmClient.complete()     [1 LLM call]
  → parsePlanDraftFromLlm()         [deterministic]
  → validatePlanDraft()             [deterministic]
  → buildGenerationSpecFromDraft()  [deterministic]
  → adapter.extendSpec()            [deterministic]
  → lockSpec()                      [deterministic]
  → validateGenerationSpec()        [deterministic]
  → locked GenerationSpec
```

---

## New Module: `lib/tbge/planning/`

| File | Purpose |
|------|---------|
| `types.ts` | Planner contracts (`PlannerLlmClient`, `MasterPlanner`, stages) |
| `plan-draft.ts` | Intermediate LLM output type |
| `prompts.ts` | TBGE-only planner prompts (new; legacy prompts untouched) |
| `parse.ts` | JSON / fenced JSON parsing |
| `validate.ts` | PlanDraft structural validation |
| `file-graph.ts` | Deterministic file graph templates per adapter |
| `build-spec.ts` | PlanDraft → GenerationSpec (no lock) |
| `pipeline.ts` | Full planning pipeline orchestration |
| `master-planner.ts` | Master Planner facade + unconfigured LLM stub |
| `fixtures/plan-draft.ts` | Test fixtures |

---

## Orchestrator Integration

When `TBGE_ENABLED=1` and `TBGE_PLANNING=1`:

1. If `input.spec` provided → validate + lock check → assembly (0 LLM calls)
2. If no spec → Master Planner runs (1 LLM call) → assembly

When planning disabled and no spec → fails with clear message (Sprint 1 behavior preserved).

---

## Feature Flags

| Flag | Required for planning | Default |
|------|----------------------|---------|
| `TBGE_ENABLED` | Yes | OFF |
| `TBGE_PLANNING` | Yes | OFF |
| `TBGE_LEGACY_FULL` | Blocks all TBGE | OFF |

Helper: `shouldRunTbgePlanning()` = enabled + planning + not legacy-full.

---

## DI Additions

| Token | Registration |
|-------|-------------|
| `tbge.masterPlanner` | `createMasterPlanner({ llmClient })` |
| `tbge.plannerLlmClient` | `createUnconfiguredPlannerLlmClient()` (throws until injected) |

---

## Benchmark Results (mock LLM, 200 iterations)

| Stage | Median |
|-------|--------|
| `parsePlanDraftFromLlm` | 0.0057ms |
| `validatePlanDraft` | 0.0018ms |
| `buildGenerationSpecFromDraft` | 0.0041ms |
| `lockSpec` | 0.0075ms |
| `runPlanningPipeline` (full, mock) | 0.0252ms |

Report: `scripts/benchmark-results/tbge-planner-benchmark-*.json`

Run: `npm run benchmark:tbge`

---

## Files NOT Modified

- `lib/website/orchestrator.ts`
- `lib/ai-core/adapters/website-builder.ts`
- `plugins/website/*`
- `app/api/website-builder/*`
- Legacy prompts
- Database / migrations

---

## Test Coverage

| Suite | Tests |
|-------|-------|
| parsePlanDraftFromLlm | 4 |
| validatePlanDraft | 4 |
| deterministic spec build | 2 |
| planning pipeline | 2 |
| Master Planner | 1 |
| orchestrator (planning paths) | 4 |
| flags (planning) | 1 |
| Sprint 1 suites | 13 |
| **Total** | **31** |

---

## Ready for Sprint 3

Integration seam for next sprint:

- Inject live `PlannerLlmClient` at DI bootstrap
- Wire `shouldRunTbgePlanning()` in Website Builder orchestrator (behind flags)
- Assembly Engine real generators (Sprint 3+)
