# Section

TBDP Phase 2 enterprise component — **layout** category.

## Usage

```tsx
import { Section } from "@/lib/design-platform/components/layout/section";

<Section size="md" dir="ltr">
  Content
</Section>
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
