# Production Website Generation Pipeline

Final production wiring connecting all completed systems into one pipeline.

## Flow

```
User Prompt
    ↓
TBGE (analysis)
    ↓
Master Plan
    ↓
Master Plan Validation
    ↓
AWQE
    ↓
Website Specification
    ↓
Content Tasks
    ↓
Content Provider (copy only)
    ↓
Structured Content Validation
    ↓
Website Builder (TBGE assembly)
    ↓
TBDP
    ↓
GLS
    ↓
Generated Website
```

## Activation

```bash
WB_PRODUCTION_PIPELINE=1
```

When enabled, `WB_MASTER_PLAN` integration is implicitly active. Without the production flag, `WB_MASTER_PLAN=1` alone preserves the prior partial integration (no AWQE, content errors are non-fatal).

## Entry Points

| Module | Function |
|--------|----------|
| `lib/ai-core/generation-engine/production/` | `runProductionPlanningPhase()` |
| `lib/website/orchestrator.ts` | `generateWebsite()` — full lifecycle |

## Validation

Every stage validates before proceeding. Failures stop immediately with a detailed `ProductionValidationReport`.

| Stage | Validator |
|-------|-----------|
| Master Plan | `validateBeforeGeneration()` |
| Pre-builder | `validateBeforeBuilder()` |
| Content tasks | `validateContentTasks()` |
| Website spec | `validateWebsiteSpecification()` |
| Structured content | `validateStructuredContent()` |
| Export | `validateBeforeExport()` |

## Observability

`ProductionPipelineReports` on generation result:

- **trace** — `ProductionExecutionTrace` (stage messages + timestamps)
- **timing** — planning, quality, content, builder, total (ms)
- **validation** — per-stage pass/fail
- **quality** — AWQE scores and improvement report

## Provider Independence

Website Builder references only `ContentProvider`. Provider names are not exposed in production mode progress messages.

## Backward Compatibility

- Default behavior unchanged (flags off)
- No template, UI, or builder redesign
- Additive settings patches only

## Verify

```bash
npm run test:production-pipeline
npm run verify:production-pipeline
```
