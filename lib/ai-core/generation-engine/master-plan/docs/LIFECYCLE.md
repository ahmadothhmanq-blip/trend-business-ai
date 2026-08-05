# Master Plan Lifecycle

## Stages

| # | Stage | Owner | Uses LLM |
|---|-------|-------|----------|
| 1 | tbge_analysis | TBGE | No |
| 2 | master_plan_build | Master Plan | No |
| 3 | master_plan_validate | Master Plan | No |
| 4 | llm_request | Master Plan | No |
| 5 | structured_content | LLM | Yes |

## API

```ts
import { MASTER_PLAN_LIFECYCLE, getMasterPlanLifecyclePhase } from "@/lib/ai-core/generation-engine";

const phase = getMasterPlanLifecyclePhase("master_plan_build");
// { stage: "master_plan_build", owner: "master-plan", usesLlm: false }
```

## Settings Patch

```ts
import { masterPlanToSettingsPatch } from "@/lib/ai-core/generation-engine";

const patch = masterPlanToSettingsPatch(result.meta);
// { masterPlanHash, masterPlanSchemaVersion, masterPlanProviderIndependent }
```
