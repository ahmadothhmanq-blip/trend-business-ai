# TBGE2 — Architecture

## Overview

TBGE2 Phase 1 is the **Intelligent Planning Engine** for Trend Business AI. It analyzes user intent and builds a complete website plan **before** any LLM call. It does not render, design, or generate files.

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    lib/ai-core/generation-engine/                │
├─────────────────────────────────────────────────────────────────┤
│  User Prompt                                                     │
│       ↓                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │   Intent     │  │   Business   │  │  Requirements    │       │
│  │  Analyzer    │  │  Analyzer    │  │   Analyzer       │       │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘       │
│         └─────────────────┼───────────────────┘                   │
│                           ↓                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │   Website    │  │     Page     │  │    Section       │       │
│  │   Planner    │  │   Planner    │  │    Planner       │       │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘       │
│         └─────────────────┼───────────────────┘                   │
│                           ↓                                      │
│                    ┌──────────────┐                              │
│                    │   Content    │                              │
│                    │   Planner    │                              │
│                    └──────┬───────┘                              │
│                           ↓                                      │
│              ┌────────────────────────┐                          │
│              │  LLM Request Builder   │  ← structured only        │
│              └────────────┬───────────┘                          │
│                           ↓                                      │
│              ┌────────────────────────┐                          │
│              │  Structured Output     │  ← JSON only             │
│              └────────────┬───────────┘                          │
│                           ↓                                      │
│              ┌────────────────────────┐                          │
│              │     Validation         │                          │
│              └────────────────────────┘                          │
├─────────────────────────────────────────────────────────────────┤
│  Bridges (additive, no upstream changes)                         │
│  ├── website-bridge → lib/website                                │
│  ├── tbge-bridge → lib/tbge (PlanDraft)                          │
│  └── gls-bridge → lib/language-platform                          │
└─────────────────────────────────────────────────────────────────┘
```

## Design Principles

1. **Think first** — 7 deterministic analyzers/planners run before any LLM call
2. **Structured LLM only** — raw user prompts never reach the provider
3. **JSON only** — LLM output must never contain HTML, React, or CSS
4. **Provider independent** — `Tbge2LlmClient` interface; DeepSeek is current default
5. **Isolated** — no changes to builder, templates, or existing TBGE v1 kernel
6. **Typed** — full TypeScript coverage with validation at every stage

## Folder Structure

```
lib/ai-core/generation-engine/
├── constants.ts
├── index.ts
├── lifecycle.ts
├── core/types.ts
├── analyzers/          # Intent, Business, Requirements
├── planners/           # Website, Page, Section, Content
├── llm/                # Request builder, structured output, provider types
├── pipeline/           # runTbge2PlanningPipeline
├── registry/           # Intent, requirement, page, section catalogs
├── validation/         # Input and plan validation
├── bridges/            # TBGE v1, GLS, website bridges
└── docs/
```
