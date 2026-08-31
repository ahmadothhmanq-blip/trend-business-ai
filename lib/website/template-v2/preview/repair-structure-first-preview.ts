import type { StaticPreviewInput } from "@/lib/website/preview-input";
import { isStructureFirstEnabled } from "@/lib/website/generation-flags";
import { composeTbgeUnifiedHomeFiles, resolveTbgeHomeSectionNames } from "@/lib/tbge/integration/compose-unified-home";
import { composeStructureFirstHomeFiles } from "@/lib/website/template-v2/integration/compose-structure-first-home";
import { createCapabilityService } from "@/lib/website/builder/capabilities/service";
import { readHomePageSource } from "@/lib/website/template-v2/preview/v2-preview-input";
import type { GeneratedProjectFile } from "@/plugins/website/types";
import { resolveProductionContentWithIntelligence } from "@/lib/ai-core/content-intelligence/resolve";

const RAW_COMPONENT_NAMES = [
  "SiteHeader",
  "SiteFooter",
  "HeroProperty",
  "HeroFullBleed",
  "HeroSplit",
  "HeroProduct",
  "PropertyListings",
  "LocationSections",
  "TeamSection",
  "TestimonialsModern",
  "ContactSection",
  "MenuHighlights",
  "FeatureHighlights",
  "ServicesGrid",
] as const;

const JSX_COMPONENT_RE =
  /<\s*(?:SiteHeader|SiteFooter|HeroProperty|HeroFullBleed|HeroSplit|HeroProduct|PropertyListings|LocationSections|TeamSection|TestimonialsModern|ContactSection|MenuHighlights|FeatureHighlights|ServicesGrid)\b/;

export function homePageListsRawComponentNames(pageSource: string): boolean {
  const page = pageSource.trim();
  if (!page) return true;
  if (/data-v2-package\s*=/.test(page)) return false;
  if (JSX_COMPONENT_RE.test(page)) return false;
  if (/return\s+null\s*;?/.test(page)) return true;
  return RAW_COMPONENT_NAMES.some((name) => page.includes(name));
}

export function previewHtmlShowsRawComponentNames(html: string): boolean {
  if (!html.trim()) return true;
  if (
    html.includes('data-project-files-render="') ||
    html.includes('data-v2-render="')
  ) {
    return false;
  }
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  const hits = RAW_COMPONENT_NAMES.filter((name) => stripped.includes(name));
  if (hits.length < 2) return false;
  return !stripped.includes("ti-site-header") && !stripped.includes("data-v2-component=");
}

export function hasComposedProfessionalHomeInFiles(pageSource: string): boolean {
  const page = pageSource.trim();
  if (!page) return false;
  if (/data-v2-package\s*=/.test(page)) return true;
  return JSX_COMPONENT_RE.test(page);
}

function resolvePreviewProductionContent(input: StaticPreviewInput) {
  const brandName = input.title?.trim() || "Website";
  const resolved = resolveProductionContentWithIntelligence({
    brandName,
    language: input.language ?? undefined,
    strategy: input.strategy as never,
    profile: input.businessProfile as never,
    businessProfile: null,
    agencyContract: null,
    masterPlan: null,
  });
  return resolved.pack;
}

export function repairStructureFirstPreviewFiles(
  input: StaticPreviewInput,
): GeneratedProjectFile[] {
  const files = input.files ?? [];
  if (!files.length) return files;

  const pageSource = readHomePageSource(input);
  const sectionNames = resolveTbgeHomeSectionNames({
    project: {
      sections: input.sections ?? [],
      files,
    },
  });

  const tbgeComposed = composeTbgeUnifiedHomeFiles({
    files,
    title: input.title?.trim() || "Website",
    description: input.description,
    language: input.language,
    industryId: input.industryId,
    sectionNames,
    content: input.content,
    primaryCta: input.primaryCta,
  });
  if (tbgeComposed !== files) {
    return tbgeComposed;
  }

  if (!isStructureFirstEnabled() || !input.strategy) {
    return files;
  }

  if (!homePageListsRawComponentNames(pageSource)) {
    return files;
  }

  const productionContent = resolvePreviewProductionContent(input);
  const capabilityService = createCapabilityService(
    {
      projectKind: "website",
      title: input.title ?? "Website",
      description: input.description ?? "",
      pages: input.pages ?? [],
      sections: input.sections ?? [],
      colorPalette: input.colorPalette ?? [],
      typography: input.typography ?? [],
      components: input.components ?? [],
      content: input.content ?? [],
      seo: [],
      roadmap: [],
      strategy: input.strategy,
      businessProfile: input.businessProfile,
      settings: input.settings ?? {},
      files,
    },
    files,
  );

  const componentPaths = files
    .map((file) => file.path)
    .filter(
      (path) =>
        path.startsWith("components/sections/") ||
        path.startsWith("components/layout/") ||
        path.startsWith("components/ui/"),
    );

  return composeStructureFirstHomeFiles({
    files,
    strategy: input.strategy,
    industryId: input.industryId ?? input.businessProfile?.industry ?? undefined,
    brandName: input.title?.trim() || "Website",
    productionContent,
    language: input.language,
    componentPaths,
    capabilityService,
  });
}
