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
import { loadTemplateV2Package } from "@/lib/website/template-v2/loader/load-v2-package";
import { hashPresentationProfile } from "@/lib/website/template-v2/loader/presentation-hash";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import path from "node:path";

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
  /** Skip production blueprint pipeline (legacy fallback). */
  forceBlueprintFallback?: boolean;
};

/**
 * Apply a V2 template package — preserves business identity, rebuilds presentation via V2 pipeline.
 */
export async function applyTemplateV2ToProject(
  params: ApplyV2TemplateParams,
): Promise<RethemeResult> {
  const templatePackageId = params.templatePackageId.trim();
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
  const identity = extractBusinessIdentity(params.project, params.language);
  const originalFiles = params.project.files ?? [];
  const preserved = originalFiles.filter((f) => shouldPreserveFile(f.path));
  notes.push(`V2 apply: preserved ${preserved.length} business asset and route files`);

  const profile = identity.businessProfile;
  const brandName = profile?.projectName || identity.title || "Brand";
  const productionContent = identity.productionContent;

  const productionPipeline = resolveProductionBlueprint({
    project: params.project,
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
    heroHeadline: productionContent.heroHeadline,
    heroSubheadline: productionContent.heroSubheadline,
    primaryCta: productionContent.primaryCta,
    secondaryCta: productionContent.secondaryCta,
    heroEyebrow: productionContent.heroEyebrow,
    content: productionContent,
    language: params.language,
    forceDesignRebuild: true,
    websiteBlueprint,
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

  const componentIds = bundle.componentRegistry.components.map((c) => c.id);
  const presentationHash = hashPresentationProfile(bundle.presentation);
  const composerId = bundle.manifest.architecture?.composer ?? "region-grid";

  notes.push(
    `V2 architecture: ${composerId} · ${componentIds.slice(0, 5).join(", ")}…`,
  );
  notes.push(`V2 package applied: ${templatePackageId} → ${template.name}`);

  const designSystem = patchDesignSystemVisualOnly(
    params.project.designSystem,
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
    websiteStructureTemplateId: templatePackageId,
    templatePackageId,
    selectedTemplateId: templatePackageId,
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

  const project = applyBusinessIdentityToProject(
    {
      ...params.project,
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
      sections: componentIds,
    },
    identity,
    designSettings,
  );

  return { project, template, notes };
}
