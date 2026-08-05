# TBGE2 Master Plan Engine

Single Source of Truth for every AI provider. LLMs execute copy only.

## Quick Start

```ts
import { runMasterPlanPipeline } from "@/lib/ai-core/generation-engine";

const result = await runMasterPlanPipeline({
  userPrompt: "Modern SaaS website with pricing and free trial",
});

if (result.ok) {
  console.log(result.masterPlan.id);           // UUID
  console.log(result.masterPlan.providerIndependent); // true
  console.log(result.llmRequest.userPrompt);   // copy tasks only — never raw prompt
}
```

## Verification

```bash
npm run test:master-plan
npm run verify:master-plan
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Schema](./docs/SCHEMA.md)
- [Lifecycle](./docs/LIFECYCLE.md)
- [Backward Compatibility](./docs/BACKWARD-COMPATIBILITY.md)
