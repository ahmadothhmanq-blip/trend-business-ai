# TeamCard

TBDP Phase 2 enterprise component — **cards** category.

## Usage

```tsx
import { TeamCard } from "@/lib/design-platform/components/cards/team-card";

<TeamCard size="md" dir="ltr">
  Content
</TeamCard>
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
