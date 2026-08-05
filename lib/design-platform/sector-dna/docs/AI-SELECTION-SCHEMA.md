# AI Selection Schema

Schemas in `schema/ai-selection.ts` power automatic design resolution.

## Request (`tbdpAiSelectionRequestSchema`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sectorId` | `TbdpSectorId` | Yes | Target industry |
| `locale` | `string` | No | Locale hint (e.g. `ar-SA`) |
| `direction` | `ltr` \| `rtl` | No | Text direction |
| `goal` | `conversion` \| `trust` \| `engagement` \| `information` | No | Optimization goal |

## Result (`tbdpAiSelectionResultSchema`)

Returns resolved selections for:

- Layout ID
- Hero component
- Navigation component
- CTA component
- Motion presets
- Typography profile
- Spacing behavior
- Page flow order
- Primary button variant
- Card component

## Usage

```ts
import { selectSectorDesign } from "@/lib/design-platform/sector-dna";

const design = selectSectorDesign({
  sectorId: "saas",
  direction: "ltr",
  goal: "conversion",
});

console.log(design.selections.layoutId);       // "single-column"
console.log(design.selections.heroComponent);  // "hero-split"
console.log(design.selections.pageFlow);       // ["hero", "logos", "features", ...]
```

## Goal → Experience Profile Bias

| Goal | Profile |
|------|---------|
| `conversion` | corporate |
| `trust` | executive |
| `engagement` | playful |
| `information` | minimal |

If the biased profile is not in the sector's experience list, the first sector profile is used.
