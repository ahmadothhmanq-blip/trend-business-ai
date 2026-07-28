/**
 * Website Builder — professional feature catalog (Phase 5).
 * Links to WEBSITE_FEATURE_REGISTRY via registryFeatureId when applicable.
 */

import type { WebsiteFeatureId } from "@/lib/constants/website-builder";

export type ProfessionalFeature = {
  id: string;
  label: string;
  description: string;
  registryFeatureId?: WebsiteFeatureId;
  managementTab?: string;
  copilotCommand?: string;
};

export const PROFESSIONAL_FEATURES: ProfessionalFeature[] = [
  {
    id: "templates",
    label: "Templates",
    description: "Apply industry templates and layouts",
  },
  {
    id: "blog",
    label: "Blog & CMS",
    description: "Manage posts, categories, and content",
    registryFeatureId: "blog",
    managementTab: "cms",
  },
  {
    id: "forms",
    label: "Forms & leads",
    description: "Capture leads and contact submissions",
    registryFeatureId: "contact",
    managementTab: "leads",
  },
  {
    id: "booking",
    label: "Booking",
    description: "Add appointment booking flows",
    registryFeatureId: "booking",
    copilotCommand: "Add a booking section to the website",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Showcase projects and case studies",
    registryFeatureId: "portfolio",
    copilotCommand: "Add a portfolio gallery section",
  },
  {
    id: "pricing",
    label: "Pricing tables",
    description: "Display plans and packages",
    registryFeatureId: "pricing",
    copilotCommand: "Add a pricing table section",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Social proof and reviews",
    registryFeatureId: "testimonials",
    copilotCommand: "Add a testimonials section",
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Answer common customer questions",
    registryFeatureId: "faq",
    copilotCommand: "Add an FAQ section to the homepage",
  },
  {
    id: "navigation",
    label: "Navigation",
    description: "Edit header and footer links",
    managementTab: "navigation",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Contact forms and business details",
    managementTab: "brand",
  },
];
