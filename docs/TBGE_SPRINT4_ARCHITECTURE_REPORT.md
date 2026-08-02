# TBGE Sprint 4 — Architecture Report

**Date:** August 2, 2026  
**Sprint:** TBGE Sprint 4 — Component Composer  
**Scope:** Deterministic page composition only — no Website Builder wiring  

---

## Executive Summary

Sprint 4 delivers the Component Composer: a deterministic, plugin-based engine that transforms a locked `GenerationSpec` into a complete `SiteComposition` (theme, industry pattern, pages, sections, responsive layouts, variants). No LLM calls. Not wired to Website Builder or the legacy pipeline.

| Criterion | Status |
|-----------|--------|
| Build | PASS |
| Type-check | PASS |
| Unit tests (55) | PASS |
| Sprint 4 verification (7) | PASS |
| Benchmarks | PASS |
| Zero regression | CONFIRMED |

---

## Architecture Rules Compliance

| Rule | Implementation |
|------|----------------|
| No LLM | Pure deterministic functions only |
| Consumes only GenerationSpec | All engines read `spec` (locked) |
| Plugin architecture | Section + industry pattern plugins via registry |
| Product-agnostic | Built-in plugins use generic spec fields |
| Deterministic output | Same spec → same composition (tested) |
| Feature flags OFF | `TBGE_COMPOSER` defaults off |

---

## Composition Pipeline

```
GenerationSpec (locked)
  → composeTheme()                    [design tokens → CSS variables]
  → resolvePattern()                  [industry pattern plugin]
  → composePage() per structure page
      → orderSections()               [pattern bias]
      → resolveComponentVariant()     [variant system]
      → composeResponsiveLayout()     [profile-based breakpoints]
      → section plugin.compose()      [section engine]
  → validateSiteComposition()
  → SiteComposition
```

---

## Module Structure

```
lib/tbge/composer/
├── types.ts              # SiteComposition, ComposedPage, ComposedSection, etc.
├── runtime.ts            # createComponentComposer()
├── registry.ts           # createComponentRegistry()
├── theme.ts              # Theme composition
├── layout.ts             # Responsive layout composition
├── variants.ts           # Component variant resolution
├── section-engine.ts     # Section composition engine
├── page-engine.ts        # Page composition engine
├── validate.ts           # Composer validation pipeline
├── index.ts              # Public API
└── plugins/
    ├── types.ts          # Plugin contracts
    ├── sections.ts       # Hero, Features, Contact, CTA, Default
    └── patterns.ts       # Gaming, Business, Default industry patterns
```

---

## Plugin Systems

### Section Plugins (5)

| Plugin | Matches | Output type |
|--------|---------|-------------|
| `section-hero` | hero, banner | `hero` |
| `section-features` | feature, game, catalog | `feature-grid` |
| `section-contact` | contact, inquiry | `contact` |
| `section-cta` | cta, signup | `cta` |
| `section-default` | fallback | `content-block` |

### Industry Pattern Plugins (3)

| Pattern | Match | Effect |
|---------|-------|--------|
| `gaming` | gaming industry | Spacious layout, hero-first ordering |
| `business` | business/corporate | Services/team ordering bias |
| `default` | fallback | Standard ordering |

### Variant System

- **Component type** — resolved from section name
- **Density** — `compact` / `comfortable` / `spacious` from profile + pattern
- **Emphasis** — `primary` / `secondary` / `neutral` from section index

### Responsive Layout

- Breakpoints: 640 / 768 / 1024 / 1280
- Container max-width varies by profile
- Grid columns and gap tuned per profile

---

## Feature Flag

| Flag | Default | Helper |
|------|---------|--------|
| `TBGE_COMPOSER` | OFF | `shouldRunTbgeComposer()` |

Requires `TBGE_ENABLED=1` and not `TBGE_LEGACY_FULL`.

---

## DI Registration

- Token: `tbge.componentComposer`
- Factory: `defaultComponentComposer`
- **Not wired** to orchestrator (Sprint 5+ integration)

---

## Benchmark Results (200 iterations)

| Stage | Median |
|-------|--------|
| `composeTheme` | ~0.01ms |
| `composePage` | ~0.05ms |
| Full runtime | ~0.08ms |

Run: `npm run benchmark:tbge:composer`

---

## Ready for Sprint 5

- Wire composer into assembly `component-bind` generator (behind `TBGE_COMPOSER`)
- Website Builder integration behind flags
- Shadow mode composition diff

---

## Files NOT Modified

- `lib/website/orchestrator.ts`
- `lib/ai-core/adapters/website-builder.ts`
- `plugins/website/*`
- Legacy prompts / database / production routes
