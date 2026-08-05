# WQBS Architecture — Phase 1

## Overview

The Website Quality Benchmark System (WQBS) is the official quality gate for generated websites. It evaluates artifacts only — it does not generate websites.

**Location:** `lib/website/quality-benchmark/`

## Design Principles

- **Provider independent** — no AI provider coupling
- **Framework independent** — operates on file content (HTML, TSX, CSS)
- **Deterministic** — no LLM required for Phase 1
- **Enterprise architecture** — typed pipeline with clear separation of concerns
- **No runtime changes** — opt-in evaluation, no builder/template modifications

## Module Structure

```
lib/website/quality-benchmark/
├── constants.ts              # Weights, thresholds, modes
├── types.ts                  # All WQBS types
├── analyze/
│   └── extract-artifact.ts   # Signal extraction from files
├── evaluate/
│   └── categories.ts         # 8 category evaluators
├── scoring/
│   └── model.ts              # Weighted scoring model
├── recommendations/
│   └── engine.ts             # Improvement recommendations
├── reports/
│   └── build-reports.ts      # Quality, benchmark, summaries
├── compare/
│   └── compare-engine.ts     # Generated vs reference comparison
├── pipeline/
│   └── run-benchmark.ts      # Orchestrator
├── index.ts
└── wqbs.test.ts
```

## Pipeline

```
WqbsBenchmarkInput (files[])
    ↓
extractArtifactSignals()
    ↓
evaluateAllCategories() — 8 categories × sub-dimensions
    ↓
finalizeScores() — weighted overall score
    ↓
generateRecommendations() — weak dimension improvements
    ↓
buildBenchmarkReport() + summaries
    ↓
WqbsBenchmarkResult
```

## Benchmark Categories

| # | Category | Sub-dimensions |
|---|----------|----------------|
| 1 | Visual Design | Layout, Spacing, Typography, Hierarchy, Consistency, White Space, Balance |
| 2 | User Experience | Navigation, IA, Accessibility UX, Mobile UX, Interaction |
| 3 | Business | Trust, Conversion, CTA, Lead Capture, Pricing, Social Proof |
| 4 | SEO | Metadata, Headings, Schema, Internal Links, Content Depth, Technical SEO |
| 5 | Performance | Images, Rendering, Critical Path, Lazy Loading, Bundle Size |
| 6 | Accessibility | WCAG, Keyboard, ARIA, Contrast, Focus |
| 7 | Content | Clarity, Structure, Readability, Brand Voice, Consistency |
| 8 | Localization | Language, RTL/LTR, Typography, Formatting, Locale |

## Benchmark Modes

| Mode | Categories | Recommendations |
|------|-----------|-----------------|
| Quick | 4 (design, UX, business, SEO) | Up to 8 |
| Standard | All 8 | Up to 16 |
| Enterprise | All 8 | Up to 32 |

## Quality Gate

- Default pass threshold: **70/100**
- Gate status: `pass` | `review` (within 10 points) | `fail`

## Comparison Engine

Compare generated website against reference:

```ts
compareWebsiteQuality({ generated, reference })
```

Future-ready platform comparison:

```ts
compareAgainstReferencePlatform({ platform: "framer", referenceFiles, generated })
```

Supported reference platforms (Phase 1 types only): Wix AI, Framer, Webflow, Squarespace, Hostinger, Durable, Lovable, Custom.

## Entry Point

```ts
import { runWebsiteQualityBenchmark } from "@/lib/website/quality-benchmark";

const result = await runWebsiteQualityBenchmark({
  files: project.files,
  mode: "standard",
});
```

## Verify

```bash
npm run test:wqbs
npm run verify:wqbs
```
