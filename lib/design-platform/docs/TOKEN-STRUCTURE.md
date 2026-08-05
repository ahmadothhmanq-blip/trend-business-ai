# TBDP Token Structure

Central token tree type: `TbdpDesignTokens` (built by `buildTbdpDesignTokens()`).

## Meta

```ts
meta: {
  packageId: "trend-business-ai-design-platform"
  specVersion: "1.0.0"
  phase: "foundations-1"
  generatedAt: ISO-8601
}
```

## Color (`color`)

Semantic groups — **no raw hex in consumer components**:

| Group | Keys |
|-------|------|
| Brand | `primary`, `secondary`, `accent` |
| Status | `success`, `warning`, `danger`, `info` |
| Surface | `base`, `raised`, `overlay`, `sunken`, `inverse` |
| Background | `canvas`, `subtle`, `emphasis`, `inverse` |
| Text | `primary`, `secondary`, `tertiary`, `disabled`, `inverse`, `link`, `linkHover` |
| Border | `default`, `subtle`, `strong`, `focus`, `inverse` |
| Overlay | `scrim`, `scrimStrong`, `backdrop`, `highlight` |

Modes: `light` | `dark` (selected at build time via `buildTbdpDesignTokens({ mode })`).

## Opacity (`opacity`)

`transparent` · `subtle` · `muted` · `soft` · `medium` · `strong` · `opaque`

## Typography (`typography`)

| Profile ID | Direction | Locale |
|------------|-----------|--------|
| `latin-ltr` | LTR | Latin |
| `latin-rtl` | RTL | Latin |
| `arabic-rtl` | RTL | Arabic |
| `arabic-ltr` | LTR | Arabic |

Roles: `display` · `headline` · `title` · `body` · `label` · `caption`

Responsive sizes per role: `sm` · `md` · `lg`

## Spacing (`spacing`)

Scale: `micro` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` · `3xl` · `4xl`

Semantic:
- `component.*` — gap, padding
- `layout.*` — gutter, margin, stack
- `section.*` — sm, md, lg, xl

## Grid (`grid`)

- Breakpoints: `mobile` · `tablet` · `desktop`
- Containers: `sm` · `md` · `lg` · `xl` · `2xl` · `full`
- Columns per breakpoint
- Gutters per breakpoint
- Safe areas (env insets)
- Max widths: `content` · `prose` · `wide`

## Radius (`radius`)

`sharp` · `sm` · `md` · `lg` · `pill` · `circle`

## Shadow (`shadow`)

Levels `0`–`5` (elevation-mapped)

## Border (`border` + `divider`)

Widths: `none` · `hairline` · `thin` · `medium` · `thick`

Styles: `solid` · `dashed` · `dotted`

Dividers: `horizontal` · `vertical` · `inset`

## Icon (`icon`)

Sizes: `xs` · `sm` · `md` · `lg` · `xl`

Stroke: `thin` · `regular` · `bold`

Usage rules: contrast ratio, decorative opacity, interactive padding

## Elevation (`elevation`)

Layers: `base` · `raised` · `dropdown` · `sticky` · `popover` · `modal` · `toast` · `tooltip`

Each layer: `{ zIndex, shadow }`

## CSS Variable Naming

Pattern: `--tbdp-{domain}-{key}`

Examples:
- `--tbdp-color-primary`
- `--tbdp-spacing-md`
- `--tbdp-radius-lg`
- `--tbdp-shadow-3`
- `--tbdp-font-body`

## Usage

```ts
import { buildTbdpDesignTokens, emitTbdpCssVariables } from "@/lib/design-platform";

const tokens = buildTbdpDesignTokens({ mode: "light", typographyProfile: "latin-ltr" });
const css = emitTbdpCssVariables(tokens);
```
