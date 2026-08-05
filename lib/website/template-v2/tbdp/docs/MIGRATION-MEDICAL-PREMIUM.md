# Medical Premium — TBDP Native Migration Report

**Template:** `medical-premium`  
**Status:** Complete — awaiting approval  
**Scope:** Fourth native TBDP template consumer

---

## Objective

Migrate Medical Premium to consume TBDP as its official design source without redesign, visual change, UX change, patient journey change, or content change.

---

## What Changed

### Template package (`templates/website/medical-premium/`)

| File | Before | After |
|------|--------|-------|
| `tokens/tokens.json` | Local Serenity Clinical hex values | TBDP manifest (`tbdpNative: true`, sector `medical`, identity `serenity-clinical`) |
| `motion/motion.json` | Local `serenity-fade` preset | TBDP manifest with `presetBinding: serenity-fade` |
| `responsive/responsive.json` | Local breakpoints + structure | TBDP manifest; breakpoints resolved from TBDP; structure retained |

**Unchanged:** All component TSX, flows, pages, presentation, assets, `mp-*` utility definitions.

### Platform (`lib/website/template-v2/tbdp/`)

- `profiles/medical-premium/serenity-clinical.ts` — locked Serenity Clinical identity binding via TBDP
- `resolve-native.ts` — added `medical-premium:serenity-clinical` to binding registry

---

## TBDP Consumption Map

| Concern | TBDP Source | Runtime Surface |
|---------|-------------|-----------------|
| Colors | Sector DNA `medical` + Serenity Clinical binding | `--color-*` |
| Typography | Language bridge + Serenity Clinical binding | `--font-display`, `--font-body` |
| Spacing / Radius / Shadows / Borders | Serenity Clinical binding via TBDP profile | `--spacing-*`, `--radius-*`, `--shadow-*`, `--border-*` |
| Motion | healthcare/corporate/minimal → `serenity-fade` | `clinical-soft-fade`, `gentle-rise`, `scale-in` |
| Responsive breakpoints | TBDP foundations grid | V2 responsive CSS (`76rem` container) |
| RTL/LTR | Language context + theme resolver | `[dir="rtl"]` block |
| Accessibility | TBDP experience layer | `prefers-reduced-motion`, focus utilities |
| Experience profiles | healthcare, corporate, minimal | `--tbdp-experience-primary` |

---

## Before / After Comparison

### Token authority

**Before:** `tokens/tokens.json` owned all design values locally.

**After:** `tokens/tokens.json` declares TBDP consumption; values resolved from `lib/website/template-v2/tbdp/profiles/medical-premium/serenity-clinical.ts` through TBDP integration layer.

### Locked values (unchanged — zero visual regression)

| Token | Value |
|-------|-------|
| primary | `#0F4C4C` |
| healing | `#5B9A8B` |
| accent | `#C4706A` |
| background | `#F7FAF9` |
| foreground | `#0F2929` |
| display font | Source Serif 4 |
| body font | Inter |
| container max | `76rem` |

---

## QA Report

Run: `node scripts/qa-medical-premium-tbdp-native.mjs`

Unit tests: `lib/website/template-v2/tbdp/tbdp-native.test.ts` (medical-premium describe block)

---

## Performance Report

- **Load-time:** One `resolveDesignContext()` call per package load (~1ms)
- **CSS output:** +~4KB TBDP authority + experience layer in globals
- **Runtime:** No change — same `mp-*` utilities and component tree
- **Builder:** No additional LLM calls

---

## Backward Compatibility

| Area | Impact |
|------|--------|
| Restaurant Signature / SaaS Enterprise / Real Estate Prestige | None — binding registry is additive |
| Creative Portfolio | None — not modified |
| V1 templates | None |
| Existing medical-premium projects | Re-apply regenerates identical visual tokens |
| Export/import | File shapes unchanged |

---

## Stop Point

Medical Premium only. **Awaiting approval** before migrating additional templates.

**Not modified:** Restaurant Signature, SaaS Enterprise, Real Estate Prestige, Creative Portfolio.
