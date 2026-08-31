import { injectProfessionalComponents } from "@/lib/ai-core/components";
import { isGeneratingWebsitePlaceholderTitle } from "@/lib/ai-core/content/content-language";
import { resolveProductionContentWithIntelligence } from "@/lib/ai-core/content-intelligence/resolve";
import { resolveComponentIdForStrategySection } from "@/lib/ai-core/website-builder/excellence";
import type { GenerationSpec } from "@/lib/tbge/spec/types";
import type { GeneratedProjectFile, GeneratedWebsiteProject } from "@/lib/website/types";
import { resolveWebsiteIndustryId } from "@/lib/website/industry/industry-resolver";

const HOME_PAGE_PATH = "app/page.tsx";

function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function looksLikeGenerationPrompt(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return (
    /^create a website for\b/.test(lower) ||
    /^build a website for\b/.test(lower) ||
    /^make a website for\b/.test(lower)
  );
}

export function normalizeTbgeIndustryId(input: {
  industryId?: string | null;
  spec?: GenerationSpec | null;
  prompt?: string | null;
}): string | undefined {
  const resolved = resolveWebsiteIndustryId({
    prompt: input.prompt,
    title: input.spec?.business.name,
    description: input.spec?.business.offer,
    industryId: input.industryId ?? input.spec?.business.industryId,
    businessIndustry: input.spec?.business.industry,
  });

  if (resolved !== "business") return resolved;
  return input.industryId ?? input.spec?.business.industryId ?? undefined;
}

function resolveBusinessDescription(input: {
  description?: string;
  prompt?: string | null;
  spec?: GenerationSpec | null;
}): string | undefined {
  const offer = input.spec?.business.offer?.trim();
  if (offer && !looksLikeGenerationPrompt(offer)) return offer;

  const description = input.description?.trim();
  if (description && !looksLikeGenerationPrompt(description)) return description;

  return undefined;
}

/** TBGE assembly emits section labels as bare <h2> blocks inside SiteShell. */
export function isTbgeBareScaffoldHomePage(pageSource: string): boolean {
  const page = pageSource.trim();
  if (!page) return false;
  if (/data-v2-package\s*=/.test(page)) return false;
  if (
    /<\s*(?:SiteHeader|HeroSplit|HeroLuxury|HeroProduct|HeroProperty|Theme\w+)/.test(
      page,
    )
  ) {
    return false;
  }
  if (!page.includes("SiteShell")) return false;
  return /<section>\s*<h2>[^<]+<\/h2>\s*<\/section>/.test(page);
}

export function resolveTbgeHomeSectionNames(input: {
  spec?: GenerationSpec | null;
  project?: Pick<GeneratedWebsiteProject, "sections" | "files">;
}): string[] {
  const homePage = input.spec?.structure.pages.find(
    (page) =>
      page.path === "/" ||
      page.path === "/home" ||
      /^home$/i.test(page.name.trim()),
  );
  if (homePage?.sections?.length) return homePage.sections;

  const pageSource =
    input.project?.files?.find((f) => normalizePath(f.path) === HOME_PAGE_PATH)
      ?.content ?? "";
  const fromHtml = [...pageSource.matchAll(/<h2>([^<]+)<\/h2>/g)]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));
  if (fromHtml.length) return fromHtml;

  return (input.project?.sections ?? []).slice(0, 10);
}

export function resolveTbgeHomeComponentOrder(input: {
  sectionNames: string[];
  industryId?: string | null;
}): string[] {
  const ctx = { industryId: input.industryId ?? undefined };
  const body = input.sectionNames.map((name) =>
    String(resolveComponentIdForStrategySection(name, ctx)),
  );
  const uniqueBody = [...new Set(body)];
  return ["SiteHeader", ...uniqueBody.filter((id) => id !== "SiteFooter"), "SiteFooter"];
}

function extractBrandTitleFromHomePage(pageSource: string): string | null {
  const match = pageSource.match(/<h1>([^<]+)<\/h1>/);
  return match?.[1]?.trim() || null;
}

export function resolveBrandTitleForComposition(input: {
  title?: string;
  spec?: GenerationSpec | null;
  pageSource?: string;
}): string {
  const candidates = [
    input.spec?.business.name,
    input.pageSource ? extractBrandTitleFromHomePage(input.pageSource) : null,
    input.title,
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && !isGeneratingWebsitePlaceholderTitle(value)) {
      return value;
    }
  }
  return input.title?.trim() || "Website";
}

export function shouldComposeTbgeUnifiedHome(
  pageSource: string,
  title?: string | null,
): boolean {
  if (isTbgeBareScaffoldHomePage(pageSource)) return true;
  return isGeneratingWebsitePlaceholderTitle(title);
}

export function composeTbgeUnifiedHomeFiles(input: {
  files: GeneratedProjectFile[];
  title: string;
  description?: string;
  language?: string | null;
  industryId?: string | null;
  sectionNames: string[];
  content?: string[];
  primaryCta?: string;
  spec?: GenerationSpec | null;
  prompt?: string | null;
}): GeneratedProjectFile[] {
  const pageSource =
    input.files.find((f) => normalizePath(f.path) === HOME_PAGE_PATH)?.content ??
    "";
  if (!shouldComposeTbgeUnifiedHome(pageSource, input.title)) {
    return input.files;
  }

  const brandTitle = resolveBrandTitleForComposition({
    title: input.title,
    spec: input.spec,
    pageSource,
  });

  const industryId = normalizeTbgeIndustryId({
    industryId: input.industryId,
    spec: input.spec,
    prompt: input.prompt,
  });

  const businessDescription = resolveBusinessDescription({
    description: input.description,
    prompt: input.prompt,
    spec: input.spec,
  });

  const production = resolveProductionContentWithIntelligence({
    brandName: brandTitle,
    language: input.language ?? undefined,
    profile: industryId
      ? ({
          industry: industryId,
          industryId,
          offer: businessDescription,
          targetAudience: input.spec?.business.audience,
        } as never)
      : null,
  }).pack;

  const homeComponentOrder = resolveTbgeHomeComponentOrder({
    sectionNames: input.sectionNames,
    industryId,
  });

  const componentPaths = input.files
    .map((file) => file.path)
    .filter(
      (path) =>
        path.startsWith("components/sections/") ||
        path.startsWith("components/layout/") ||
        path.startsWith("components/ui/"),
    );

  return injectProfessionalComponents({
    files: input.files,
    componentPaths,
    homeComponentOrder,
    brandName: brandTitle,
    pageTitle: production.heroHeadline || brandTitle,
    pageDescription: production.heroSubheadline || businessDescription,
    heroHeadline: production.heroHeadline,
    heroSubheadline: production.heroSubheadline,
    primaryCta: input.primaryCta ?? production.primaryCta,
    secondaryCta: production.secondaryCta,
    heroEyebrow: production.heroEyebrow,
    content: production,
    composePage: true,
    language: input.language,
    forceDesignRebuild: true,
  });
}

export function composeTbgeUnifiedHomeIfNeeded(
  project: GeneratedWebsiteProject,
  options: {
    spec?: GenerationSpec | null;
    industryId?: string | null;
    language?: string | null;
    primaryCta?: string;
    prompt?: string | null;
  } = {},
): GeneratedWebsiteProject {
  const sectionNames = resolveTbgeHomeSectionNames({
    spec: options.spec,
    project,
  });
  if (!sectionNames.length) return project;

  const industryId = normalizeTbgeIndustryId({
    industryId:
      options.industryId ??
      options.spec?.business.industryId ??
      project.sitePlan?.archetypeId ??
      null,
    spec: options.spec,
    prompt: options.prompt,
  });

  const files = composeTbgeUnifiedHomeFiles({
    files: project.files ?? [],
    title: project.title,
    description: project.description,
    language: options.language ?? project.language,
    industryId,
    sectionNames,
    content: project.content,
    primaryCta: options.primaryCta,
    spec: options.spec,
    prompt: options.prompt,
  });

  if (files === project.files) return project;

  const brandTitle = resolveBrandTitleForComposition({
    title: project.title,
    spec: options.spec,
    pageSource:
      files.find((f) => normalizePath(f.path) === HOME_PAGE_PATH)?.content ?? "",
  });

  return {
    ...project,
    title: brandTitle,
    files,
  };
}
