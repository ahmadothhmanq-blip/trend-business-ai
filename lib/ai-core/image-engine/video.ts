/**
 * Video Asset Preparation — system ready for hero / product / background videos.
 * Prepares briefs + poster roles; actual video generation can plug in later.
 */

import type { ImageIntelligenceContext } from "@/lib/ai-core/image-engine/types";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";

export type VideoAssetKind = "hero-video" | "product-video" | "background-video";

export type VideoAssetBrief = {
  id: string;
  kind: VideoAssetKind;
  title: string;
  purpose: string;
  /** Poster image role to bind until video URL exists. */
  posterRole: "hero" | "product" | "background";
  artDirection: string;
  durationHint: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  status: "prepared" | "awaiting-provider";
  posterUrl?: string | null;
  videoUrl?: string | null;
};

export type VideoAssetPackage = {
  briefs: VideoAssetBrief[];
  summary: string;
  readyForProvider: boolean;
};

/**
 * Prepare video asset briefs for the website (posters from image manifest).
 */
export function prepareVideoAssets(params: {
  ctx: ImageIntelligenceContext;
  brandIdentity?: BrandIdentityBrief | null;
  imageManifest?: CoreAssetManifest | null;
}): VideoAssetPackage {
  const poster = (role: "hero" | "product" | "background") =>
    params.imageManifest?.items.find((i) => i.role === role && i.url)?.url ??
    null;

  const mood =
    params.brandIdentity?.imageDirection ||
    params.ctx.imageRequirements[0] ||
    `${params.ctx.imageStyle} cinematic motion for ${params.ctx.industry}`;

  const briefs: VideoAssetBrief[] = [
    {
      id: "video-hero",
      kind: "hero-video",
      title: "Hero brand film",
      purpose: "Cinematic opening loop for full-bleed / video heroes",
      posterRole: "hero",
      artDirection: `${mood}; slow push-in; ${params.ctx.offer}; no text overlays`,
      durationHint: "6–12s seamless loop",
      aspectRatio: "16:9",
      status: "prepared",
      posterUrl: poster("hero"),
      videoUrl: null,
    },
    {
      id: "video-product",
      kind: "product-video",
      title: "Product showcase clip",
      purpose: "Product / offer motion for interactive or product sections",
      posterRole: "product",
      artDirection: `${mood}; product detail reveals; soft camera orbit`,
      durationHint: "8–15s",
      aspectRatio: "16:9",
      status: "prepared",
      posterUrl: poster("product"),
      videoUrl: null,
    },
    {
      id: "video-background",
      kind: "background-video",
      title: "Atmospheric background loop",
      purpose: "Subtle motion backdrop behind copy sections",
      posterRole: "background",
      artDirection: `${mood}; abstract atmosphere; low contrast motion; text-safe`,
      durationHint: "10–20s loop",
      aspectRatio: "16:9",
      status: "prepared",
      posterUrl: poster("background"),
      videoUrl: null,
    },
  ];

  return {
    briefs,
    readyForProvider: briefs.every((b) => Boolean(b.posterUrl)),
    summary: `Prepared ${briefs.length} video briefs (posters ${briefs.filter((b) => b.posterUrl).length}/${briefs.length}) for ${params.ctx.projectName}`,
  };
}

/** Emit a small module for generated sites (poster-first video readiness). */
export function buildSiteVideoModule(pkg: VideoAssetPackage): string {
  return `/**
 * AI Assets Engine — video preparation (poster-first).
 * videoUrl is null until a video provider is connected.
 */

export type SiteVideoBrief = {
  id: string;
  kind: string;
  title: string;
  posterUrl: string | null;
  videoUrl: string | null;
  aspectRatio: string;
};

export const SITE_VIDEOS: SiteVideoBrief[] = ${JSON.stringify(
    pkg.briefs.map((b) => ({
      id: b.id,
      kind: b.kind,
      title: b.title,
      posterUrl: b.posterUrl ?? null,
      videoUrl: b.videoUrl ?? null,
      aspectRatio: b.aspectRatio,
    })),
    null,
    2,
  )};

export const HERO_VIDEO_POSTER = SITE_VIDEOS.find((v) => v.kind === "hero-video")?.posterUrl ?? null;
export const HERO_VIDEO_URL = SITE_VIDEOS.find((v) => v.kind === "hero-video")?.videoUrl ?? null;

export function videoPoster(kind: string): string | null {
  return SITE_VIDEOS.find((v) => v.kind === kind)?.posterUrl ?? HERO_VIDEO_POSTER;
}
`;
}
