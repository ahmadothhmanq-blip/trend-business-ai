import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";
import type { ImageSystemSpec } from "@/lib/ai-core/image-intelligence/iie-types";
import {
  resolveSiteImageStrategy,
  siteImageStrategyUsesGeneration,
  type SiteImageStrategy,
} from "@/lib/website/site-plan/image-strategy";
import { resolveImageRoutingFromContext } from "@/lib/website/site-plan/resolve-image-routing";
import { preferAiImages } from "@/lib/ai-core/image-engine/prefer";
import {
  isPremiumStockUrl,
  normalizePremiumStockUrl,
  resolvePremiumStockUrl,
} from "@/lib/ai-core/image-engine/stock";
import { optimizePhotoUrlForRole } from "@/lib/ai-core/image-engine/optimize";
import { buildSiteVideoModule } from "@/lib/ai-core/image-engine/video";
import {
  enrichManifestWithProfileSlots,
  hydrateSlotsFromManifest,
} from "@/lib/ai-core/image-engine/profile-engine";
import {
  resolveStockIndustryForRole,
  resolveRequiredPhotoRoleCounts,
  capSubjectSparingGalleryUrls,
  capSubjectSparingSectionUrls,
  getIndustryVisualPolicy,
  isHeroDominantIndustry,
  isAutomotiveVehiclePhotoUrl,
  isSubjectPackPhotoUrl,
  isSubjectSparingIndustry,
  stripSubjectPackPhotos,
} from "@/lib/ai-core/image-engine/industry-slot-policy";
import { slotUrls } from "@/lib/ai-core/image-engine/slots";

const SITE_IMAGES_PATH = "lib/site-images.ts";
const SITE_VIDEOS_PATH = "lib/site-videos.ts";

const PLACEHOLDER_URL_RE =
  /(?:https?:\/\/(?:placehold\.co|via\.placeholder\.com|picsum\.photos|dummyimage\.com)[^\s"'`)]+|\/placeholder(?:[-_/][^\s"'`)]*)?|data:image\/svg\+xml[^"'`]*)/gi;

const EMPTY_IMG_SRC_RE = /(<img\b[^>]*\bsrc\s*=\s*)(["'])\2/gi;

const REQUIRED_PHOTO_ROLES = [
  "hero",
  "product",
  "service",
  "background",
  "section",
  "gallery",
  "testimonial",
] as const;

function sanitizeHeroDominantManifestItems(
  items: CoreAssetManifest["items"],
  hero: string,
  serviceFallback: string | null,
): CoreAssetManifest["items"] {
  return items.map((item) => {
    const role = item.role;
    if (role === "hero") return item;
    if (role === "product" || role === "gallery" || role === "brand") {
      return { ...item, url: hero };
    }
    if (item.url && isSubjectPackPhotoUrl(item.url, "automotive")) {
      const replacement =
        serviceFallback && !isSubjectPackPhotoUrl(serviceFallback, "automotive")
          ? serviceFallback
          : resolvePremiumStockUrl({
              routingIndustryId: "business",
              industry: "business",
              role,
              seed: item.id,
            });
      return { ...item, url: replacement };
    }
    return item;
  });
}

/**
 * Emit a typed site image map and replace template layout placeholders with
 * ImageSpecification-driven photographic URLs only.
 */
export function injectAiImagesIntoProject(params: {
  files: GeneratedProjectFile[];
  assetManifest: CoreAssetManifest;
  industry?: string | null;
  routingIndustryId?: string | null;
  imageSystemSpec?: ImageSystemSpec | null;
}): GeneratedProjectFile[] {
  const routingIndustryId =
    params.routingIndustryId ?? params.industry ?? null;
  const manifest = ensureRequiredPhotoAssets(
    preferAiImages(params.assetManifest),
    params.industry,
    {
      imageSystemSpec: params.imageSystemSpec,
      routingIndustryId,
    },
  );
  let enriched = enrichManifestWithProfileSlots(
    manifest,
    {
      industry: params.industry,
      routingIndustryId,
    },
    { projectSeed: params.industry ?? "website" },
  );
  const slotResult = hydrateSlotsFromManifest(
    enriched,
    {
      industry: params.industry,
      routingIndustryId,
    },
    { projectSeed: params.industry ?? "website" },
  );
  const hero = firstUrl(groupByRole(enriched), "hero");
  const servicePreview = firstUrl(groupByRole(enriched), "service");
  if (isHeroDominantIndustry(routingIndustryId) && hero) {
    enriched = {
      ...enriched,
      items: sanitizeHeroDominantManifestItems(
        enriched.items,
        hero,
        servicePreview,
      ),
    };
  }
  const byRole = groupByRole(enriched);
  const product = isHeroDominantIndustry(routingIndustryId) && hero
    ? hero
    : firstUrl(byRole, "product");
  const service = firstUrl(byRole, "service");
  const background = firstUrl(byRole, "background");
  const brand = firstUrl(byRole, "brand");
  const sections = isSubjectSparingIndustry(routingIndustryId)
    ? capSubjectSparingSectionUrls(
        routingIndustryId,
        hero,
        urlsForRole(byRole, "section"),
        service,
      )
    : urlsForRole(byRole, "section");
  const gallery = isSubjectSparingIndustry(routingIndustryId)
    ? capSubjectSparingGalleryUrls(
        routingIndustryId,
        hero,
        urlsForRole(byRole, "gallery"),
      )
    : urlsForRole(byRole, "gallery");
  const testimonials = urlsForRole(byRole, "testimonial");

  const hasPhotos = enriched.items.some(
    (i) =>
      Boolean(i.url) &&
      !i.url!.startsWith("data:image/svg") &&
      (i.status === "generated" ||
        i.metadata?.provider === "premium-stock" ||
        isPremiumStockUrl(i.url)),
  );

  const siteImagesSource = buildSiteImagesModule({
    hero,
    product,
    service,
    background,
    brand,
    sections,
    gallery,
    testimonials,
    about: slotUrls(slotResult.slots, "about"),
    features: slotUrls(slotResult.slots, "features"),
    team: slotUrls(slotResult.slots, "team"),
    items: enriched.items,
    routingIndustryId,
  });

  const out: GeneratedProjectFile[] = [];
  let sawSiteImages = false;
  let sawSiteVideos = false;

  for (const file of params.files) {
    if (file.path === SITE_IMAGES_PATH || file.path === "lib/site-images.js") {
      sawSiteImages = true;
      out.push({
        ...file,
        path: SITE_IMAGES_PATH,
        content: siteImagesSource,
        language: "typescript",
      });
      continue;
    }
    if (file.path === SITE_VIDEOS_PATH || file.path === "lib/site-videos.js") {
      sawSiteVideos = true;
      if (enriched.videoPackage) {
        out.push({
          ...file,
          path: SITE_VIDEOS_PATH,
          content: buildSiteVideoModule(enriched.videoPackage),
          language: "typescript",
        });
        continue;
      }
    }

    let content = file.content;
    if (hasPhotos && /\.(tsx?|jsx?)$/.test(file.path)) {
      content = rewritePlaceholders(content, {
        hero,
        product,
        service,
        background,
        sections,
        gallery,
        testimonials,
      });
      content = fillEmptyImageSrcs(content, {
        hero,
        product,
        service,
        background,
        sections,
        gallery,
        testimonials,
      });
      // Strip decorative empty gradient-only hero branches when we have photos
      content = content.replace(
        /\{!src \? \(\s*<div className="[^"]*bg-gradient-hero[^"]*"[^>]*\/>\s*\) : null\}/g,
        "",
      );
    }
    out.push({ ...file, content });
  }

  if (!sawSiteImages) {
    out.push({
      path: SITE_IMAGES_PATH,
      content: siteImagesSource,
      language: "typescript",
    });
  }
  if (!sawSiteVideos && enriched.videoPackage) {
    out.push({
      path: SITE_VIDEOS_PATH,
      content: buildSiteVideoModule(enriched.videoPackage),
      language: "typescript",
    });
  }

  return out;
}

export type ImageInjectionProject = {
  files: GeneratedProjectFile[];
  assetManifest?: CoreAssetManifest | null;
  businessProfile?: { industry?: string; routingIndustryId?: string } | null;
  designSystem?: { industryPattern?: string } | null;
  sitePlan?: {
    imageStrategy?: SiteImageStrategy;
    archetypeId?: string;
  } | null;
  prompt?: string | null;
  title?: string | null;
  description?: string | null;
  settings?: {
    businessIndustry?: string;
    sitePlanArchetype?: string;
  } | null;
};

/**
 * Definitive image injection pass for completed generation output.
 * Call once after all file generation, quality passes, and V2 template finalize.
 */
export function applyFinalImageInjectionToProject<T extends ImageInjectionProject>(
  project: T,
  options?: { imageStrategy?: SiteImageStrategy },
): T {
  if (!project.files?.length) {
    return project;
  }

  const imageStrategy = resolveSiteImageStrategy(
    options?.imageStrategy ?? project.sitePlan?.imageStrategy,
  );
  if (!siteImageStrategyUsesGeneration(imageStrategy)) {
    return project;
  }

  const routing = resolveImageRoutingFromContext({
    prompt: project.prompt,
    title: project.title,
    description: project.description,
    industryId:
      project.businessProfile?.routingIndustryId ??
      project.settings?.businessIndustry,
    businessIndustry:
      project.settings?.businessIndustry ??
      project.businessProfile?.routingIndustryId,
    sitePlanArchetype:
      project.settings?.sitePlanArchetype ?? project.sitePlan?.archetypeId,
    archetypeId: project.sitePlan?.archetypeId as
      | import("@/lib/website/site-plan/types").SiteArchetypeId
      | undefined,
  });

  const industry =
    project.businessProfile?.routingIndustryId ??
    routing.routingIndustryId ??
    project.businessProfile?.industry ??
    project.designSystem?.industryPattern;

  const manifest = project.assetManifest?.items?.length
    ? project.assetManifest
    : ensureRequiredPhotoAssets(
        {
          items: [],
          engine: "premium-stock-fallback",
          generatedAt: new Date().toISOString(),
        },
        industry,
        { routingIndustryId: routing.routingIndustryId },
      );

  const files = injectAiImagesIntoProject({
    files: project.files,
    assetManifest: manifest,
    industry,
    routingIndustryId: routing.routingIndustryId,
  });

  return { ...project, files, assetManifest: manifest };
}

function isPhotographicUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (
    url.startsWith("data:image/svg") ||
    url.includes("image/svg+xml") ||
    /placehold\.co|via\.placeholder|picsum\.photos|dummyimage/i.test(url)
  ) {
    return false;
  }
  return true;
}

/**
 * Guarantee hero / service / product / background / section / gallery /
 * testimonial URLs exist so components never render empty visual areas.
 * Uses premium stock only — never SVG placeholders for photos.
 */
export function ensureRequiredPhotoAssets(
  manifest: CoreAssetManifest,
  industry?: string | null,
  options?: {
    routingIndustryId?: string | null;
    imageSystemSpec?: ImageSystemSpec | null;
  },
): CoreAssetManifest {
  const items = [...manifest.items];
  const specById = new Map(
    (options?.imageSystemSpec?.specifications ?? []).map((s) => [s.id, s]),
  );

  const semanticForItem = (item: (typeof items)[number]) => {
    const spec = specById.get(item.id);
    return (
      spec?.providerPrompt ||
      spec?.visualConcept ||
      item.metadata?.prompt ||
      item.prompt
    );
  };

  // Replace SVG / generic placeholders with spec-aligned premium stock photography.
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]!;
    if (item.role === "icon") continue;
    if (isPhotographicUrl(item.url)) continue;
    const semanticQuery = semanticForItem(item);
    items[i] = {
      ...item,
      url: resolvePremiumStockUrl({
        industry,
        routingIndustryId: options?.routingIndustryId,
        role: item.role,
        seed: item.id,
        semanticQuery,
      }),
      status: "generated",
      mimeType: "image/jpeg",
      metadata: {
        ...item.metadata,
        purpose: (item.metadata?.purpose || item.role) as "hero",
        provider: "premium-stock",
        style: item.metadata?.style || "premium-stock",
        prompt: semanticQuery || `Semantic ${item.role} photography`,
        visualConcept: specById.get(item.id)?.visualConcept,
        sectionPurpose: specById.get(item.id)?.sectionPurpose,
      },
    };
  }

  const routingId = options?.routingIndustryId ?? industry ?? "business";
  const roleCounts = resolveRequiredPhotoRoleCounts(routingId);

  for (const role of REQUIRED_PHOTO_ROLES) {
    const haveCount = items.filter(
      (i) => i.role === role && isPhotographicUrl(i.url),
    ).length;
    const need = roleCounts[role] ?? 1;
    if (need <= 0) continue;
    for (let i = haveCount; i < need; i += 1) {
      const id = need === 1 ? role : `${role}-${i + 1}`;
      if (items.some((item) => item.id === id && isPhotographicUrl(item.url))) {
        continue;
      }
      const spec =
        specById.get(id) ||
        [...specById.values()].find((s) => s.role === role);
      const semanticQuery =
        spec?.providerPrompt || spec?.visualConcept || undefined;
      const url = resolvePremiumStockUrl({
        industry,
        routingIndustryId: options?.routingIndustryId,
        role,
        seed: `${id}-${industry || "business"}`,
        semanticQuery,
      });
      items.push({
        id: spec?.id || id,
        role,
        name: `${role} image ${need === 1 ? "" : i + 1}`.trim(),
        prompt: semanticQuery || `Semantic ${role} photography for ${industry || "business"}`,
        alt: spec?.accessibility.altText || `Premium ${role} photography`,
        url,
        storagePath: null,
        status: "generated",
        mimeType: "image/jpeg",
        metadata: {
          purpose: role as "hero",
          provider: "premium-stock",
          style: "premium-stock",
          prompt: semanticQuery || `Semantic ${role} photography`,
          visualConcept: spec?.visualConcept,
          sectionPurpose: spec?.sectionPurpose,
        },
      });
    }
  }

  return {
    ...manifest,
    engine: manifest.engine || "ai-assets-engine",
    items,
  };
}

/** True when the project has a real hero photo URL (not empty / SVG). */
export function hasPublishableHeroImage(manifest: CoreAssetManifest): boolean {
  return manifest.items.some(
    (i) =>
      i.role === "hero" &&
      Boolean(i.url) &&
      !i.url!.startsWith("data:image/svg") &&
      i.mimeType !== "image/svg+xml",
  );
}

function groupByRole(manifest: CoreAssetManifest) {
  const map = new Map<string, typeof manifest.items>();
  for (const item of manifest.items) {
    const list = map.get(item.role) ?? [];
    list.push(item);
    map.set(item.role, list);
  }
  return map;
}

function firstUrl(
  byRole: Map<string, CoreAssetManifest["items"]>,
  role: string,
): string | null {
  const item = byRole.get(role)?.find((i) => i.url);
  return item?.url ?? null;
}

function urlsForRole(
  byRole: Map<string, CoreAssetManifest["items"]>,
  role: string,
): string[] {
  return (byRole.get(role) ?? [])
    .map((i) => i.url)
    .filter((u): u is string => Boolean(u));
}

function normalizePhotoUrl(
  url: string | null | undefined,
  role = "section",
): string | null {
  if (!url?.trim()) return null;
  return optimizePhotoUrlForRole(normalizePremiumStockUrl(url.trim()), role);
}

function buildSiteImagesModule(params: {
  hero: string | null;
  product: string | null;
  service: string | null;
  background: string | null;
  brand: string | null;
  sections: string[];
  gallery: string[];
  testimonials: string[];
  about: string[];
  features: string[];
  team: string[];
  items: CoreAssetManifest["items"];
  routingIndustryId?: string | null;
}): string {
  const meta = params.items.map((item) => ({
    id: item.id,
    role: item.role,
    name: item.name,
    alt: item.alt,
    url: normalizePhotoUrl(item.url, item.role),
    status: item.status,
    purpose: item.metadata?.purpose ?? item.role,
    section: item.metadata?.section,
    style: item.metadata?.style,
    prompt: item.metadata?.prompt ?? item.prompt,
    provider: item.metadata?.provider,
    artDirection: item.metadata?.artDirection,
  }));

  // Never export null for primary roles when any photo exists in the pool.
  const pool = [
    params.hero,
    params.product,
    params.service,
    params.background,
    ...params.sections,
    ...params.gallery,
    ...params.testimonials,
  ]
    .map((url, i) =>
      normalizePhotoUrl(url, i === 0 ? "hero" : "section"),
    )
    .filter((u): u is string => Boolean(u));
  const fallback = pool[0] ?? null;
  const policy = getIndustryVisualPolicy(params.routingIndustryId);
  const subjectSparing = Boolean(policy);
  const heroDominant = policy?.heroDominant ?? false;
  const hero = normalizePhotoUrl(params.hero, "hero") || fallback;
  const product = heroDominant
    ? hero
    : normalizePhotoUrl(params.product, "product") || hero || fallback;
  const service = normalizePhotoUrl(params.service, "service") || product || fallback;
  const rawBackground =
    normalizePhotoUrl(params.background, "background") || service || fallback;
  const background =
    policy &&
    heroDominant &&
    isSubjectPackPhotoUrl(rawBackground, policy.subjectPackId)
      ? service && !isSubjectPackPhotoUrl(service, policy.subjectPackId)
        ? service
        : rawBackground
      : rawBackground;
  const sections = subjectSparing
    ? capSubjectSparingSectionUrls(
        params.routingIndustryId,
        hero,
        params.sections
          .map((url) => normalizePhotoUrl(url, "section")!)
          .filter(Boolean),
        service,
      )
    : params.sections.length > 0
      ? params.sections
          .map((url) => normalizePhotoUrl(url, "section")!)
          .filter(Boolean)
      : ([service, product, hero].filter(Boolean) as string[]);
  const gallery = subjectSparing
    ? capSubjectSparingGalleryUrls(params.routingIndustryId, hero, params.gallery)
    : params.gallery.length > 0
      ? params.gallery
          .map((url) => normalizePhotoUrl(url, "gallery")!)
          .filter(Boolean)
      : ([product, hero, service].filter(Boolean) as string[]);
  const testimonials =
    params.testimonials.length > 0
      ? params.testimonials
          .map((url) => normalizePhotoUrl(url, "testimonial")!)
          .filter(Boolean)
      : heroDominant
        ? []
        : ([hero, product].filter(Boolean) as string[]);
  const about = subjectSparing && policy
    ? stripSubjectPackPhotos(
        params.about.length > 0
          ? params.about.map((url) => normalizePhotoUrl(url, "about")!).filter(Boolean)
          : sections,
        policy.subjectPackId,
        hero,
      ).slice(0, 2)
    : params.about.length > 0
      ? params.about.map((url) => normalizePhotoUrl(url, "about")!).filter(Boolean)
      : sections;
  const features = subjectSparing && policy
    ? stripSubjectPackPhotos(
        params.features.length > 0
          ? params.features
              .map((url) => normalizePhotoUrl(url, "features")!)
              .filter(Boolean)
          : ([service].filter(Boolean) as string[]),
        policy.subjectPackId,
        hero,
      ).slice(0, 2)
    : params.features.length > 0
      ? params.features
          .map((url) => normalizePhotoUrl(url, "features")!)
          .filter(Boolean)
      : heroDominant
        ? ([service].filter(Boolean) as string[])
        : ([service, product].filter(Boolean) as string[]);
  const team =
    params.team.length > 0
      ? params.team.map((url) => normalizePhotoUrl(url, "team")!).filter(Boolean)
      : testimonials;

  const exportMeta = heroDominant
    ? meta.map((item) => {
        if (item.role === "hero") return item;
        if (item.role === "product" || item.role === "gallery" || item.role === "brand") {
          return { ...item, url: hero };
        }
        if (item.url && isAutomotiveVehiclePhotoUrl(item.url)) {
          return {
            ...item,
            url:
              service && !isAutomotiveVehiclePhotoUrl(service)
                ? service
                : resolvePremiumStockUrl({
                    routingIndustryId: "business",
                    industry: "business",
                    role: item.role,
                    seed: item.id,
                  }),
          };
        }
        return item;
      })
    : meta;

  return `/**
 * Website Builder Image Engine — generated site imagery.
 * Semantic slots: hero, gallery, about, features, team, products, testimonials, backgrounds.
 */

export const HERO_IMAGE = ${JSON.stringify(hero)};
export const PRODUCT_IMAGE = ${JSON.stringify(product)};
export const SERVICE_IMAGE = ${JSON.stringify(service)};
export const BACKGROUND_IMAGE = ${JSON.stringify(background)};
export const ABOUT_IMAGE = ${JSON.stringify(about[0] ?? hero)};
export const BRAND_IMAGE = ${JSON.stringify(normalizePhotoUrl(params.brand, "brand") || hero)};
export const SECTION_IMAGES = ${JSON.stringify(about.length ? about : sections)} as const;
export const FEATURE_IMAGES = ${JSON.stringify(features)} as const;
export const TEAM_IMAGES = ${JSON.stringify(team)} as const;
export const GALLERY_IMAGES = ${JSON.stringify(gallery)} as const;
export const TESTIMONIAL_IMAGES = ${JSON.stringify(testimonials)} as const;

export type ImageSlotKind =
  | "hero"
  | "gallery"
  | "about"
  | "features"
  | "team"
  | "products"
  | "testimonials"
  | "backgrounds";

export type SiteImageMeta = {
  id: string;
  role: string;
  name: string;
  alt: string;
  url: string | null;
  status: string;
  purpose?: string;
  section?: string;
  style?: string;
  prompt?: string;
  provider?: string;
  artDirection?: string;
  slot?: ImageSlotKind;
  objectPosition?: string;
  isUserOverride?: boolean;
};

export const SITE_IMAGES: SiteImageMeta[] = ${JSON.stringify(exportMeta, null, 2)};

export function siteImagePool(): string[] {
  return [
    HERO_IMAGE,
    PRODUCT_IMAGE,
    SERVICE_IMAGE,
    BACKGROUND_IMAGE,
    ABOUT_IMAGE,
    ...SECTION_IMAGES,
    ...FEATURE_IMAGES,
    ...TEAM_IMAGES,
    ...GALLERY_IMAGES,
    ...TESTIMONIAL_IMAGES,
  ].filter((u): u is string => Boolean(u));
}

export function slotImages(kind: ImageSlotKind): readonly string[] {
  switch (kind) {
    case "hero":
      return [HERO_IMAGE];
    case "gallery":
      return GALLERY_IMAGES;
    case "about":
      return SECTION_IMAGES.length ? SECTION_IMAGES : [ABOUT_IMAGE];
    case "features":
      return FEATURE_IMAGES.length ? FEATURE_IMAGES : SECTION_IMAGES;
    case "team":
      return TEAM_IMAGES;
    case "products":
      return [PRODUCT_IMAGE, ...GALLERY_IMAGES].filter(Boolean);
    case "testimonials":
      return TESTIMONIAL_IMAGES;
    case "backgrounds":
      return [BACKGROUND_IMAGE, HERO_IMAGE].filter(Boolean);
    default:
      return siteImagePool();
  }
}

export function imageByRole(role: string): string | null {
  const hit = SITE_IMAGES.find((i) => i.role === role && i.url);
  return hit?.url ?? null;
}

function sharpenUnsplashUrl(url: string, role: string): string {
  if (!url?.trim()) return "";
  const trimmed = url.trim();
  if (!trimmed.includes("images.unsplash.com")) return trimmed;
  const base = trimmed.split("?")[0]!;
  const w =
    role === "hero" || role === "background"
      ? 2400
      : role === "testimonial" || role === "team"
        ? 960
        : 1920;
  const q = w >= 2400 ? 90 : 88;
  return \`\${base}?auto=format&fit=crop&w=\${w}&q=\${q}\`;
}

export function resolveSlotImage(
  kind: ImageSlotKind,
  index = 0,
  preferred?: string | null,
): string {
  if (preferred?.trim()) return sharpenUnsplashUrl(preferred.trim(), kind);
  const images = slotImages(kind);
  if (images.length > 0) {
    return sharpenUnsplashUrl(images[index % images.length]!, kind);
  }
  return resolveSiteImage(null, index);
}

/** Resolve a photographic URL for a slot — never returns empty string when pool has images. */
export function resolveSiteImage(
  preferred?: string | null,
  index = 0,
): string {
  if (preferred?.trim()) {
    return sharpenUnsplashUrl(preferred.trim(), index === 0 ? "hero" : "section");
  }
  const pool = siteImagePool();
  if (!pool.length) return "";
  return sharpenUnsplashUrl(pool[index % pool.length]!, "section");
}
`;
}

function photoPool(urls: {
  hero: string | null;
  product: string | null;
  service: string | null;
  background: string | null;
  sections: string[];
  gallery: string[];
  testimonials?: string[];
}): string[] {
  return [
    urls.hero,
    ...urls.gallery,
    ...urls.sections,
    ...(urls.testimonials ?? []),
    urls.product,
    urls.service,
    urls.background,
  ].filter((u): u is string => Boolean(u));
}

function rewritePlaceholders(
  content: string,
  urls: {
    hero: string | null;
    product: string | null;
    service: string | null;
    background: string | null;
    sections: string[];
    gallery: string[];
    testimonials?: string[];
  },
): string {
  const pool = photoPool(urls);
  if (!pool.length) return content;

  if (!PLACEHOLDER_URL_RE.test(content)) {
    PLACEHOLDER_URL_RE.lastIndex = 0;
  } else {
    PLACEHOLDER_URL_RE.lastIndex = 0;
    let index = 0;
    content = content.replace(PLACEHOLDER_URL_RE, () => {
      const next = pool[index % pool.length]!;
      index += 1;
      return next;
    });
  }

  return content;
}

function fillEmptyImageSrcs(
  content: string,
  urls: {
    hero: string | null;
    product: string | null;
    service: string | null;
    background: string | null;
    sections: string[];
    gallery: string[];
    testimonials?: string[];
  },
): string {
  const pool = photoPool(urls);
  if (!pool.length) return content;

  let index = 0;
  EMPTY_IMG_SRC_RE.lastIndex = 0;
  return content.replace(EMPTY_IMG_SRC_RE, (_match, prefix: string, quote: string) => {
    const next = pool[index % pool.length]!;
    index += 1;
    return `${prefix}${quote}${next}${quote}`;
  });
}
