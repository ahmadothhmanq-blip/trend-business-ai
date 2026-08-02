/**
 * Apply section configuration edits to generated TSX source files.
 */

import {
  ANIMATION_CLASS,
  LAYOUT_WIDTH_CLASS,
  serializeSectionConfig,
  VISIBILITY_CLASS,
  WB_SECTION_CLASS,
  WB_SECTION_CONFIG_ATTR,
  WB_SECTION_ID_ATTR,
} from "@/lib/ai-core/visual-editor/section-config";
import { sectionPreviewClassName } from "@/lib/ai-core/visual-editor/section-styles";
import type { VisualSectionConfig } from "@/lib/ai-core/visual-editor/section-types";
import type { CSSProperties } from "react";
import { resolveSectionPreviewStyle } from "@/lib/ai-core/visual-editor/section-styles";

const SECTION_ROOT_RE =
  /<(section|header|footer)\b([^>]*)>([\s\S]*?)<\/\1>/i;

function escapeJsxAttr(value: string): string {
  return value.replace(/"/g, "&quot;");
}

function styleToJsxObject(style: CSSProperties): string {
  const entries = Object.entries(style).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  if (!entries.length) return "";
  const body = entries
    .map(([key, value]) => `${key}: ${JSON.stringify(String(value))}`)
    .join(", ");
  return ` style={{ ${body} }}`;
}

function stripWbClasses(className: string): string {
  const allWb = new Set([
    WB_SECTION_CLASS,
    ...Object.values(VISIBILITY_CLASS).filter(Boolean),
    ...Object.values(LAYOUT_WIDTH_CLASS),
    ...Object.values(ANIMATION_CLASS).filter(Boolean),
  ]);
  return className
    .split(/\s+/)
    .filter((c) => c && !allWb.has(c) && !c.startsWith("wb-animate-"))
    .join(" ");
}

function buildRootAttributes(config: VisualSectionConfig): string {
  const serialized = serializeSectionConfig(config);
  const attrs: string[] = [
    `${WB_SECTION_ID_ATTR}="${escapeJsxAttr(config.id)}"`,
    `${WB_SECTION_CONFIG_ATTR}="${escapeJsxAttr(serialized)}"`,
    `className="${escapeJsxAttr(sectionPreviewClassName(config))}"`,
  ];

  const htmlId = config.settings.htmlId.trim() || config.settings.anchor.trim();
  if (htmlId) {
    const id = htmlId.startsWith("#") ? htmlId.slice(1) : htmlId;
    attrs.push(`id="${escapeJsxAttr(id)}"`);
  }

  if (config.settings.customAttributes.trim()) {
    for (const pair of config.settings.customAttributes.split(/\s+/)) {
      const [key, ...rest] = pair.split("=");
      if (key && rest.length) {
        attrs.push(`${key}="${escapeJsxAttr(rest.join("="))}"`);
      }
    }
  }

  return attrs.join(" ");
}

export function applySectionConfigToSectionSource(
  sectionSource: string,
  config: VisualSectionConfig,
): string | null {
  const match = sectionSource.match(SECTION_ROOT_RE);
  if (!match || match.index === undefined) return null;

  const tag = match[1]!;
  const inner = match[3] ?? "";
  const attrs = buildRootAttributes(config);
  const previewStyle = styleToJsxObject(resolveSectionPreviewStyle(config, "desktop"));
  const replacement = `<${tag} ${attrs}${previewStyle}>\n      ${inner.trim()}\n    </${tag}>`;

  return (
    sectionSource.slice(0, match.index) +
    replacement +
    sectionSource.slice(match.index + match[0].length)
  );
}

export function serializeSectionConfigModel(config: VisualSectionConfig): string {
  return JSON.stringify(config);
}

export function sectionConfigsEqual(
  a: VisualSectionConfig,
  b: VisualSectionConfig,
): boolean {
  return serializeSectionConfigModel(a) === serializeSectionConfigModel(b);
}

export { stripWbClasses };
