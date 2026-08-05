# Restaurant Signature — TBDP Native Migration Report

**Template:** `restaurant-signature`  
**Status:** Complete — awaiting approval  
**Scope:** First native TBDP template consumer (no other templates modified)

---

## Objective

Migrate Restaurant Signature to consume TBDP as its official design source without redesign, visual change, UX change, or content change.

---

## What Changed

### Template package (`templates/website/restaurant-signature/`)

| File | Before | After |
|------|--------|-------|
| `tokens/tokens.json` | Local Forest Table hex values | TBDP manifest (`tbdpNative: true`, sector `restaurant`, identity `forest-table`) |
| `motion/motion.json` | Local `forest-table-reveal` preset | TBDP manifest with `presetBinding: forest-table-reveal` |
| `responsive/responsive.json` | Local breakpoints + structure | TBDP manifest; breakpoints resolved from TBDP; structure retained |

**Unchanged:** All component TSX, flows, pages, presentation, assets, `rs-*` utility definitions.

### Platform (`lib/website/template-v2/tbdp/`)

New TBDP native consumption layer:

- `profiles/restaurant-signature/forest-table.ts` — locked Forest Table identity binding via TBDP
- `resolve-native.ts` — resolves sector DNA + hospitality experience + language + theme
- `consume-package.ts` — load-time manifest → runtime contract resolution
- `emit-tbdp-consumption-css.ts` — TBDP authority CSS in `globals.css`

### Wiring

- `load-v2-package.ts` — detects `tbdpNative` manifests, resolves at load
- `apply-v2-template.ts` — passes language for TBDP language context
- `emit-design-tokens.ts` — appends TBDP authority layer when `bundle.tbdpNative` is set
- Validation schemas accept TBDP manifest union types

---

## TBDP Consumption Map

| Concern | TBDP Source | Runtime Surface |
|---------|-------------|-----------------|
| Colors | Sector DNA `restaurant` + Forest Table binding | `--color-*` |
| Typography | Language bridge + Forest Table binding | `--font-display`, `--font-body` |
| Spacing / Radius / Shadows / Borders | Forest Table binding via TBDP profile | `--spacing-*`, `--radius-*`, `--shadow-*`, `--border-*` |
| Motion | Hospitality + sector motion profile → `forest-table-reveal` | `rs-reveal-*` keyframes |
| Responsive breakpoints | TBDP foundations grid | V2 responsive CSS |
| RTL/LTR | Language context + theme resolver | `[dir="rtl"]` block |
| Accessibility | TBDP experience layer | `prefers-reduced-motion`, focus utilities |
| Experience profile | Hospitality, luxury, editorial | `--tbdp-experience-primary` |

---

## Before / After Comparison

### Token authority

**Before:** `tokens/tokens.json` owned all design values locally.

**After:** `tokens/tokens.json` declares TBDP consumption; values resolved from `lib/website/template-v2/tbdp/profiles/restaurant-signature/forest-table.ts` through TBDP integration layer.

### Locked values (unchanged — zero visual regression)

| Token | Value |
|-------|-------|
| primary | `#1A3D32` |
| copper | `#D4A574` |
| accent | `#B87333` |
| background | `#0A1210` |
| foreground | `#F4EDE4` |
| display font | Cormorant Garamond |
| body font | DM Sans |

### globals.css markers (new)

```css
/* TBDP Native Consumption — restaurant-signature */
:root { --tbdp-native: 1; --tbdp-sector-dna: "restaurant"; ... }
```

V2 `--color-*` and `rs-*` utilities remain identical.

---

## QA Report

Run: `node scripts/qa-restaurant-signature-tbdp-native.mjs`

Checks:

- TBDP native load + sector DNA
- Forest Table color parity (`#1A3D32`, `#D4A574`)
- V2 apply (sidebar-left, components, routes)
- TBDP authority CSS in globals
- Export shape preserved
- RTL language profile

Unit tests: `lib/website/template-v2/tbdp/tbdp-native.test.ts`

---

## Performance Report

- **Load-time:** One additional `resolveDesignContext()` call per package load (~1ms)
- **CSS output:** +~4KB TBDP authority + experience layer in globals (metadata + platform vars)
- **Runtime:** No change — same `rs-*` utilities and component tree
- **Builder:** No additional LLM calls

---

## Backward Compatibility

| Area | Impact |
|------|--------|
| Other V2 templates | None — TBDP native path only when `tbdpNative: true` |
| V1 templates | None |
| Existing restaurant-signature projects | Re-apply regenerates identical visual tokens |
| Builder settings | Existing TBDP wiring (Phase 6) unchanged; now reinforced at template layer |
| Export/import | File shapes unchanged |

---

## Deliverables Checklist

- [x] Migration report (this document)
- [x] Before / after comparison
- [x] TBDP consumption report (`scripts/benchmark-results/template-v2-comparison/restaurant-signature-tbdp-consumption.json`)
- [x] QA script + unit tests
- [x] Performance notes
- [x] Backward compatibility notes

---

## Stop Point

Restaurant Signature only. **Awaiting approval** before migrating additional templates.
