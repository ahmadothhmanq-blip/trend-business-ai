/**
 * Website Builder — business feature catalog (Phase 6).
 * Links to WEBSITE_FEATURE_REGISTRY via registryFeatureId when applicable.
 */

import type { WebsiteFeatureId } from "@/lib/constants/website-builder";
import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";

export type BusinessFeature = {
  id: string;
  label: string;
  description: string;
  registryFeatureId?: WebsiteFeatureId;
  capabilityId?: WebsiteCapabilityId;
  requiresAnyCapability?: WebsiteCapabilityId[];
  alwaysVisible?: boolean;
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
    capabilityId: "analytics",
    workspaceTab: "analytics",
  },
  {
    id: "experiments",
    label: "A/B experiments",
    description: "Test headlines, CTAs, and layouts",
    requiresAnyCapability: ["analytics", "products", "forms"],
    workspaceTab: "experiments",
  },
  {
    id: "leads",
    label: "Lead collection",
    description: "Form submissions and CRM export",
    capabilityId: "forms",
    href: "management:leads",
  },
  {
    id: "ecommerce",
    label: "E-commerce catalog",
    description: "Products, services, and catalog management",
    registryFeatureId: "ecommerce",
    capabilityId: "products",
    href: "management:catalog",
  },
  {
    id: "membership",
    label: "Membership foundation",
    description: "Gated content and member areas (foundation)",
    registryFeatureId: "membership",
    capabilityId: "authentication",
    copilotCommand: "Add a members-only area section",
  },
  {
    id: "marketing",
    label: "Marketing tools",
    description: "Conversion tracking and campaign hooks",
    requiresAnyCapability: ["analytics", "newsletter", "forms"],
    workspaceTab: "analytics",
  },
  {
    id: "crm",
    label: "CRM integration",
    description: "Webhook and lead routing integrations",
    registryFeatureId: "crm",
    capabilityId: "forms",
    href: "management:leads",
  },
];
