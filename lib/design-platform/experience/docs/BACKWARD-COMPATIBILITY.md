# TBDP Phase 3 — Backward Compatibility

## Unchanged

| System | Status |
|--------|--------|
| Phase 1 Foundations | API unchanged |
| Phase 2 Components | API unchanged |
| Website templates | Not modified |
| Template V2 engine | Not modified |
| Website Builder | Not modified |
| Runtime products | Not modified |

## Additions Only

- `lib/design-platform/experience/` — 7 subsystems
- `scripts/design-platform/verify-phase3.ts`
- npm scripts for Phase 3 QA

## Opt-In

Experience layer is exported from `@/lib/design-platform` but nothing auto-wires it. Products adopt explicitly in Phase 4+.

## Namespace

- `data-tbdp-xp-*` — experience attributes
- `tbdp-xp-*` — motion keyframes
- No collision with `data-tbdp-ui` (components) or template systems
