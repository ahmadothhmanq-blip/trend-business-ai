/**
 * Extract editable section backgrounds from generated components.
 */

import {
  mergeSectionBgConfig,
  parseSectionBgConfig,
  WB_SECTION_BG_CONFIG_ATTR,
  WB_SECTION_BG_ID_ATTR,
  WB_SECTION_BG_IMG_CLASS,
} from "@/lib/ai-core/visual-editor/section-bg-config";
import {
  createDefaultSectionBackground,
  type VisualSectionBackground,
} from "@/lib/ai-core/visual-editor/section-bg-types";
import {
  parseComponentInvocation,
  parseDefaultPropsFromComponent,
} from "@/lib/ai-core/visual-editor/hydrate-node-text";
import type { VisualNodeKind } from "@/lib/ai-core/visual-editor/types";

const SECTION_ROOT_RE =
  /<(section|header|footer)\b([^>]*)>([\s\S]*?)<\/\1>/i;

function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function readConfigFromAttrs(attrs: string): string | undefined {
  const patterns = [
    new RegExp(`${WB_SECTION_BG_CONFIG_ATTR}\\s*=\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"),
    new RegExp(`${WB_SECTION_BG_CONFIG_ATTR}\\s*=\\s*'((?:\\\\.|[^'\\\\])*)'`, "i"),
  ];
  for (const re of patterns) {
    const match = attrs.match(re);
    if (match?.[1]) return unescapeHtml(match[1]);
  }
  return undefined;
}

function readIdFromAttrs(attrs: string): string | undefined {
  const match = attrs.match(
    new RegExp(`${WB_SECTION_BG_ID_ATTR}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"),
  );
  return match?.[2] ?? match?.[3];
}

function extractFirstBackgroundImgUrl(source: string): string | undefined {
  const wbImg = source.match(
    new RegExp(
      `<img\\b[^>]*className\\s*=\\s*["'][^"']*${WB_SECTION_BG_IMG_CLASS}[^"']*["'][^>]*src\\s*=\\s*("([^"]*)"|'([^']*)'|\\{([^}]+)\\})`,
      "i",
    ),
  );
  if (wbImg) {
    return unescapeHtml(wbImg[2] ?? wbImg[3] ?? wbImg[4] ?? "").replace(
      /^["'{]|["'}]$/g,
      "",
    );
  }

  const absoluteImg = source.match(
    /<div[^>]*absolute[^>]*inset-0[^>]*>[\s\S]*?<img\b[^>]*src\s*=\s*("([^"]*)"|'([^']*)'|\{([^}]+)\})/i,
  );
  if (absoluteImg) {
    const raw = absoluteImg[2] ?? absoluteImg[3] ?? absoluteImg[4] ?? "";
    const cleaned = unescapeHtml(raw).replace(/^["'{]|["'}]$/g, "");
    if (cleaned && !/HERO_IMAGE|PRODUCT_IMAGE|BACKGROUND_IMAGE|resolveSiteImage/i.test(cleaned)) {
      return cleaned;
    }
  }

  const literalSrc = source.match(/<img\b[^>]*src\s*=\s*"([^"]+)"/i);
  if (literalSrc?.[1] && literalSrc[1].startsWith("http")) {
    return literalSrc[1];
  }

  return undefined;
}

function extractAltFromBgImg(source: string): string | undefined {
  const match = source.match(
    new RegExp(
      `<img\\b[^>]*${WB_SECTION_BG_IMG_CLASS}[^>]*alt\\s*=\\s*("([^"]*)"|'([^']*)')`,
      "i",
    ),
  );
  return match?.[2] ?? match?.[3];
}

function isLiteralUrl(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  return (
    value.startsWith("http") ||
    value.startsWith("/") ||
    value.startsWith("data:")
  );
}

export function extractSectionBackground(params: {
  exportName: string;
  kind: VisualNodeKind;
  componentSource?: string;
  pageSource?: string;
}): VisualSectionBackground {
  const { exportName, kind, componentSource, pageSource } = params;
  const baseId = `${exportName}-bg`;

  const pageProps = pageSource
    ? parseComponentInvocation(pageSource, exportName)
    : {};
  const defaultProps = componentSource
    ? parseDefaultPropsFromComponent(componentSource)
    : {};
  const mergedProps = { ...defaultProps, ...pageProps };
  const imageUrlProp = mergedProps.imageUrl ?? mergedProps.backgroundUrl;
  const hasImageUrlProp = Boolean(
    componentSource?.includes("imageUrl") ||
      componentSource?.includes("backgroundUrl"),
  );

  let resolvedId = baseId;
  let configPartial: Partial<VisualSectionBackground> | null = null;
  let extractedUrl = "";
  let extractedAlt = "";

  if (componentSource) {
    const rootMatch = componentSource.match(SECTION_ROOT_RE);
    if (rootMatch?.[2]) {
      configPartial = parseSectionBgConfig(readConfigFromAttrs(rootMatch[2]));
      const configId = readIdFromAttrs(rootMatch[2]);
      if (configId) resolvedId = configId;
    }
    extractedUrl = extractFirstBackgroundImgUrl(componentSource) ?? "";
    extractedAlt = extractAltFromBgImg(componentSource) ?? "";
  }

  const propUrl = isLiteralUrl(imageUrlProp) ? imageUrlProp : "";
  const url = configPartial?.url || propUrl || extractedUrl || "";

  const base = createDefaultSectionBackground({
    id: resolvedId,
    sectionExportName: exportName,
    kind,
    url,
    source: url ? (configPartial?.source ?? (propUrl ? "url" : "library")) : "none",
    alt: configPartial?.alt || extractedAlt || mergedProps.title || exportName,
    decorative: configPartial?.decorative ?? false,
    hasImageUrlProp,
  });

  return mergeSectionBgConfig(base, configPartial);
}
