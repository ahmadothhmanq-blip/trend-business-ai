export {
  SITE_ARCHETYPE_REGISTRY,
  getSiteArchetypeDefinition,
  suggestCapabilitiesForArchetype,
  type SiteArchetypeDefinition,
} from "@/lib/website/site-plan/archetypes";
export { detectSiteArchetypeFromText } from "@/lib/website/site-plan/detect-archetype";
export {
  resolveImageRoutingFromContext,
  type ImageRoutingContext,
} from "@/lib/website/site-plan/resolve-image-routing";
export {
  attachSitePlanToProject,
  deriveSitePlan,
  type DeriveSitePlanParams,
} from "@/lib/website/site-plan/derive";
export { computeSitePlanHash, hashSitePlanParts } from "@/lib/website/site-plan/hash";
export {
  DEFAULT_SITE_IMAGE_STRATEGY,
  resolveSiteImageStrategy,
  siteImageStrategyUsesGeneration,
  type SiteImageStrategy,
  type SiteImageStrategyMode,
} from "@/lib/website/site-plan/image-strategy";
export {
  SITE_PLAN_SPEC_VERSION,
  type SiteArchetypeId,
  type SitePlan,
  type SitePlanInput,
  type SitePlanPage,
  type SitePlanSection,
  type SitePlanDerivationSource,
} from "@/lib/website/site-plan/types";
