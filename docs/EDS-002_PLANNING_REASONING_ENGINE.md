# EDS-002 — AI Planning & Reasoning Engine

**Status:** Implemented  
**Version:** 1.0.0  
**Depends on:** EDS-001 (Architecture Knowledge Base, unified routing, architecture validation)

## Objective

Centralize all website planning orchestration into a single **Planning & Reasoning Engine (PRE)** with structured, explainable decision traces. Downstream engines consume the locked `MasterWebsitePlan` and never re-detect industry or override locked facets.

## Architecture

```
User Prompt (CoreBrief)
        │
        ▼
┌───────────────────────────────────────┐
│  Planning & Reasoning Engine (PRE)    │
│  lib/ai-core/planning-reasoning-engine│
└───────────────────────────────────────┘
        │
        ├── Phase 1: Business Analysis (BI)
        ├── Phase 2: Agency Synthesis
        ├── Phase 3: Auto-design Heuristics
        ├── Phase 4: Template Routing (AKB)
        ├── Phase 5: Architecture Validation
        └── Phase 6: Master Plan Lock
        │
        ▼
MasterWebsitePlan + PlanningReasoningTrace
        │
        ▼
Downstream Layers (Idea → Strategy → Design → Assets → Generation)
```

## Module Structure

| File | Purpose |
|------|---------|
| `types.ts` | `DecisionTraceEntry`, `PlanningReasoningTrace`, phase IDs |
| `trace/collector.ts` | `PlanningTraceCollector` — append-only structured trace |
| `trace/explain.ts` | Human-readable chain from structured trace |
| `orchestrator.ts` | `runPlanningReasoningEngine()` — authoritative entry |
| `index.ts` | Public API |

## Public API

```typescript
import {
  runPlanningReasoningEngine,
  getPlanningReasoningTraceFromBrief,
  explainPlanningTrace,
  PLANNING_REASONING_TRACE_KEY,
} from "@/lib/ai-core/planning-reasoning-engine";
```

`runMasterWebsitePlanner()` remains available as a backward-compatible facade.

## Decision Trace Contract

Every planning decision records:

- `phase` — which PRE phase produced the decision
- `ruleId` — stable rule identifier (e.g. `industry-layout-family`)
- `category` — industry, layout, routing, business, agency, heuristic, planning
- `passed` / `severity` — outcome classification
- `message` — human-readable explanation
- `knowledgeEntryId` — AKB entry when applicable (from architecture validation)
- `confidence` — when available from BI or validation
- `inputs` / `outputs` — optional structured context

Trace is persisted on brief metadata at `planningReasoningTrace`.

## Backward Compatibility

- `MasterWebsitePlan` contract unchanged
- `sources.reasoningChain` now derived from structured PRE trace (prefixed with `[phase/ruleId]`)
- `runMasterWebsitePlanner()` delegates to PRE
- `LayerRunner` invokes `runPlanningReasoningEngine()` directly

## Verification

```bash
npm run type-check
npx tsx --test lib/ai-core/planning-reasoning-engine/planning-reasoning-engine.test.ts
npx tsx --test lib/ai-core/architecture-knowledge-base/architecture-knowledge-base.test.ts
npx tsx --test lib/ai-core/architecture-validation/architecture-validation.test.ts
npx tsx --test lib/ai-core/template-router/route.test.ts
node scripts/verify-website-master-planner.mjs
```

## Stage Gate Checklist (EDS-002)

- [x] Single planning entry point (`runPlanningReasoningEngine`)
- [x] Structured decision traces across all phases
- [x] AKB-backed routing and validation integrated
- [x] Master plan lock preserved
- [x] Backward-compatible master planner facade
- [x] Automated tests
- [x] Architecture documentation

## Next Stage

**EDS-003 — Content Intelligence** — unify content generation under PRE-locked plans with industry-aware copy and anti-cliché filtering.
