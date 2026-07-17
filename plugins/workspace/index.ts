import { createWorkspaceDefinition } from "@/plugins/workspace/create-definition";
import {
  auditPlugin,
  brandPlugin,
  businessPlugin,
  contentPlugin,
  creativePlugin,
  managerPlugin,
  marketingPlugin,
  socialPlugin,
} from "@/plugins/workspace/plugins";
import type { WorkspaceDefinition } from "@/lib/workspace/definition";
import type { WorkspaceType } from "@/lib/workspace/types";

export const brandWorkspace = createWorkspaceDefinition({
  type: "brand",
  configKey: "brandDesigner",
  dashboardHref: "/dashboard/brand-studio",
  label: "Brand Designer",
  plugin: brandPlugin,
});

export const creativeWorkspace = createWorkspaceDefinition({
  type: "creative",
  configKey: "creativeStudio",
  dashboardHref: "/dashboard/image-generator",
  label: "Creative Studio",
  plugin: creativePlugin,
});

export const contentWorkspace = createWorkspaceDefinition({
  type: "content",
  configKey: "contentStudio",
  dashboardHref: "/dashboard/content-studio",
  label: "Content Studio",
  plugin: contentPlugin,
});

export const businessWorkspace = createWorkspaceDefinition({
  type: "business",
  configKey: "businessIntelligence",
  dashboardHref: "/dashboard/business-intelligence",
  label: "Business Intelligence",
  plugin: businessPlugin,
});

export const managerWorkspace = createWorkspaceDefinition({
  type: "manager",
  configKey: "businessManager",
  dashboardHref: "/dashboard/business-intelligence",
  label: "Business Manager",
  plugin: managerPlugin,
});

export const marketingWorkspace = createWorkspaceDefinition({
  type: "marketing",
  configKey: "marketing",
  dashboardHref: "/dashboard/marketing",
  label: "Marketing",
  plugin: marketingPlugin,
});

export const socialWorkspace = createWorkspaceDefinition({
  type: "social",
  configKey: "socialMedia",
  dashboardHref: "/dashboard/social-media",
  label: "Social Media",
  plugin: socialPlugin,
});

export const auditWorkspace = createWorkspaceDefinition({
  type: "audit",
  configKey: "businessAudit",
  dashboardHref: "/dashboard/feasibility-study",
  label: "Business Audit",
  plugin: auditPlugin,
});

export const workspaceDefinitions: Record<WorkspaceType, WorkspaceDefinition> = {
  brand: brandWorkspace,
  creative: creativeWorkspace,
  content: contentWorkspace,
  business: businessWorkspace,
  manager: managerWorkspace,
  marketing: marketingWorkspace,
  social: socialWorkspace,
  audit: auditWorkspace,
};

export function getWorkspaceDefinitionByType(type: WorkspaceType) {
  return workspaceDefinitions[type];
}

export * from "@/plugins/workspace/plugins";
