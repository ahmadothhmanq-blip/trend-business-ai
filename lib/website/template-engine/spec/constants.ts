/** Template Package Specification format version (layout-driven / region-based). */
export const WB_TEMPLATE_PACKAGE_SPEC_VERSION = "2.0.0";

/** Required manifest filename at the root of every template package. */
export const WB_TEMPLATE_MANIFEST_FILENAME = "manifest.json";

/** Default subdirectory names inside a template package. */
export const WB_TEMPLATE_PACKAGE_DIRS = {
  pages: "pages",
  layouts: "layouts",
  regions: "regions",
  assets: "assets",
  canvas: "canvas",
} as const;

/** Allowed image extensions for thumbnail and preview media. */
export const WB_TEMPLATE_MEDIA_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
] as const;

export const WB_TEMPLATE_CATEGORIES = [
  "business",
  "corporate",
  "enterprise",
  "saas",
  "ai-startup",
  "agency",
  "creative-agency",
  "marketing-agency",
  "portfolio",
  "restaurant",
  "cafe",
  "hotel",
  "travel",
  "real-estate",
  "architecture",
  "construction",
  "healthcare",
  "medical",
  "dental",
  "pharmacy",
  "legal",
  "law-firm",
  "finance",
  "insurance",
  "education",
  "university",
  "ecommerce",
  "fashion",
  "beauty",
  "fitness",
  "automotive",
  "logistics",
  "manufacturing",
  "nonprofit",
  "blog",
  "landing",
  "other",
] as const;

export const WB_TEMPLATE_UPDATE_CHANNELS = ["stable", "beta", "alpha"] as const;

export const WB_TEMPLATE_LAYOUT_KINDS = [
  "single-column",
  "sidebar-left",
  "sidebar-right",
  "full-bleed",
] as const;

/** Semantic region roles — structural slots, not business content. */
export const WB_TEMPLATE_REGION_ROLES = [
  "header",
  "main",
  "sidebar",
  "footer",
  "overlay",
  "utility",
] as const;

/** How components may be ordered inside a region. */
export const WB_TEMPLATE_COMPONENT_ORDERING = [
  "vertical",
  "horizontal",
  "grid",
  "free",
] as const;

/** Region width modes. */
export const WB_TEMPLATE_REGION_WIDTH = [
  "full",
  "contained",
  "narrow",
  "wide",
] as const;

/** Region alignment modes. */
export const WB_TEMPLATE_REGION_ALIGNMENT = [
  "start",
  "center",
  "end",
  "stretch",
] as const;

/**
 * Well-known component types a region may allow.
 * Templates may also permit arbitrary types via `allowCustomComponents`.
 */
export const WB_TEMPLATE_KNOWN_COMPONENT_TYPES = [
  "hero",
  "banner",
  "features",
  "gallery",
  "pricing",
  "faq",
  "team",
  "blog",
  "contact",
  "video",
  "timeline",
  "cta",
  "navigation",
  "logo",
  "testimonials",
  "services",
  "custom",
] as const;

export const WB_TEMPLATE_COMPONENT_CATEGORIES = [
  "content",
  "media",
  "commerce",
  "form",
  "navigation",
  "custom",
] as const;
