/**
 * Website-specific structure extensions for GenerationSpec.
 */

export type WebsitePageSpec = {
  name: string;
  path: string;
  purpose: string;
  sections: string[];
  primaryCta?: string;
};

export type WebsiteNavigationSpec = {
  items: Array<{ label: string; href: string }>;
  style?: string;
};

export type WebsiteStructure = {
  kind: "website";
  pages: WebsitePageSpec[];
  navigation: WebsiteNavigationSpec;
  footerSections?: string[];
};

export function isWebsiteStructure(
  value: unknown,
): value is WebsiteStructure {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as WebsiteStructure).kind === "website" &&
    Array.isArray((value as WebsiteStructure).pages)
  );
}
