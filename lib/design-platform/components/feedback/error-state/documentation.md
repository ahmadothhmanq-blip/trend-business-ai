# ErrorState

TBDP Phase 2 enterprise component — **feedback** category.

## Usage

```tsx
import { ErrorState } from "@/lib/design-platform/components/feedback/error-state";

<ErrorState size="md" dir="ltr">
  Content
</ErrorState>
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
