import { WB_TEMPLATE_CATEGORIES } from "@/lib/website/template-engine/spec/constants";
import type {
  WbTemplateMarketplaceSortDirection,
  WbTemplateMarketplaceSortField,
} from "@/lib/website/template-marketplace/types";

/** Marketplace module version (independent from template-engine). */
export const WB_TEMPLATE_MARKETPLACE_VERSION = "1.0.0";

export const WB_TEMPLATE_MARKETPLACE_CATEGORIES = WB_TEMPLATE_CATEGORIES;

export const WB_TEMPLATE_MARKETPLACE_CATEGORY_DEFINITIONS: Array<{
  id: (typeof WB_TEMPLATE_CATEGORIES)[number];
  label: string;
  description: string;
}> = [
  { id: "business", label: "Business", description: "Corporate and professional layouts" },
  { id: "restaurant", label: "Restaurant", description: "Dining, menus, and reservations" },
  { id: "healthcare", label: "Healthcare", description: "Clinics and medical services" },
  { id: "real-estate", label: "Real Estate", description: "Listings and property showcases" },
  { id: "automotive", label: "Automotive", description: "Dealers and automotive services" },
  { id: "saas", label: "SaaS", description: "Product-led software landing pages" },
  { id: "ecommerce", label: "E-commerce", description: "Catalog and storefront layouts" },
  { id: "agency", label: "Agency", description: "Creative and marketing agencies" },
  { id: "portfolio", label: "Portfolio", description: "Personal and studio portfolios" },
  { id: "education", label: "Education", description: "Courses and learning platforms" },
  { id: "nonprofit", label: "Nonprofit", description: "Mission-driven organizations" },
  { id: "legal", label: "Legal", description: "Law firms and compliance sites" },
  { id: "travel", label: "Travel", description: "Tourism and hospitality" },
  { id: "blog", label: "Blog", description: "Editorial and publishing layouts" },
  { id: "landing", label: "Landing", description: "Focused conversion pages" },
  { id: "other", label: "Other", description: "General-purpose templates" },
];

export const WB_TEMPLATE_MARKETPLACE_SORT_FIELDS: WbTemplateMarketplaceSortField[] = [
  "name",
  "releasedAt",
  "featured",
  "category",
  "regionCount",
  "pageCount",
];

export const WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT: {
  field: WbTemplateMarketplaceSortField;
  direction: WbTemplateMarketplaceSortDirection;
} = {
  field: "featured",
  direction: "desc",
};
