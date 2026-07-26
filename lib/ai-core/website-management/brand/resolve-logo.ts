import type { GeneratedWebsiteProject } from "@/plugins/website/types";

/**
 * Resolve the current logo URL from a generated website project blueprint.
 */
export function resolveBrandLogoUrl(
  project: GeneratedWebsiteProject,
): string | null {
  const fromManifest = project.assetManifest?.items?.find(
    (item) =>
      item.role === "brand" ||
      item.metadata?.purpose === "brand" ||
      /logo/i.test(item.name),
  )?.url;
  if (fromManifest?.trim()) return fromManifest.trim();

  for (const file of project.files || []) {
    if (!/\.(tsx|ts|jsx|js|html)$/i.test(file.path)) continue;
    const logoUrlMatch = file.content.match(
      /logoUrl=\{?["']([^"']+)["']\}?/i,
    );
    if (logoUrlMatch?.[1]?.trim()) return logoUrlMatch[1].trim();

    const srcMatch = file.content.match(
      /src=\{?["'](https?:\/\/[^"']+)["']\}?/i,
    );
    if (srcMatch?.[1] && /logo|brand/i.test(file.content)) {
      return srcMatch[1].trim();
    }
  }

  return null;
}
