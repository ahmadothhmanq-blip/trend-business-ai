# Master Plan Engine — Architecture

## Overview

The Master Plan is the **Single Source of Truth** for every AI provider. No LLM makes planning decisions. LLMs execute copy only.

## Pipeline

```
User Prompt
    ↓
TBGE Analysis (Phase 1 — deterministic)
    ↓
Master Plan Builder
    ↓
Master Plan Validation
    ↓
Master Plan (locked)
    ↓
LLM Request Builder (copy tasks only)
    ↓
DeepSeek / OpenAI / Gemini / Claude / Grok
    ↓
Structured Content (copy only)
    ↓
[Future] Website Builder → TBDP → Website
```

## Ownership Rules

| Domain | Owner |
|--------|-------|
| Planning | Master Plan |
| Business Logic | Master Plan |
| Website Architecture | Master Plan |
| Page Architecture | Master Plan |
| Section Architecture | Master Plan |
| Feature Architecture | Master Plan |
| SEO Strategy | Master Plan |
| Content Strategy | Master Plan |
| Localization Strategy | Master Plan |
| Growth Strategy | Master Plan |
| Headlines, copy, descriptions | LLM |
| Meta descriptions, FAQs | LLM |
| Marketing text, CTA labels | LLM |

## Folder Structure

```
master-plan/
├── constants.ts
├── types.ts
├── build-master-plan.ts
├── validate.ts
├── llm-request-builder.ts
├── lifecycle.ts
├── pipeline/run-pipeline.ts
├── strategies/index.ts
└── docs/
```

## Provider Independence

Every Master Plan includes `providerIndependent: true` and `futureExpansion.supportedProviders`:

- DeepSeek (current)
- OpenAI
- Gemini
- Claude
- Grok

All providers consume the exact same Master Plan schema.
