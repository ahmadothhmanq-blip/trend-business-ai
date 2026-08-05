# TBDP Phase 5 — Integration Architecture

## Overview

Phase 5 creates the official bridge between Website Builder, Template Engine, and TBDP — without modifying templates or builder routing logic.

```
Website Builder
      ↓
Template Engine (V1 / V2)
      ↓
TBDP Integration Layer  ← Phase 5
      ↓
Sector DNA + Foundations + Components + Experience
      ↓
Generated Website
```

## Modules

| Module | Responsibility |
|--------|----------------|
| `design-resolver.ts` | Unified Design Context |
| `template-resolver.ts` | Template selection → tokens, components, experience |
| `language-bridge.ts` | Website + generation + template language + RTL |
| `theme-resolver.ts` | Brand / industry / user / system themes |
| `industry-map.ts` | Industry & template → sector DNA |
| `bridges/builder-bridge.ts` | Additive builder enrichment |
| `bridges/ai-bridge.ts` | Deterministic AI component selection |
| `bridges/template-bridge.ts` | V1/V2 advisory TBDP layer |
| `lifecycle.ts` | Builder lifecycle hooks |

## Isolation

- Integration lives in `lib/design-platform/integration/`
- Does **not** modify `lib/website/builder` routing
- Does **not** migrate or redesign templates
- V1 and V2 templates continue working unchanged

## Version

- Phase: `integration-5`
- Version: `5.0.0`
