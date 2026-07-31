import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import { applyCmsToPublishHtml } from "@/lib/website/cms-inject";
import {
  buildStaticPreviewHtml,
  extractStaticPreviewHtml,
  sanitizePreviewHtml,
} from "@/lib/website/build-static-preview.server";
import { previewInputFromGeneration } from "@/lib/website/live-preview";
import {
  applySeoToPublicHtml,
  buildPublicRobotsTxt,
  buildPublicSitemapXml,
} from "@/lib/website/public-site";
import type { CmsEntry } from "@/lib/ai-core/website-management/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

function isGeneratedWebsiteProject(
  value: unknown,
): value is GeneratedWebsiteProject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as GeneratedWebsiteProject).files)
  );
}

export function resolveProductionPublishHtml(
  generation: WebsiteGeneration,
  publicUrl: string,
  cmsEntries: CmsEntry[] = [],
): {
  html: string;
  robotsTxt: string;
  sitemapXml: string;
  seoPackage: CoreSeoPackage | null;
} {
  const input = previewInputFromGeneration(generation);
  const blueprint = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : null;
  const seoPackage = blueprint?.seoPackage ?? null;

  let html: string;
  if (blueprint?.files?.length) {
    html = extractStaticPreviewHtml(blueprint.files, input);
  } else {
    html = buildStaticPreviewHtml(input);
  }

  const withSeo = applySeoToPublicHtml({
    html: sanitizePreviewHtml(html),
    seoPackage,
    publicUrl,
    fallbackTitle: input.title || generation.project_name,
    fallbackDescription:
      input.description || generation.business_description || undefined,
  });

  const withCms = applyCmsToPublishHtml(withSeo, cmsEntries);

  return {
    html: withCms,
    robotsTxt: buildPublicRobotsTxt(publicUrl),
    sitemapXml: buildPublicSitemapXml({ publicUrl, seoPackage }),
    seoPackage,
  };
}
