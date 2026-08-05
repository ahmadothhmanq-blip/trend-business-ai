# TBDP Interaction Catalog — Phase 3

## Buttons
| ID | Trigger | Response |
|----|---------|----------|
| btn-press | pointerdown | scale(0.98) |
| btn-hover | pointerenter | hover-lift |
| btn-focus | focus-visible | focus-ring |
| btn-loading | aria-busy | loading |

## Forms
| ID | Trigger | Response |
|----|---------|----------|
| form-focus | focus | focus-ring |
| form-error | invalid | error-shake |
| form-success | valid | success-pulse |
| form-saving | submit | saving |

## Cards, Navigation, Dialogs, Tables, Dashboard, Marketing, Commerce
See `interaction/catalog.ts` for full 27 behavior definitions.

Behaviors adapt per viewport and input modality (touch vs keyboard).
