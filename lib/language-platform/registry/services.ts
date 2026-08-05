import type { GlsServiceId } from "@/lib/language-platform/core/types";

export type GlsServiceDefinition = {
  id: GlsServiceId;
  label: string;
  description: string;
  supportsIndependentLanguage: boolean;
  defaultLanguage: string;
  layers: Array<"platform" | "generation" | "website" | "template" | "content">;
};

/** Every AI product supports independent language selection. */
export const GLS_SERVICE_REGISTRY: readonly GlsServiceDefinition[] = [
  {
    id: "website-builder",
    label: "Website Builder",
    description: "Website generation, templates, preview, export",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "generation", "website", "template", "content"],
  },
  {
    id: "app-builder",
    label: "App Builder",
    description: "Mobile and web app generation",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "generation", "content"],
  },
  {
    id: "landing-builder",
    label: "Landing Builder",
    description: "Landing page generation",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "generation", "website", "content"],
  },
  {
    id: "video-studio",
    label: "Video Studio",
    description: "Video script and scene generation",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "generation", "content"],
  },
  {
    id: "content-studio",
    label: "Content Studio",
    description: "Marketing and editorial content",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "generation", "content"],
  },
  {
    id: "brand-designer",
    label: "Brand Designer",
    description: "Brand identity and guidelines",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "generation", "content"],
  },
  {
    id: "logo-designer",
    label: "Logo Designer",
    description: "Logo concept generation",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "generation"],
  },
  {
    id: "marketing-ai",
    label: "Marketing AI",
    description: "Campaigns, ads, and copy",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "generation", "content"],
  },
  {
    id: "crm",
    label: "CRM",
    description: "Customer relationship management",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "content"],
  },
  {
    id: "erp",
    label: "ERP",
    description: "Enterprise resource planning",
    supportsIndependentLanguage: true,
    defaultLanguage: "English",
    layers: ["platform", "content"],
  },
] as const;

export function getGlsServiceDefinition(
  serviceId: GlsServiceId,
): GlsServiceDefinition | undefined {
  return GLS_SERVICE_REGISTRY.find((s) => s.id === serviceId);
}
