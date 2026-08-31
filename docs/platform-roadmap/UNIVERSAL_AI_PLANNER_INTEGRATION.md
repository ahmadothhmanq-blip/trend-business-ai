# Universal AI Planner Integration Spec (v1)

## Purpose
Define how the Universal AI Planner becomes the first intelligence layer for all platform services without changing current service behavior.

## Scope (v1)
- Introduce planner infrastructure only.
- No direct modification of Website Builder, App Builder, or other service runtime behavior.
- Persist planner artifacts in `CoreBrief.metadata` and MAOE shared memory.

## Core Components
- Planner engine: `lib/ai-core/universal-planner/engine.ts`
- Blueprint schema: `lib/ai-core/universal-planner/schema.ts`
- Requirements analyzer: `lib/ai-core/universal-planner/requirements/analyzer.ts`
- Clarification engine: `lib/ai-core/universal-planner/clarification-engine.ts`
- Service router: `lib/ai-core/universal-planner/service-router.ts`
- PRE wrapper: `lib/ai-core/planning-reasoning-engine/orchestrator.ts`
- MAOE orchestration: `lib/ai-core/multi-agent-orchestration/maoe-engine.ts`

## Metadata Keys
- `universalPlannerBlueprint`
- `universalPlannerRequirements`
- `universalPlannerClarifications`
- `universalPlannerServicePlans`

Existing PRE/MAOE keys remain unchanged and are referenced by the planner trace object.

## Router Contract
Each `servicePlans[]` entry:
- `serviceId`: universal service id
- `adapterVersion`: `"1"`
- `supported`: boolean
- `serviceBlueprint`: adapter-specific payload
- `note`: optional reason when unsupported

This contract allows progressive adapter rollout by service.

## Feature Flag Strategy
Use a two-level gate when later wiring services:
- Global: `UNIVERSAL_PLANNER_ENABLED`
- Per service: `UNIVERSAL_PLANNER_<SERVICE>_ENABLED` (for example, `UNIVERSAL_PLANNER_WEBSITE_ENABLED`)

Default in rollout phase:
- Planner runs in shadow mode (observe, no routing enforcement).
- Service keeps existing direct flow.

## Suggested Rollout Phases
1. Shadow mode:
   - Run planner in parallel.
   - Record deltas between planner suggestion and current service plan.
2. Advisory mode:
   - Expose planner outputs to internal dashboards.
3. Enforced mode:
   - Service routes through planner service plan.

## Telemetry Requirements
- Planner run id (`briefId`/fingerprint)
- PRE trace reference
- MAOE workflow id
- Selected service id
- Clarification question count
- Validation pass/fail status of universal blueprint schema

## Failure Handling
- If planner schema validation fails:
  - Do not invoke planner routing.
  - Keep legacy service flow.
  - Emit structured error with trace references.

## Security / Compliance
- Never persist secrets in planner metadata.
- Keep clarification answers summarized, not raw PII payloads.
- Preserve existing auth checks on each service route; planner does not bypass auth.
