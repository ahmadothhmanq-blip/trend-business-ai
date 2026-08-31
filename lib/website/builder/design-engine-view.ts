/**
 * Resolve strategy + asset panels for the website builder UI when blueprint
 * artifacts are partial or missing (legacy generations, post-sync projects).
 */

import type { GeneratedWebsiteProject } from "@/lib/website/types";
import type {
  AssetItem,
  AssetManifest,
  WebsiteStrategy,
} from "@/lib/website/types/layers";
import {
  parseSiteImagesFromFiles,
  type ParsedSiteImageMeta,
  type ParsedSiteImages,
} from "@/lib/website/site-images-parser";
import type { GeneratedProjectFile } from "@/lib/ai/types";

function pagePathToRoute(pagePath: string): string {
  const normalized = pagePath.replace(/\\/g, "/");
  if (normalized === "app/page.tsx" || normalized.endsWith("/app/page.tsx")) {
    return "/";
  }
  const match = normalized.match(/(?:^|\/)app\/(.+)\/page\.tsx$/);
  if (match?.[1]) return `/${match[1]}`;
  return `/${normalized.replace(/^\/+/, "")}`;
}

function pagePathToLabel(pagePath: string): string {
  const route = pagePathToRoute(pagePath);
  if (route === "/") return "Home";
  return route
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function hasStrategyContent(strategy?: WebsiteStrategy): boolean {
  if (!strategy) return false;
  return Boolean(
    strategy.positioning?.trim() ||
      strategy.sitemap?.length ||
      strategy.ctas?.length ||
      strategy.contentStrategy?.brandVoice?.trim(),
  );
}

function buildSitemapFromPages(pages: string[]): string[] {
  const routes = pages.map(pagePathToRoute);
  return [...new Set(routes)];
}

function buildStrategyPagesFromProject(
  project: GeneratedWebsiteProject,
  existing?: WebsiteStrategy,
): WebsiteStrategy["pages"] {
  if (existing?.pages?.length) return existing.pages;
  return (project.pages ?? []).map((pagePath) => ({
    name: pagePathToLabel(pagePath),
    path: pagePathToRoute(pagePath),
    purpose: pagePathToLabel(pagePath),
    keySections: [],
    primaryCta: existing?.ctas?.[0],
  }));
}

export function resolveDesignEngineStrategy(
  project: GeneratedWebsiteProject | undefined | null,
): WebsiteStrategy | undefined {
  if (!project) return undefined;

  const existing = project.strategy;
  if (hasStrategyContent(existing)) {
    return existing;
  }

  const profile = project.businessProfile;
  const positioning =
    existing?.positioning?.trim() ||
    profile?.summary?.trim() ||
    project.description?.trim() ||
    project.prompt?.trim() ||
    "";

  const sitemap =
    existing?.sitemap?.length && existing.sitemap.length > 0
      ? existing.sitemap
      : buildSitemapFromPages(project.pages ?? []);

  const ctas = existing?.ctas?.length ? existing.ctas : [];
  const contentStructure =
    existing?.contentStructure?.length && existing.contentStructure.length > 0
      ? existing.contentStructure
      : [...(project.sections ?? [])];

  if (!positioning && !sitemap.length && !contentStructure.length && !ctas.length) {
    return existing;
  }

  return {
    positioning,
    sitemap,
    pages: buildStrategyPagesFromProject(project, existing),
    sectionPlan: existing?.sectionPlan ?? [],
    conversionFunnel: existing?.conversionFunnel ?? [],
    contentStructure,
    contentStrategy: existing?.contentStrategy ?? {
      brandVoice: profile?.tone?.trim() || "",
      messagingPillars: profile?.businessGoals?.slice(0, 4) ?? [],
      proofPoints: [],
      objectionHandlers: [],
      seoTopics: [...(project.seo ?? []).slice(0, 6)],
    },
    ctas,
    seoFocus: existing?.seoFocus?.length ? existing.seoFocus : [...(project.seo ?? [])],
  };
}

function pushAssetItem(
  items: AssetItem[],
  seen: Set<string>,
  params: {
    id: string;
    role: AssetItem["role"];
    name: string;
    url: string | null;
  },
): void {
  if (!params.url?.trim() || seen.has(params.url)) return;
  seen.add(params.url);
  items.push({
    id: params.id,
    role: params.role,
    name: params.name,
    prompt: "",
    alt: params.name,
    url: params.url,
    storagePath: null,
    status: "generated",
  });
}

function normalizeAssetRole(
  role: string | undefined,
): AssetItem["role"] {
  switch (role) {
    case "hero":
    case "product":
    case "service":
    case "background":
    case "section":
    case "gallery":
    case "testimonial":
    case "icon":
    case "other":
      return role;
    case "brand":
      return "other";
    default:
      return "section";
  }
}

function validAssetItems(items: AssetItem[] | undefined): AssetItem[] {
  return (items ?? []).filter((item) => Boolean(item.url?.trim()));
}

function manifestFromSiteImages(parsed: ParsedSiteImages): AssetItem[] {
  const items: AssetItem[] = [];
  const seen = new Set<string>();

  pushAssetItem(items, seen, {
    id: "site-hero",
    role: "hero",
    name: "Hero image",
    url: parsed.HERO_IMAGE,
  });
  pushAssetItem(items, seen, {
    id: "site-product",
    role: "product",
    name: "Product image",
    url: parsed.PRODUCT_IMAGE,
  });
  pushAssetItem(items, seen, {
    id: "site-service",
    role: "service",
    name: "Service image",
    url: parsed.SERVICE_IMAGE,
  });
  pushAssetItem(items, seen, {
    id: "site-background",
    role: "background",
    name: "Background image",
    url: parsed.BACKGROUND_IMAGE,
  });
  pushAssetItem(items, seen, {
    id: "site-about",
    role: "section",
    name: "About image",
    url: parsed.ABOUT_IMAGE,
  });
  pushAssetItem(items, seen, {
    id: "site-brand",
    role: "other",
    name: "Brand image",
    url: parsed.BRAND_IMAGE,
  });

  parsed.GALLERY_IMAGES.forEach((url, index) => {
    pushAssetItem(items, seen, {
      id: `site-gallery-${index + 1}`,
      role: "gallery",
      name: `Gallery ${index + 1}`,
      url,
    });
  });
  parsed.SECTION_IMAGES.forEach((url, index) => {
    pushAssetItem(items, seen, {
      id: `site-section-${index + 1}`,
      role: "section",
      name: `Section ${index + 1}`,
      url,
    });
  });
  parsed.FEATURE_IMAGES.forEach((url, index) => {
    pushAssetItem(items, seen, {
      id: `site-feature-${index + 1}`,
      role: "section",
      name: `Feature ${index + 1}`,
      url,
    });
  });
  parsed.TEAM_IMAGES.forEach((url, index) => {
    pushAssetItem(items, seen, {
      id: `site-team-${index + 1}`,
      role: "testimonial",
      name: `Team ${index + 1}`,
      url,
    });
  });
  parsed.TESTIMONIAL_IMAGES.forEach((url, index) => {
    pushAssetItem(items, seen, {
      id: `site-testimonial-${index + 1}`,
      role: "testimonial",
      name: `Testimonial ${index + 1}`,
      url,
    });
  });

  parsed.SITE_IMAGES.forEach((meta: ParsedSiteImageMeta, index) => {
    const url = meta.url?.trim() ?? null;
    if (!url) return;
    pushAssetItem(items, seen, {
      id: meta.id?.trim() || `site-meta-${index + 1}`,
      role: normalizeAssetRole(meta.role),
      name: meta.name?.trim() || meta.alt?.trim() || `Image ${index + 1}`,
      url,
    });
  });

  return items;
}

const PLACEHOLDER_IMAGE_RE =
  /placehold\.co|via\.placeholder|picsum\.photos|dummyimage\.com|data:image\/svg/i;

const SCRAPED_IMAGE_URL_RE =
  /https?:\/\/[^\s"'`)<>]+?(?:\.(?:jpg|jpeg|png|webp|gif|avif)|(?:images\.unsplash\.com|images\.pexels\.com|cdn\.|img\.|media\.)[^\s"'`)<>]*)/gi;

function isUsableImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http")) return false;
  if (PLACEHOLDER_IMAGE_RE.test(trimmed)) return false;
  return true;
}

/** Last-resort: collect photographic URLs embedded in generated source files. */
export function scrapeImageUrlsFromProjectFiles(
  files?: GeneratedProjectFile[],
): AssetItem[] {
  if (!files?.length) return [];

  const items: AssetItem[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const path = file.path.replaceAll("\\", "/");
    if (
      path === "lib/site-images.ts" ||
      path === "lib/site-images.js" ||
      path.startsWith("preview/")
    ) {
      continue;
    }

    const matches = file.content.match(SCRAPED_IMAGE_URL_RE) ?? [];
    for (const raw of matches) {
      const url = raw.replace(/[),.;]+$/, "").trim();
      if (!isUsableImageUrl(url) || seen.has(url)) continue;
      seen.add(url);
      items.push({
        id: `scraped-${items.length + 1}`,
        role: "section",
        name: `Image ${items.length + 1}`,
        prompt: "",
        alt: `Image ${items.length + 1}`,
        url,
        storagePath: null,
        status: "generated",
      });
      if (items.length >= 12) return items;
    }
  }

  return items;
}

export function resolveDesignEngineAssetManifest(
  project: GeneratedWebsiteProject | undefined | null,
): AssetManifest | undefined {
  if (!project) return undefined;

  const persisted = project.assetManifest;
  const persistedValid = validAssetItems(persisted?.items);
  if (persistedValid.length) {
    return {
      ...persisted,
      items: persistedValid,
    };
  }

  const parsed = parseSiteImagesFromFiles(project.files);
  const fromSiteImages = parsed ? manifestFromSiteImages(parsed) : [];
  if (fromSiteImages.length) {
    return {
      items: fromSiteImages,
      provider: persisted?.provider ?? "site-images",
      generatedAt: persisted?.generatedAt,
      engine: persisted?.engine ?? "derived-from-files",
    };
  }

  const scraped = scrapeImageUrlsFromProjectFiles(project.files);
  if (scraped.length) {
    return {
      items: scraped,
      provider: persisted?.provider ?? "project-files",
      generatedAt: persisted?.generatedAt,
      engine: "scraped-from-files",
    };
  }

  return persisted;
}
