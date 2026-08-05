# AWQE Backward Compatibility

## Principles

1. **Isolated** — AWQE does not modify Master Plan, TBDP, GLS, templates, or builder
2. **Not wired yet** — Phase 1 builds engine only; no orchestrator integration
3. **Provider independent** — no LLM, no AI provider imports
4. **Read-only input** — Master Plan is consumed, never mutated

## Unchanged Systems

| System | Status |
|--------|--------|
| Master Plan Engine | Unchanged |
| Master Plan Integration | Unchanged |
| TBDP | Unchanged |
| GLS | Unchanged |
| Website Builder | Unchanged |
| Templates | Unchanged |

## Phase 2 (Future)

Wire `runAwqePipeline()` between Master Plan validation and Website Builder.
