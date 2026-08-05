# AI Website Review Studio — Architecture (Phase 1)

## Overview

Professional AI-powered website reviewer. Analyzes generated websites, explains quality, and applies **targeted** improvements only.

**Location:** `lib/website/review-studio/`

**Not:** a website generator · not a visual editor · not wired to builder runtime

## Workflow

```
Generated Website
    ↓
Website Analysis (10 dimensions)
    ↓
Quality Review (WQBS benchmark)
    ↓
Issue Detection
    ↓
Improvement Suggestions (13 areas)
    ↓
User selects improvement
    ↓
Execution Engine (targeted only)
    ↓
Version N+1
    ↓
Compare Before / After
```

## Modules

| # | Module | Path | Role |
|---|--------|------|------|
| 1 | Website Analyzer | `analyze/website-analyzer.ts` | Layout, sections, components, business, SEO, a11y, performance, content, conversion, brand |
| 2 | Review Engine | `review/review-engine.ts` | Overall review, strengths, weaknesses, business/technical/design insights |
| 3 | Improvement Engine | `improvements/improvement-engine.ts` | Hero, nav, CTA, trust, testimonials, pricing, forms, footer, SEO, content, a11y, performance, localization |
| 4 | Impact Estimator | `impact/impact-estimator.ts` | Quality, SEO, conversion, a11y, performance gains + risk + time |
| 5 | Version Manager | `versions/version-manager.ts` | v1, v2, v3… with rollback |
| 6 | Comparison Engine | `compare/comparison-engine.ts` | Before/after score differences |
| 7 | Recommendation Engine | `recommendations/recommendation-engine.ts` | Critical → Nice to Have |
| 8 | Execution Engine | `execution/execution-engine.ts` | Selected improvements only |

## Integrations

| System | Integration |
|--------|-------------|
| **WQBS** | Quality scores and category benchmarks |
| **TBGE** | Artifact files from generation |
| **Master Plan** | `upstreamContext.masterPlanId` |
| **AWQE** | `upstreamContext.awqeScore` |
| **TBDP** | `upstreamContext.tbdpTemplateId` |
| **GLS** | `upstreamContext.glsContextHash` |

## Execution Rules

- **Deterministic patches** — accessibility, SEO, performance, localization, nav, footer (no LLM)
- **Targeted regen** — hero, CTA, content, pricing, etc. (requires `executor` callback)
- **Never** regenerates the whole website unless `allowFullRegeneration: true`

## Entry Points

```ts
import { runWebsiteReview, applySelectedImprovements } from "@/lib/website/review-studio";

const review = await runWebsiteReview({ files: project.files });

const result = await applySelectedImprovements({
  request: { sessionId: review.meta.sessionId, improvementIds: [id] },
});
```

## Verify

```bash
npm run test:review-studio
npm run verify:review-studio
```
