# Language Inventory — Platform UI vs AI Generation

**Audit date:** 2026-08-21  
**Scope:** Read-only repository audit. No application code was changed.  
**GCRI countries are not languages and are not counted.**

PLATFORM UI LANGUAGES: 31
AI GENERATION LANGUAGES: 32

- Platform UI count = entries in `SUPPORTED_LOCALES` (`lib/i18n/config.ts`).
- AI Generation count = 31 GLS world languages from `getGlsWorldLanguageRegistry()` **plus** 1 special GLS generation token (`Bilingual`).

These systems are independent:

| System | What it controls | Cookie / storage |
|---|---|---|
| Platform UI language | Dashboard/marketing chrome, `html lang` / `dir` | `tba_locale` |
| AI Generation Language (GLS) | AI output language | `tba_generation_language` |
| GCRI country | Regional/currency/context for a GLS language | `tba_generation_country` |

Hebrew (`he` / `he-IL`) is **intentionally excluded** from the platform UI registry (`lib/i18n/config.ts`). It is not a UI locale and not a GLS generation language.

---

## A) Platform UI languages

**Canonical source:** `lib/i18n/config.ts` → `SUPPORTED_LOCALES` (type `SupportedLocale`).

**Related wiring (derived from that registry, not a second catalog):**

| Concern | Location |
|---|---|
| Fallback locale | `DEFAULT_LOCALE = "en"` |
| RTL set | `RTL_LOCALES = ar, fa, ur` (matches `dir` on those locale rows) |
| Translation load | `lib/i18n/load-messages.ts` (`locales/{code}.json`, English deep-merge fallback) |
| Selector | `components/i18n/language-selector.tsx` maps **all** `SUPPORTED_LOCALES` |
| Client persist | `lib/i18n/client.tsx` (`tba_locale` cookie + localStorage) |
| Server resolve | `lib/i18n/server.ts` (`x-tba-locale` header, then `tba_locale` cookie, then `normalizeLocale`) |
| Locale routing | `proxy.ts` + `lib/i18n/paths.ts` (`LOCALE_PREFIX_RE`) |
| HTML `lang` / `dir` | `app/layout.tsx` via `getLocaleDefinition(locale)` |
| Locale API | `app/api/i18n/locale/route.ts` |

English has **no** URL prefix (`/` is English). Other locales use `/{code}/…` (for example `/ar`). Dashboard, login, signup, and `/api/*` do not auto-redirect by Accept-Language (`shouldAutoRedirectForLocale`).

### PLATFORM UI LANGUAGE COUNT: 31

| # | Language | Native Name | Locale Code | RTL/LTR | Translation Resource | Registered | Exposed in Selector |
|---|---|---|---|---|---|---|---|
| 1 | English | English | `en` | LTR | `locales/en.json` | Yes | Yes |
| 2 | Arabic | العربية | `ar` | RTL | `locales/ar.json` | Yes | Yes |
| 3 | Spanish | Español | `es` | LTR | `locales/es.json` | Yes | Yes |
| 4 | French | Français | `fr` | LTR | `locales/fr.json` | Yes | Yes |
| 5 | German | Deutsch | `de` | LTR | `locales/de.json` | Yes | Yes |
| 6 | Italian | Italiano | `it` | LTR | `locales/it.json` | Yes | Yes |
| 7 | Portuguese | Português | `pt` | LTR | `locales/pt.json` | Yes | Yes |
| 8 | Dutch | Nederlands | `nl` | LTR | `locales/nl.json` | Yes | Yes |
| 9 | Turkish | Türkçe | `tr` | LTR | `locales/tr.json` | Yes | Yes |
| 10 | Chinese (Simplified) | 简体中文 | `zh-CN` | LTR | `locales/zh-CN.json` | Yes | Yes |
| 11 | Chinese (Traditional) | 繁體中文 | `zh-TW` | LTR | `locales/zh-TW.json` | Yes | Yes |
| 12 | Japanese | 日本語 | `ja` | LTR | `locales/ja.json` | Yes | Yes |
| 13 | Korean | 한국어 | `ko` | LTR | `locales/ko.json` | Yes | Yes |
| 14 | Russian | Русский | `ru` | LTR | `locales/ru.json` | Yes | Yes |
| 15 | Hindi | हिन्दी | `hi` | LTR | `locales/hi.json` | Yes | Yes |
| 16 | Indonesian | Bahasa Indonesia | `id` | LTR | `locales/id.json` | Yes | Yes |
| 17 | Vietnamese | Tiếng Việt | `vi` | LTR | `locales/vi.json` | Yes | Yes |
| 18 | Thai | ไทย | `th` | LTR | `locales/th.json` | Yes | Yes |
| 19 | Polish | Polski | `pl` | LTR | `locales/pl.json` | Yes | Yes |
| 20 | Swedish | Svenska | `sv` | LTR | `locales/sv.json` | Yes | Yes |
| 21 | Norwegian | Norsk | `no` | LTR | `locales/no.json` | Yes | Yes |
| 22 | Danish | Dansk | `da` | LTR | `locales/da.json` | Yes | Yes |
| 23 | Finnish | Suomi | `fi` | LTR | `locales/fi.json` | Yes | Yes |
| 24 | Greek | Ελληνικά | `el` | LTR | `locales/el.json` | Yes | Yes |
| 25 | Czech | Čeština | `cs` | LTR | `locales/cs.json` | Yes | Yes |
| 26 | Romanian | Română | `ro` | LTR | `locales/ro.json` | Yes | Yes |
| 27 | Ukrainian | Українська | `uk` | LTR | `locales/uk.json` | Yes | Yes |
| 28 | Malay | Bahasa Melayu | `ms` | LTR | `locales/ms.json` | Yes | Yes |
| 29 | Bengali | বাংলা | `bn` | LTR | `locales/bn.json` | Yes | Yes |
| 30 | Persian | فارسی | `fa` | RTL | `locales/fa.json` | Yes | Yes |
| 31 | Urdu | اردو | `ur` | RTL | `locales/ur.json` | Yes | Yes |

`htmlLang` notes (BCP-47, not a second language): Norwegian UI code `no` → `htmlLang` `nb`; Simplified Chinese `zh-CN` → `zh-Hans`; Traditional Chinese `zh-TW` → `zh-Hant`.

### Platform UI findings

**Registered but missing translations**

Every registered locale has a JSON file. Non-English files are incomplete versus `locales/en.json` (6,102 leaf keys). Runtime still works because `loadMessages()` deep-merges onto English.

| Locale group | Leaf-key overlap vs `en.json` | Missing vs English | Runtime behavior |
|---|---|---|---|
| `en` | 100% (6,102) | 0 | Canonical dictionary |
| `ar` | 94.4% (5,762) | 340 | Missing keys render English |
| All other 29 locales | 90.0% (5,491) | 611 | Missing keys render English |

Largest English-only clusters (present in `en.json`, absent from other locale files): `products.visualEditor`, `products.websiteBuilder`, `products.templateMarketplace`.

**Translation files not registered**

None. `locales/` contains exactly 31 JSON files, one per `SupportedLocale`. There is no `he.json` / Hebrew dictionary.

**Languages registered but hidden from selector**

None. `LanguageSelector` iterates `SUPPORTED_LOCALES` with no filter.

**Duplicate locale definitions**

| Location | Role |
|---|---|
| `lib/i18n/config.ts` `SUPPORTED_LOCALES` | **Canonical** UI locale catalog |
| `lib/i18n/paths.ts` `LOCALE_PREFIX_RE` | Must stay in sync with the 31 codes (duplicate encoding as a regex) |
| `lib/seo/site.ts` `SUPPORTED_LOCALES` | Derived map from i18n config (hreflang / OG), not an independent language list |
| `lib/language-platform/registry/languages.ts` | GLS world registry **cloned from** UI `SUPPORTED_LOCALES` |
| `lib/i18n/website-output-locale.ts` `LANGUAGE_MAP` | Partial duplicate (English, Arabic, Bilingual, Spanish, French, German, Italian, Portuguese, Persian, Urdu). Other GLS languages fall through to the GLS option + `getLocaleDefinition` |
| `BROWSER_ALIASES` in `config.ts` | Accept-Language aliases (`pt-BR` → `pt`, `zh` → `zh-CN`, `nb` → `no`). Not extra languages |

Unrelated nested `languages` objects inside `locales/en.json` (website-builder feature labels, content-studio copy labels) are **UI strings**, not locale registries. They must not be counted as platform UI languages.

---

## B) AI generation languages (GLS)

**Canonical source:** `getGlsWorldLanguageRegistry()` in `lib/language-platform/registry/languages.ts`, which maps **the same** `SUPPORTED_LOCALES` into GLS world languages (`aiLanguage` stored values such as `"English"`, `"Simplified Chinese"`).

**Special generation-only token (not a world language, not a UI locale):**

- `Bilingual` — `lib/language-platform/generation/options.ts` `SPECIAL_GENERATION_LANGUAGES`
- Selector: Website Builder and Landing Builder only (`BILINGUAL_SERVICE_IDS`)
- GCRI treats Bilingual as Arabic for country options (country, not language)

**Related wiring:**

| Concern | Location |
|---|---|
| Picker options | `getGlsGenerationLanguageOptions(serviceId)` |
| Shared selector | `components/dashboard/language/gls-generation-language-select.tsx` |
| Normalize / validate | `normalizeGlsGenerationLanguage`, `isGlsGenerationLanguage` |
| Resolve order | `lib/language-platform/generation/service.ts` (explicit body → header `x-tba-generation-language` → cookie `tba_generation_language` → UI locale fallback → English) |
| API bind | `getRequestAiLanguage` / `resolveRequestLanguage` in `lib/i18n/api.ts` |
| Prompt directive | `buildGlsOutputDirective` / `aiOutputLanguageDirective` |
| Product lists | `WEBSITE_LANGUAGES`, `LP_LANGUAGES`, `CONTENT_LANGUAGES`, `WEBAPP_LANGUAGES`, `WORKSPACE_LANGUAGES` all call `getGlsGenerationLanguageValues(...)` |

GLS stored values are human language names (`LocaleDefinition.aiLanguage`), **not** ISO country codes. ISO-like locale codes below are the GLS `localeCode` (same as platform UI codes).

### AI GENERATION LANGUAGE COUNT: 32

31 world languages + 1 special (`Bilingual`).

| # | Language | Native Name | Language Code | GLS Supported | Selector Available | Generation Pipeline |
|---|---|---|---|---|---|---|
| 1 | English | English | `en` | Yes | Yes (all GLS selectors) | Yes |
| 2 | Arabic | العربية | `ar` | Yes | Yes (all GLS selectors) | Yes |
| 3 | Spanish | Español | `es` | Yes | Yes (all GLS selectors) | Yes |
| 4 | French | Français | `fr` | Yes | Yes (all GLS selectors) | Yes |
| 5 | German | Deutsch | `de` | Yes | Yes (all GLS selectors) | Yes |
| 6 | Italian | Italiano | `it` | Yes | Yes (all GLS selectors) | Yes |
| 7 | Portuguese | Português | `pt` | Yes | Yes (all GLS selectors) | Yes |
| 8 | Dutch | Nederlands | `nl` | Yes | Yes (all GLS selectors) | Yes |
| 9 | Turkish | Türkçe | `tr` | Yes | Yes (all GLS selectors) | Yes |
| 10 | Simplified Chinese | 简体中文 | `zh-CN` | Yes | Yes (all GLS selectors) | Yes |
| 11 | Traditional Chinese | 繁體中文 | `zh-TW` | Yes | Yes (all GLS selectors) | Yes |
| 12 | Japanese | 日本語 | `ja` | Yes | Yes (all GLS selectors) | Yes |
| 13 | Korean | 한국어 | `ko` | Yes | Yes (all GLS selectors) | Yes |
| 14 | Russian | Русский | `ru` | Yes | Yes (all GLS selectors) | Yes |
| 15 | Hindi | हिन्दी | `hi` | Yes | Yes (all GLS selectors) | Yes |
| 16 | Indonesian | Bahasa Indonesia | `id` | Yes | Yes (all GLS selectors) | Yes |
| 17 | Vietnamese | Tiếng Việt | `vi` | Yes | Yes (all GLS selectors) | Yes |
| 18 | Thai | ไทย | `th` | Yes | Yes (all GLS selectors) | Yes |
| 19 | Polish | Polski | `pl` | Yes | Yes (all GLS selectors) | Yes |
| 20 | Swedish | Svenska | `sv` | Yes | Yes (all GLS selectors) | Yes |
| 21 | Norwegian | Norsk | `no` | Yes | Yes (all GLS selectors) | Yes |
| 22 | Danish | Dansk | `da` | Yes | Yes (all GLS selectors) | Yes |
| 23 | Finnish | Suomi | `fi` | Yes | Yes (all GLS selectors) | Yes |
| 24 | Greek | Ελληνικά | `el` | Yes | Yes (all GLS selectors) | Yes |
| 25 | Czech | Čeština | `cs` | Yes | Yes (all GLS selectors) | Yes |
| 26 | Romanian | Română | `ro` | Yes | Yes (all GLS selectors) | Yes |
| 27 | Ukrainian | Українська | `uk` | Yes | Yes (all GLS selectors) | Yes |
| 28 | Malay | Bahasa Melayu | `ms` | Yes | Yes (all GLS selectors) | Yes |
| 29 | Bengali | বাংলা | `bn` | Yes | Yes (all GLS selectors) | Yes |
| 30 | Persian | فارسی | `fa` | Yes | Yes (all GLS selectors) | Yes |
| 31 | Urdu | اردو | `ur` | Yes | Yes (all GLS selectors) | Yes |
| 32 | Bilingual | Bilingual (Arabic + English) | `bilingual` | Yes (special) | Website Builder + Landing Builder only | Yes (those products; valid GLS token everywhere) |

Picker i18n labels: `locales/en.json` → `constants.gls.languages.*` (32 slugs, including `bilingual`, `simplified_chinese`, `traditional_chinese`).

**Selector coverage (shared component):** Website Builder, Landing Builder, App Builder, Content Studio, Video Studio, Brand Designer, Logo Designer, Image Generator, AI Agents, Marketing AI, Business Manager, Social Media, workspace generator form.

**GLS service IDs without that selector in UI:** `crm`, `erp` are in `GLS_SERVICE_REGISTRY` with `supportsIndependentLanguage: true`, but no `GlsGenerationLanguageSelect` mount was found under CRM/ERP components. Generation routes can still bind GLS via `getRequestAiLanguage` / cookies / body.

**Not counted**

- GCRI catalog countries (SA, US, CA, …)
- Provider-theoretical languages (for example Hebrew) that are not in the GLS registry
- Typography profile `hebrew-rtl` (`lib/language-platform/typography/profiles.ts`) — script profile only

---

## C) Cross-check

| Language | Platform UI | AI Generation | Both | Notes |
|---|---|---|---|---|
| Arabic | Yes (`ar`) | Yes (`Arabic`) | Yes | RTL UI |
| English | Yes (`en`, fallback) | Yes (`English`, GLS default) | Yes | Primary site language |
| Spanish | Yes (`es`) | Yes (`Spanish`) | Yes | |
| French | Yes (`fr`) | Yes (`French`) | Yes | GCRI country is separate (FR vs CA, etc.) |
| German | Yes (`de`) | Yes (`German`) | Yes | |
| Portuguese | Yes (`pt`) | Yes (`Portuguese`) | Yes | `pt-BR` / `pt-PT` alias to UI `pt`; not separate UI locales |
| Italian | Yes (`it`) | Yes (`Italian`) | Yes | |
| Dutch | Yes (`nl`) | Yes (`Dutch`) | Yes | |
| Turkish | Yes (`tr`) | Yes (`Turkish`) | Yes | |
| Hindi | Yes (`hi`) | Yes (`Hindi`) | Yes | |
| Japanese | Yes (`ja`) | Yes (`Japanese`) | Yes | |
| Korean | Yes (`ko`) | Yes (`Korean`) | Yes | |
| Chinese Simplified | Yes (`zh-CN`) | Yes (`Simplified Chinese`) | Yes | Distinct from Traditional |
| Chinese Traditional | Yes (`zh-TW`) | Yes (`Traditional Chinese`) | Yes | Distinct from Simplified |
| Vietnamese | Yes (`vi`) | Yes (`Vietnamese`) | Yes | |
| Thai | Yes (`th`) | Yes (`Thai`) | Yes | |
| Malay | Yes (`ms`) | Yes (`Malay`) | Yes | Distinct from Indonesian |
| Indonesian / Bahasa Indonesia | Yes (`id`) | Yes (`Indonesian`) | Yes | Distinct from Malay |
| Polish | Yes (`pl`) | Yes (`Polish`) | Yes | |
| Russian | Yes (`ru`) | Yes (`Russian`) | Yes | |
| Swedish | Yes (`sv`) | Yes (`Swedish`) | Yes | |
| Norwegian | Yes (`no`) | Yes (`Norwegian`) | Yes | |
| Danish | Yes (`da`) | Yes (`Danish`) | Yes | |
| Finnish | Yes (`fi`) | Yes (`Finnish`) | Yes | |
| Greek | Yes (`el`) | Yes (`Greek`) | Yes | |
| Czech | Yes (`cs`) | Yes (`Czech`) | Yes | |
| Romanian | Yes (`ro`) | Yes (`Romanian`) | Yes | |
| Ukrainian | Yes (`uk`) | Yes (`Ukrainian`) | Yes | |
| Bengali | Yes (`bn`) | Yes (`Bengali`) | Yes | |
| Persian | Yes (`fa`) | Yes (`Persian`) | Yes | RTL UI |
| Urdu | Yes (`ur`) | Yes (`Urdu`) | Yes | RTL UI |
| Bilingual | No | Yes (special) | No | Generation token only; not a platform UI locale |
| Hebrew | No | No | No | Intentionally excluded from UI registry; Hebrew Accept-Language falls back to `en` |

All 20 requested check languages exist in **both** inventories.

---

## D) Critical distinction

| | Platform UI language | AI Generation Language | GCRI country |
|---|---|---|---|
| Count in this audit | **31** | **32** (31 world + Bilingual) | Not a language count |
| Source | `SUPPORTED_LOCALES` | GLS world registry + `Bilingual` | `GCRI_CATALOG` |
| User control | `LanguageSelector` | `GlsGenerationLanguageSelect` | Country `<select>` under GLS |
| Cookie | `tba_locale` | `tba_generation_language` | `tba_generation_country` |
| Changes dashboard chrome | Yes | No | No |
| Changes AI output language | Only as last-resort GLS fallback when no explicit/header/cookie generation language is set | Yes | No (sets region/currency/context for the selected GLS language) |

Do not treat “French + Canada” as a language. French is GLS; Canada is GCRI.

---

## E) Final answer

PLATFORM UI LANGUAGES: 31
AI GENERATION LANGUAGES: 32

**Platform UI (31):** English, Arabic, Spanish, French, German, Italian, Portuguese, Dutch, Turkish, Chinese (Simplified), Chinese (Traditional), Japanese, Korean, Russian, Hindi, Indonesian, Vietnamese, Thai, Polish, Swedish, Norwegian, Danish, Finnish, Greek, Czech, Romanian, Ukrainian, Malay, Bengali, Persian, Urdu.

**AI Generation (32):** the same 31 world languages (GLS stored names: English, Arabic, Spanish, French, German, Italian, Portuguese, Dutch, Turkish, Simplified Chinese, Traditional Chinese, Japanese, Korean, Russian, Hindi, Indonesian, Vietnamese, Thai, Polish, Swedish, Norwegian, Danish, Finnish, Greek, Czech, Romanian, Ukrainian, Malay, Bengali, Persian, Urdu) **plus** Bilingual.

**Highest-signal gaps (inventory only, not implementation):**

1. Non-English UI dictionaries are incomplete vs English (Arabic 94.4%; others 90.0%); missing keys fall back to English.
2. `LANGUAGE_MAP` in `website-output-locale.ts` duplicates a subset of languages; remaining GLS languages resolve via the GLS registry.
3. `Bilingual` is an AI generation option, not a platform UI locale.
4. CRM/ERP are GLS services without the shared generation-language selector UI.
5. Hebrew is excluded from both inventories by design.
