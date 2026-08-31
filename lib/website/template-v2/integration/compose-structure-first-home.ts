import type { GeneratedProjectFile } from "@/plugins/website/types";
import { injectProfessionalComponents } from "@/lib/ai-core/components";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import type { SectionShellVariant } from "@/lib/ai-core/components/scaffolds";
import type { WebsiteCapabilityService } from "@/lib/website/builder/capabilities/service";
import { resolveStructureFirstHomeComponents } from "@/lib/website/template-v2/integration/strategy-home-components";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

export function composeStructureFirstHomeFiles(params: {
  files: GeneratedProjectFile[];
  strategy: WebsiteStrategy;
  industryId?: string;
  brandName: string;
  productionContent: ProductionContentPack;
  language?: string | null;
  sectionShellVariant?: SectionShellVariant | null;
  componentPaths: string[];
  capabilityService?: WebsiteCapabilityService | null;
  compositionMode?: string;
}): GeneratedProjectFile[] {
  const homeComponentOrder = resolveStructureFirstHomeComponents({
    strategy: params.strategy,
    industryId: params.industryId,
    capabilityService: params.capabilityService,
    compositionMode: params.compositionMode,
  });

  return injectProfessionalComponents({
    files: params.files,
    componentPaths: params.componentPaths,
    homeComponentOrder: homeComponentOrder.map(String),
    brandName: params.brandName,
    pageTitle: params.productionContent.heroHeadline || params.brandName,
    pageDescription: params.productionContent.heroSubheadline,
    heroHeadline: params.productionContent.heroHeadline,
    heroSubheadline: params.productionContent.heroSubheadline,
    primaryCta: params.productionContent.primaryCta,
    secondaryCta: params.productionContent.secondaryCta,
    heroEyebrow: params.productionContent.heroEyebrow,
    content: params.productionContent,
    composePage: true,
    language: params.language,
    sectionShellVariant: params.sectionShellVariant,
    forceDesignRebuild: true,
  });
}
