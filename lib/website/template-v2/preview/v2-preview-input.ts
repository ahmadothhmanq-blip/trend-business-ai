import type { StaticPreviewInput } from "@/lib/website/preview-input";
import {
  resolveInstalledBuilderTemplatePackageId,
} from "@/lib/website/builder/resolve-builder-template-package-id";
import { readTemplateArchitectureFromSettings } from "@/lib/website/template-v2/contracts/settings";

export const V2_PREVIEW_RENDER_VERSION = "v2-files-6";
export const PROJECT_FILES_PREVIEW_RENDER_VERSION = "project-files-1";

const HOME_PAGE_PATH = "app/page.tsx";

function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

export function readHomePageSource(input: StaticPreviewInput): string {
  return (
    input.files?.find((f) => normalizePath(f.path) === HOME_PAGE_PATH)?.content ??
    ""
  );
}

export function isV2PreviewInput(input: StaticPreviewInput): boolean {
  if (input.templateArchitectureVersion === "v2") return true;
  if (input.settings) {
    return readTemplateArchitectureFromSettings(input.settings) === "v2";
  }
  return false;
}

/**
 * True when app/page.tsx was composed by the V2 region-grid pipeline
 * (not a professional-library / LLM home page preserved under structure-first).
 */
export function isV2ComposedHomePage(input: StaticPreviewInput): boolean {
  const page = readHomePageSource(input);
  if (!page.trim()) return false;
  if (/data-v2-package\s*=/.test(page)) return true;
  const packageId = resolveV2PackageId(input);
  if (packageId && page.includes(`${packageId}-`)) {
    return true;
  }
  return false;
}

/** Route stamped V2 projects through the V2 preview renderer. */
export function shouldUseV2PreviewDocument(input: StaticPreviewInput): boolean {
  return isV2PreviewInput(input);
}

/** User explicitly chose a marketplace / structure template or TI skin. */
export function hasExplicitPreviewTemplateChoice(
  input: StaticPreviewInput,
): boolean {
  if (input.templateIntelligenceId?.trim()) return true;
  if (input.websiteThemeId?.trim()) return true;
  if (input.templatePackageId?.trim()) return true;

  const settings = input.settings as Record<string, unknown> | undefined;
  if (typeof settings?.templatePackageId === "string" && settings.templatePackageId.trim()) {
    return true;
  }
  if (
    typeof settings?.websiteStructureTemplateId === "string" &&
    settings.websiteStructureTemplateId.trim()
  ) {
    return true;
  }
  return false;
}

export function isComposedHomePagePlaceholder(pageSource: string): boolean {
  const page = pageSource.trim();
  if (!page) return true;
  if (/Placeholder — the home page is composed/.test(page)) return true;
  return /export default function Page\(\)\s*\{\s*return null;?\s*\}/.test(page);
}

/**
 * TBGE / unified-builder projects: render preview from generated app/page.tsx
 * instead of the legacy TI section fallback (HeroSplit, etc.).
 */
export function shouldUseProjectFilesPreview(input: StaticPreviewInput): boolean {
  if (shouldUseV2PreviewDocument(input)) return false;
  if (hasExplicitPreviewTemplateChoice(input)) return false;
  const page = readHomePageSource(input);
  if (!page.trim() || isComposedHomePagePlaceholder(page)) return false;
  return input.files?.some((f) => normalizePath(f.path) === HOME_PAGE_PATH) ?? false;
}

export function resolveV2PackageId(input: StaticPreviewInput): string | null {
  const page = input.files?.find(
    (f) => f.path.replaceAll("\\", "/") === "app/page.tsx",
  )?.content;
  if (page) {
    const match = page.match(/data-v2-package=(?:"([^"]+)"|'([^']+)')/);
    const fromPage = match?.[1] || match?.[2];
    if (fromPage?.trim()) return fromPage.trim();
  }

  const fromField = input.templatePackageId?.trim();
  if (fromField) {
    return resolveInstalledBuilderTemplatePackageId(fromField);
  }

  const settings = input.settings as Record<string, unknown> | undefined;
  const fromSettings =
    typeof settings?.templatePackageId === "string"
      ? settings.templatePackageId.trim()
      : typeof settings?.websiteStructureTemplateId === "string"
        ? settings.websiteStructureTemplateId.trim()
        : "";
  if (fromSettings) {
    return resolveInstalledBuilderTemplatePackageId(fromSettings);
  }

  return null;
}

export function v2PreviewCacheSignature(input: StaticPreviewInput): string | null {
  if (!shouldUseV2PreviewDocument(input)) return null;
  const packageId = resolveV2PackageId(input) ?? "unknown";
  const presentationHash =
    (input.settings as Record<string, unknown> | undefined)
      ?.templatePresentationHash ?? "";
  const components = (input.components ?? []).join(",");
  return `${packageId}|${presentationHash}|${components}|${V2_PREVIEW_RENDER_VERSION}`;
}
