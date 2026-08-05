# CheckoutSummary

TBDP Phase 2 enterprise component — **commerce** category.

## Usage

```tsx
import { CheckoutSummary } from "@/lib/design-platform/components/commerce/checkout-summary";

<CheckoutSummary size="md" dir="ltr">
  Content
</CheckoutSummary>
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
