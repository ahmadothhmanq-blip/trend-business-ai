# TBGE2 — Planning Lifecycle

## Phases

| # | Stage | Module | Uses LLM |
|---|-------|--------|----------|
| 1 | intent | `analyzers/intent-analyzer.ts` | No |
| 2 | business | `analyzers/business-analyzer.ts` | No |
| 3 | requirements | `analyzers/requirements-analyzer.ts` | No |
| 4 | website | `planners/website-planner.ts` | No |
| 5 | pages | `planners/page-planner.ts` | No |
| 6 | sections | `planners/section-planner.ts` | No |
| 7 | content | `planners/content-planner.ts` | No |
| 8 | llm_request | `llm/request-builder.ts` | No |
| 9 | structured_output | `llm/structured-output.ts` | Yes (optional) |
| 10 | validate | `validation/validate.ts` | No |

## API

```ts
import { TBGE2_PLANNING_LIFECYCLE, getLifecyclePhase } from "@/lib/ai-core/generation-engine";

const phase = getLifecyclePhase("intent");
// { stage: "intent", label: "Intent Analyzer", usesLlm: false, ... }
```

## Settings Patch

```ts
import { planToSettingsPatch } from "@/lib/ai-core/generation-engine";

const patch = planToSettingsPatch(result.meta);
// { tbge2PlanHash: "...", tbge2PlatformVersion: "2.0.0" }
```
