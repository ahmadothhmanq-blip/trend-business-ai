# Checkbox

TBDP Phase 2 enterprise component — **forms** category.

## Usage

```tsx
import { Checkbox } from "@/lib/design-platform/components/forms/checkbox";

<Checkbox size="md" dir="ltr">
  Content
</Checkbox>
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
