# AWQE — AI Website Quality Engine

Transforms Master Plan into world-class Website Specification.

## Pipeline

```
Master Plan → AWQE → Website Specification → Website Builder
```

## Quick Start

```ts
import { runAwqePipeline } from "@/lib/ai-core/generation-engine";

const result = runAwqePipeline({ masterPlan });
if (result.ok) {
  console.log(result.specification.scores.overall);
  console.log(result.specification.report.appliedImprovements);
}
```

## Verification

```bash
npm run test:awqe
npm run verify:awqe
```
