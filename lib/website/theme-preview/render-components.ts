import { getThemeComponentRole } from "@/lib/website/builder/theme-component-registry";
import { buildThemeComponentProps } from "@/lib/website/theme-preview/component-props";
import { renderThemeScaffoldMarkup } from "@/lib/website/theme-preview/scaffold-compiler";
import type { ThemePreviewContent, ThemePreviewContext } from "@/lib/website/theme-preview/types";

export function renderThemeComponent(
  componentId: string,
  previewCtx: ThemePreviewContext,
  content: ThemePreviewContent,
  contentSlot: number,
  files?: Array<{ path: string; content: string }>,
): string {
  try {
    const props = buildThemeComponentProps(componentId, content, contentSlot);
    return renderThemeScaffoldMarkup(
      componentId,
      previewCtx.themeId,
      props,
      content,
      files,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown scaffold render error";
    return `<div data-component="${componentId}" data-theme-scaffold-error="${message.replaceAll('"', "&quot;")}"></div>`;
  }
}

export function isThemeBodyComponent(id: string): boolean {
  const role = getThemeComponentRole(id);
  return Boolean(
    role &&
      role !== "nav" &&
      role !== "footer" &&
      role !== "floating-cta" &&
      role !== "hero",
  );
}
