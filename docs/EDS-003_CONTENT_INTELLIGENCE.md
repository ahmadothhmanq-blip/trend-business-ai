# EDS-003 — Content Intelligence

**Status:** Implemented  
**Version:** 1.0.0  
**Depends on:** EDS-001 (AKB), EDS-002 (PRE / locked master plan)

## Objective

Centralize all website content decisions into a **Content Intelligence Engine (CIE)** with a **Content Knowledge Base (CKB)**, structured validation traces, auto-remediation, and a single resolution pipeline. No hardcoded industry copy rules in application logic.

## Architecture

```
MasterWebsitePlan + BI Profile + Agency Contract
                    │
                    ▼
┌─────────────────────────────────────────┐
│     Content Intelligence Engine (CIE)   │
│  lib/ai-core/content-intelligence/      │
└─────────────────────────────────────────┘
        │
        ├── CKB Policy Resolution (per industry)
        ├── Agency Content (LLM) — primary
        ├── Auto-Remediation (clichés, CTA)
        ├── Validation (forbidden subjects, sections, SEO)
        └── Production Pack Bridge
        │
        ▼
ProductionContentPack + ContentIntelligenceTrace
```

## Module Structure

| File | Purpose |
|------|---------|
| `knowledge-base/catalog.ts` | CKB industry content policies (SSOT) |
| `policies.ts` | `resolveContentPolicy()` — CKB + plan + BI merge |
| `cliches.ts` | Shared anti-cliché rules |
| `validate-content.ts` | Policy validation with trace entries |
| `remediate.ts` | Auto-remediation before generation |
| `resolve.ts` | `resolveProductionContentWithIntelligence()` |
| `engine.ts` | `runContentIntelligenceEngine()` |
| `types.ts` | Trace, policy, resolution contracts |

## Content Knowledge Base

Industry policies define:
- `forbiddenSubjects` — must not appear in copy (e.g. furniture → fashion)
- `minServices`, `minTestimonials`, `minFaq`
- `minSeoDescriptionLength`
- `toneKeywords`

Policies merge with:
- **Master plan** — required sections, hero keywords, primary CTA
- **BI profile** — `forbiddenSubjects`, `routingIndustryId`

## Integration Points

| Consumer | Integration |
|----------|-------------|
| `agency-orchestrator` | Validates + remediates content after LLM generation |
| `plugins/website/generate.ts` | `resolveProductionContentWithIntelligence()` with master plan |
| `adapters/website-builder.ts` | Passes `masterWebsitePlan` to generation |
| `llm-generate.ts` | Uses shared `cliches.ts` SSOT |

## Trace Contract

Persisted on brief at `contentIntelligenceTrace` and project settings.

Each entry includes:
- `phase` — resolve, policy-check, remediation, anti-cliche, section-alignment, production-pack
- `ruleId` — stable rule identifier
- `knowledgeEntryId` — CKB entry used
- `passed` / `severity`

## Public API

```typescript
import {
  resolveProductionContentWithIntelligence,
  runContentIntelligenceEngine,
  resolveContentPolicy,
  CONTENT_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/content-intelligence";
```

`resolveProductionContent()` remains backward-compatible (returns pack only).

## Verification

```bash
npm run type-check
npx tsx --test lib/ai-core/content-intelligence/content-intelligence.test.ts
npx tsx --test lib/ai-core/planning-reasoning-engine/planning-reasoning-engine.test.ts
node scripts/verify-content-intelligence.mjs
node scripts/verify-website-master-planner.mjs
```

## Stage Gate Checklist (EDS-003)

- [x] Content Knowledge Base (CKB) as SSOT for industry content policies
- [x] Policy resolution from CKB + master plan + BI (no hardcoded industry logic)
- [x] Structured decision traces with `knowledgeEntryId`
- [x] Auto-remediation (clichés, CTA alignment)
- [x] Forbidden subject validation
- [x] Agency orchestrator integration
- [x] Generation pipeline integration with master plan
- [x] Backward-compatible `resolveProductionContent()`
- [x] Automated tests
- [x] Architecture documentation

## Next Stage

**EDS-005** — downstream renderer enforcement and asset pipeline integration (pending EDS-004 sign-off).
