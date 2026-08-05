# Trend Business AI Design Platform (TBDP)

Official design foundations and enterprise UI components for Trend Business AI.

## Phases

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 | Foundations (color, typography, spacing, grid, radius, shadow, border, icon, elevation) | Complete |
| Phase 2 | Enterprise UI Component System (75 components) | Complete |
| Phase 3 | Experience & Interaction System (motion, interaction, feedback, a11y, RTL, performance) | Complete |

## Quick Start

```ts
import {
  buildTbdpDesignTokens,
  buildTbdpExperience,
  emitTbdpExperienceCss,
  PrimaryButton,
  motionDataAttributes,
} from "@/lib/design-platform";

const tokens = buildTbdpDesignTokens({ mode: "light" });
const xp = buildTbdpExperience({ direction: "ltr" });
const css = emitTbdpExperienceCss();

<PrimaryButton size="md" label="Save" {...motionDataAttributes("hover-lift")} />
```

## Verification

```bash
npm run test:design-platform
npm run verify:design-platform
npm run verify:design-platform:phase2
npm run verify:design-platform:phase3
```

## Documentation

- [Phase 1 Architecture](./docs/ARCHITECTURE.md)
- [Phase 2 Component Architecture](./components/docs/ARCHITECTURE.md)
- [Token Structure](./docs/TOKEN-STRUCTURE.md)
- [Backward Compatibility](./docs/BACKWARD-COMPATIBILITY.md)
- [Phase 2 Compatibility](./components/docs/BACKWARD-COMPATIBILITY.md)
