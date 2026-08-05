/**
 * Image optimization helpers — responsive URLs, modern formats, lazy loading attrs.
 */

export type OptimizeImageOptions = {
  width?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg";
};

const DEFAULT_WIDTHS = [400, 800, 1200, 1600, 2400] as const;

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
    const width = opts.width ?? 1600;
    const quality = opts.quality ?? 82;
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
