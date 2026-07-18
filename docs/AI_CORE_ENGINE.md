# AI Core Engine

**Status:** Phase 9 — One Prompt Experience + Service UX  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018–D-028

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

User-facing One Prompt progress simplifies this to:

**Idea → Strategy → Design → Assets → Generation → Quality → Ready Product**

Industry **Template** selection still runs at LayerRunner start (Phase 6). Existing product APIs remain unchanged.

---

## Phase 9 — One Prompt Experience

UX layer on top of AI Core (no generator rewrites):

| Surface | Package / path |
|---------|----------------|
| Progress stepper | `components/dashboard/one-prompt/` |
| Product configs / examples | `lib/constants/one-prompt-products.ts` |
| Marketing service pages | `OnePromptProductSection` on product landings |
| Dashboard AI Runs | `getDashboardHomeData` + `GET /api/ai-core/runs` |

Supported products: Website Builder, App Builder, Landing Page Builder, Video Studio, Brand Designer, Content Studio, Marketing AI.

---

## Phase 8 — SEO + Performance + Auto Quality

Packages: `lib/ai-core/seo/`, `lib/ai-core/performance/`, `lib/ai-core/quality/`

See Phase 8 sections in git history / D-027 for full details.

---

## Phase 7 — AI Design System + Assets

Packages: `lib/ai-core/design-system/`, `lib/ai-core/assets/`

Presets: `luxury` · `modern` · `corporate` · `minimal` · `creative`

`GET /api/ai-core/design-presets` lists presets.

---

## Product registry & run API

Canonical products: `website-builder`, `app-builder`, `landing-page-builder`, `brand-designer`, `content-studio`, `video-studio`, `marketing-ai`.

| Method | Path |
|--------|------|
| `GET` | `/api/ai-core/products` |
| `GET` | `/api/ai-core/industries` |
| `GET` | `/api/ai-core/design-presets` |
| `GET` | `/api/ai-core/runs` |
| `POST` | `/api/ai-core/runs` |
| `GET` | `/api/ai-core/runs/[id]` |
| `POST` | `/api/ai-core/runs/[id]/continue` |

---

## Compatibility

- Product dashboards and legacy `/api/*` generators unchanged  
- One Prompt UX wraps existing tools; LayerRunner still powers Core adapters  
- Platform marketing SEO (`lib/seo`) remains separate from customer-project SEO Engine  
