# MAOE Execution Order — Website Builder

This document aligns the **MAOE Agent Registry** (`AGENT_REGISTRY`) with **actual runtime execution** for Website Builder. The current order is **correct by design** — no behavior change is required.

## Registry Canonical Order

```
PRE → CIE → DIE → IIE → SAIE → QASHE
```

Defined in `lib/ai-core/multi-agent-orchestration/workflow-definition.ts` as `CANONICAL_WORKFLOW_ORDER`.

## Runtime Execution Map

| Agent | Registry `dependsOn` | Actual execution site | Supervision |
|-------|---------------------|----------------------|-------------|
| **PRE** | `[]` | `lib/website/layer-hooks/prepare-template.ts` via `superviseAgentExecution` | Async MAOE |
| **CIE** | `["PRE"]` | `lib/ai-core/agency-orchestrator/orchestrate.ts` **inside PRE phase 2** (agency synthesis) | `superviseAgentSync` when MAOE workflow active |
| **DIE** | `["PRE", "CIE"]` | `lib/ai-core/design-plan/engine.ts` during adapter `runDesign` | `superviseAgentSync` |
| **IIE** | `["DIE"]` | `lib/ai-core/image-engine/engine.ts` during adapter `runAssets` | `superviseAgentSync` |
| **SAIE** | `["IIE"]` | `lib/ai-core/adapters/website-builder.ts` `runSeo` | `superviseAgentSync` |
| **QASHE** | `["SAIE"]` | `lib/ai-core/adapters/website-builder.ts` `runQuality` | `superviseAgentSync` |

## Why CIE Runs Inside PRE (Not After)

1. **Agency contract requirement** — PRE phase 2 (`runAgencyOrchestrator`) produces the unified `AgencyGenerationContract` including remediated content from CIE.
2. **Architecture validation** — Phase 4 of PRE (`validateAndRouteWebsiteGeneration`) needs industry + content context locked before template routing.
3. **Dependency satisfaction** — CIE's registry dependency on PRE is satisfied because PRE has started (MAOE workflow initialized) before agency runs. `relaxedDependencies: true` is used because the formal PRE trace is completed at the end of `runPlanningReasoningEngine`, while CIE runs mid-PRE.

This is **intentional nesting**, not a registry bug.

## PRE Internal Phases

```
Phase 1/5 — Business intelligence
Phase 2/5 — Agency synthesis (includes CIE when MAOE active)
Phase 3/5 — Auto-design heuristics
Phase 4/5 — Template routing + architecture validation
Phase 5/5 — Master plan lock + apply to brief
```

## MAOE Workflow Lifecycle

```
prepareTemplate (website adapter)
  → runMultiAgentOrchestrationEngine (init workflow on brief)
  → superviseAgentExecution(PRE) → runPlanningReasoningEngine
       └─ includes agency + CIE inside PRE
  → ... layer stages (idea → strategy → design → assets → generation → quality → seo) ...
  → completeRun (website adapter) → completeMaoeWorkflow
```

## `relaxedDependencies: true`

Used for CIE, DIE, IIE, SAIE, QASHE when supervised inside their respective stages. Allows agents to run before the formal PRE trace is persisted on brief, while still recording MAOE supervision metadata.

## When to Change This

Only change execution order if:

- CIE is moved **after** full PRE completion (would require agency orchestrator to run post-PRE), or
- Architecture validation is moved before agency synthesis.

Both would be **behavior changes** and are out of scope for architecture freeze.

## Related Docs

- [WEBSITE_BUILDER_VALIDATION_LADDER.md](./WEBSITE_BUILDER_VALIDATION_LADDER.md)
- [EDS-008_MULTI_AGENT_ORCHESTRATION.md](./EDS-008_MULTI_AGENT_ORCHESTRATION.md)
