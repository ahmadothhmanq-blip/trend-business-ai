# GhostButton

TBDP Phase 2 enterprise component — **buttons** category.

## Usage

```tsx
import { GhostButton } from "@/lib/design-platform/components/buttons/ghost";

<GhostButton size="md" dir="ltr">
  Content
</GhostButton>
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
