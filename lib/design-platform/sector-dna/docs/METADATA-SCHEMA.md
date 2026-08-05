# Metadata Schema

Zod schemas in `schema/metadata.ts` define the full Sector DNA structure.

## Sector DNA (`tbdpSectorDnaSchema`)

```ts
{
  id: TbdpSectorId,
  name: string,
  experienceProfiles: TbdpExperienceProfileId[],
  personality: { brand, visual, emotionalTone, philosophy, targetAudience },
  visual: { typographyProfile, colorStrategy, surfaceStrategy, spacingBehavior, ... },
  components: { preferredComponents, heroStrategy, navigationStyle, ctaStrategy, ... },
  experience: { motionProfile, interactionProfile, feedbackProfile, accessibilityProfile, ... },
  growth: { seoPresentation, conversionStrategy, trustBuilding },
  ai: { layoutIds, heroComponents, navComponents, ctaComponents, motionPresets, ... }
}
```

## Experience Profile (`tbdpExperienceProfileDefinitionSchema`)

```ts
{
  id: TbdpExperienceProfileId,
  label: string,
  description: string,
  motionBias: string[],
  interactionBias: string[],
  typographyBias: string,
  spacingBias: "compact" | "balanced" | "generous" | "editorial",
  colorBias: "warm" | "cool" | "neutral" | "bold" | "clinical"
}
```

## Validation

```ts
import { validateSectorDna, assertSectorDnaCatalog } from "@/lib/design-platform/sector-dna";

const result = validateSectorDna(profile);
assertSectorDnaCatalog(TBDP_SECTOR_DNA_CATALOG);
```
