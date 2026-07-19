/**
 * Design Platform families & verticals (Phase 2 taxonomy).
 */

import type {
  DesignPlatformFamily,
  DesignPlatformVertical,
} from "@/lib/ai-core/website-design-platform/types";

export const DESIGN_PLATFORM_TAXONOMY: Record<
  DesignPlatformFamily,
  DesignPlatformVertical[]
> = {
  Luxury: ["Automotive", "Real Estate", "Luxury Brands"],
  Technology: ["AI Companies", "SaaS", "Software"],
  Business: ["Corporate", "Consulting", "Finance"],
  Creative: ["Agency", "Portfolio"],
  Hospitality: ["Restaurant", "Hotel", "Travel"],
  Commerce: ["Ecommerce", "Product Brands"],
};

export function mapIndustryToVertical(
  industry: string,
  prompt = "",
): { family: DesignPlatformFamily; vertical: DesignPlatformVertical } {
  const i = industry.toLowerCase();
  const p = prompt.toLowerCase();

  if (
    i.includes("auto") ||
    /car|vehicle|dealership|showroom/.test(p)
  ) {
    return { family: "Luxury", vertical: "Automotive" };
  }
  if (i.includes("real") || /property|realtor|listing/.test(p)) {
    return { family: "Luxury", vertical: "Real Estate" };
  }
  if (/luxury brand|haute|jeweller|watch/.test(p)) {
    return { family: "Luxury", vertical: "Luxury Brands" };
  }
  if (i === "saas" || /saas|subscription platform/.test(p)) {
    return { family: "Technology", vertical: "SaaS" };
  }
  if (/ai company|artificial intelligence|machine learning/.test(p)) {
    return { family: "Technology", vertical: "AI Companies" };
  }
  if (i.includes("soft") || /software|developer tool|tech company/.test(p)) {
    return { family: "Technology", vertical: "Software" };
  }
  if (/consult|advisory/.test(p)) {
    return { family: "Business", vertical: "Consulting" };
  }
  if (/finance|bank|wealth|invest/.test(p)) {
    return { family: "Business", vertical: "Finance" };
  }
  if (i.includes("agency") || /agency|studio|creative shop/.test(p)) {
    return { family: "Creative", vertical: "Agency" };
  }
  if (/portfolio|freelancer|designer showcase/.test(p)) {
    return { family: "Creative", vertical: "Portfolio" };
  }
  if (i.includes("restaurant") || /restaurant|dining|bistro|cafe/.test(p)) {
    return { family: "Hospitality", vertical: "Restaurant" };
  }
  if (/hotel|resort|boutique stay/.test(p)) {
    return { family: "Hospitality", vertical: "Hotel" };
  }
  if (i.includes("tourism") || /travel|tour|destination/.test(p)) {
    return { family: "Hospitality", vertical: "Travel" };
  }
  if (i.includes("ecom") || /ecommerce|online store|shopify/.test(p)) {
    return { family: "Commerce", vertical: "Ecommerce" };
  }
  if (/product brand|dtc|consumer brand/.test(p)) {
    return { family: "Commerce", vertical: "Product Brands" };
  }
  if (i.includes("business") || /corporate|enterprise/.test(p)) {
    return { family: "Business", vertical: "Corporate" };
  }

  return { family: "Business", vertical: "Corporate" };
}
