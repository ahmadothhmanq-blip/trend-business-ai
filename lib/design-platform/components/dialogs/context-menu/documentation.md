# ContextMenu

TBDP Phase 2 enterprise component — **dialogs** category.

## Usage

```tsx
import { ContextMenu } from "@/lib/design-platform/components/dialogs/context-menu";

<ContextMenu size="md" dir="ltr">
  Content
</ContextMenu>
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
