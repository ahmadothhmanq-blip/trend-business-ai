# Wave Scheduler (Phase 2.2) — Production Readiness Report

**Date:** 2026-08-02  
**Validator:** Performance Validation (Golden Prompt Suite)  
**Feature flag:** `WB_WAVE_SCHEDULER=1` (wave) vs `WB_WAVE_SCHEDULER=0` (legacy)

---

## Verdict: **FAIL — Do not enable on staging**

Quality degradation was detected in 3 of 12 golden-prompt file-stage comparisons. Per validation protocol, rollout is **blocked** until regressions are resolved or confirmed as test-artifact.

---

## Phase 1 — Golden Prompt Suite

12 industry archetypes defined in `scripts/golden-prompts/website-generation-suite.ts`:

| # | ID | Industry |
|---|-----|----------|
| 1 | restaurant | Restaurant |
| 2 | saas | SaaS |
| 3 | corporate | Corporate |
| 4 | agency | Agency |
| 5 | medical | Medical |
| 6 | law-firm | Law Firm |
| 7 | construction | Construction |
| 8 | ecommerce | Ecommerce |
| 9 | portfolio | Portfolio |
| 10 | education | Education |
| 11 | real-estate | Real Estate |
| 12 | hotel | Hotel |

**Runs executed:**
- **File-stage isolated** (12/12): `scripts/validate-wave-scheduler-file-stage.ts` — real LLM, frozen file plan, bypasses MAOE/PRE variance
- **Full E2E pilot** (1/12): SaaS only via `scripts/validate-wave-scheduler-production.ts --profile fast --ids saas`
- **Full E2E restaurant:** Blocked before file generation — `MAOE: PRE failed — Industry "restaurant" cannot use editorial layout structure "travel-premium"` (PRE blocker, not wave-scheduler)

---

## Phase 2 — Quality Comparison

### File-stage results (primary matrix)

| Prompt | Structure | Jaccard | Regressions | Result |
|--------|-----------|---------|-------------|--------|
| Restaurant | 100 | 1.0 | — | PASS |
| SaaS | 100 | 1.0 | — | PASS |
| Corporate | 100 | 1.0 | — | PASS |
| Agency | 100 | 1.0 | — | PASS |
| Medical | 100 | 1.0 | — | PASS |
| Law Firm | 100 | 1.0 | — | PASS |
| Construction | 100 | 1.0 | — | PASS |
| Ecommerce | 100 | 1.0 | — | PASS |
| Education | 100 | 1.0 | — | PASS |
| **Portfolio** | 100 | 1.0 | +1 import issue | **FAIL** |
| **Real Estate** | 100 | 1.0 | +1 import issue | **FAIL** |
| **Hotel** | 100 | 1.0 | +1 import issue | **FAIL** |

**Summary:** 9/12 passed (75%). Average structure score **100**. Average file-path Jaccard **1.0** (identical file trees). Failures are **marginal import-count deltas only** (+1 broken import in wave vs legacy).

### E2E SaaS (full pipeline)

| Metric | Legacy | Wave |
|--------|--------|------|
| Wall clock | 936,164 ms | 498,803 ms |
| File count | 67 | 61 |
| File-path Jaccard | — | 0.803 |
| Structure score | — | 83 |
| LLM requests | 11 | 9 |
| File-gen LLM calls | 6 | 4 |
| Retries | 0 | 0 |
| Validation | passed | passed |
| **Quality** | — | **PASS** |

Both modes produced buildable projects with `validationPassed: true`. File-tree divergence (Jaccard 0.803) reflects normal LLM non-determinism across independent runs, not a wave-only structural break.

---

## Phase 3 — Benchmark

### File-stage (12 prompts, real LLM)

| Metric | Value |
|--------|-------|
| Legacy total | 2,770,988 ms (~46 min) |
| Wave total | 1,495,492 ms (~25 min) |
| **Overall speedup** | **~46%** |
| Average per-prompt speedup | 43% (range 14–74%) |
| LLM calls per mode | 6 per prompt (unchanged) |
| Peak concurrency (file-stage) | Not instrumented live; mock benchmark confirms W2 peak = 4 |

### Mock W2 scheduler benchmark (`wave-scheduler-benchmark-1785630047103.json`)

| Mode | Duration | Peak concurrency |
|------|----------|------------------|
| Serial W2 | 806 ms | 1 |
| Parallel W2 (4 workers) | 202 ms | 4 |
| **Speedup** | **3.99× (75%)** | — |

### E2E SaaS

| Metric | Legacy | Wave | Δ |
|--------|--------|------|---|
| Total time | 936 s | 499 s | **-47%** |
| File-gen stage | 331 s | 235 s | **-29%** |
| Memory (RSS end) | 178.7 MB | 181.4 MB | +1.5% |
| Retries | 0 | 0 | — |
| Provider throttling | None observed | None observed | — |

---

## Phase 4 — Regression Detail (FAIL cases)

All three failures share the same signature:

```
regression: "Wave mode has more import issues (N vs N-1)"
```

| Prompt | Legacy imports | Wave imports | Delta | Wave-only issue |
|--------|----------------|--------------|-------|-----------------|
| Portfolio | 4 | 5 | +1 | `ContactSection.tsx` / `ServicesModern.tsx` react import |
| Real Estate | 4 | 5 | +1 | `ContactSection.tsx` react import (duplicate line) |
| Hotel | 3 | 4 | +1 | `ContactSection.tsx` react import |

**What did NOT regress:**
- File paths (Jaccard = 1.0 on all 12)
- Component hierarchy (4 sections + layout + page on all 12)
- `validateWebsiteGeneration` passed on both modes for all 12
- Missing files: none (same 8-file isolated plan)
- Layout / home page presence: 100% on both modes

**Likely root causes (ranked):**
1. **Snapshot context in parallel W2** — sections generated concurrently see a frozen dependency snapshot; wave outputs differ from serial full-context runs (expected Phase 2.2 tradeoff).
2. **LLM non-determinism** — legacy and wave are independent regenerations; marginal import-count swings are within normal variance for isolated scaffold (no `package.json` in tree).
3. **Heuristic sensitivity** — `brokenImportCount` treats `imports "react" but package.json is missing` as a broken import; this inflates counts in isolated tests and is not a production build failure.

---

## Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Parallel section context drift | Medium | Snapshot context may produce sections with weaker cross-references |
| PRE pipeline variance | Low | Blocks full E2E on some industries (restaurant); unrelated to scheduler |
| Import validation noise | Low | Isolated file-stage lacks full scaffold; over-counts react imports |
| Provider rate limits at W2 concurrency | Low | No 429s observed; `LlmConcurrencyGate` not stress-tested at scale |
| Memory under parallel load | Low | +3 MB heap on E2E SaaS wave run |

---

## Recommendation

**Do NOT enable `WB_WAVE_SCHEDULER=1` on staging or production.**

**Before re-validation:**
1. Re-run failed prompts (portfolio, real-estate, hotel) with **deterministic mock LLM** or **same seed** to separate scheduler causation from LLM variance.
2. Run full E2E on ≥3 industries that pass PRE (saas, corporate, ecommerce confirmed viable).
3. Tighten regression gate: compare wave vs legacy on **same frozen LLM responses** for sections, or require regression on structural/validation dimensions only (not import heuristics in partial scaffolds).
4. Fix restaurant PRE blocker separately for complete E2E coverage.

**Performance upside (when quality gate clears):** ~43–49% file-stage speedup, ~47% E2E SaaS wall-clock reduction, ~75% theoretical W2 section speedup (mock).

---

## Artifacts

- `scripts/benchmark-results/wave-scheduler-file-stage-validation-1785635375649.json`
- `scripts/benchmark-results/wave-scheduler-production-validation-1785632542966.json`
- `scripts/benchmark-results/wave-scheduler-benchmark-1785630047103.json`
- `scripts/benchmark-results/file-stage-run.log`
