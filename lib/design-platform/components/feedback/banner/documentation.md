# Banner

TBDP Phase 2 enterprise component — **feedback** category.

## Usage

```tsx
import { Banner } from "@/lib/design-platform/components/feedback/banner";

<Banner size="md" dir="ltr">
  Content
</Banner>
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
