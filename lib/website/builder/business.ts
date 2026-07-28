/**
 * Website Builder — business feature catalog (Phase 6).
 * Links to WEBSITE_FEATURE_REGISTRY via registryFeatureId when applicable.
 */

import type { WebsiteFeatureId } from "@/lib/constants/website-builder";

export type BusinessFeature = {
  id: string;
  label: string;
  description: string;
  registryFeatureId?: WebsiteFeatureId;
  workspaceTab?: "analytics" | "experiments" | "deploy";
  href?: string;
  copilotCommand?: string;
};

export const BUSINESS_FEATURES: BusinessFeature[] = [
  {
    id: "analytics",
    label: "Analytics",
    description: "Traffic, engagement, and conversion metrics",
    registryFeatureId: "analytics",
    workspaceTab: "analytics",
  },
  {
    id: "experiments",
    label: "A/B experiments",
    description: "Test headlines, CTAs, and layouts",
    workspaceTab: "experiments",
  },
  {
    id: "leads",
    label: "Lead collection",
    description: "Form submissions and CRM export",
    href: "management:leads",
  },
  {
    id: "ecommerce",
    label: "E-commerce catalog",
    description: "Products, services, and catalog management",
    registryFeatureId: "ecommerce",
    href: "management:catalog",
  },
  {
    id: "membership",
    label: "Membership foundation",
    description: "Gated content and member areas (foundation)",
    registryFeatureId: "membership",
    copilotCommand: "Add a members-only area section",
  },
  {
    id: "marketing",
    label: "Marketing tools",
    description: "Conversion tracking and campaign hooks",
    workspaceTab: "analytics",
  },
  {
    id: "crm",
    label: "CRM integration",
    description: "Webhook and lead routing integrations",
    registryFeatureId: "crm",
    href: "management:leads",
  },
];
