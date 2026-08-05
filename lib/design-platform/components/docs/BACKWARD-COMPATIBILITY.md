# TBDP Phase 2 — Backward Compatibility

## Unchanged Systems

| System | Status |
|--------|--------|
| Phase 1 foundations | Unchanged API |
| Website templates | Not modified |
| Template V2 engine | Not modified |
| Website Builder | Not modified |
| `lib/ai-core/website-design-platform` | Not modified |
| Runtime / API routes | Not modified |

## Additions Only

- `lib/design-platform/components/` — 75 components + core
- `scripts/design-platform/verify-phase2.ts`
- `scripts/design-platform/scaffold-phase2-components.mjs`
- npm scripts: `test:design-platform:components`, `verify:design-platform:phase2`

## Opt-In Consumption

Components are exported from `@/lib/design-platform` but **nothing auto-imports them**. Products adopt Phase 2 explicitly in future phases.

## CSS Namespace

- Phase 1: `--tbdp-color-*`, `--tbdp-spacing-*`
- Phase 2: `.tbdp-btn`, `.tbdp-card`, `[data-tbdp-ui]`

No collision with template `cp-*`, `mp-*`, or Theme* classes.
