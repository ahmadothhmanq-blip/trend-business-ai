# Master Plan — Backward Compatibility

## Principles

1. **Additive only** — Master Plan does not modify existing generation paths
2. **Not wired yet** — Phase 1.5 builds the engine only; no builder integration
3. **TBGE2 Phase 1 unchanged** — Master Plan consumes `runTbge2PlanningPipeline()` output
4. **No template changes** — Master Plan is metadata only
5. **No builder redesign** — Website Builder unchanged

## Existing Systems Preserved

| System | Status |
|--------|--------|
| TBGE2 Phase 1 (`generation-engine/`) | Unchanged |
| TBGE v1 (`lib/tbge/`) | Unchanged |
| Website orchestrator | Unchanged |
| Templates | Unchanged |
| Builder | Unchanged |

## Migration Path

**Phase 1.5 (current):** Master Plan Engine built, tested, documented — not wired

**Phase 2 (future):** Wire `runMasterPlanPipeline()` at builder lifecycle boundaries

**Phase 3 (future):** All providers consume Master Plan as authoritative contract
