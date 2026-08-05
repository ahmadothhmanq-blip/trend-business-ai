# Grid

TBDP Phase 2 enterprise component — **layout** category.

## Usage

```tsx
import { Grid } from "@/lib/design-platform/components/layout/grid";

<Grid size="md" dir="ltr">
  Content
</Grid>
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
