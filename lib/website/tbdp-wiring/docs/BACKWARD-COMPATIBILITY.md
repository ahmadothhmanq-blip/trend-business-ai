# TBDP Phase 6 — Backward Compatibility

## Guarantee

Phase 6 wiring is **opt-in by signal**. When no industry, sector, or template is present, `isTbdpEnrichmentEnabled()` returns false and the builder behaves identically to pre-Phase 6.

| System | Modified? | Behavior Change |
|--------|-----------|-----------------|
| V1 templates | No file changes | Unchanged |
| V2 templates | No file changes | Unchanged |
| Builder UX | No | Unchanged |
| Runtime routing | No | Unchanged |
| Bare prompt generation | No TBDP | Identical |

## Additive Changes Only

- `project.settings` gains optional TBDP keys
- `brief.metadata` gains optional TBDP keys
- Preview may include advisory TBDP CSS layer (non-destructive `<style>` injection)
- Design system `componentPalette` updated when TBDP visual authority is active

## No Template Migration

Templates are not modified to read TBDP directly. Wiring operates at builder lifecycle boundaries.
