# AI Core Engine

**Status:** Phase 8 — SEO + Performance + Auto Quality  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018–D-027

---

## Pipeline

```
Business Idea
→ Strategy
→ Design System
→ Assets
→ Generation
→ Quality Check
→ SEO
→ Performance
→ Ready to Publish
```

Industry **Template** selection still runs at LayerRunner start (Phase 6). Existing product APIs remain unchanged.

---

## Phase 8 — SEO Engine

Package: `lib/ai-core/seo/`

Generates SEO metadata from **Strategy** (+ business profile):

| Output | Description |
|--------|-------------|
| Title / description | Truncated, brand + primary keyword |
| Keywords | From `seoFocus` + content SEO topics |
| Open Graph | title, description, type, siteName, locale |
| Structured data | Organization, WebSite, industry-aware schema |
| Sitemap | Paths/priorities from strategy sitemap + pages |

```ts
import { buildSeoPackageFromStrategy, checkSeoReadiness } from "@/lib/ai-core";

const seo = buildSeoPackageFromStrategy({ strategy, profile, language: "en" });
const readiness = checkSeoReadiness({ files, strategy, seoPackage: seo });
```

Website Builder injects `seo/site-seo.ts`, `seo/site-seo.json`, `public/sitemap.xml`, and structured-data snippets.

---

## Phase 8 — Performance Engine

Package: `lib/ai-core/performance/`

Automatic optimization checks:

- image optimization  
- asset size  
- loading performance  
- mobile responsiveness  
- Core Web Vitals preparation (LCP / CLS / INP signals)

```ts
import { runPerformanceChecks } from "@/lib/ai-core";

const report = runPerformanceChecks({ files, assetManifest });
// report.score, report.checks, report.recommendations
```

---

## Phase 8 — Auto Quality Engine

Package: `lib/ai-core/quality/`

Before publish, builds a **Quality Report** that validates:

- required sections  
- design consistency  
- SEO readiness  
- performance score  

```ts
import { buildAutoQualityReport, finalizeQualityForPublish } from "@/lib/ai-core";

const report = buildAutoQualityReport({
  baseReport,
  files,
  strategy,
  designSystem,
  seoPackage,
  performanceReport,
});
// report.score, report.publishReady, report.dimensions
```

LayerRunner refreshes the quality report after SEO + Performance so finalize sees publish readiness.

---

## Phase 7 — AI Design System

Package: `lib/ai-core/design-system/`

Builds design decisions from **Strategy** (+ optional industry template):

| Decision | Description |
|----------|-------------|
| Color palette | primary / secondary / accent / surfaces |
| Typography | heading + body fonts, type scale |
| Spacing system | unit, scale, section gap, container |
| UI style | density, corners, elevation, contrast |
| Component style | buttons, cards, inputs, navigation |
| Animation style | motion level, easing, entrances |

### Presets

`luxury` · `modern` · `corporate` · `minimal` · `creative`

`GET /api/ai-core/design-presets` lists presets.

---

## Phase 7 — AI Assets Engine

Package: `lib/ai-core/assets/`

Shared asset layer for realistic / hero / product / background / brand images.

**Provider:** OpenAI DALL·E 3 when `OPENAI_API_KEY` is set; SVG gradient fallback otherwise.

---

## Product registry & run API

Canonical products: `website-builder`, `app-builder`, `landing-page-builder`, `brand-designer`, `content-studio`, `video-studio`, `marketing-ai`.

| Method | Path |
|--------|------|
| `GET` | `/api/ai-core/products` |
| `GET` | `/api/ai-core/industries` |
| `GET` | `/api/ai-core/design-presets` |
| `POST` | `/api/ai-core/runs` |
| `GET` | `/api/ai-core/runs/[id]` |
| `POST` | `/api/ai-core/runs/[id]/continue` |

---

## Compatibility

- Product dashboards and legacy `/api/*` generators unchanged  
- Platform marketing SEO (`lib/seo`) remains separate from customer-project SEO Engine  
- Website plugin quality heuristics still run; Core Auto Quality wraps and extends them  
- Landing + Web App Core adapters enable SEO/Performance via LayerRunner defaults  
