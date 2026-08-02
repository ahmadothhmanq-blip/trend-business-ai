/**
 * Extract editable section configuration from generated components.
 */

import {
  mergeSectionConfig,
  parseSectionConfig,
  WB_SECTION_CONFIG_ATTR,
  WB_SECTION_ID_ATTR,
} from "@/lib/ai-core/visual-editor/section-config";
import {
  createDefaultSectionConfig,
  inferSectionType,
  type VisualSectionConfig,
} from "@/lib/ai-core/visual-editor/section-types";
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
    new RegExp(`${WB_SECTION_CONFIG_ATTR}\\s*=\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"),
    new RegExp(`${WB_SECTION_CONFIG_ATTR}\\s*=\\s*'((?:\\\\.|[^'\\\\])*)'`, "i"),
  ];
  for (const re of patterns) {
    const match = attrs.match(re);
    if (match?.[1]) return unescapeHtml(match[1]);
  }
  return undefined;
}

function readIdFromAttrs(attrs: string): string | undefined {
  const match = attrs.match(
    new RegExp(`${WB_SECTION_ID_ATTR}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"),
  );
  return match?.[2] ?? match?.[3];
}

function readHtmlId(attrs: string): string | undefined {
  const match = attrs.match(/\bid\s*=\s*("([^"]*)"|'([^']*)')/i);
  return match?.[2] ?? match?.[3];
}

function readClassName(attrs: string): string | undefined {
  const match = attrs.match(/className\s*=\s*("([^"]*)"|'([^']*)'|\{`([^`]*)`\})/i);
  return match?.[2] ?? match?.[3] ?? match?.[4];
}

export function extractSectionConfig(params: {
  exportName: string;
  kind: VisualNodeKind;
  componentSource?: string;
}): VisualSectionConfig {
  const { exportName, kind, componentSource } = params;
  const sectionType = inferSectionType(exportName, kind);
  let resolvedId = `${exportName}-section`;
  let configPartial: Partial<VisualSectionConfig> | null = null;
  let htmlId = "";
  let cssClasses = "";

  if (componentSource) {
    const rootMatch = componentSource.match(SECTION_ROOT_RE);
    if (rootMatch?.[2]) {
      const attrs = rootMatch[2];
      configPartial = parseSectionConfig(readConfigFromAttrs(attrs));
      const configId = readIdFromAttrs(attrs);
      if (configId) resolvedId = configId;
      htmlId = readHtmlId(attrs) ?? "";
      const className = readClassName(attrs) ?? "";
      cssClasses = className
        .split(/\s+/)
        .filter((c) => c && !c.startsWith("wb-"))
        .join(" ");
    }
  }

  const base = createDefaultSectionConfig({
    id: resolvedId,
    sectionExportName: exportName,
    sectionType,
    kind,
    settings: {
      htmlId,
      anchor: htmlId.startsWith("#") ? htmlId.slice(1) : htmlId,
      cssClasses,
      customAttributes: "",
    },
  });

  return mergeSectionConfig(base, configPartial);
}
