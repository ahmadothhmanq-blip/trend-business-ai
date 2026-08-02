# Website Builder — Complete Pipeline Performance Report

**Date:** 2026-08-02  
**Method:** Instrumented pipeline profiling via existing `WebsitePipelineProfiler` (layer-runner progress events + per-LLM timing). Data from historical live benchmarks — no architecture or generation logic changed.  
**Prompt:** Fine dining restaurant in Dubai with reservations, menu highlights, chef story, and private dining events. Premium luxury aesthetic.

---

## Executive Summary

| Profile | Wall Time | Files | LLM Calls | Primary Bottleneck |
|---------|-----------|-------|-----------|-------------------|
| **professional** (default) | **18.4 min** (1,105,126 ms) | 48 | 26 | Per-file LLM generation (67.6%) |
| ultra | 2.8 min (170,223 ms) | 46 | 7 | Strategy + design layers (pre-file) |

The default `professional` profile spends **~84%** of time in page planning + per-file generation. Ultra shifts cost to upstream strategy/design because it defers most file LLM work.

---

## Professional Profile — Stage Timeline

**Total:** 1,105,126 ms (18.4 min) · 48 files · 26 LLM requests

| Stage | Start (ms) | End (ms) | Duration (ms) | % of Total |
|-------|-----------|---------|---------------|------------|
| 1. Request received | 0 | 0 | 0* | 0% |
| 2. PRE / template routing / master plan | 0 | 8,478 | 8,478 | 0.8% |
| 3. Business analysis | 8,478 | 31,527 | 23,049 | 2.1% |
| 4. Strategy generation | 31,527 | 80,339 | 48,812 | 4.4% |
| 5. Brand generation | 80,339 | 99,429 | 19,090 | 1.7% |
| 6. Design system generation | 99,429 | 114,761 | 15,332 | 1.4% |
| 7. Assets generation | 114,761 | 137,507 | 22,746 | 2.1% |
| 8. Page planning | 137,507 | 317,022 | 179,515 | 16.2% |
| 9. Page generation (per-file LLM) | 317,022 | 1,064,265 | 747,243 | **67.6%** |
| 10. Content generation (scaffold/repair) | 1,064,265 | 1,064,265 | 0† | 0% |
| 11. SEO generation | 1,064,265 | 1,064,286 | 21 | 0% |
| 12. ZIP generation | — | — | 0‡ | 0% |
| 13. Finalize | 1,064,286 | 1,105,125 | 40,839 | 3.7% |
| 14. Database save | — | — | 0* | 0% |
| 15. API response | — | — | 0* | 0% |

\* Not measured in generation-only benchmark (stream route adds auth, session, persist).  
† Scaffold/validation time is embedded in generation wall clock; LLM sub-stages account for ~100% of generation layer.  
‡ ZIP is on-demand via `/api/website-builder/[id]/export` — not part of Generate.

---

## Stage | Duration | % of Total | Recommendation

| Stage | Duration | % | Recommendation |
|-------|----------|---|----------------|
| Request received | ~0–500ms (est.) | <0.1% | Measure in stream route; cold start dominates only on first request |
| Business analysis | 23,049 ms | 2.1% | Cache `businessProfile` for continue/regenerate modes |
| Strategy generation | 48,812 ms | 4.4% | Use deterministic blueprint when PRE master plan already locked |
| Brand generation | 19,090 ms | 1.7% | Premium design heuristics run sequentially inside design layer |
| Design system generation | 15,332 ms | 1.4% | Single LLM call; 16K prompt chars — trim strategy context |
| Assets generation | 22,746 ms | 2.1% | Image slots requested sequentially; parallelize independent slots |
| Page planning | 179,515 ms | 16.2% | `dynamic-plan` (106s) + `generateJson` (91s) before file loop; skip when upstream artifacts exist |
| Page generation | 747,243 ms | **67.6%** | **CRITICAL** — 18 sequential file LLM calls (~45.6s avg); batch or parallelize |
| Content generation | embedded | — | Validation/repair re-invokes file-generation LLM on failures |
| SEO generation | 21 ms | 0% | No action needed |
| ZIP generation | 0 ms (Generate) | 0% | Separate export API; not a Generate bottleneck |
| Database save | not measured | — | Stream checkpoints every 4s add write amplification |
| API response | not measured | — | Ensure persist does not block SSE `complete` event |

---

## AI Calls by Stage (Professional)

| Stage | Calls | Duration | Prompt Chars | Tokens |
|-------|-------|----------|--------------|--------|
| file-generation | 18 | 820,602 ms | 482,504 | 252,478 |
| dynamic-plan | 1 | 106,088 ms | 9,709 | 15,613 |
| generateJson | 4 | 91,050 ms | 64,051 | 24,432 |
| strategy | 1 | 48,807 ms | 6,927 | 8,150 |
| business-idea | 1 | 23,048 ms | 4,285 | 4,134 |
| design-system | 1 | 15,332 ms | 16,285 | 5,989 |

**Total LLM time:** ~1,104,927 ms (≈100% of wall clock — non-LLM overhead is negligible).

---

## Ultra Profile Comparison (2.8 min)

| Stage | Duration | % of Total |
|-------|----------|------------|
| Strategy generation | 49,246 ms | 28.9% |
| Brand generation | 32,683 ms | 19.2% |
| Assets generation | 19,455 ms | 11.4% |
| Page planning | 18,993 ms | 11.2% |
| Business analysis | 17,203 ms | 10.1% |
| Design system | 16,690 ms | 9.8% |
| Page generation | 9,018 ms | 5.3% |
| PRE / template | 6,840 ms | 4.0% |

Ultra uses **1 file-generation LLM call** vs professional's **18** — explains 6.5× faster wall time.

---

## Anomalies Detected

### Duplicate executions
- `master-planner` progress logged **6×** per run (orchestration bookkeeping, not 6 LLM calls)
- `template` logged **3×**, `template-intelligence` **2×** (same — profiler sub-step emissions)

### Repeated AI calls
- Professional: **18 sequential** `file-generation` LLM calls with **482K cumulative prompt chars** (each call re-includes prior file context)
- **5 planning JSON calls** before file loop (`dynamic-plan` + `generateJson` ×4)

### Sequential tasks that could run in parallel
- Independent file LLM generations (no dependency between scaffold files)
- Image asset slots in assets layer
- Brand heuristics + design-system LLM (partially independent)

### Unnecessary waiting
- Stream route **throttles Supabase checkpoints to 4s** (`stream/route.ts` line 107) — adds latency between progress events and DB
- Per-file LLM waits for previous file to complete before starting next

### Unnecessary database writes
- Checkpoint queue writes partial files every 4s during generation
- `beginWebsiteGenerationSession` + `checkpointWebsiteGeneration` + final `persistWebsiteGeneration` = 3+ write phases

### Repeated prompt construction
- `websiteFilePrompt()` built per file with growing `existingFiles` context (instrumented as `prompt-generation` category when live profiler active)
- Planning prompts rebuilt on validation retry (up to 3 attempts per `generateJsonWithValidation`)

### Repeated filesystem / serialization
- `JSON.parse` + Zod validation on every LLM response in `generateJsonWithValidation`
- Blueprint/files serialized to brief metadata multiple times across layers
- Static preview file generation in `persistWebsiteGeneration` (post-generation)

---

## Bottleneck Ranking (Professional)

1. **Per-file LLM generation** — 67.6% of total (747s measured wall, 821s LLM cumulative)
2. **Page planning LLM** — 16.2% (dynamic-plan + blueprint JSON)
3. **Finalize** — 3.7% (design platform packaging)
4. **Strategy LLM** — 4.4%
5. **Everything else** — <3% each

---

## Data Sources

| File | Profile | Timestamp |
|------|---------|-----------|
| `scripts/benchmark-results/benchmark-professional-1785518656616.json` | professional | 2026-07-31 |
| `scripts/benchmark-results/benchmark-ultra-1785515682580.json` | ultra | 2026-07-31 |
| `scripts/benchmark-results/pipeline-performance-report-1785625776242.json` | professional (mapped stages) | 2026-08-02 |

**Instrumentation:** `WebsitePipelineProfiler` in `lib/ai-core/performance/website-profiler.ts`, wired via `getActiveWebsiteProfiler()` in layer-runner, `generate.ts`, `generator.ts`, `save-generation.ts`, `generation-session.ts`, and `deepseek.ts`. No production code was modified for this report.

**Note:** Request received, database save, and API response timings require stream-route profiling (not captured in generation-only benchmark). ZIP is not executed during Generate.
