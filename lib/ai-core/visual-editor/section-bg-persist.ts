/**
 * Apply section background edits to generated TSX source files.
 */

import {
  serializeSectionBgConfig,
  WB_SECTION_BG_CONFIG_ATTR,
  WB_SECTION_BG_ID_ATTR,
  WB_SECTION_BG_IMG_CLASS,
  WB_SECTION_BG_LAYER_CLASS,
  WB_SECTION_BG_OVERLAY_CLASS,
} from "@/lib/ai-core/visual-editor/section-bg-config";
import {
  resolveSectionBgImageStyle,
  resolveSectionBgOverlayStyle,
  sectionHeightClass,
} from "@/lib/ai-core/visual-editor/section-bg-styles";
import type { VisualSectionBackground } from "@/lib/ai-core/visual-editor/section-bg-types";
import { updateComponentJsxStringProp } from "@/lib/ai-core/visual-editor/hydrate-node-text";
import type { CSSProperties } from "react";

const SECTION_ROOT_RE =
  /<(section|header|footer)\b([^>]*)>([\s\S]*?)<\/\1>/i;

function escapeJsxAttr(value: string): string {
  return value.replace(/"/g, "&quot;");
}

function escapeJsxText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

function objectFitClass(displayMode: VisualSectionBackground["displayMode"]): string {
  switch (displayMode) {
    case "contain":
      return "object-contain";
    case "fill":
      return "object-fill";
    case "no-repeat":
      return "object-none";
    default:
      return "object-cover";
  }
}

function buildBackgroundLayer(bg: VisualSectionBackground): string {
  if (!bg.url && bg.source === "none") return "";

  const imgStyle = resolveSectionBgImageStyle(bg, "desktop");
  const overlayStyle = resolveSectionBgOverlayStyle(bg);
  const alt = bg.decorative ? "" : escapeJsxAttr(bg.alt || bg.sectionExportName);
  const altAttr = bg.decorative
    ? 'alt="" aria-hidden="true"'
    : `alt="${alt}"`;

  const parallaxClass = bg.parallax ? " wb-section-bg-parallax" : "";
  const mobileHide = bg.mobile.hideOnMobile ? " wb-section-bg-hide-mobile" : "";

  const mobileImg =
    bg.mobile.url.trim() && bg.mobile.url !== bg.url
      ? `<img className="${WB_SECTION_BG_IMG_CLASS} hidden md:block h-full w-full ${objectFitClass(bg.displayMode)}${parallaxClass}" src="${escapeJsxAttr(bg.url)}" ${altAttr}${styleToJsxObject(imgStyle)} />
        <img className="${WB_SECTION_BG_IMG_CLASS} md:hidden h-full w-full ${objectFitClass(bg.mobile.displayMode)}${parallaxClass}" src="${escapeJsxAttr(bg.mobile.url)}" ${altAttr}${styleToJsxObject(resolveSectionBgImageStyle({ ...bg, displayMode: bg.mobile.displayMode, position: bg.mobile.position, positionX: bg.mobile.positionX, positionY: bg.mobile.positionY, url: bg.mobile.url }, "mobile"))} />`
      : `<img className="${WB_SECTION_BG_IMG_CLASS} h-full w-full ${objectFitClass(bg.displayMode)}${parallaxClass}${mobileHide}" src="${escapeJsxAttr(bg.url)}" ${altAttr}${styleToJsxObject(imgStyle)} />`;

  return `<div className="${WB_SECTION_BG_LAYER_CLASS} absolute inset-0 pointer-events-none"${bg.mobile.hideOnMobile ? ' data-wb-bg-hide-mobile="true"' : ""}>
        ${mobileImg}
        <div className="${WB_SECTION_BG_OVERLAY_CLASS} absolute inset-0"${styleToJsxObject(overlayStyle)} />
      </div>`;
}

function stripExistingBgLayer(inner: string): string {
  return inner
    .replace(
      new RegExp(
        `<div\\b[^>]*${WB_SECTION_BG_LAYER_CLASS}[^>]*>[\\s\\S]*?<\\/div>`,
        "gi",
      ),
      "",
    )
    .trim();
}

function patchSectionRoot(
  source: string,
  bg: VisualSectionBackground,
): string | null {
  const match = source.match(SECTION_ROOT_RE);
  if (!match || match.index === undefined) return null;

  const tag = match[1]!;
  let attrs = match[2] ?? "";
  let inner = match[3] ?? "";

  const config = serializeSectionBgConfig(bg);
  attrs = attrs
    .replace(new RegExp(`${WB_SECTION_BG_CONFIG_ATTR}\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi"), "")
    .replace(new RegExp(`${WB_SECTION_BG_ID_ATTR}\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi"), "")
    .trim();
  attrs += ` ${WB_SECTION_BG_ID_ATTR}="${escapeJsxAttr(bg.id)}"`;
  attrs += ` ${WB_SECTION_BG_CONFIG_ATTR}="${escapeJsxAttr(config)}"`;

  const heightClass = sectionHeightClass(bg);
  if (heightClass && !attrs.includes(heightClass)) {
    const classMatch = attrs.match(/className\s*=\s*("([^"]*)"|'([^']*)'|\{`([^`]*)`\})/i);
    if (classMatch) {
      const quote = classMatch[1]!.startsWith("{") ? "template" : classMatch[1]!.charAt(0);
      if (quote === "template") {
        const existing = classMatch[4] ?? "";
        attrs = attrs.replace(classMatch[0], `className={\`${existing} ${heightClass}\`}`);
      } else {
        const existing = classMatch[2] ?? classMatch[3] ?? "";
        const q = classMatch[1]!.charAt(0);
        attrs = attrs.replace(classMatch[0], `className=${q}${existing} ${heightClass}${q}`);
      }
    }
  }

  if (bg.borderRadius && bg.borderRadius !== "0" && !attrs.includes("rounded")) {
    const classMatch = attrs.match(/className\s*=\s*("([^"]*)"|'([^']*)')/i);
    if (classMatch) {
      const existing = classMatch[2] ?? classMatch[3] ?? "";
      const q = classMatch[1]!.charAt(0);
      attrs = attrs.replace(classMatch[0], `className=${q}${existing} overflow-hidden${q}`);
    }
  }

  inner = stripExistingBgLayer(inner);
  const layer = buildBackgroundLayer(bg);
  const nextInner = layer ? `${layer}\n      ${inner}` : inner;

  const replacement = `<${tag} ${attrs.trim()}>\n      ${nextInner}\n    </${tag}>`;
  return (
    source.slice(0, match.index) +
    replacement +
    source.slice(match.index + match[0].length)
  );
}

function removeBackgroundFromSection(source: string, bg: VisualSectionBackground): string | null {
  const cleared = { ...bg, url: "", source: "none" as const };
  return patchSectionRoot(source, cleared);
}

export function applySectionBackgroundToSectionSource(
  sectionSource: string,
  bg: VisualSectionBackground,
): string | null {
  if (!bg.url && bg.source === "none") {
    const match = sectionSource.match(SECTION_ROOT_RE);
    if (!match) return sectionSource;
    let inner = stripExistingBgLayer(match[3] ?? "");
    const attrs = (match[2] ?? "")
      .replace(new RegExp(`${WB_SECTION_BG_CONFIG_ATTR}\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi"), "")
      .replace(new RegExp(`${WB_SECTION_BG_ID_ATTR}\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi"), "")
      .trim();
    const config = serializeSectionBgConfig({ ...bg, url: "", source: "none" });
    const nextAttrs = `${attrs} ${WB_SECTION_BG_ID_ATTR}="${escapeJsxAttr(bg.id)}" ${WB_SECTION_BG_CONFIG_ATTR}="${escapeJsxAttr(config)}"`;
    if (match.index === undefined) return null;
    return (
      sectionSource.slice(0, match.index) +
      `<${match[1]} ${nextAttrs.trim()}>\n      ${inner}\n    </${match[1]}>` +
      sectionSource.slice(match.index + match[0].length)
    );
  }

  return patchSectionRoot(sectionSource, bg);
}

export function applySectionBackgroundToPageSource(
  pageSource: string,
  exportName: string,
  bg: VisualSectionBackground,
): string | null {
  if (!bg.hasImageUrlProp || !bg.url) return null;
  return updateComponentJsxStringProp(pageSource, exportName, "imageUrl", bg.url);
}

export function serializeSectionBackground(bg: VisualSectionBackground): string {
  return JSON.stringify(bg);
}

export function sectionBackgroundsEqual(
  a: VisualSectionBackground,
  b: VisualSectionBackground,
): boolean {
  return serializeSectionBackground(a) === serializeSectionBackground(b);
}

export { removeBackgroundFromSection };
