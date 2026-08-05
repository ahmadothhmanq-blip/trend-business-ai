# GLS — Language Lifecycle

```
Platform Language (dashboard UI locale)
        ↓
Generation Language (AI prompt + output)
        ↓
Template Language (language-neutral scaffolds)
        ↓
Content Language (LLM-authored copy)
        ↓
Preview (inherits website + direction + typography)
        ↓
Export (inherits locale + SEO + direction metadata)
```

## Layer Responsibilities

### Platform
- Source: `lib/i18n/config.ts` (30 locales)
- Bridge: `bridgePlatformLocale()`
- Used by: Dashboard, settings, navigation, builder chrome

### Generation
- Source: `resolveAiLanguage()`
- Controls: prompt language, output language, structured output contract
- Used by: Website builder, app builder, video studio, marketing AI

### Website
- Source: `resolveGlsLanguageContext().website`
- Includes: locale code, html lang, direction, RTL flag
- Bridge: `bridgeWebsiteLocale()` → `resolveLocaleFromLanguage()`

### Template
- Templates are **language-neutral** (`languageNeutral: true`)
- No hardcoded English or Arabic in template packages
- Copy resolved at generation/content layer

### Content
- `usesLlmLocalization` when non-English
- Static fallback packs in `content-language.ts` (existing)

### Preview / Export
- Inherit full `GlsLanguageContext`
- Direction CSS via `emitDirectionCssVariables()`
- SEO metadata via `resolveSeoLocalization()`

## Settings Patch

`contextToSettingsPatch()` writes:
- `glsContextHash`
- `glsPlatformVersion`
- `glsWebsiteLanguage`
- `glsLocaleCode`
- `glsDirection`
- `glsTypographyProfile`
- `glsTbdpTypographyProfile`
