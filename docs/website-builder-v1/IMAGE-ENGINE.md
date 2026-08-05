# Image Engine

The Image Engine decouples images from V2 templates. Templates reference semantic slots; the engine fills slots from industry profiles and user overrides.

## Architecture

```
Master Plan / Generation Input
        │
        ▼
runAiImageEngine (engine.ts)
        │
        ├── enrichManifestWithProfileSlots (profile-engine.ts)
        ├── validateAssetManifest / assertPublishableAssets
        └── injectAiImagesIntoProject (inject.ts)
                │
                ▼
        lib/site-images.ts (emitted per project)
                │
                ▼
        resolveSlotImage("hero") in template components
```

## Semantic slots

Defined in `lib/ai-core/image-engine/slots.ts`:

| Slot | Typical use |
|------|-------------|
| `hero` | Primary above-fold image |
| `gallery` | Image grid / carousel |
| `about` | About section portrait |
| `features` | Feature illustrations |
| `team` | Team member photos |
| `products` | Product / listing shots |
| `testimonials` | Client / patient portraits |
| `backgrounds` | Ambient section backgrounds |

## Industry profiles

17 industry profiles in `lib/ai-core/image-engine/profiles/data.ts` define:

- Default Unsplash/Pexels search terms per slot
- Slot priority and deduplication rules
- Industry-specific validation constraints

`profile-engine.ts` detects industry from project metadata and fills missing slots without duplicating URLs.

## Validation

| Stage | Module | When |
|-------|--------|------|
| Manifest validation | `slot-validator.ts` | After AI generation |
| Pre-render repair | `lib/website/image-management/validate-before-render.ts` | Before preview/export |
| Publish gate | `assertPublishableAssets` | Before publish |

Validation checks: duplicate URLs, missing hero, wrong aspect ratios, industry mismatch.

## User image management

`lib/website/image-management/` provides:

- `service.ts` — CRUD operations on project images
- `operations.ts` — replace, upload, AI generate, crop, restore
- `list-slots.ts` — enumerate slots for media manager UI
- `validate-before-render.ts` — industry validation gate

Dashboard UI: `components/dashboard/website-builder/site-image-manager-panel.tsx`

API: `app/api/website-builder/[id]/site-images/route.ts`

## Template integration

Templates must use slot API — never hardcode image URLs:

```tsx
import { resolveSlotImage, HERO_IMAGE } from "@/lib/site-images";

// In component
<img src={resolveSlotImage("hero", HERO_IMAGE)} alt="..." />
```

Legacy `template-images.ts` is deprecated; all flagships migrated to `resolveSlotImage()`.

## Optimization

`lib/ai-core/image-engine/optimize.ts` provides WebP/AVIF conversion hints, responsive `srcset`, and lazy-loading attributes for export.

## Frozen modules (v1)

See `FROZEN_IMAGE_ENGINE_MODULES` in `lib/website/v1-baseline/manifest.ts`.

## Industry Image Rules Engine

The Rules Engine (`lib/ai-core/image-engine/rules/`) enforces industry-correct imagery on every generated website.

### Supported industries (18)

Fashion, Gaming, Restaurant, Medical, Hotel, Real Estate, Finance, Education, E-commerce, SaaS, Corporate, Automotive, Beauty, Fitness, Law, Construction, Travel, Creative Agency.

### Slot rules per industry

Each industry defines rules for: `hero`, `about`, `gallery`, `team`, `products`, `features`, `testimonials`, `backgrounds`, `cta`.

### Detection (before selection)

`detectImageContext()` resolves:
- Business industry (from routing ID, aliases, keywords)
- Subcategory (from profile subcategories)
- Visual style (from brand style or profile default)

### Validation (auto-reject + replace)

Rejected automatically when:
- Wrong industry (cross-industry URL registry)
- Wrong subcategory
- Duplicate URL
- Low quality / placeholder
- Wrong orientation
- Wrong section assignment
- Forbidden subject for industry

### Priority order

```
User Upload  →  AI Generated  →  Industry Image Library  →  Stock Images
```

Use `resolveSlotImageSource()` for tier resolution.

### Validation report

`runIndustryImageRulesEngine()` returns:

```typescript
{
  passed: boolean;
  detected: { industryId, subcategory, visualStyle, ... };
  profileId: string;
  selected: ImageSelectionRecord[];
  rejected: ImageRejectionRecord[];
  replaced: number;
  sourceCounts: { user, ai, library, stock };
  summary: string;
}
```

### API

```bash
npx tsx --test lib/ai-core/image-engine/rules/rules-engine.test.ts
```

```typescript
import { runIndustryImageRulesEngine, detectImageContext } from "@/lib/ai-core/image-engine/rules";
```

