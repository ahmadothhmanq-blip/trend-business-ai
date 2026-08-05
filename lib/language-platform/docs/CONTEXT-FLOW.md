# GLS — Context Flow

## Unified Context Pipeline

```
Platform Locale (dashboard i18n)
        ↓
Generation Language (AI prompt/output)
        ↓
Template Language (language-neutral)
        ↓
Content Language (LLM-localized copy)
        ↓
Preview (direction + typography applied)
        ↓
Export (SEO + locale formatting)
```

## Entry Point

```ts
import { resolveGlsLanguageContext } from "@/lib/language-platform";

const ctx = resolveGlsLanguageContext({
  platformLocale: "en",       // Dashboard UI
  websiteLanguage: "Japanese", // Generated site
  generationLanguage: "Japanese", // AI generation
  serviceId: "website-builder",
});
```

## Context Layers

| Layer | Field | Source |
|-------|-------|--------|
| Platform | `ctx.platform` | `lib/i18n/config` |
| Generation | `ctx.generation` | AI resolver |
| Website | `ctx.website` | GLS website locale bridge |
| Template | `ctx.template` | Always language-neutral |
| Content | `ctx.content` | LLM localization flag |
| Typography | `ctx.typography` | Script family → profile |
| Direction | `ctx.direction` | RTL/LTR engine |
| Locale | `ctx.locale` | Numbers, dates, currency |
| SEO | `ctx.seo` | hreflang, slugs, schema |
| AI | `ctx.ai` | Structured output directive |
| Service | `ctx.service` | Per-product language |

## Bridges

| Bridge | Target |
|--------|--------|
| `bridgePlatformLocale()` | `lib/i18n` |
| `resolveGlsWebsiteLocale()` | `website-output-locale` + GLS registry |
| `bridgeToTbdpLanguageContext()` | TBDP language-bridge |
