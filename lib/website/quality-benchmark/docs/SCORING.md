# WQBS Scoring Model

## Category Scores (0–100)

Each category score is the **average** of its sub-dimension scores.

Sub-dimension scores are computed deterministically from artifact signals (HTML structure, CSS tokens, content volume, ARIA attributes, etc.).

## Overall Score

Weighted average across active categories for the benchmark mode:

| Category | Weight |
|----------|--------|
| Visual Design | 14% |
| User Experience | 14% |
| Business | 13% |
| SEO | 12% |
| Performance | 12% |
| Accessibility | 12% |
| Content | 12% |
| Localization | 11% |

Quick mode uses only the first 4 categories; weights are re-normalized over active categories.

## Gate Thresholds

| Score | Status |
|-------|--------|
| ≥ 70 | Pass |
| 60–69 | Review |
| < 60 | Fail |

## Recommendation Triggers

Sub-dimensions scoring below **75** generate improvement recommendations with:

- Priority (critical / high / medium / low) based on score gap
- Reason (from detected issues)
- Recommendation (actionable fix)
- Expected impact (low / medium / high)
- Estimated effort (low / medium / high)

## Reports

| Report | Audience | Contents |
|--------|----------|----------|
| Quality Report | All | Scores, categories, recommendations |
| Benchmark Report | QA | Quality report + meta + gate status |
| Executive Summary | Leadership | Headline, top strengths/weaknesses, priority actions |
| Technical Summary | QA/SEO | Sub-dimension breakdown, signals, issues |
| Developer Summary | Engineering | Fix queue, quick wins, structural changes |

## Comparison Scoring

Category gap = reference score − generated score

- Positive gap → generated is behind reference
- Negative gap → generated leads reference

Overall gap drives the quality gap narrative.
