/**
 * Image optimization helpers — responsive URLs, modern formats, lazy loading attrs.
 */

export type OptimizeImageOptions = {
  width?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg";
};

const DEFAULT_WIDTHS = [640, 960, 1280, 1920, 2400] as const;

/** Target Unsplash width by photographic role. */
export function stockWidthForRole(role: string): number {
  const key = role.toLowerCase();
  if (key === "hero" || key === "background") return 2400;
  if (key === "testimonial" || key === "brand") return 960;
  if (
    key === "gallery" ||
    key === "product" ||
    key === "section" ||
    key === "service"
  ) {
    return 1920;
  }
  return 1600;
}

export function stockQualityForRole(role: string): number {
  const key = role.toLowerCase();
  if (key === "hero" || key === "background") return 90;
  return 88;
}

/** Normalize a photographic URL for web display at role-appropriate sharpness. */
export function optimizePhotoUrlForRole(url: string, role: string): string {
  return optimizeImageUrl(url, {
    width: stockWidthForRole(role),
    quality: stockQualityForRole(role),
  });
}

/**
 * Build an optimized image URL with width/quality params.
 * Supports Unsplash CDN; passes through other URLs unchanged.
 */
export function optimizeImageUrl(
  url: string,
  opts: OptimizeImageOptions = {},
): string {
  if (!url?.trim()) return "";
  const trimmed = url.trim();

  if (trimmed.includes("images.unsplash.com")) {
    const base = trimmed.split("?")[0]!;
    const width = opts.width ?? 1920;
    const quality = opts.quality ?? 88;
    const format = opts.format ?? "auto";
    const params = new URLSearchParams({
      auto: "format",
      fit: "crop",
      w: String(width),
      q: String(quality),
    });
    if (format !== "auto" && format !== "jpg") {
      params.set("fm", format);
    }
    return `${base}?${params.toString()}`;
  }

  return trimmed;
}

/** Responsive srcset for Unsplash photography. */
export function buildResponsiveSrcSet(
  url: string,
  widths: readonly number[] = DEFAULT_WIDTHS,
): string {
  if (!url.includes("images.unsplash.com")) return "";
  return widths
    .map((w) => `${optimizeImageUrl(url, { width: w })} ${w}w`)
    .join(", ");
}

export function defaultSizesAttr(breakpoints = "(max-width: 768px) 100vw, 1200px"): string {
  return breakpoints;
}

export type LazyImageAttrs = {
  loading: "lazy" | "eager";
  decoding: "async" | "sync" | "auto";
  fetchPriority?: "high" | "low" | "auto";
};

/** Lazy-loading attributes — hero uses eager + high fetch priority. */
export function lazyImageAttrs(role: "hero" | "content" = "content"): LazyImageAttrs {
  if (role === "hero") {
    return { loading: "eager", decoding: "async", fetchPriority: "high" };
  }
  return { loading: "lazy", decoding: "async" };
}

/** Pick optimal format hint for next/image or img src. */
export function preferredModernFormat(): "webp" | "avif" {
  return "webp";
}
