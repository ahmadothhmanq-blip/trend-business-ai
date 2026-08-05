# Faq

TBDP Phase 2 enterprise component — **marketing** category.

## Usage

```tsx
import { Faq } from "@/lib/design-platform/components/marketing/faq";

<Faq size="md" dir="ltr">
  Content
</Faq>
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
