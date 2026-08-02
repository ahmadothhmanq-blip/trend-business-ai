# TBGE Sprint 3 — Architecture Report

**Date:** August 2, 2026  
**Sprint:** TBGE Sprint 3 — Assembly Engine  
**Scope:** Deterministic assembly only — no Website Builder wiring  

---

## Executive Summary

Sprint 3 replaces the Sprint 1 assembly skeleton with a full deterministic Assembly Engine. It consumes only locked `GenerationSpec`, executes plugin-based generators in parallel topological levels, validates artifacts, and returns files with stats. No LLM calls occur in assembly.

| Criterion | Status |
|-----------|--------|
| Build | PASS |
| Type-check | PASS |
| Unit tests (42) | PASS |
| Sprint 1–3 verification | PASS |
| Zero behavior change (legacy) | CONFIRMED |

---

## Architecture Rules Compliance

| Rule | Implementation |
|------|----------------|
| Assembly is deterministic | All generators are pure functions of `GenerationSpec` |
| No LLM in assembly | `custom-llm` generator rejected at runtime |
| Consumes only GenerationSpec | `GeneratorContext.spec` is sole input |
| Product-agnostic | Built-in generators read generic spec fields |
| Website logic in adapter | Optional `getAssemblyGenerators` / `transformAssemblyArtifacts` hooks |
| Parallel by default | `mapParallel` with `DEFAULT_ASSEMBLY_CONCURRENCY` |
| Plugin-based generators | `GeneratorRegistry` + `GeneratorPlugin` interface |
| Zero regression | Legacy pipeline untouched; TBGE flags default OFF |

---

## Assembly Pipeline

```
GenerationSpec (locked)
  → validateDependencyGraph()     [topological levels]
  → for each level (parallel):
      → resolve generator plugin
      → validate node dependencies
      → plugin.generate({ spec, node, artifacts })
      → artifact store.set()
  → optional adapter.transformAssemblyArtifacts()
  → validateAssemblyOutput()
  → AssemblyResult { files, stats }
```

---

## Module Structure

```
lib/tbge/assembly/
├── types.ts                 # AssemblyEngine, AssemblyEngineDeps
├── engine.ts                # createAssemblyEngine()
├── runtime.ts               # runAssemblyRuntime()
├── registry.ts              # createGeneratorRegistry()
├── dependency-graph.ts      # validateDependencyGraph, buildExecutionLevels
├── parallel.ts              # mapParallel (bounded concurrency)
├── artifact-pipeline.ts     # ArtifactStore
├── validate.ts              # validateAssemblyOutput
└── generators/
    ├── types.ts             # GeneratorPlugin interface
    ├── shared.ts            # Deterministic helpers
    ├── index.ts             # Built-in registration
    ├── scaffold-static.ts
    ├── scaffold-css.ts
    ├── layout-root.ts
    ├── ux-shells.ts
    ├── ui-primitives.ts
    ├── lib-seo.ts
    ├── page-home.ts
    ├── page-secondary.ts
    ├── component-bind.ts
    └── package-sync.ts
```

---

## Built-in Generators (10)

| ID | Output |
|----|--------|
| `scaffold-static` | `package.json` |
| `scaffold-css` | `app/globals.css` |
| `layout-root` | `app/layout.tsx` |
| `ux-shells` | `components/layout/site-shell.tsx` |
| `ui-primitives` | `components/ui/button.tsx` |
| `lib-seo` | `lib/seo.ts` |
| `page-home` | `app/page.tsx` |
| `page-secondary` | Secondary pages |
| `component-bind` | `components/sections/bindings.ts` |
| `package-sync` | `package-lock.json` |

---

## Parallel Execution

- Topological levels ensure dependencies are satisfied before parallel runs
- Within each level, tasks run concurrently via worker pool
- Default concurrency: `max(4, availableParallelism())`

---

## Adapter Extension Points

```typescript
getAssemblyGenerators?(): GeneratorPlugin[];      // Override built-ins
transformAssemblyArtifacts?(files, spec): files; // Post-assembly transform
```

Website Builder adapter uses built-in generators only in Sprint 3 (no overrides).

---

## Benchmark Results (100 iterations, mock)

| Scenario | Median |
|----------|--------|
| Single-node spec | ~0.5ms |
| Full website graph (10 nodes) | ~15ms |

Run: `npm run benchmark:tbge:assembly`

---

## Ready for Sprint 4

- Inject live `PlannerLlmClient` + Website Builder routing (behind flags)
- Component Composer / richer generators
- Shadow mode dual-run comparison

---

## Files NOT Modified

- `lib/website/orchestrator.ts`
- `lib/ai-core/adapters/website-builder.ts`
- `plugins/website/*`
- Legacy prompts / database
