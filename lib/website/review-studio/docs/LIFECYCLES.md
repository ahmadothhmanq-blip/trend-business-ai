# Review Studio Lifecycles — Phase 1

## Review Lifecycle

1. **Input** — `ReviewStudioInput` with `files[]` and optional upstream context
2. **Session** — `getOrCreateSession()` creates Version 1
3. **Analyze** — `analyzeWebsite()` extracts 10 dimension scores
4. **Benchmark** — WQBS `runWebsiteQualityBenchmark()` for category scores
5. **Detect Issues** — merge analyzer + WQBS issues
6. **Generate Improvements** — 13 areas with impact estimates
7. **Build Review** — insights, expected results, improvement list
8. **Output** — `ReviewStudioResult` (read-only, no file mutation)

## Version Lifecycle

```
Version 1 (original)
    ↓ apply improvement
Version 2 (patched)
    ↓ apply improvement
Version 3 (patched)
    ↓ rollback
Version 1 (restored)
```

Each version stores:
- `versionNumber`, `id`, `createdAt`
- `files[]` (snapshot)
- `appliedImprovements[]`, `improvementTitles[]`
- `qualityScores` (WQBS re-benchmark)
- `parentVersionId`

Max 20 versions per session (in-memory Phase 1).

## Improvement Lifecycle

1. Issue detected → grouped by area (hero, nav, CTA, etc.)
2. Improvement generated with priority, impact, patch type
3. User selects improvement IDs
4. Execution engine applies:
   - **Deterministic** — inline file patches
   - **Targeted regen** — `executor` callback on target files only
5. Re-benchmark → new version → comparison report

## Comparison Lifecycle

```ts
compareVersions(beforeVersion, afterVersion)
```

Returns:
- Quality difference (overall)
- Score differences (all 8 WQBS categories)
- SEO, conversion, accessibility, performance, content differences
- Applied changes list
- Summary narrative

## Priority Categories

| Priority | Trigger |
|----------|---------|
| Critical | Dimension score < 45 |
| High | Score 45–54 |
| Medium | Score 55–64 |
| Low | Score 65–74 |
| Nice to Have | Score ≥ 75 with minor issues |
