# Sidebar

TBDP Phase 2 enterprise component — **navigation** category.

## Usage

```tsx
import { Sidebar } from "@/lib/design-platform/components/navigation/sidebar";

<Sidebar size="md" dir="ltr">
  Content
</Sidebar>
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
