# Dashboard Performance Budgets (Advisory)

**Status:** Soft / warn-only (L05)  
**Related:** `PERFORMANCE_REPORT_PHASE19.md`, `lib/perf/timing.ts`  
**Not:** CI hard-fail gates or mass lazy-loading (out of scope).

---

## How to measure

```bash
npm run build
npm run perf:budget
```

`perf:budget` inspects `.next/static/chunks` after a production build and prints warnings if soft limits are exceeded. Exit code stays `0` unless you pass `--strict`.

Optional deep dive: install `@next/bundle-analyzer` later and wire `ANALYZE=true` — not required for L05.

---

## Soft budgets (warn)

| Signal | Soft limit | Rationale |
|--------|------------|-----------|
| Single JS chunk | **350 KB** (raw) | Catches accidental giant vendor/tool bundles |
| Total `.next/static/chunks` JS | **6 MB** (raw) | Whole-app static JS ceiling for smoke checks |
| Dashboard tool First Load JS | **~250 KB** (Next “First Load JS” in build log) | Manual review for heavy `/dashboard/*` routes |

These are **advisory**. Phase 19 already lazy-loads Website Builder + Content Studio tabs and defers JSZip until download.

---

## Already in place

- Next: `compress`, `optimizePackageImports`, `serverExternalPackages`
- Slim list selects (no full blueprint on Website Builder list — H03)
- Request timing helpers (`lib/perf/timing.ts`) on key list APIs
- Dynamic import for the heaviest Website Builder client surface

---

## When a budget warns

1. Confirm a recent `npm run build` completed successfully.  
2. Identify the offending chunk name from `perf:budget` output.  
3. Prefer targeted `dynamic()` / on-demand imports for that tool — do not rewrite the dashboard shell.  
4. Re-run `npm run build && npm run perf:budget`.

---

## Out of scope (later)

- CI failing builds on budget breach  
- Lazy-loading every product tool at once (coordinate with L04 if pursued)  
- New RUM / Lighthouse CI stacks
