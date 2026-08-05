# FeatureGrid

TBDP Phase 2 enterprise component — **marketing** category.

## Usage

```tsx
import { FeatureGrid } from "@/lib/design-platform/components/marketing/feature-grid";

<FeatureGrid size="md" dir="ltr">
  Content
</FeatureGrid>
```

## Props

| Prop | Type | Default |
|------|------|---------|
| size | xs \| sm \| md \| lg \| xl | md |
| dir | ltr \| rtl | — |
| disabled | boolean | false |
| loading | boolean | false |

## Accessibility

- WCAG AA compliant
- RTL/LTR via `dir` prop
- See `accessibility.ts` for ARIA configuration

## Tokens

All styles reference Phase 1 TBDP CSS variables via `tokens.ts`.
