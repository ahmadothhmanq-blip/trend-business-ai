# SecondaryButton

TBDP Phase 2 enterprise component — **buttons** category.

## Usage

```tsx
import { SecondaryButton } from "@/lib/design-platform/components/buttons/secondary";

<SecondaryButton size="md" dir="ltr">
  Content
</SecondaryButton>
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
