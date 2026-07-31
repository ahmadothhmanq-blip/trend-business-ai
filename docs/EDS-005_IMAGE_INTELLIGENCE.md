# EDS-005 — Image Intelligence Engine

**Status:** Implemented  
**Version:** 1.0.0  
**Depends on:** EDS-001 (AKB), EDS-002 (PRE), EDS-003 (CIE), EDS-004 (DIE)

## Objective

Centralize all image planning, visual asset reasoning, and image-generation decisions into an **Image Intelligence Engine (IIE)** with an **Image Knowledge Base (IKB)**, structured validation traces, and locked **ImageSpecifications**. The IIE reasons about every required visual asset before any rendering or AI image generation. No downstream image generator, renderer, or AI provider may build or modify image prompts independently.

## Architecture

```
MasterWebsitePlan + WebsiteGenerationPlan + DIE DesignSystemSpec + BI + Design Plan
                    │
                    ▼
┌─────────────────────────────────────────┐
│   Image Intelligence Engine (IIE)         │
│  lib/ai-core/image-intelligence/        │
└─────────────────────────────────────────┘
        │
        ├── IKB Policy Resolution (per industry)
        ├── Purpose classification + placement reasoning
        ├── Scene, composition, lighting, camera reasoning
        ├── Color harmony with locked DesignSystemSpec
        ├── Accessibility alt text + SEO metadata
        ├── Validation (forbidden subjects, coverage, alt text)
        └── ImageSystemSpec lock (provider-agnostic ImageSpecifications)
        │
        ▼
ImageSystemSpec → runAiImageEngine → generateCoreAssets
```

## Module Structure

| File | Purpose |
|------|---------|
| `knowledge-base/catalog.ts` | IKB industry image policies (SSOT) |
| `iie-types.ts` | Trace, policy, spec, ImageSpecification contracts |
| `policies.ts` | `resolveImagePolicy()` — IKB + plan + DIE + BI merge |
| `validate-image.ts` | Policy validation with trace entries |
| `build-spec.ts` | `buildImageSystemSpec()` — structured image plan (no generation) |
| `iie-engine.ts` | `runImageIntelligenceEngine()` — authoritative entry |
| `engine.ts` | Public facade exports |

## Image Knowledge Base

Industry policies define:
- `requiredPurposes` — hero, product, gallery, section, etc.
- `minImageCount` / `maxImageCount`
- `forbiddenSubjects`, `photographyStyle`, `heroShotSeed`
- `lightingStrategy`, `cameraStrategy`, `compositionGuidelines`
- `accessibilityPolicies`, `seoKeywordMinLength`

Policies merge with:
- **Master plan** — locked `imageKeywords`
- **WebsiteGenerationPlan** — `imagePolicy` (routing, forbidden subjects, photography style)
- **DesignSystemSpec** — color harmony with locked palette
- **BI profile** — `photographyStyle`, `forbiddenSubjects`, `routingIndustryId`

## ImageSpecification Contract

Each specification is provider-agnostic and includes:
- `purpose`, `placement`, `subject`, `scene`, `composition`
- `lighting`, `cameraPerspective`, `style`, `colorHarmony`
- `accessibility` (alt text, decorative flag)
- `seo` (description, keywords)
- `providerPrompt` — **locked prompt** consumed by all generators

## Integration Points

| Consumer | Integration |
|----------|-------------|
| `image-engine/engine.ts` | Runs IIE first; maps specs to plan items for generation |
| `assets/prompt-engine.ts` | Delegates to `runImageIntelligenceEngine()` |
| `adapters/website-builder.ts` | Passes DIE spec + WebsiteGenerationPlan; persists trace |
| `design-plan/build.ts` | Supplies `imageRequirements` as IIE input |

## Trace Contract

Persisted on brief at `imageIntelligenceTrace`, `imageSystemSpec`, and `imageIntelligenceValidation`.

Each entry includes:
- `phase` — policy-resolve, scene-planning, validation, spec-lock, etc.
- `ruleId` — stable rule identifier
- `knowledgeEntryId` — IKB entry used
- `passed` / `severity`

## Public API

```typescript
import {
  runImageIntelligenceEngine,
  resolveImagePolicy,
  buildImageSystemSpec,
  imageSpecificationsToPlanItems,
  IMAGE_INTELLIGENCE_TRACE_KEY,
  IMAGE_INTELLIGENCE_SPEC_KEY,
} from "@/lib/ai-core/image-intelligence";
```

## Verification

```bash
npm run type-check
npx tsx --test lib/ai-core/image-intelligence/image-intelligence-engine.test.ts
npx tsx --test lib/ai-core/design-intelligence/design-intelligence-engine.test.ts
npx tsx --test lib/ai-core/content-intelligence/content-intelligence.test.ts
node scripts/verify-image-intelligence.mjs
node scripts/verify-design-intelligence.mjs
node scripts/verify-content-intelligence.mjs
node scripts/verify-website-master-planner.mjs
```

## Stage Gate Checklist (EDS-005)

- [x] Image Knowledge Base (IKB) as SSOT for industry image policies
- [x] Policy resolution from IKB + master plan + WebsiteGenerationPlan + DIE spec
- [x] Image purpose classification and placement intelligence
- [x] Composition, lighting, camera, style, and storytelling reasoning
- [x] Color harmony with locked DesignSystemSpec
- [x] Accessibility alt text and SEO metadata per specification
- [x] Provider-agnostic ImageSpecifications with locked `providerPrompt`
- [x] Structured decision traces with `knowledgeEntryId`
- [x] Automated validation (forbidden subjects, coverage, alt text)
- [x] Image engine and prompt-engine integration
- [x] Website builder adapter integration with trace persistence
- [x] Automated tests
- [x] Architecture documentation

## Next Stage

**EDS-006** — SEO & AEO Intelligence Engine — unify search optimization under IIE-locked specs with provider-independent SEOSpecification.
