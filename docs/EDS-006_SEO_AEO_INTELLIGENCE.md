# EDS-006 — SEO & AEO Intelligence Engine

**Status:** Implemented  
**Version:** 1.0.0  
**Depends on:** EDS-001 (AKB), EDS-002 (PRE), EDS-003 (CIE), EDS-004 (DIE), EDS-005 (IIE)

## Objective

Centralize all search optimization, semantic understanding, discoverability, and AI-answer optimization decisions into a **SEO & AEO Intelligence Engine (SAIE)** with **SEO Knowledge Base (SKB)** and **AEO Knowledge Base**, structured validation traces, and locked **SEOSpecification**. The engine reasons about search visibility before any page is rendered or published. No downstream component may independently generate SEO metadata or structured data.

## Architecture

```
MasterWebsitePlan + WebsiteGenerationPlan + IIE ImageSystemSpec + Strategy + BI
                    │
                    ▼
┌─────────────────────────────────────────┐
│  SEO & AEO Intelligence Engine (SAIE)   │
│  lib/ai-core/seo-aeo-intelligence/     │
└─────────────────────────────────────────┘
        │
        ├── SKB + AEO KB Policy Resolution
        ├── Keyword intelligence + search intent reasoning
        ├── Semantic topic clustering + entity extraction
        ├── Metadata, Open Graph, Twitter, canonical, URL structure
        ├── Structured data (Schema.org) reasoning
        ├── Internal linking + heading hierarchy planning
        ├── Image SEO (from IIE) + accessibility SEO
        ├── AEO optimization (LLM citation readiness)
        ├── Voice search + featured snippet planning
        └── Validation + SEOSpecification lock
        │
        ▼
SEOSpecification.seoPackage → injectSeoArtifacts
```

## Module Structure

| File | Purpose |
|------|---------|
| `knowledge-base/catalog.ts` | SKB + AEO KB industry policies (SSOT) |
| `saie-types.ts` | Trace, policy, SEOSpecification contracts |
| `policies.ts` | `resolveSeoPolicy()` — SKB + AEO + plan + IIE merge |
| `validate-seo.ts` | Policy validation with trace entries |
| `build-spec.ts` | `buildSeoAeoSpecification()` — search plan (no rendering) |
| `saie-engine.ts` | `runSeoAeoIntelligenceEngine()` — authoritative entry |
| `seo/assemble-package.ts` | Low-level CoreSeoPackage assembly (SAIE internal) |

## Integration Points

| Consumer | Integration |
|----------|-------------|
| `seo/build.ts` | `buildSeoPackageFromStrategy()` delegates to SAIE |
| `adapters/website-builder.ts` | Runs SAIE with full plan context; persists trace |
| `layers/runner.ts` | Uses `buildSeoPackageFromStrategy()` (SAIE-backed) |
| `seo/inject.ts` | Consumes locked `seoPackage` from SEOSpecification |

## Trace Contract

Persisted on brief at `seoAeoIntelligenceTrace`, `seoAeoSpecification`, and `seoAeoIntelligenceValidation`.

## Public API

```typescript
import {
  runSeoAeoIntelligenceEngine,
  resolveSeoPolicy,
  buildSeoAeoSpecification,
  SEO_AEO_INTELLIGENCE_TRACE_KEY,
  SEO_AEO_INTELLIGENCE_SPEC_KEY,
} from "@/lib/ai-core/seo-aeo-intelligence";
```

`buildSeoPackageFromStrategy()` remains backward-compatible (returns `CoreSeoPackage` via SAIE).

## Verification

```bash
npm run type-check
npx tsx --test lib/ai-core/seo-aeo-intelligence/seo-aeo-intelligence-engine.test.ts
node scripts/verify-seo-aeo-intelligence.mjs
node scripts/verify-image-intelligence.mjs
node scripts/verify-design-intelligence.mjs
node scripts/verify-content-intelligence.mjs
```

## Stage Gate Checklist (EDS-006)

- [x] SEO Knowledge Base (SKB) as SSOT for industry SEO policies
- [x] AEO Knowledge Base for AI answer optimization
- [x] Policy resolution from SKB + master plan + WebsiteGenerationPlan + IIE
- [x] Keyword intelligence, search intent, topic clustering, entity extraction
- [x] Metadata, Open Graph, structured data, canonical, URL structure
- [x] Internal linking, heading hierarchy, content-keyword alignment
- [x] Image SEO from IIE specifications
- [x] AEO, voice search, featured snippet optimization
- [x] Provider-independent SEOSpecification with locked seoPackage
- [x] Structured decision traces with `knowledgeEntryId`
- [x] Website builder adapter integration with trace persistence
- [x] Backward-compatible `buildSeoPackageFromStrategy()`
- [x] Automated tests and architecture documentation

## Next Stage

**EDS-007** — Quality Assurance & Self-Healing Engine (see `docs/EDS-007_QUALITY_ASSURANCE.md`).
