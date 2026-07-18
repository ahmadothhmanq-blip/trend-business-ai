# AI Core Engine

**Status:** Phase 7 — AI Design System + AI Assets Engine  
**Scope:** Shared layer pipeline for all Trend Business AI products  
**Related:** D-018–D-026

---

## Pipeline

```
Business Idea
→ Strategy
→ Design System
→ Assets
→ Generation
→ Quality Check
→ Final Product
```

Industry **Template** selection still runs at LayerRunner start (Phase 6). Existing product APIs remain unchanged.

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

```ts
import { buildAiDesignSystemFromStrategy } from "@/lib/ai-core";

const design = buildAiDesignSystemFromStrategy({
  strategy,
  profile,
  preferredPreset: "luxury",
  templateSelection,
});
```

Website Builder merges this foundation with its existing design-engine AI output.

`GET /api/ai-core/design-presets` lists presets.

---

## Phase 7 — AI Assets Engine

Package: `lib/ai-core/assets/`

Shared asset layer for:

- realistic images  
- hero images  
- product images  
- backgrounds  
- brand assets  

**Provider:** OpenAI DALL·E 3 when `OPENAI_API_KEY` is set; SVG gradient fallback otherwise. Website Builder reuses `website-assets` upload storage.

```ts
import { planCoreAssets, generateCoreAssets } from "@/lib/ai-core";

const items = planCoreAssets({ strategy, designSystem, profile });
const manifest = await generateCoreAssets({
  items,
  colors: designSystem.colors,
  upload: /* optional */,
});
```

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
- Website plugin `generateWebsiteAssets` still available for non-Core paths  
- Core Website adapter uses Design System + Assets Engine foundations  
