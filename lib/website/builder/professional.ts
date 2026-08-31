/**
 * Website Builder — professional feature catalog (Phase 5).
 * Links to WEBSITE_FEATURE_REGISTRY via registryFeatureId when applicable.
 */

import type { WebsiteFeatureId } from "@/lib/constants/website-builder";
import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";

export type ProfessionalFeature = {
  id: string;
  label: string;
  description: string;
  registryFeatureId?: WebsiteFeatureId;
  capabilityId?: WebsiteCapabilityId;
  requiresAnyCapability?: WebsiteCapabilityId[];
  alwaysVisible?: boolean;
  managementTab?: string;
  copilotCommand?: string;
};

export const PROFESSIONAL_FEATURES: ProfessionalFeature[] = [
  {
    id: "templates",
    label: "Design templates",
    description: "Change colors, typography, and visual style only",
    alwaysVisible: true,
  },
  {
    id: "blog",
    label: "Blog & CMS",
    description: "Manage posts, categories, and content",
    registryFeatureId: "blog",
    capabilityId: "blog",
    managementTab: "cms",
  },
  {
    id: "forms",
    label: "Forms & leads",
    description: "Capture leads and contact submissions",
    registryFeatureId: "contact",
    capabilityId: "forms",
    managementTab: "leads",
  },
  {
    id: "booking",
    label: "Booking",
    description: "Add appointment booking flows",
    registryFeatureId: "booking",
    capabilityId: "booking",
    managementTab: "booking",
    copilotCommand: "Add a booking section to the website",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Showcase projects and case studies",
    registryFeatureId: "portfolio",
    capabilityId: "portfolio",
    copilotCommand: "Add a portfolio gallery section",
  },
  {
    id: "pricing",
    label: "Pricing tables",
    description: "Display plans and packages",
    registryFeatureId: "pricing",
    capabilityId: "pricing",
    copilotCommand: "Add a pricing table section",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Social proof and reviews",
    registryFeatureId: "testimonials",
    capabilityId: "testimonials",
    copilotCommand: "Add a testimonials section",
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Answer common customer questions",
    registryFeatureId: "faq",
    capabilityId: "faq",
    copilotCommand: "Add an FAQ section to the homepage",
  },
  {
    id: "navigation",
    label: "Navigation",
    description: "Edit header and footer links",
    alwaysVisible: true,
    managementTab: "navigation",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Contact forms and business details",
    capabilityId: "forms",
    managementTab: "brand",
  },
];
