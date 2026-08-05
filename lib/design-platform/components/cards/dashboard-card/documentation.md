# DashboardCard

TBDP Phase 2 enterprise component — **cards** category.

## Usage

```tsx
import { DashboardCard } from "@/lib/design-platform/components/cards/dashboard-card";

<DashboardCard size="md" dir="ltr">
  Content
</DashboardCard>
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
