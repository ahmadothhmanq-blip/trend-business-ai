# V2 TBDP Native Library Report

**Generated:** Run `node scripts/verify-v2-tbdp-native-library.mjs`  
**Status:** All five V2 templates TBDP native

---

## V2 Native Template Catalog

| # | Package | Identity | Sector DNA | Experience Profiles | Motion Preset |
|---|---------|----------|------------|---------------------|---------------|
| 1 | `restaurant-signature` | forest-table | restaurant | hospitality, luxury, editorial | forest-table-reveal |
| 2 | `saas-enterprise` | nexus-command | saas | technical, corporate, executive | nexus-grid-reveal |
| 3 | `real-estate-prestige` | monolith-estate | real-estate | luxury, executive, corporate | monolith-reveal |
| 4 | `medical-premium` | serenity-clinical | medical | healthcare, corporate, minimal | serenity-fade |
| 5 | `creative-portfolio` | kinetic-atelier | creative-studio | creative, editorial, playful | kinetic-spring-stagger |

---

## Architecture

```
templates/website/{package}/
  tokens/tokens.json      → tbdpNative manifest
  motion/motion.json      → tbdpNative manifest
  responsive/responsive.json → tbdpNative manifest (structure only)

lib/website/template-v2/tbdp/
  profiles/{package}/{identity}.ts  → locked visual bindings
  resolve-native.ts                 → binding registry
  consume-package.ts                → load-time resolution
  emit-tbdp-consumption-css.ts      → TBDP authority layer in globals.css
```

---

## What Templates Own vs TBDP

| Template owns | TBDP owns |
|---------------|-----------|
| Structure, flows, sections | Colors, typography, spacing |
| Content, assets | Grid, radius, shadows, borders |
| Component composition | Motion, interaction |
| Business/property/patient/portfolio flow | Responsive rules, RTL/LTR, accessibility |

---

## Verification Commands

```bash
# Full library verification + reports
node scripts/verify-v2-tbdp-native-library.mjs

# Unit tests
npm run test:template-v2

# Per-template QA
node scripts/qa-restaurant-signature-tbdp-native.mjs
node scripts/qa-saas-enterprise-tbdp-native.mjs
node scripts/qa-real-estate-prestige-tbdp-native.mjs
node scripts/qa-medical-premium-tbdp-native.mjs
node scripts/qa-creative-portfolio-tbdp-native.mjs
```

---

## Output Reports

Written to `scripts/benchmark-results/template-v2-comparison/`:

- `v2-native-library-report.json`
- `v2-native-consumption-report.json`
- `v2-native-regression-report.json`
- `v2-native-qa-summary.json`
- `v2-native-performance-summary.json`

---

## Backward Compatibility

- V1 templates unchanged
- TBDP native path only activates when `tbdpNative: true` in manifests
- Re-apply regenerates identical visual tokens from identity bindings
