# TBGE2 — Backward Compatibility

## Principles

1. **Additive only** — TBGE2 does not modify existing generation paths
2. **Bridge pattern** — wraps `lib/tbge`, `lib/website`, `lib/language-platform`
3. **No template changes** — planning output is metadata only
4. **No builder redesign** — existing generation pipeline unchanged
5. **Opt-in consumption** — products adopt via `runTbge2PlanningPipeline()` when ready

## Existing Systems Preserved

| System | Path | TBGE2 Relationship |
|--------|------|-------------------|
| TBGE v1 kernel | `lib/tbge/` | Bridge via `bridgeToTbgePlanDraft()` |
| Website orchestrator | `lib/website/orchestrator.ts` | Unchanged |
| Legacy planner | `plugins/website/plan.ts` | Unchanged |
| Master planner | `lib/ai-core/master-planner/` | Unchanged |
| PRE | `lib/ai-core/planning-reasoning-engine/` | Unchanged |
| GLS | `lib/language-platform/` | Bridge via `enrichPlanWithGls()` |

## Migration Path

**Phase 1 (current):** TBGE2 planning engine built, tested, documented — no wiring changes

**Phase 2 (future):** Wire `runTbge2PlanningPipeline()` at builder lifecycle boundaries

**Phase 3 (future):** Replace ad-hoc planning with TBGE2 as authoritative planner
