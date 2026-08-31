import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import type { SiteImageStrategy } from "@/lib/website/site-plan/image-strategy";

export const SITE_PLAN_SPEC_VERSION = "1.0.0" as const;

/** Canonical site archetypes — drive sections, capabilities, and image hints. */
export type SiteArchetypeId =
  | "mobile-app-landing"
  | "ecommerce-dropshipping"
  | "electronics-retail"
  | "fashion-retail"
  | "restaurant-local"
  | "saas-b2b"
  | "real-estate"
  | "general-business";

export type SitePlanPage = {
  name: string;
  path: string;
  purpose?: string;
  sectionIds: string[];
};

export type SitePlanSection = {
  id: string;
  pagePath: string;
  name: string;
  goal?: string;
  contentNotes?: string;
};

export type SitePlanDerivationSource =
  | "archetype"
  | "strategy"
  | "workspace"
  | "merged";

/**
 * Unified site plan — single source of truth for structure (not visual skin).
 * Persisted on project when `WB_SITE_PLAN_V1=1`.
 */
export type SitePlan = {
  specVersion: typeof SITE_PLAN_SPEC_VERSION;
  archetypeId: SiteArchetypeId;
  industry?: string;
  language?: string;
  pages: SitePlanPage[];
  sections: SitePlanSection[];
  /** Prescriptive capabilities for this site (not post-hoc only). */
  capabilities: WebsiteCapabilityId[];
  imageStrategy: SiteImageStrategy;
  planHash: string;
  derivedFrom: SitePlanDerivationSource;
  createdAt: string;
  /** Visitor-facing locale routes when multi-language is enabled. */
  visitorLocales?: import("@/lib/website/site-plan/visitor-locales").VisitorLocaleConfig;
};

export type SitePlanInput = {
  archetypeId?: SiteArchetypeId;
  industry?: string;
  language?: string;
  prompt?: string;
  imageStrategy?: SiteImageStrategy;
};
