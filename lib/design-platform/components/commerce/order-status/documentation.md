# OrderStatus

TBDP Phase 2 enterprise component — **commerce** category.

## Usage

```tsx
import { OrderStatus } from "@/lib/design-platform/components/commerce/order-status";

<OrderStatus size="md" dir="ltr">
  Content
</OrderStatus>
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
