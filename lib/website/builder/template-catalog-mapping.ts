import type { WebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";
import { resolveStructureTemplateIntelligenceId } from "@/lib/website/builder/template-package-ti-mapping";
import { resolveTemplateDisplayName } from "@/lib/website/builder/template-display-names";
/** Fallback Template Intelligence id when a package has no explicit mapping. */
export const BUILDER_DEFAULT_STRUCTURE_TEMPLATE_INTELLIGENCE_ID =
  "ti-corporate-trust";

type PackageManifestShape = {
  id: string;
  name: string;
  description: string;
  metadata: {
    category: string;
  };
  layouts: Array<{ id: string; kind: string }>;
  regions: Array<{ id: string }>;
};

export function mapPackageManifestToStructureTemplate(
  manifest: PackageManifestShape,
): WebsiteStructureTemplate {
  const defaultLayout =
    manifest.layouts.find((layout) => layout.id === "default") ??
    manifest.layouts[0];

  return {
    id: manifest.id,
    label: resolveTemplateDisplayName(manifest.id, manifest.name),    description: manifest.description,
    industry: manifest.metadata.category,
    layoutType: defaultLayout?.kind ?? "single-column",
    heroType: "region-based",
    navigationType: "header-region",
    footerType: "footer-region",
    sections: manifest.regions.map((region) => region.id),
    templateIntelligenceId: resolveStructureTemplateIntelligenceId(manifest.id),
    architectureVersion: "v2",
    marketplaceTemplateId: "",
    premiumTemplateId: manifest.id,
  };
}
