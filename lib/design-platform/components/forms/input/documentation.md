# Input

TBDP Phase 2 enterprise component — **forms** category.

## Usage

```tsx
import { Input } from "@/lib/design-platform/components/forms/input";

<Input size="md" dir="ltr">
  Content
</Input>
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
