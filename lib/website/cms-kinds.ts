/**
 * Canonical CMS entry kinds — aligned with migration 047 DB constraint.
 */

export const CMS_DB_KINDS = [
  "page",
  "section",
  "post",
  "media",
  "faq",
  "testimonial",
  "custom",
] as const;

export type CmsDbKind = (typeof CMS_DB_KINDS)[number];

/** App-facing kind labels (backward compatible with management UI). */
export type CmsAppKind =
  | "page-block"
  | "post"
  | "announcement"
  | "media"
  | "page"
  | "section"
  | "faq"
  | "testimonial"
  | "custom";

const APP_TO_DB: Record<CmsAppKind, CmsDbKind> = {
  "page-block": "section",
  announcement: "custom",
  post: "post",
  media: "media",
  page: "page",
  section: "section",
  faq: "faq",
  testimonial: "testimonial",
  custom: "custom",
};

const DB_TO_APP: Record<CmsDbKind, CmsAppKind> = {
  page: "page",
  section: "page-block",
  post: "post",
  media: "media",
  faq: "faq",
  testimonial: "testimonial",
  custom: "announcement",
};

export function cmsKindToDb(kind: string): CmsDbKind {
  const mapped = APP_TO_DB[kind as CmsAppKind];
  if (mapped) return mapped;
  if ((CMS_DB_KINDS as readonly string[]).includes(kind)) {
    return kind as CmsDbKind;
  }
  return "custom";
}

export function cmsKindFromDb(kind: string): CmsAppKind {
  if ((DB_TO_APP as Record<string, CmsAppKind>)[kind]) {
    return DB_TO_APP[kind as CmsDbKind];
  }
  return "custom";
}
