# Image

TBDP Phase 2 enterprise component — **media** category.

## Usage

```tsx
import { Image } from "@/lib/design-platform/components/media/image";

<Image size="md" dir="ltr">
  Content
</Image>
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
