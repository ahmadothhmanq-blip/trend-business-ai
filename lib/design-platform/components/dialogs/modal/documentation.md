# Modal

TBDP Phase 2 enterprise component — **dialogs** category.

## Usage

```tsx
import { Modal } from "@/lib/design-platform/components/dialogs/modal";

<Modal size="md" dir="ltr">
  Content
</Modal>
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
