# TBDP Phase 4 — Sector Design DNA Architecture

## Overview

The Sector Design DNA System is the **design intelligence layer** for Trend Business AI. It defines unique industry identities without being a template, theme, or runtime modification.

```
┌─────────────────────────────────────────────────────────────────┐
│                    TBDP Phase 4 — Sector DNA                     │
├─────────────────────────────────────────────────────────────────┤
│  sectors/          10 industry DNA profiles                    │
│  experience-profiles/  10 reusable experience personalities    │
│  ai/select.ts      Automatic layout/component/motion selection │
│  resolve.ts        Bridges DNA → Phase 1–3 configs               │
│  schema/           Metadata + AI selection Zod schemas         │
│  validation/       Runtime validation                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ references only (no modification)
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   Phase 1            Phase 2            Phase 3
   Foundations        Components         Experience
   (tokens)           (75 UI)            (motion, a11y, RTL)
```

## Isolation Boundary

Phase 4 does **not** modify:

- Website Builder (`lib/website/builder`)
- V2 Templates (`templates/website`, `lib/website/template-v2`)
- Runtime products
- Existing locked templates

## Sector DNA Dimensions

Each of the 10 sectors defines:

| Dimension | Purpose |
|-----------|---------|
| Brand personality | Voice and positioning |
| Visual personality | Aesthetic direction |
| Emotional tone | User feeling target |
| Design philosophy | Guiding principle |
| Target audience | Primary users |
| Typography profile | Phase 1 typography binding |
| Color strategy | Semantic token emphasis |
| Surface strategy | flat / layered / elevated / immersive |
| Spacing behavior | compact → editorial |
| Grid preference | Layout density |
| Component preference | Phase 2 component IDs |
| Hero strategy | Above-fold pattern |
| Navigation style | Nav pattern |
| CTA strategy | Conversion actions |
| Content hierarchy | Page information order |
| Card style | Card treatment |
| Image direction | Photography/imagery guidance |
| Icon style | outline / filled / duotone / minimal |
| Illustration style | Supporting visual language |
| Motion profile | Phase 3 motion preset IDs |
| Interaction profile | Phase 3 interaction IDs |
| Feedback profile | Phase 3 feedback states |
| Accessibility profile | Contrast + motion sensitivity |
| Responsive profile | Viewport + touch priority |
| RTL/LTR profile | Direction mirroring rules |
| SEO presentation | Structured content guidance |
| Conversion strategy | Funnel optimization |
| Trust-building strategy | Credibility signals |

## AI Selection Flow

```
Request (sectorId, locale?, direction?, goal?)
    → validateAiSelectionRequest()
    → getSectorDna(sectorId)
    → resolveExperienceProfile(goal bias)
    → selectSectorDesign()
    → TbdpAiSelectionResult (layout, hero, nav, CTA, motion, flow)
```

## Module Map

| Path | Role |
|------|------|
| `sectors/` | 10 complete DNA profiles |
| `experience-profiles/catalog.ts` | 10 experience personalities |
| `catalog.ts` | Sector catalog summary |
| `schema/metadata.ts` | Zod metadata schema |
| `schema/ai-selection.ts` | AI request/result schema |
| `ai/select.ts` | AI auto-selection resolver |
| `resolve.ts` | DNA → foundations + experience |
| `validation/validate.ts` | Runtime validation |

## Version

- Phase: `sector-dna-4`
- Version: `4.0.0`
