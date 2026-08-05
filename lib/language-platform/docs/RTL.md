# GLS — RTL/LTR Engine

## Automatic Adaptations

When `direction === "rtl"`, `resolveDirectionAdaptations()` returns:

| Property | LTR | RTL |
|----------|-----|-----|
| spacingMirror | false | true |
| motionReverse | false | true |
| gridFlow | row | row-reverse |
| iconMirror | false | true |
| navigationAlign | start | end |
| carouselDirection | ltr | rtl |
| timelineDirection | ltr | rtl |
| drawerSide | left | right |

## CSS Emission

```ts
import { emitDirectionCssVariables } from "@/lib/language-platform";

const css = emitDirectionCssVariables("rtl");
// :root { --gls-direction: rtl; --gls-grid-flow: row-reverse; ... }
// [dir="rtl"] { text-align: start; }
```

## Integration with TBDP

TBDP experience layer (`lib/design-platform/experience/direction/`) provides additional RTL adaptations. GLS direction engine is the authoritative source; TBDP consumes via bridge.

## RTL Locales

Platform RTL locales: `ar`, `fa`, `ur` (from `lib/i18n/config.ts`).

Website output also supports Arabic, Persian, Urdu via `resolveLocaleFromLanguage()`.
