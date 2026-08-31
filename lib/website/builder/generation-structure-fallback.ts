import type { WebsiteStructureTemplate } from "@/lib/website/contracts/structure";

/** Internal generation fallback — not listed in the user-facing template catalog. */
export const INTERNAL_GENERATION_STRUCTURE_FALLBACK: WebsiteStructureTemplate = {
  id: "_generation-default",
  label: "Default",
  description: "Internal generation fallback",
  industry: "business",
  layoutType: "corporate-trust",
  heroType: "split corporate hero",
  navigationType: "corporate topbar",
  footerType: "enterprise links",
  sections: [],
  templateIntelligenceId: "ti-corporate-trust",
  marketplaceTemplateId: "",
  premiumTemplateId: "luxury-business",
};
