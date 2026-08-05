# ProductDetails

TBDP Phase 2 enterprise component — **commerce** category.

## Usage

```tsx
import { ProductDetails } from "@/lib/design-platform/components/commerce/product-details";

<ProductDetails size="md" dir="ltr">
  Content
</ProductDetails>
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
