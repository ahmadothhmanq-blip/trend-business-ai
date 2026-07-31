# EDS-004 — Design Intelligence Engine

**Status:** Implemented  
**Version:** 1.0.0  
**Depends on:** EDS-001 (AKB), EDS-002 (PRE), EDS-003 (CIE)

## Objective

Centralize all visual design decisions into a **Design Intelligence Engine (DIE)** with a **Design Knowledge Base (DKB)**, structured validation traces, auto-remediation, and a locked **DesignSystemSpec**. The DIE reasons about and defines the complete visual system before any rendering or image generation. No downstream renderer, image generator, or page builder may make independent design decisions outside the DIE.

## Architecture

```
MasterWebsitePlan + WebsiteGenerationPlan + BI + Brand DNA
                    │
                    ▼
┌─────────────────────────────────────────┐
│   Design Intelligence Engine (DIE)      │
│  lib/ai-core/design-intelligence/       │
└─────────────────────────────────────────┘
        │
        ├── DKB Policy Resolution (per industry)
        ├── Brand DNA modeling
        ├── Layout reasoning (analyze)
        ├── Validation (premium style, layout, AKB alignment)
        ├── Auto-Remediation (policy corrections)
        ├── DesignSystemSpec lock (colors, type, spacing, hierarchy)
        └── Explainable decision traces
        │
        ▼
DesignSystemSpec + DesignIntelligenceTrace → VisualDesignPlan
```

## Module Structure

| File | Purpose |
|------|---------|
| `knowledge-base/catalog.ts` | DKB industry design policies (SSOT) |
| `die-types.ts` | Trace, policy, spec, validation contracts |
| `policies.ts` | `resolveDesignPolicy()` — DKB + plan + BI merge |
| `validate-design.ts` | Policy validation with trace entries |
| `build-spec.ts` | `buildDesignSystemSpec()` — visual system definition (no assets) |
| `die-engine.ts` | `runDesignIntelligenceEngine()` — authoritative entry |
| `engine.ts` | Backward-compatible `runDesignIntelligence()` facade |
| `analyze.ts` | Layout and style reasoning |
| `layout-selection.ts` | Layout variation selection |

## Design Knowledge Base

Industry policies define:
- `allowedPremiumStyleIds` / `defaultPremiumStyleId`
- `forbiddenLayoutVariationIds` / `defaultLayoutVariationId`
- `layoutFamily`, spacing density, color/typography strategies
- `minContrastRatio`, accessibility policies, responsive strategy

Policies merge with:
- **Master plan** — locked colors, typography, layout
- **WebsiteGenerationPlan** — layout family, theme preset, sections
- **BI profile** — `routingIndustryId`

## Integration Points

| Consumer | Integration |
|----------|-------------|
| `design-plan/engine.ts` | Runs DIE before `buildVisualDesignPlan()` |
| `design-plan/build.ts` | Consumes `designSpec` for locked colors/type/spacing |
| `adapters/website-builder.ts` | Passes master plan + WebsiteGenerationPlan; persists trace |
| `architecture-knowledge-base` | Editorial layout routing alignment |

## Trace Contract

Persisted on brief at `designIntelligenceTrace`, `designSystemSpec`, and `designIntelligenceValidation`.

Each entry includes:
- `phase` — policy-resolve, brand-dna, layout-reasoning, validation, spec-lock, etc.
- `ruleId` — stable rule identifier
- `knowledgeEntryId` — DKB entry used
- `passed` / `severity`

## Public API

```typescript
import {
  runDesignIntelligenceEngine,
  resolveDesignPolicy,
  buildDesignSystemSpec,
  DESIGN_INTELLIGENCE_TRACE_KEY,
  DESIGN_INTELLIGENCE_SPEC_KEY,
} from "@/lib/ai-core/design-intelligence";
```

`runDesignIntelligence()` remains backward-compatible (returns intelligence brief only).

## Verification

```bash
npm run type-check
npx tsx --test lib/ai-core/design-intelligence/design-intelligence-engine.test.ts
npx tsx --test lib/ai-core/content-intelligence/content-intelligence.test.ts
npx tsx --test lib/ai-core/planning-reasoning-engine/planning-reasoning-engine.test.ts
node scripts/verify-design-intelligence.mjs
node scripts/verify-content-intelligence.mjs
node scripts/verify-website-master-planner.mjs
```

## Stage Gate Checklist (EDS-004)

- [x] Design Knowledge Base (DKB) as SSOT for industry design policies
- [x] Policy resolution from DKB + master plan + WebsiteGenerationPlan (no hardcoded industry logic)
- [x] Brand DNA modeling integration
- [x] DesignSystemSpec — complete visual system definition (no asset generation)
- [x] Color, typography, spacing, layout, hierarchy, responsive, accessibility intelligence
- [x] Structured decision traces with `knowledgeEntryId`
- [x] Auto-remediation (premium style, forbidden layouts)
- [x] AKB editorial routing alignment
- [x] Design planning phase integration
- [x] Website builder adapter integration with trace persistence
- [x] Backward-compatible `runDesignIntelligence()`
- [x] Automated tests
- [x] Architecture documentation

## Next Stage

**EDS-005** — Image Intelligence Engine — unify image planning under DIE-locked specs with provider-agnostic ImageSpecifications.
