export type InstalledTemplateMediaKind = "thumbnail" | "preview";

const MEDIA_API = "/api/website-builder/template-marketplace/media";

export function resolveInstalledTemplateMediaUrl(
  templateId: string,
  kind: InstalledTemplateMediaKind,
): string {
  const params = new URLSearchParams({
    templateId,
    kind,
  });
  return `${MEDIA_API}?${params.toString()}`;
}
