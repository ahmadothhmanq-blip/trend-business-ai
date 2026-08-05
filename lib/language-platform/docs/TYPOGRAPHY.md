# GLS — Typography Profiles

## Script Families

| Family | Locales | Profile ID | Display Font |
|--------|---------|------------|--------------|
| Latin | en, es, fr, de, it, pt, nl, tr, pl, sv, ... | latin-ltr / latin-rtl | Inter |
| Arabic | ar, fa, ur | arabic-rtl / arabic-ltr | Noto Naskh Arabic |
| Hebrew | he (website only) | hebrew-rtl | Noto Sans Hebrew |
| CJK | zh-CN, zh-TW, ja, ko | cjk-ltr | Noto Sans SC |
| Cyrillic | ru, uk | cyrillic-ltr | Noto Sans |
| Indic | hi, bn | indic-ltr | Noto Sans Devanagari |
| Thai | th | thai-ltr | Noto Sans Thai |
| Greek | el | greek-ltr | Noto Sans |
| Vietnamese | vi | vietnamese-ltr | Noto Sans |

## Resolution

```ts
import { resolveTypographyProfile } from "@/lib/language-platform";

const profile = resolveTypographyProfile("arabic", "rtl");
// profile.id === "arabic-rtl"
// profile.tbdpProfileId === "arabic-rtl"
```

## Fallback Strategy

`resolveTypographyFallbackChain()` returns ordered font stack:
1. Script-specific primary font
2. Body font
3. CSS fallback stack
4. system-ui
5. sans-serif

## TBDP Bridge

Templates consuming TBDP use `ctx.typography.tbdpProfileId` for design token typography profile selection.
