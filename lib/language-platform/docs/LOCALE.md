# GLS — Locale Engine

## Capabilities

| Feature | API | Notes |
|---------|-----|-------|
| Numbers | `formatGlsNumber()` | Intl.NumberFormat |
| Dates | `formatGlsDate()` | Intl.DateTimeFormat with timezone |
| Currencies | `formatGlsCurrency()` | Per-locale default currency |
| Units | `unitSystem` | metric (default) / imperial (en) |
| Timezone | `locale.timezone` | Configurable, default UTC |
| Calendars | `locale.calendar` | gregory, islamic, buddhist, japanese |
| Pluralization | `pluralizeGls()` | Intl.PluralRules |

## Resolution

```ts
import { resolveLocaleFormatting } from "@/lib/language-platform";

const locale = resolveLocaleFormatting("ar", {
  timezone: "Asia/Riyadh",
  currencyCode: "SAR",
});
```

## World Language Registry

30 locales from `lib/i18n/config.ts`, each with:
- BCP-47 `htmlLang`
- Direction (ltr/rtl)
- Script family
- Default currency (ISO 4217)
