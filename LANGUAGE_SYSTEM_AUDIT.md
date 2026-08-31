# Language System Audit — Trend Business AI

**Date:** 21 August 2026  
**Scope:** Production i18n / GLS across the platform (read-only)  
**Method:** Source review of `lib/i18n`, `lib/language-platform`, `locales/*`, APIs, schema, SEO, product UIs, and official audit scripts (`scripts/verify-locale-depth.mjs`, `scripts/audit-i18n.mjs`)  
**Code changes:** none

---

## Executive summary

Trend Business AI has a **real, centralized language architecture** (GLS + custom JSON i18n), **30 UI locales**, **RTL document direction**, **cookie/profile persistence**, and **independent generation-language pickers** on the flagship builders (Website, Landing, App, Video, Content Studio).

It is **not yet a world-class multilingual AI platform**. Translation depth is **73% overall**. Nine shipped UI locales are still ~90% English. **English itself is missing 23 keys** that other locale files have — Image Generator editor buttons render raw key paths for `en`. Several products have translated chrome but **no independent AI output language**. Published-site multilingual SEO is incomplete (2-letter locale URLs, English-forced primary HTML at publish, sitemap without locale variants). Dashboard fonts are Latin-only. GLS RTL/typography engines exist but are only partially wired.

| Area | Grade | One-line status |
|------|-------|-----------------|
| Platform UI locales | C+ | 30 locales registered; 21 deep, 9 shallow; `en.json` missing 23 keys |
| Language switcher | A− | Present on marketing, auth, dashboard, settings |
| Persistence | A− | Cookie + localStorage + `user_preferences.locale` |
| Browser detection | B | Marketing pages only; dashboard/auth skipped |
| RTL/LTR | B | `html[dir]` + CSS; GLS CSS vars unused; Latin fonts |
| Locale routing | B | Prefix rewrite via `proxy.ts`; no `app/[locale]` tree |
| Independent AI language | C+ | Strong on builders; missing or UI-tied elsewhere |
| Published-site i18n | C | Pipeline exists; no UI toggle; locale URL bugs |
| SEO (marketing site) | B | hreflang + sitemap expansion; canonical always `en` |
| SEO (customer sites) | C− | hreflang when enabled; sitemap ignores locales |
| Database | C | Preference + generation `language` columns; no TM |
| APIs | C+ | Common resolver; many products ignore explicit language |

**Localization score (official script):** `50/100` (`verify-locale-depth.mjs`).

---

## 1. Global language system

### 1.1 Supported languages

**Source of truth:** `lib/i18n/config.ts` (`SUPPORTED_LOCALES`). GLS wraps the same list in `lib/language-platform/registry/languages.ts`.

| Code | Name | Dir | `htmlLang` | AI prompt name |
|------|------|-----|------------|----------------|
| `en` | English (default) | ltr | `en` | English |
| `ar` | Arabic | rtl | `ar` | Arabic |
| `es` | Spanish | ltr | `es` | Spanish |
| `fr` | French | ltr | `fr` | French |
| `de` | German | ltr | `de` | German |
| `it` | Italian | ltr | `it` | Italian |
| `pt` | Portuguese | ltr | `pt` | Portuguese |
| `nl` | Dutch | ltr | `nl` | Dutch |
| `tr` | Turkish | ltr | `tr` | Turkish |
| `zh-CN` | Chinese (Simplified) | ltr | `zh-Hans` | Simplified Chinese |
| `zh-TW` | Chinese (Traditional) | ltr | `zh-Hant` | Traditional Chinese |
| `ja` | Japanese | ltr | `ja` | Japanese |
| `ko` | Korean | ltr | `ko` | Korean |
| `ru` | Russian | ltr | `ru` | Russian |
| `hi` | Hindi | ltr | `hi` | Hindi |
| `id` | Indonesian | ltr | `id` | Indonesian |
| `vi` | Vietnamese | ltr | `vi` | Vietnamese |
| `th` | Thai | ltr | `th` | Thai |
| `pl` | Polish | ltr | `pl` | Polish |
| `sv` | Swedish | ltr | `sv` | Swedish |
| `no` | Norwegian | ltr | `nb` | Norwegian |
| `da` | Danish | ltr | `da` | Danish |
| `fi` | Finnish | ltr | `fi` | Finnish |
| `el` | Greek | ltr | `el` | Greek |
| `cs` | Czech | ltr | `cs` | Czech |
| `ro` | Romanian | ltr | `ro` | Romanian |
| `uk` | Ukrainian | ltr | `uk` | Ukrainian |
| `ms` | Malay | ltr | `ms` | Malay |
| `bn` | Bengali | ltr | `bn` | Bengali |
| `fa` | Persian | rtl | `fa` | Persian |
| `ur` | Urdu | rtl | `ur` | Urdu |

**Locale JSON files:** 31 files under `locales/` (`en` + 30 overrides). Matches the registry.

**Hebrew (`he`):** intentionally excluded. `normalizeLocale("he"|"he-IL")` maps to English. GLS still has a unused `hebrew-rtl` typography profile.

**Generation languages:** same 30, stored as human names (`"English"`, `"Simplified Chinese"`). Website + Landing also offer **Bilingual (Arabic + English)**. Unknown values fall back to English (`PRIMARY_SITE_LANGUAGE`).

Users cannot type an arbitrary language (e.g. Swahili, Catalan). “Any language” is **not** true; it is “any of the 30 GLS languages.”

### 1.2 Language switcher (platform UI)

| Surface | Component | Evidence |
|---------|-----------|----------|
| Marketing header | `LanguageSelector` | `components/marketing/site/header.tsx` |
| Dashboard header | compact | `components/dashboard/header.tsx` |
| Dashboard sidebar | ghost, full width | `components/dashboard/sidebar.tsx` |
| Settings | default | `components/dashboard/platform/settings-panel.tsx` |
| Login / signup / forgot / reset | compact | `components/auth/*-form.tsx` |

Switcher lists all `SUPPORTED_LOCALES` with native names. Changing language calls `setLocale` → persist + `POST /api/i18n/locale` + `router.push` to a prefixed path (`lib/i18n/client.tsx`).

### 1.3 RTL / LTR

**Working**

- Locale `dir` is applied on `<html>` in `app/layout.tsx` from `getLocaleDefinition(locale)`.
- RTL set: `ar`, `fa`, `ur` (`RTL_LOCALES`).
- Substantial dashboard RTL CSS in `app/globals.css` (`html[dir="rtl"]` — sidebar, forms, tables, dialogs, charts, kanban, spacing).
- Generated websites: `applyHtmlDirAttribute` / `applyHtmlLangAttribute` (`lib/website/public-site.ts`).
- Website AI prompts require RTL for Arabic (`lib/ai-core/website-builder/language-directive.ts`).

**Gaps**

- GLS `emitDirectionCssVariables()` is **exported and tested but never injected** into the live app (only `lib/language-platform/language-platform.test.ts`).
- Root fonts are **Geist latin-only** (`app/layout.tsx` `subsets: ["latin"]`). Arabic/CJK/Indic UI falls back to the OS font — not production typography.
- GLS typography profiles (Noto Naskh Arabic, Noto Sans SC, etc.) are **not loaded** in the dashboard.
- Logical CSS (`ms-`/`me-`, `ps-`/`pe-`) is mixed with physical Tailwind (`ml-`, `text-left`) that RTL CSS then tries to invert — fragile.
- Hebrew RTL profile exists in GLS but Hebrew is blocked at the locale layer.

### 1.4 Locale routing

There is **no** `middleware.ts` and **no** `app/[locale]/...` tree.

Routing lives in `proxy.ts` (Next.js 16 proxy):

1. Path prefix `/ar/pricing` → rewrite to `/pricing`, set `x-tba-locale: ar`.
2. Cookie `tba_locale` → keep unprefixed URL, set header.
3. No cookie → `Accept-Language` detection.
4. If detected ≠ `en` **and** path is a public marketing page → **redirect** to `/{locale}{path}`.
5. **Not redirected:** `/dashboard`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/api/*`, `/w/*`.

English URLs stay unprefixed (`localizedPath` omits `/en`).

**Published customer sites**

| URL | Behavior |
|-----|----------|
| `/w/{slug}` | Primary; HTML `lang` forced to `en` at publish |
| `/w/{slug}/{locale}` | Alternate HTML from `seo_json.visitorLocaleHtml` |
| `/w/app/{slug}` | App publish — **no locale segment** |
| `/w/video/{slug}` | Video publish — **no locale segment** |

Locale param on published sites must match `/^[a-z]{2}$/` (`app/w/[slug]/[locale]/route.ts`). **`zh-CN` / `zh-TW` cannot be routed.** Codes are also sliced to two letters (`htmlLang.slice(0, 2)`), so Simplified and Traditional Chinese collide as `zh`.

### 1.5 Default locale

`DEFAULT_LOCALE = "en"` (`lib/i18n/config.ts` and `lib/seo/site.ts`).  
Published-site primary language is hard-coded English (`PRIMARY_SITE_LANGUAGE = "English"` in `lib/language-platform/generation/options.ts`), even when the site was generated in Arabic.

### 1.6 Language persistence

| Layer | Key / column | Notes |
|-------|----------------|-------|
| Cookie | `tba_locale` (1 year, `SameSite=Lax`) | Set by proxy, client `setLocale`, and `POST /api/i18n/locale` |
| localStorage | `tba_locale` | Client persist + `LocaleSync` |
| Request header | `x-tba-locale` | Set by proxy; `getServerLocale()` prefers this |
| Database | `user_preferences.locale` | Migration `071_i18n_locale_preference.sql` |
| Dashboard sync | `LocaleSync` | `app/(dashboard)/layout.tsx` |

`POST /api/i18n/locale` upserts the profile when the user is authenticated; if the column is missing it still saves the cookie (`skipped: true`).

### 1.7 Browser language detection

`detectLocaleFromAcceptLanguage()` exists and is used in `proxy.ts` on first visit (no cookie). Aliases cover `en-GB`, `pt-BR`, `zh-Hans`, `nb`, etc.

**Not used** for dashboard or auth (explicit skip). First-time users landing on `/login` stay in English until they use the switcher. `getServerLocale()` does **not** read `Accept-Language`; only header + cookie.

---

## 2. Translation coverage

### 2.1 How translations load

Custom stack (not next-intl / react-i18next):

- Messages: `locales/*.json` → `lib/i18n/load-messages.ts`
- Non-English locales **deep-merge onto English** (missing keys silently show English)
- Client: `I18nProvider` / `useTranslation` / `useProductT` / `useWorkspaceT`
- Server: `getServerTranslator()`
- Missing keys that are absent from English too render as the **raw key string**

Namespaces include `common`, `nav`, `pages`, `products`, `workspaces`, `marketing`, `dashboard`, `constants`, `errors`, `seoContent`.

Comparable string keys (official script): **6,128**.

### 2.2 Translation depth (production blocker)

From `npm run` equivalent `node scripts/verify-locale-depth.mjs`:

**Shipped but mostly English (FAIL, &lt;98%)**

| Locale | Translated | Remaining English copies |
|--------|------------|--------------------------|
| fa (Persian, RTL) | 10% | 5,500 |
| ur (Urdu, RTL) | 10% | 5,500 |
| ja | 10% | 5,500 |
| ko | 10% | 5,500 |
| ms | 10% | 5,500 |
| pl | 10% | 5,500 |
| sv | 10% | 5,500 |
| zh-TW | 10% | 5,500 |
| th | 24% | 4,682 |

**Deep locales (99–100%)**  
`ar`, `bn`, `cs`, `da`, `de`, `el`, `es`, `fi`, `fr`, `hi`, `id`, `it`, `nl`, `no`, `pt`, `ro`, `ru`, `tr`, `uk`, `vi`, `zh-CN`.

**Overall depth: 73%.** Selecting Persian, Urdu, Japanese, Korean, or Traditional Chinese in the switcher produces a **mixed-language dashboard**.

### 2.2b Missing keys vs English copies

Two different failure modes:

**A. Keys present in `en.json`, missing from 28 other locales (~611 keys)**  
Silent English fallback via `deepMergeMessages`. Clusters: `products.websiteBuilder.*` (~300), `products.visualEditor.*` (~246), `constants.gls.*` language labels (~32), `products.templateMarketplace.*` (~31). Newest Website Builder Visual Editor / Visual Skin / Marketplace chrome is English everywhere except partially Arabic.

**B. Keys present in non-English files, missing from `en.json` (~23 keys)**  
`loadMessages("en")` returns `en.json` with **no merge fallback**. `createTranslator` then returns the **raw key**. Confirmed live: `components/dashboard/image-generator/editor/toolbar.tsx` calls `p("editor.save")` → `products.imageGenerator.editor.save`. Those keys exist under `products.imageGenerator.editor` in `locales/ar.json` (and the other 28 files) but **not** in `locales/en.json` (English `editor` object stops at `brandKitPicker`). English users see `products.imageGenerator.editor.save` / `.png` / `.pdf` on the toolbar.

Also missing from `en.json` `products.templateMarketplace`: `allStyles`, `aiRecommendations`, `aiRecommendationsDescription`, `industryPlaceholder`, `goalPlaceholder`, `audiencePlaceholder`, `recommend`, `briefPlaceholder` (present in `ar.json`).

### 2.3 Hardcoded / untranslated UI

`scripts/audit-i18n.mjs` found **24 files with no i18n markers** (~130 string hits), concentrated in **new Video Studio create/editor** and **Website Builder Pro / visual skin** surfaces:

- `components/dashboard/video-studio/create/*` (home, wizard, prompt, generate, advanced)
- `components/dashboard/video-studio/editor/*` (inspector, audio, captions, timeline, actions)
- `components/dashboard/website-builder/visual-skin-preview-scenes.tsx`
- `components/dashboard/website-builder/pro-workspace-*.tsx`
- `components/dashboard/website-builder/site-image-manager-panel.tsx`
- `components/dashboard/webapp-builder/app-copilot-command-panel.tsx`

These ship English chrome even when the UI locale is Arabic.

The heuristic audit under-counts: it skips files that import `useTranslation` even if they still contain English JSX. Example: `components/dashboard/website-builder/website-management-dashboard.tsx` still has the English capability string *“Add bilingual Arabic and English content with RTL support and language switcher”*.

### 2.4 Mixed languages — structural causes

1. Shallow locale JSON (section 2.2).
2. English fallback merge (`deepMergeMessages`).
3. New product UI not wired to keys (section 2.3).
4. Option labels in some `<select>`s still use raw English constants (e.g. workspace **theme** names in `workspace-generator-form.tsx`).
5. Published primary URL is English even when generation language is Arabic (section 4).
6. Static website copy packs only cover `en/ar/es/fr/de/pt/it` (`lib/ai-core/content/content-language.ts`); other languages get **empty** fallbacks and rely 100% on the LLM.

---

## 3. Products

Legend: **UI** = chrome uses i18n hooks. **Picker** = `GlsGenerationLanguageSelect` or equivalent. **API** = honors explicit generation language independent of UI locale. **Multi** = visitor/output can differ from UI locale.

| Product | UI translated? | AI output language selectable? | Multi-language supported? | Missing functionality |
|---------|----------------|--------------------------------|---------------------------|------------------------|
| **Website Builder** | Mostly yes (`useProductT("websiteBuilder")`). New Pro/skin/image panels hardcoded. | **Yes** — GLS select, 30 langs + Bilingual | Generate in any GLS language. Visitor locales exist in publish pipeline but **no dashboard toggle**; enabled via API/`settings.visitorLocales` or bilingual capability. | Visitor-locale UI; real per-page translations; CJK locale URLs; Pro i18n |
| **App Builder** | Yes (`useProductT`) | **Yes** — GLS select `app-builder` | Generation language independent | Published `/w/app/{slug}` has no locale routes; no bilingual option |
| **Landing Page Builder** | Yes | **Yes** — GLS select `landing-builder` + Bilingual | Same as website for generation | Same visitor-locale gaps as WB |
| **Video Studio** | Partial — main tool i18n’d; **create + editor English** | **Yes** on main tool + director wizard | Scripts/scenes follow picker | Caption language separate from video language; create/editor i18n; published `/w/video/{slug}` monolingual |
| **Image Generator** | Yes | **No independent picker** | API uses **UI locale cookie** (`resolveRequestLanguage(request)` with no body `language`) | Output language cannot differ from UI; GLS service not registered |
| **Logo Designer** | Yes | **No independent picker** | Same as images — follows UI locale | Wordmark language tied to UI; no GLS picker |
| **Brand Designer** | Yes | **No independent picker** | Guidelines/copy follow UI locale | Independent language; GLS id exists (`brand-designer`) but unused in UI |
| **Content Studio** | Yes | **Yes** — GLS select | API receives `language`; translate action supported | — |
| **Marketing** | Yes (`useWorkspaceT`) | **Split:** Strategy tab = GLS; Assistant + `/api/marketing/actions` + `/api/marketing/campaigns` = **none**; `/api/marketing/generate` = UI locale only | Strategy tab only | Unify pipelines; picker on campaigns/assistant |
| **Social Media** | Yes | **Split:** Strategy tab = GLS; composer has no picker; `generate` defaults `language: "English"`; `actions.targetLanguage` exists but **UI never sends it** | Strategy tab only | Wire composer + translate action |
| **CRM** | Yes | **No** (no Strategy tab) | Assistant ignores language | Independent output; GLS flag is false in practice |
| **ERP** | Yes | **No** (no Strategy tab) | Same | Same as CRM |
| **AI Agents** | Partial | **No picker** | System prompt uses UI locale only | Independent language; not in GLS registry |
| **Business Manager** | Yes | **Split:** Strategy tab = GLS; `/api/business-manager/actions` = none | Strategy tab only | Assistant language |
| **BI** (`/dashboard/bi`) | Yes | **No** | Assistants ignore language | Independent language |
| **Business Suite** (`/dashboard/business-intelligence`) | Yes | **No** — `/api/business-suite` has no language field | Different product from BI; naming collision | Add GLS; rename one of the two “Business Intelligence” surfaces |
| **Cybersecurity** | Yes | **No** (no Strategy tab) | Assistants ignore language | Independent language |
| **Ideas / Reports / Market Analysis** | Yes (`useProductT`) | **No** — dedicated APIs use `resolveRequestLanguage(request)` with **no body override** | Mirrors UI locale only | Pass `language` from body; add GLS picker |
| **SEO analyze / AI Search analyze / AI Core runs** | Page chrome i18n | **No** | Analysis/enrichment ignores locale | Honor UI locale at minimum |
| **Feasibility / Creative / generic workspaces** | Yes | **Yes** via `WorkspaceGeneratorForm` → `/api/workspaces/[type]` | Yes | Form hardcodes `serviceId="content-studio"` for every workspace type |

### 3.1 GLS service registry vs reality

`GLS_SERVICE_REGISTRY` lists 10 services and claims **every AI product supports independent language**. Missing from the registry: Image Generator, Social Media, AI Agents, BI, Cyber, Business Manager, Ideas/Reports.

CRM and ERP are listed as `supportsIndependentLanguage: true` but have **no picker and no API language**.

### 3.2 Dual AI pipelines (Marketing, Social, Business Manager)

These products each have two disconnected generation paths:

| Path | Language |
|------|----------|
| Legacy **Strategy** tab → `WorkspaceTool` → `POST /api/workspaces/[type]` | Independent GLS picker |
| Native dashboard **Assistant / generate / campaigns / compose** | None or UI-locale only |

CRM, ERP, BI, and Cyber have **only** the native assistant path (Mechanism 3 — no language at all).

`WorkspaceGeneratorForm` always mounts `GlsGenerationLanguageSelect serviceId="content-studio"`, even when the workspace is marketing, social, or manager.

Visitor locales remain **not customer-usable**: no `.tsx` checkbox, `docs/platform-roadmap/FLAGS.md` still lists it under Advanced/flags, `REMAINING-WORK.md` says flags are not on by default (internal QA only).

---

## 4. Generated content — independent of UI language?

**Question:** Can users generate websites, apps, videos, images, logos, and content in any language independently from the platform UI language?

| Artifact | Independent of UI language? | Evidence |
|----------|----------------------------|----------|
| **Websites** | **Yes, with caveats** | GLS picker → `language` on generate/stream. Directives in `language-directive.ts`. Publish still forces `/w/{slug}` to English HTML when visitor locales are on. |
| **Landing pages** | **Yes** | Same GLS picker (`landing-builder`) |
| **Apps** | **Yes** | GLS picker (`app-builder`); published app URL has no locales |
| **Videos** | **Yes** (script/scenes) | `generationLanguage` posted to `/api/video-studio`. Captions/TTS language not a separate control. |
| **Images** | **No** | No picker; `resolveRequestLanguage(request)` only. Text-in-image follows UI locale. |
| **Logos** | **No** | Same pattern as images |
| **Brand kits** | **No** | Same pattern |
| **Content Studio** | **Yes** | Picker + API `language` / translate action |
| **Marketing / social copy** | **Partial** | Strategy tabs: yes. Campaigns, marketing assistant, social composer: no. `targetLanguage` on social actions is a dead API field. |

**“Any language”** is limited to the 30 GLS names (+ Bilingual for web/landing). Free-form languages are coerced to English.

**Website visitor multilingual** is **not user-operable in production**. The publish pipeline, `/w/{slug}/{locale}` route, hreflang tags, and LLM/phrase translation exist, but `visitorLocales` appears in **zero** dashboard `.tsx` files, is flag-gated, and is documented as internal-QA only. Without that setting, an Arabic site is a single-language site.

When visitor locales **are** enabled and content is non-English, publish **machine-translates the primary URL to English** and keeps source language on `/w/{slug}/{code}` (`resolveProductionPublishHtmlAsync`). That inverts the user’s generation language for the canonical URL.

**Serve vs publish (nuance):** `app/w/[slug]/route.ts` does **not** overwrite `lang` at request time — it preserves whatever was stored in `preview_html` (“never force en over Arabic”). The English force happens **at publish** (`applyHtmlLangAttribute(withCms, "en")` in `lib/website/public-site.server.ts`) when visitor locales are on. A single-language Arabic site with visitor locales off can still serve `lang="ar"` from baked HTML. Both `htmlLang.slice(0, 2)` at serve time and the 2-letter route param still collapse `zh-Hans` / `zh-Hant`.

---

## 5. Database

### 5.1 What exists

| Store | Purpose |
|-------|---------|
| `user_preferences.locale` | UI locale (`en`, `ar`, `zh-CN`, …). Migration 071. |
| `website_generations.language` | Generation language (human name, required) |
| `workspace_generations.language` | Default `'English'` |
| `landing_page_generations.language` | Default `'English'` (migration 014) |
| `webapp_generations.language` | Default `'English'` (migration 013) |
| `content_studio` language column | Default `'English'` (migration 019) |
| `social_media` posts `language` | Default `'English'` (migration 062) |
| Video domain `language` | Mixed defaults `'en'` vs human names (migrations 090, 094) |
| `website_leads.locale` | Lead locale (migration 047) |
| `website_publications.seo_json` | JSON blob may include `visitorLocaleHtml` + `visitorLocales` |

No Prisma models for i18n; schema is Supabase SQL.

**Drift:** consolidated `supabase/schema.sql` still defines `user_preferences` **without** `locale` (migration 006 only). Fresh DBs bootstrapped from `schema.sql` instead of replaying migrations miss the column. `POST /api/i18n/locale` already catches `42P01` / `PGRST205` and falls back to cookie-only — the app knows this can happen.

### 5.2 Missing for world-class i18n

- Translation-memory / professional TMS tables
- Per-locale content versions for sites, apps, videos (pages, metadata, captions)
- Locale constraint/check on `user_preferences.locale` (any string currently allowed)
- Consistent language encoding (`en` vs `English` vs `zh-Hans`)
- Index on generation `language` for analytics
- Organization-level default locale (only user preference)
- Audit log of locale changes

---

## 6. SEO

### 6.1 Marketing / SaaS site — working

- `createPageMetadata` / `SeoService.createMetadata` emit `alternates.languages` via `buildHreflangAlternates()` (`lib/seo/i18n.ts`) for all 30 locales + `x-default`.
- Public pages use `getServerTranslator()` so titles/descriptions follow the request locale (example: `app/pricing/page.tsx`).
- `/sitemap.xml` → `buildFullSitemap()` → `expandSitemapLocales()` duplicates every URL with `/{locale}` prefixes (lower priority).
- Root layout also sets hreflang for `/`.

### 6.2 Marketing / SaaS site — gaps

- **Canonical is always the unprefixed English path** even when serving `/ar/pricing`. Google’s current guidance is self-canonical + hreflang, not canonicalizing every locale to English.
- `og:locale` follows the request locale, but `rootMetadata()` Open Graph strings are English-only defaults.
- JSON-LD builders in `lib/seo/json-ld.ts` never set `inLanguage` — no structured-data language signal besides `<html lang>` and hreflang.
- Two different `buildHreflangAlternates()` functions exist: live one in `lib/seo/i18n.ts` (30 locales); unused GLS one in `lib/language-platform/seo/resolve.ts` (caps alternates at 10). Naming collision risk.
- GLS `resolveSeoLocalization()` **truncates alternate locales to 10** (`alternateLocales.slice(0, 10)`) — incomplete if used for customer sites.
- Sitemap expansion multiplies every URL by 30. For the 9 shallow locales that is **thin/duplicate English content** at `/ja/...`, `/ko/...`, `/fa/...`, etc. — indexation risk.
- No `app/[locale]` so crawlers depend entirely on `proxy.ts` rewrite + `x-tba-locale`. If the proxy matcher misses a path, hreflang URLs 404 or serve the wrong language.
- **Legal pages** (`components/marketing/marketing-legal-page.tsx` → `/privacy`, `/terms`) have **no translation hooks** — locale-prefixed URLs still serve English legal copy.
- Marketing locale variants are rendered **per request** (no static per-locale HTML / ISR). Prefix rewrite does force locale from the URL, independent of crawler `Accept-Language`.

### 6.3 Published customer websites — gaps (critical)

- hreflang `<link>` tags are injected **only when visitor locales are enabled**.
- `buildPublicSitemapXml` emits **hash URLs** (`/w/slug#about`) and **does not list `/w/slug/ar`**.
- Locale routes reject regional codes (`zh-CN`).
- `applyHtmlLangAttribute` slices lang to **two letters** — `zh-Hans` becomes `zh`.
- Primary URL language is forced to `en` at publish (`applyHtmlLangAttribute(withCms, "en")`).
- App and video public URLs have no hreflang, locale path, or sitemap expansion.

### 6.4 Robots

Published sites get `buildPublicRobotsTxt(publicUrl)` and a **single** `/w/{slug}/sitemap.xml` + `robots.txt` regardless of how many visitor locales exist. Platform `app/robots.ts` gates indexing to production and allow-lists AI crawlers. No locale-specific robots.

---

## 7. APIs

**Shared helper:** `resolveRequestLanguage(request, explicitLanguage?)` in `lib/i18n/api.ts` — prefers body/explicit language, else UI cookie/header.

### 7.1 Honor explicit generation language

| API | Explicit `language`? |
|-----|----------------------|
| `POST /api/website-builder` / `stream` | Yes (`resolveRequestLanguage(request, input.language)`) |
| `POST /api/landing-page-builder` | Yes |
| `POST /api/webapp-builder` | Yes |
| `POST /api/video-studio` | Yes |
| `POST /api/content-studio/stream` | Yes |
| `POST /api/social-media/generate` | Body field exists (default `"English"`); **composer never sends a picker value** |
| `POST /api/workspaces/[type]` | Yes (`language` from Strategy / workspace form) |
| `POST /api/i18n/locale` | Sets UI locale only |

### 7.2 Follow UI locale only (no independent body language)

| API | Behavior |
|-----|----------|
| `POST /api/image-generator` (+ stream) | `resolveRequestLanguage(request)` |
| `POST /api/logo-designer` | same |
| `POST /api/brand-identity` (+ stream) | same |
| `POST /api/ideas` | no body override |
| `POST /api/reports` | no body override |
| `POST /api/market-analysis` | no body override |
| `POST /api/marketing/generate` | `getRequestAiLanguage(request)` + prompt suffix |
| `POST /api/ai-agents` | `getRequestAiLanguage(request)` on system prompt |

### 7.3 No locale / language at all

`/api/crm/actions`, `/api/erp/actions`, `/api/bi/actions`, `/api/cyber/actions`, `/api/business-manager/actions`, `/api/marketing/actions`, `/api/marketing/campaigns`, `/api/business-suite`, `/api/seo/analyze`, `/api/ai-search/analyze`, `/api/ai-core/runs` — AI output is prompt-default (typically English) regardless of UI locale.

`/api/social-media/actions` accepts `targetLanguage` but dashboard panels never populate it.

Zod validation error messages on several generators are **hardcoded English** (e.g. image-generator `"Describe your image in at least 5 characters."`).

---

## 8. Working features (keep)

1. Central GLS package (`lib/language-platform`, spec 1.0.0) with world registry, direction, locale formatting, AI resolver, SEO helpers, bridges.
2. 30-locale JSON catalogs with merge fallback.
3. Language switcher on marketing, auth, and dashboard.
4. Persistence: cookie + localStorage + `user_preferences.locale`.
5. Marketing locale URLs via proxy rewrite + hreflang + sitemap expansion.
6. `html lang` + `dir` on the SaaS shell.
7. Independent generation language on Website, Landing, App, Video, Content Studio.
8. Website language directives + Arabic leak checks (`llm-language.ts`).
9. Bilingual (AR+EN) option for website/landing.
10. Published-site language switcher HTML + optional LLM/phrase translation pipeline.
11. `useFormatter` for dates/numbers/currency bound to UI locale.
12. Dashboard page titles mapped in `lib/i18n/dashboard-pages.ts`.
13. Official verification: `verify:i18n`, `verify:language-platform`, `test:language-platform`, `test:visitor-locale`.

---

## 9. Missing features — world-class multilingual AI platform

### Platform UI

- Finish the 9 shallow locales (or unship them until ≥98%).
- i18n all Video Studio create/editor and Website Builder Pro/skin panels.
- Load script-aware webfonts (Arabic, CJK, Indic, Thai, Cyrillic) instead of Geist latin-only.
- Wire GLS direction CSS variables into the live shell.
- Organization default locale; per-workspace locale.
- Language-aware search in help/docs.
- QA locale (pseudo-localization) in staging.
- ICU/MessageFormat plurals beyond `Intl.PluralRules` helpers (many strings are still English plural forms).

### Generation

- GLS picker on Image, Logo, Brand, Marketing, Social, Ideas/Reports (body `language` on every generate API).
- Independent language on CRM/ERP/BI/Cyber/Agents assistants.
- Register missing products in `GLS_SERVICE_REGISTRY` and make the flag match reality.
- Custom/unlisted language (or clear “not supported” UX) instead of silent English fallback.
- Separate controls: UI language ≠ content language ≠ caption/TTS language ≠ image-text language.
- Translation memory + glossary (brand names never translated).
- Human review workflow for published locale variants.

### Published websites / apps / videos

- Dashboard **Visitor languages** control (enable, pick locales, set primary).
- Primary URL should follow the **generation language**, not always English.
- Locale routes that accept `zh-CN` / `zh-TW` / BCP-47, not only `[a-z]{2}`.
- Per-locale HTML stored as first-class rows, not only `seo_json` blob.
- Sitemap + canonical + hreflang for every published locale URL.
- Locale routes for `/w/app/{slug}` and `/w/video/{slug}`.
- Phrase dictionary covering all 30 languages (today ~8 phrases × ~15 languages).
- Quality gate: reject publish if locale HTML is still English when target ≠ English.

### SEO / routing

- Self-canonical localized URLs on the marketing site.
- Do not cap hreflang alternates at 10.
- Ensure proxy + sitemap URLs always resolve.
- Localized Open Graph images / default titles.

### Data

- CHECK constraint on supported locales.
- Canonical language code column (`locale_code`) plus display name.
- Translation tables, jobs, and provider status.

---

## 10. Critical issues

| ID | Issue | Impact |
|----|--------|--------|
| C1 | 9 UI locales at 10–24% translation | Mixed-language product for JA/KO/FA/UR/zh-TW/etc. |
| C2 | Image / Logo / Brand / Marketing AI language = UI locale only | Cannot generate Arabic assets from an English dashboard (and vice versa) |
| C3 | Published `/w/{slug}/{locale}` rejects non-`[a-z]{2}` | Chinese (and any regional tag) broken |
| C4 | Primary published URL forced to English | Arabic-generated sites canonicalized to English |
| C5 | No visitor-locale UI in Website Builder | Multilingual publish is a hidden/API-only path |
| C6 | CRM/ERP/BI/Cyber assistants ignore locale | Core business products answer in English |
| C7 | Dashboard fonts latin-only | Unprofessional RTL/CJK UI |
| C8 | New Video Studio + WB Pro surfaces hardcoded English | Flagship editors look untranslated |
| C9 | `ideas`/`reports`/`market-analysis` APIs drop the form language | Workspace picker can be ignored |
| C10 | Customer sitemap omits locale URLs | Alternate pages may never get indexed |
| C11 | 23 keys missing from `en.json` (present elsewhere) | English UI shows raw keys in Image Generator editor and Template Marketplace |
| C12 | ~611 new WB keys missing from 28 locales | Visual Editor / Visual Skin / GLS language labels English-only outside `en`/`ar` |
| C13 | JSON-LD has no `inLanguage` | Structured data does not declare page language |
| C14 | Sitemap ×30 for 9 untranslated locales | Thin/duplicate `/ja`, `/ko`, `/fa` URLs indexed as unique language pages |
| C15 | `schema.sql` missing `user_preferences.locale` | Fresh bootstrap from baseline SQL has no UI locale column |
| C16 | Dual pipelines (Marketing / Social / BM) | Strategy tab is multilingual; the product users actually click is not |
| C17 | `/privacy` and `/terms` untranslated | Locale URLs claim a language the legal copy does not use |
| C18 | Visitor locales flag/UI off | Built publish i18n is not a customer feature today |

---

## 11. Recommended priority

### P0 — ship-blockers for “global product”

1. **Complete or hide shallow locales** (`fa`, `ur`, `ja`, `ko`, `ms`, `pl`, `sv`, `zh-TW`, `th`). Do not offer a language whose catalog is 10% translated. **Stop sitemap expansion** for locales below the depth gate.
2. **Add the 23 missing keys to `en.json`** (Image Generator editor toolbar + Template Marketplace). English currently leaks raw key paths.
3. **Pass `language` on every generate API** and add GLS pickers for Image, Logo, Brand, Marketing, Social, Ideas/Reports.
4. **Fix published locale URLs:** BCP-47 paths, no 2-letter collapse, sitemap + hreflang for all variants.
5. **Stop forcing English as the published primary** when the user generated in another language (or make primary selectable).
6. **i18n Video Studio create/editor and WB Pro/skin** (the 24 unaudited files) **and** copy the ~611 missing WB/GLS keys into every locale.

### P1 — required for a credible multilingual AI platform

7. Visitor-languages panel in Website Builder (enable, locales, default) and turn the capability on for production, not internal QA only.
8. Localize `/privacy` and `/terms`; regenerate `schema.sql` to include `user_preferences.locale`.
9. Collapse dual pipelines: native Marketing/Social/BM assistants must use the same GLS `language` as Strategy tabs.
10. CRM/ERP/BI/Cyber/Agents/Business Suite: honor UI locale at minimum; independent picker next.
11. Script-aware fonts + actually emit GLS direction CSS.
12. Align `GLS_SERVICE_REGISTRY` with real product behavior; stop hardcoding `serviceId="content-studio"` on every workspace form.
13. Marketing-site self-canonical localized URLs; lift the GLS 10-alternate cap; add `inLanguage` to JSON-LD; delete or rename the unused GLS `buildHreflangAlternates`.
14. Normalize DB language values (`en` vs `English`).
15. Expand phrase dictionary + empty static copy packs for all GLS languages.

### P2 — quality and operations

16. Translation memory, glossaries, and locale QA gates on website publish.
17. Organization default locale; invite emails localized.
18. Separate caption/TTS language in Video Studio.
19. Locale routes for published apps and videos.
20. Pseudo-locale + CI fail on missing keys (beyond depth script).
21. Professional TMS (or Crowdin/Lokalise) instead of JSON-only + DeepSeek batch scripts.

### P3 — world-class extras

22. Hebrew (if the market is in scope) — currently blocked by design.
23. Truly arbitrary generation languages with quality warnings.
24. In-context WYSIWYG translation editor for published pages.
25. Regional variants (`pt-BR` vs `pt-PT`, `en-GB`) as first-class locales.
26. Spoken-language / dialect controls for video and agents.
27. Automated linguistic QA (untranslated segments, mixed-script, RTL overflow).

---

## 12. Current status (one paragraph)

The platform has the **right architecture** for a global product: a single locale registry, a generation-language layer, RTL document direction, persistence, and hreflang on the marketing site. Flagship **builders can generate in 30 languages independently of the UI**. Production quality is uneven: **nine advertised UI languages are almost untranslated**, **English is missing 23 keys** (raw key leakage in Image Generator), several products still bind AI output to the UI locale, published multilingual SEO/URLs are incorrect for CJK and force English as the public primary at publish time, and newest Video Studio / Website Builder Pro UI is English-only. Closing P0 items is the difference between “i18n exists in the codebase” and “a world-class multilingual AI platform.”

---

*End of audit. No application code was modified.*
