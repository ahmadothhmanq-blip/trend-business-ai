# PricingTable

TBDP Phase 2 enterprise component — **marketing** category.

## Usage

```tsx
import { PricingTable } from "@/lib/design-platform/components/marketing/pricing-table";

<PricingTable size="md" dir="ltr">
  Content
</PricingTable>
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
