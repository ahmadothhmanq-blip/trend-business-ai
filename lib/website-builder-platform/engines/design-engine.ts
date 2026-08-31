/**
 * Design Engine — template loading, blueprint, tokens, layout, motion.
 */

import { loadTemplateV2Package } from "@/lib/website/template-v2/loader/load-v2-package";
import { hashPresentationProfile } from "@/lib/website/template-v2/loader/presentation-hash";
import { resolveProductionBlueprint } from "@/lib/website/template-v2/integration/production-pipeline";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteBusinessPack } from "@/lib/website-builder-platform/contracts/business-layer";
import type {
  DesignLayerInput,
  WebsiteDesignPack,
} from "@/lib/website-builder-platform/contracts/design-layer";
import { DESIGN_LAYER_VERSION } from "@/lib/website-builder-platform/contracts/design-layer";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import path from "node:path";

export type RunDesignEngineParams = DesignLayerInput & {
  business: WebsiteBusinessPack;
  project: GeneratedWebsiteProject;
  onProgress?: (message: string) => void;
};

export async function runDesignEngine(
  params: RunDesignEngineParams,
): Promise<WebsiteDesignPack> {
  const templatePackageId = params.templatePackageId.trim();
  const packageDirectory = path.join(resolveWbTemplatesRoot(), templatePackageId);

  params.onProgress?.(
    `[design-engine] Loading template package · ${templatePackageId}`,
  );

  const loaded = await loadTemplateV2Package(packageDirectory, {
    language: params.language,
  });

  if (!loaded.ok) {
    throw new Error(loaded.error);
  }

  const bundle = loaded.bundle;
  const presentationHash = hashPresentationProfile(bundle.presentation);

  params.onProgress?.("[design-engine] Running blueprint + design director…");
  const production = resolveProductionBlueprint({
    project: params.project,
    templatePackageId,
    language: params.language,
    seed: params.seed ?? params.business.projectSeed,
  });

  const blueprint = production?.optimizedBlueprint ?? null;
  const designSystem = params.project.designSystem;
  const layoutId = bundle.presentation.layout.defaultLayoutId ?? "region-grid";

  const theme = {
    id: layoutId,
    paletteId: blueprint?.colorPalette?.presetId ?? "default",
    typographyId: blueprint?.typographyProfile?.presetId ?? "default",
    motionPreset: bundle.motion.preset ?? "subtle",
    layoutId,
    spacingScale: "default",
    borderRadius: "default",
  };

  const components = bundle.componentRegistry.components.map((c) => ({
    id: c.id,
    role: c.role,
    region: "main",
    variantId: undefined,
  }));

  return {
    version: DESIGN_LAYER_VERSION,
    templatePackageId,
    bundle,
    blueprint,
    designSystem,
    theme,
    components,
    presentationHash,
  };
}
