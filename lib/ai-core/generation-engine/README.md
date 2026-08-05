# TBGE2 — Trend Business AI Generation Engine v2

Official AI planning engine for Trend Business AI. Thinks before calling any LLM.

## Quick Start

```ts
import { runTbge2PlanningPipeline } from "@/lib/ai-core/generation-engine";

const result = await runTbge2PlanningPipeline({
  userPrompt: "Create a modern SaaS website with pricing and free trial",
});

if (result.ok) {
  console.log(result.plan.intent.category);   // "saas"
  console.log(result.plan.pages.length);       // 5
  console.log(result.llmRequest.userPrompt);   // structured JSON — never raw prompt
}
```

## Verification

```bash
npm run test:generation-engine
npm run verify:generation-engine
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Pipeline](./docs/PIPELINE.md)
- [Planning Lifecycle](./docs/LIFECYCLE.md)
- [Backward Compatibility](./docs/BACKWARD-COMPATIBILITY.md)
