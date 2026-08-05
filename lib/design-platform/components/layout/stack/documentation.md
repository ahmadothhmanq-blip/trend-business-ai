# Stack

TBDP Phase 2 enterprise component — **layout** category.

## Usage

```tsx
import { Stack } from "@/lib/design-platform/components/layout/stack";

<Stack size="md" dir="ltr">
  Content
</Stack>
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
