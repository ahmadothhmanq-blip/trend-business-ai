import { getSiteArchetypeDefinition } from "@/lib/website/site-plan/archetypes";

import type { SiteArchetypeId } from "@/lib/website/site-plan/types";

import { resolveWebsiteIndustry } from "@/lib/website/industry/industry-resolver";



/** SitePlan archetype → forbidden image subjects per archetype. */

const ARCHETYPE_FORBIDDEN_IMAGE_SUBJECTS: Partial<

  Record<SiteArchetypeId, string[]>

> = {

  "electronics-retail": [

    "cars",

    "automotive",

    "restaurant food",

    "real estate property",

    "fashion clothing",

    "generic office",

  ],

  "fashion-retail": [

    "cars",

    "automotive",

    "smartphones",

    "mobile phones",

    "restaurant food",

    "real estate property",

    "construction",

    "hospital medical",

    "software dashboard",

  ],

  "restaurant-local": [

    "software dashboard",

    "cars",

    "automotive",

    "fashion runway",

    "real estate property",

  ],

  "real-estate": ["restaurant food", "fashion runway", "mobile app screenshot"],

  "saas-b2b": ["restaurant food", "fashion runway", "cars", "automotive"],

  "mobile-app-landing": ["cars", "automotive", "restaurant food"],

};



export function getArchetypeForbiddenImageSubjects(

  archetypeId: SiteArchetypeId,

): string[] {

  return [...(ARCHETYPE_FORBIDDEN_IMAGE_SUBJECTS[archetypeId] ?? [])];

}



export type ImageRoutingContext = {

  archetypeId: SiteArchetypeId;

  routingIndustryId: string;

  industryLabel: string;

  imageHints: string[];

};



/** Resolve archetype + stock routing for image generation / injection. */

export function resolveImageRoutingFromContext(params: {

  prompt?: string | null;

  title?: string | null;

  description?: string | null;

  industryId?: string | null;

  businessIndustry?: string | null;

  sitePlanArchetype?: string | null;

  archetypeId?: SiteArchetypeId | null;

}): ImageRoutingContext {

  const resolved = resolveWebsiteIndustry(params);

  return {

    archetypeId: resolved.archetypeId,

    routingIndustryId: resolved.industryId,

    industryLabel: resolved.industryLabel,

    imageHints: resolved.imageHints,

  };

}



export { detectStockIndustryFromHaystack } from "@/lib/website/industry/industry-resolver";


