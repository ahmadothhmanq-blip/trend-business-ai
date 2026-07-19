/**
 * Website Management Platform — public exports.
 */

export type {
  ManagedPageDef,
  SiteStructurePlan,
  LinkValidationIssue,
  LinkValidationReport,
  CatalogItemType,
  CatalogItem,
  CmsEntry,
  BrandManagementState,
  PrePublishQualityReport,
  WebsiteAssistantResult,
} from "@/lib/ai-core/website-management/types";

export {
  resolveSiteStructure,
  listSiteStructureIndustries,
} from "@/lib/ai-core/website-management/pages/site-structure";

export { composeManagedSecondaryPages } from "@/lib/ai-core/website-management/pages/compose-pages";

export {
  wireNavAndFooterToRoutes,
  structureNavToContentLinks,
} from "@/lib/ai-core/website-management/pages/wire-nav";

export { validateWebsiteLinks } from "@/lib/ai-core/website-management/links/validate";

export {
  seedCatalogForIndustry,
  catalogToSiteDataFile,
  parseCatalogFromFiles,
  writeCatalogToFiles,
  upsertCatalogItem,
  deleteCatalogItem,
} from "@/lib/ai-core/website-management/catalog/engine";

export {
  listCmsEntries,
  upsertCmsEntry,
  deleteCmsEntry,
  listDueScheduledEntries,
} from "@/lib/ai-core/website-management/cms/store";

export { applyBrandManagement } from "@/lib/ai-core/website-management/brand/apply";

export { runWebsiteAssistant } from "@/lib/ai-core/website-management/assistant/engine";

export { runPrePublishQualityControl } from "@/lib/ai-core/website-management/quality/pre-publish";

import type { GeneratedProjectFile } from "@/lib/ai/types";
import { resolveSiteStructure } from "@/lib/ai-core/website-management/pages/site-structure";
import { composeManagedSecondaryPages } from "@/lib/ai-core/website-management/pages/compose-pages";
import { wireNavAndFooterToRoutes } from "@/lib/ai-core/website-management/pages/wire-nav";
import {
  seedCatalogForIndustry,
  catalogToSiteDataFile,
} from "@/lib/ai-core/website-management/catalog/engine";
import { validateWebsiteLinks } from "@/lib/ai-core/website-management/links/validate";
import { injectProfessionalComponents } from "@/lib/ai-core/components/inject";

const INDUSTRY_PAGE_COMPONENTS: Record<string, string[]> = {
  restaurant: [
    "MenuHighlights",
    "ReservationSection",
    "GalleryExperience",
    "FeatureStorytelling",
    "ContactSection",
    "MapsSection",
    "SiteHeader",
    "SiteFooter",
  ],
  automotive: [
    "VehicleShowcase",
    "VehicleComparison",
    "InventoryGrid",
    "VehicleDetail",
    "AppointmentCalendar",
    "BranchesMap",
    "ServicesModern",
    "ContactSection",
    "SiteHeader",
    "SiteFooter",
  ],
  "real-estate": [
    "PropertyListings",
    "FeatureStorytelling",
    "ServicesModern",
    "ContactSection",
    "SiteHeader",
    "SiteFooter",
  ],
  ecommerce: [
    "PropertyListings",
    "FeatureStorytelling",
    "ContactSection",
    "SiteHeader",
    "SiteFooter",
  ],
  saas: [
    "ServicesModern",
    "CaseStudies",
    "PricingModern",
    "FeatureStorytelling",
    "ContactSection",
    "ContactCta",
    "SiteHeader",
    "SiteFooter",
  ],
  business: [
    "ServicesModern",
    "CaseStudies",
    "FeatureStorytelling",
    "ContactSection",
    "ContactCta",
    "SiteHeader",
    "SiteFooter",
  ],
  agency: [
    "ServicesModern",
    "CaseStudies",
    "FeatureStorytelling",
    "ContactSection",
    "SiteHeader",
    "SiteFooter",
  ],
  tourism: [
    "ServicesModern",
    "GalleryExperience",
    "FeatureStorytelling",
    "ContactSection",
    "ContactCta",
    "SiteHeader",
    "SiteFooter",
  ],
};

/**
 * Full post-generation management apply: pages + nav + catalog + link check.
 */
export function applyWebsiteManagementToProject(params: {
  files: GeneratedProjectFile[];
  industryId?: string | null;
  brandName?: string;
  promptHint?: string | null;
}) {
  const structure = resolveSiteStructure(
    params.industryId,
    params.promptHint,
  );
  const brand = params.brandName || "Brand";
  let files = [...params.files];

  const componentIds =
    INDUSTRY_PAGE_COMPONENTS[structure.industryId] ||
    INDUSTRY_PAGE_COMPONENTS.business!;

  files = injectProfessionalComponents({
    files,
    componentIds,
    brandName: brand,
    composePage: false,
  });

  const secondary = composeManagedSecondaryPages({
    structure,
    brandName: brand,
  });
  for (const file of secondary) {
    if (
      files.some((f) => f.path === file.path) &&
      (file.path.startsWith("app/models") ||
        file.path.startsWith("app/inventory"))
    ) {
      continue;
    }
    files = [...files.filter((f) => f.path !== file.path), file];
  }

  files = wireNavAndFooterToRoutes(files, structure);

  const catalog = seedCatalogForIndustry(structure.industryId, brand);
  const catalogFile = catalogToSiteDataFile(catalog, structure.industryId);
  files = [...files.filter((f) => f.path !== catalogFile.path), catalogFile];

  const linkReport = validateWebsiteLinks({ files, structure });

  return { files, structure, catalog, linkReport };
}
