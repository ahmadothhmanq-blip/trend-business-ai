# Integration Backward Compatibility

## Principles

1. **Flag-gated** — `WB_MASTER_PLAN=1` required; default behavior unchanged
2. **Additive only** — no template, builder UI, TBDP, or GLS redesign
3. **TBGE v1 planner bypassed** — only when Master Plan provides locked spec
4. **Legacy path** — receives `masterWebsitePlan` via existing adapter contract

## Unchanged When Flag Off

- Website orchestrator routing
- TBGE v1 master planner
- PRE / legacy planning
- Templates and builder UI
- TBDP and GLS modules

## Changed When Flag On

- Master Plan becomes planning authority
- TBGE path uses locked spec (no planner LLM for architecture)
- Brief metadata enriched with Master Plan + GLS + TBDP
- Settings patch includes Master Plan + GLS hashes
