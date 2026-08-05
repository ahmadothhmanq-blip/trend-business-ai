# Creative Portfolio — TBDP Native Migration Report

**Template:** `creative-portfolio`  
**Status:** Complete — awaiting approval  
**Scope:** Fifth and final V2 template TBDP native consumer

---

## Objective

Migrate Creative Portfolio to consume TBDP as its official design source without redesign, visual change, UX change, portfolio flow change, or content change.

---

## What Changed

### Template package (`templates/website/creative-portfolio/`)

| File | Before | After |
|------|--------|-------|
| `tokens/tokens.json` | Local Kinetic Atelier hex values | TBDP manifest (`tbdpNative: true`, sector `creative-studio`, identity `kinetic-atelier`) |
| `motion/motion.json` | Local `kinetic-spring-stagger` preset | TBDP manifest with `presetBinding: kinetic-spring-stagger` |
| `responsive/responsive.json` | Local breakpoints + structure | TBDP manifest; breakpoints resolved from TBDP; structure retained |

**Unchanged:** All component TSX, flows, pages, presentation, assets, `cp-*` utility definitions.

### Platform (`lib/website/template-v2/tbdp/`)

- `profiles/creative-portfolio/kinetic-atelier.ts` — locked Kinetic Atelier identity binding via TBDP
- `resolve-native.ts` — added `creative-portfolio:kinetic-atelier` to binding registry

**Note:** TBDP sector DNA id is `creative-studio` (maps from business sector label `creative`).

---

## TBDP Consumption Map

| Concern | TBDP Source | Runtime Surface |
|---------|-------------|-----------------|
| Colors | Sector DNA `creative-studio` + Kinetic Atelier binding | `--color-*` |
| Typography | Language bridge + Kinetic Atelier binding | `--font-display`, `--font-body` |
| Spacing / Radius / Shadows / Borders | Kinetic Atelier binding via TBDP profile | `--spacing-*`, `--radius-*`, `--shadow-*`, `--border-*` |
| Motion | creative/editorial/playful → `kinetic-spring-stagger` | `kinetic-slam`, `asymmetric-rise`, `reveal-wipe` |
| Responsive breakpoints | TBDP foundations grid | V2 responsive CSS (`100%` container) |
| RTL/LTR | Language context + theme resolver | `[dir="rtl"]` block |
| Accessibility | TBDP experience layer | `prefers-reduced-motion`, focus utilities |
| Experience profiles | creative, editorial, playful | `--tbdp-experience-primary` |

---

## Locked values (unchanged)

| Token | Value |
|-------|-------|
| primary | `#09090B` |
| volt / accent | `#E8FF47` |
| magenta | `#FF2D6A` |
| foreground | `#F4F4EF` |
| display font | Syne |
| body font | Instrument Sans |

---

## QA

Run: `node scripts/qa-creative-portfolio-tbdp-native.mjs`  
Library: `node scripts/verify-v2-tbdp-native-library.mjs`

---

## Stop Point

Creative Portfolio only. **All five V2 templates are now TBDP native.** Awaiting approval.

**Not modified:** V1 templates, other locked template packages.
