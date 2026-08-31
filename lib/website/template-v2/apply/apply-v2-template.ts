import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import type { RethemeResult } from "@/lib/ai-core/template-intelligence/apply";
import {
  applyBusinessIdentityToProject,
  extractBusinessIdentity,
  patchDesignSystemVisualOnly,
} from "@/lib/ai-core/template-intelligence/business-identity";
import {
  resolveLocaleFromLanguage,
  applyLocaleToWebsiteFiles,
} from "@/lib/ai-core/website-design-platform/i18n";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import {
  WB_DESIGN_DIRECTOR_REPORT_SETTING,
  WB_TEMPLATE_ARCHITECTURE_VERSION_SETTING,
  WB_TEMPLATE_COMPOSER_ID_SETTING,
  WB_TEMPLATE_PRESENTATION_HASH_SETTING,
  WB_WEBSITE_BLUEPRINT_SETTING,
} from "@/lib/website/template-v2/constants";
import {
  WB_PRODUCTION_INTEGRATION_VERSION_SETTING,
} from "@/lib/website/template-v2/integration/constants";
import { resolveProductionBlueprint } from "@/lib/website/template-v2/integration/production-pipeline";
import { injectV2TemplatePipeline } from "@/lib/website/template-v2/inject/inject-v2-pipeline";
import { refreshCapabilities } from "@/lib/website/builder/capabilities";
import { seedFeaturesFromCapabilityManifest } from "@/lib/website/builder/capabilities/seed-from-manifest";
import { applyFinalImageInjectionToProject } from "@/lib/ai-core/image-engine/inject";
import { createCapabilityService } from "@/lib/website/builder/capabilities/service";
import { isStructureFirstEnabled } from "@/lib/website/generation-flags";
import {
  assertStructurePreserved,
  captureStructureSnapshot,
} from "@/lib/website/template-v2/validation/structure-purity";
import { loadTemplateV2Package } from "@/lib/website/template-v2/loader/load-v2-package";
import { hashPresentationProfile } from "@/lib/website/template-v2/loader/presentation-hash";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import {
  resolveInstalledBuilderTemplatePackageId,
} from "@/lib/website/builder/resolve-builder-template-package-id";
import path from "node:path";
import { isVisualSkinV2PackageId } from "@/lib/website/visual-skin/theme-bridge";

const PRESERVE_PATH_PREFIXES = [
  "lib/site-images",
  "lib/site-videos",
  "public/",
  "content/",
  "data/",
];

function shouldPreserveFile(filePath: string): boolean {
  if (PRESERVE_PATH_PREFIXES.some((prefix) => filePath.startsWith(prefix))) {
    return true;
  }
  if (filePath.startsWith("app/") && filePath !== "app/page.tsx" && filePath !== "app/globals.css" && filePath !== "app/layout.tsx") {
    return true;
  }
  return false;
}

export type ApplyV2TemplateParams = {
  project: GeneratedWebsiteProject;
  templatePackageId: string;
  language?: string | null;
  /** Skip with WB_PRODUCTION_BLUEPRINT=0 */
  forceBlueprintFallback?: boolean;
  /** When true, use templatePackageId as-is (visual skins / flagship apply). */
  directPackageId?: boolean;
  /**
   * When set, overrides structure-first skin-only CSS path.
   * Visual skins force false for full flagship component inject.
   */
  skinOnlyOverride?: boolean;
};

function shouldUseFlagshipPackageDefaults(
  _project: GeneratedWebsiteProject,
  templatePackageId: string,
  directPackageId?: boolean,
): boolean {
  if (!directPackageId || !isVisualSkinV2PackageId(templatePackageId)) {
    return false;
  }
  // Keep package DEFAULT_* chrome (metrics, trust rails, footer groups, etc.)
  // so flagship skins like Signal — Aura match their authored design.
  // Brand name / CTAs / nav still overlay via buildComponentProps identity
  // bindings when real business values are present (stub brands are ignored).
  return true;
}

/**
 * Apply a V2 template package — preserves business identity, rebuilds presentation via V2 pipeline.
 */
export async function applyTemplateV2ToProject(
  params: ApplyV2TemplateParams,
): Promise<RethemeResult> {
  const requestedPackageId = params.templatePackageId.trim();
  const templatePackageId = params.directPackageId
    ? requestedPackageId
    : resolveInstalledBuilderTemplatePackageId(requestedPackageId);
  const packageDirectory = path.join(resolveWbTemplatesRoot(), templatePackageId);
  const loaded = await loadTemplateV2Package(packageDirectory, {
    language: params.language,
  });

  if (!loaded.ok) {
    throw new Error(loaded.error);
  }

  const bundle = loaded.bundle;
  const tiHint = bundle.presentation.templateIntelligenceHint ?? "ti-saas-growth";
  const template = getTemplateIntelligence(tiHint);
  if (!template) {
    throw new Error(`Unknown template intelligence hint: ${tiHint}`);
  }

  const notes: string[] = [];
  const locale = resolveLocaleFromLanguage(params.language);
  const structureFirst = isStructureFirstEnabled();
  const generationFast = Boolean(params.forceBlueprintFallback);
  const preservedSeedFeatures = seedFeaturesFromCapabilityManifest(params.project);
  const projectForApply =
    structureFirst && !generationFast
      ? refreshCapabilities(params.project, {
          files: params.project.files ?? undefined,
          force: true,
          seedFeatures: preservedSeedFeatures,
        }).project
      : params.project;
  const identity = extractBusinessIdentity(projectForApply, params.language);
  const originalFiles = projectForApply.files ?? [];
  const preserved = structureFirst
    ? originalFiles
    : originalFiles.filter((f) => shouldPreserveFile(f.path));
  notes.push(
    structureFirst
      ? `V2 skin-only apply: preserving ${preserved.length} generated files`
      : `V2 apply: preserved ${preserved.length} business asset and route files`,
  );

  const profile = identity.businessProfile;
  const brandName = profile?.projectName || identity.title || "Brand";
  const usePackageDefaults = shouldUseFlagshipPackageDefaults(
    projectForApply,
    templatePackageId,
    params.directPackageId,
  );
  const productionContent = usePackageDefaults ? null : identity.productionContent;
  const beforeStructure =
    structureFirst && !generationFast
      ? captureStructureSnapshot(
          projectForApply,
          createCapabilityService(
            projectForApply,
            projectForApply.files ?? undefined,
          ).getActiveCapabilities(),
        )
      : null;

  const productionPipeline = resolveProductionBlueprint({
    project: projectForApply,
    templatePackageId,
    language: params.language,
    forceFallback: params.forceBlueprintFallback,
  });

  const websiteBlueprint = productionPipeline?.optimizedBlueprint ?? null;

  let files: GeneratedProjectFile[] = await injectV2TemplatePipeline({
    files: preserved,
    bundle,
    brandName,
    pageTitle: identity.title,
    pageDescription: identity.description,
    heroHeadline: productionContent?.heroHeadline,
    heroSubheadline: productionContent?.heroSubheadline,
    primaryCta: productionContent?.primaryCta,
    secondaryCta: productionContent?.secondaryCta,
    heroEyebrow: productionContent?.heroEyebrow,
    content: productionContent,
    language: params.language,
    forceDesignRebuild: true,
    strategy: projectForApply.strategy,
    websiteBlueprint,
    skinOnly: params.skinOnlyOverride ?? (structureFirst && !generationFast),
    skipSecondaryPages: generationFast && structureFirst,
    usePackageDefaults,
  });

  for (const file of preserved) {
    if (file.path.includes("site-images") || file.path.includes("site-videos")) {
      files = [...files.filter((f) => f.path !== file.path), file];
    }
  }

  files = applyLocaleToWebsiteFiles(files, locale);
  if (locale.rtl) {
    notes.push("Applied Arabic/RTL locale to layout and styles");
  }

  const componentIds = structureFirst
    ? (projectForApply.components ?? [])
    : bundle.componentRegistry.components.map((c) => c.id);
  const presentationHash = hashPresentationProfile(bundle.presentation);
  const composerId = bundle.manifest.architecture?.composer ?? "region-grid";

  notes.push(
    `V2 architecture: ${composerId} · ${componentIds.slice(0, 5).join(", ")}…`,
  );
  notes.push(`V2 package applied: ${templatePackageId} → ${template.name}`);

  const designSystem = patchDesignSystemVisualOnly(
    projectForApply.designSystem,
    template,
  );

  if (productionPipeline) {
    notes.push(
      `Production blueprint: ${websiteBlueprint!.meta.blueprintId} · score ${productionPipeline.directorResult.finalScore}`,
    );
  } else {
    notes.push("Production blueprint: legacy presentation fallback");
  }

  const designSettings = {
    templateIntelligenceId: template.id,
    templateIntelligenceCategory: template.category,
    [WB_TEMPLATE_ARCHITECTURE_VERSION_SETTING]: "v2" as const,
    [WB_TEMPLATE_PRESENTATION_HASH_SETTING]: presentationHash,
    [WB_TEMPLATE_COMPOSER_ID_SETTING]: composerId,
    websiteStructureTemplateId: requestedPackageId,
    templatePackageId,
    selectedTemplateId: requestedPackageId,
    ...(websiteBlueprint
      ? {
          [WB_WEBSITE_BLUEPRINT_SETTING]: websiteBlueprint,
          [WB_DESIGN_DIRECTOR_REPORT_SETTING]:
            productionPipeline!.directorResult.report,
          [WB_PRODUCTION_INTEGRATION_VERSION_SETTING]:
            productionPipeline!.integrationVersion,
        }
      : {}),
  };

  const structuralSections = structureFirst
    ? (projectForApply.strategy?.sectionPlan ?? []).map(
        (section) => `${section.page}: ${section.name}`,
      )
    : componentIds;

  const project = applyBusinessIdentityToProject(
    {
      ...projectForApply,
      files,
      designSystem,
      colorPalette: websiteBlueprint
        ? [
            websiteBlueprint.colorPalette.colors.primary,
            websiteBlueprint.colorPalette.colors.secondary,
            websiteBlueprint.colorPalette.colors.accent,
            websiteBlueprint.colorPalette.colors.background,
            websiteBlueprint.colorPalette.colors.foreground,
            websiteBlueprint.colorPalette.colors.surface,
          ]
        : [
            bundle.tokens.colors.primary,
            bundle.tokens.colors.secondary ?? bundle.tokens.colors.primary,
            bundle.tokens.colors.accent,
            bundle.tokens.colors.background,
            bundle.tokens.colors.foreground,
            bundle.tokens.colors.surface ?? "#FFFFFF",
          ],
      typography: websiteBlueprint
        ? [
            websiteBlueprint.typographyProfile.display,
            websiteBlueprint.typographyProfile.body,
          ]
        : [
            bundle.tokens.typography.display,
            bundle.tokens.typography.body,
          ],
      components: componentIds,
      sections: structuralSections,
    },
    identity,
    designSettings,
  );

  const { project: capabilityProject } = generationFast
    ? { project }
    : refreshCapabilities(project, {
        files,
        force: !structureFirst,
        seedFeatures: preservedSeedFeatures,
      });

  const projectWithImages = params.forceBlueprintFallback
    ? capabilityProject
    : applyFinalImageInjectionToProject(capabilityProject);

  if (structureFirst && beforeStructure && !generationFast) {
    const afterStructure = captureStructureSnapshot(
      projectWithImages,
      createCapabilityService(projectWithImages, files).getActiveCapabilities(),
    );
    assertStructurePreserved(beforeStructure, afterStructure);
    notes.push("Structure-first: skin applied without structural mutation");
  }

  return { project: projectWithImages, template, notes };
}
