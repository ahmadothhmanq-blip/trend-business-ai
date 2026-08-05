# TBDP Phase 4 — Backward Compatibility

## Isolation Guarantee

Phase 4 adds new modules under `lib/design-platform/sector-dna/` only.

**No modifications to:**

- `lib/website/builder/`
- `lib/website/template-v2/`
- `templates/website/`
- Runtime or existing product code paths

## Phase 1–3 Compatibility

| Phase | Integration | Modification |
|-------|-------------|--------------|
| Phase 1 Foundations | `resolveSectorDna()` calls `buildTbdpDesignTokens()` | None |
| Phase 2 Components | Sector DNA references component IDs from catalog | None |
| Phase 3 Experience | Sector DNA references motion/interaction/feedback IDs | None |

## API Additions

New exports from `@/lib/design-platform`:

- `TBDP_SECTOR_DNA_PHASE`, `TBDP_SECTOR_DNA_VERSION`
- `getSectorDna`, `TBDP_SECTOR_DNA_CATALOG`
- `selectSectorDesign`, `resolveSectorDna`
- `validateSectorDna`, schema validators

## Breaking Changes

None. Phase 4 is purely additive.

## Template Migration

**Not started.** Awaiting explicit approval before any template wiring.
