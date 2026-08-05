import type { StaticPreviewInput } from "@/lib/website/preview-input";
import { resolveBuilderTemplatePackageId } from "@/lib/website/builder/resolve-builder-template-package-id";
import { readTemplateArchitectureFromSettings } from "@/lib/website/template-v2/contracts/settings";

export const V2_PREVIEW_RENDER_VERSION = "v2-files";

export function isV2PreviewInput(input: StaticPreviewInput): boolean {
  if (input.templateArchitectureVersion === "v2") return true;
  if (input.settings) {
    return readTemplateArchitectureFromSettings(input.settings) === "v2";
  }
  return false;
}

export function resolveV2PackageId(input: StaticPreviewInput): string | null {
  const fromField = input.templatePackageId?.trim();
  if (fromField) return resolveBuilderTemplatePackageId(fromField);

  const settings = input.settings as Record<string, unknown> | undefined;
  const fromSettings =
    typeof settings?.templatePackageId === "string"
      ? settings.templatePackageId.trim()
      : typeof settings?.websiteStructureTemplateId === "string"
        ? settings.websiteStructureTemplateId.trim()
        : "";
  if (fromSettings) return resolveBuilderTemplatePackageId(fromSettings);

  const page = input.files?.find(
    (f) => f.path.replaceAll("\\", "/") === "app/page.tsx",
  )?.content;
  if (!page) return null;
  const match = page.match(/data-v2-package=(?:"([^"]+)"|'([^']+)')/);
  return match?.[1] || match?.[2] || null;
}

export function v2PreviewCacheSignature(input: StaticPreviewInput): string | null {
  if (!isV2PreviewInput(input)) return null;
  const packageId = resolveV2PackageId(input) ?? "unknown";
  const presentationHash =
    (input.settings as Record<string, unknown> | undefined)
      ?.templatePresentationHash ?? "";
  const components = (input.components ?? []).join(",");
  return `${packageId}|${presentationHash}|${components}|${V2_PREVIEW_RENDER_VERSION}`;
}
