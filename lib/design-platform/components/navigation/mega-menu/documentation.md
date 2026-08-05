# MegaMenu

TBDP Phase 2 enterprise component — **navigation** category.

## Usage

```tsx
import { MegaMenu } from "@/lib/design-platform/components/navigation/mega-menu";

<MegaMenu size="md" dir="ltr">
  Content
</MegaMenu>
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
