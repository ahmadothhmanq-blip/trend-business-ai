import { normalizePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";
import type { StaticPreviewInput } from "@/lib/website/preview-input";
import { parseSiteImagesModule, findSiteImagesSource } from "@/lib/website/site-images-parser";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

function isGeneratedWebsiteProject(value: unknown): value is GeneratedWebsiteProject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as GeneratedWebsiteProject).files)
  );
}

function extractHeroImageUrl(
  blueprint: GeneratedWebsiteProject | null,
): string | null {
  const heroAsset = blueprint?.assetManifest?.items?.find(
    (item) => item.role === "hero" && item.url,
  );
  if (heroAsset?.url) {
    return normalizePremiumStockUrl(heroAsset.url);
  }

  const siteImagesContent = findSiteImagesSource(blueprint?.files);
  const parsed = parseSiteImagesModule(siteImagesContent);
  if (parsed?.HERO_IMAGE) return parsed.HERO_IMAGE;

  if (!siteImagesContent) return null;
  const match = siteImagesContent.match(
    /export const HERO_IMAGE = ("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|null)/,
  );
  if (!match?.[1] || match[1] === "null") return null;
  try {
    return normalizePremiumStockUrl(JSON.parse(match[1]) as string);
  } catch {
    return null;
  }
}

export function previewInputFromGeneration(
  generation: WebsiteGeneration,
): StaticPreviewInput {
  const blueprint = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : null;

  return {
    title: blueprint?.title || generation.project_name,
    description: blueprint?.description || generation.business_description,
    pages: blueprint?.pages,
    sections: blueprint?.sections,
    colorPalette: blueprint?.colorPalette,
    typography: blueprint?.typography,
    content: blueprint?.content,
    components: blueprint?.components,
    heroImageUrl: extractHeroImageUrl(blueprint),
    files: blueprint?.files,
    templateIntelligenceId:
      (blueprint?.settings as { templateIntelligenceId?: string } | undefined)
        ?.templateIntelligenceId ?? null,
    websiteThemeId:
      (blueprint?.settings as { websiteThemeId?: string } | undefined)
        ?.websiteThemeId ?? null,
    templateArchitectureVersion:
      (blueprint?.settings as { templateArchitectureVersion?: "v1" | "v2" } | undefined)
        ?.templateArchitectureVersion ?? null,
    templatePackageId:
      (blueprint?.settings as { templatePackageId?: string } | undefined)
        ?.templatePackageId ?? null,
    settings: (blueprint?.settings as Record<string, unknown> | undefined) ?? null,
    language: generation.language ?? null,
    industryId:
      (blueprint?.settings as { tbdpSectorDnaId?: string } | undefined)
        ?.tbdpSectorDnaId ??
      (blueprint?.settings as { industryId?: string } | undefined)?.industryId ??
      null,
  };
}
