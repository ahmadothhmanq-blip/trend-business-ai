/**
 * Apply button edits to generated TSX source files (full durable persistence).
 */

import {
  buttonConfigPropName,
  serializeButtonConfig,
  WB_BUTTON_CLASS,
  WB_BUTTON_CONFIG_ATTR,
  WB_BUTTON_ID_ATTR,
} from "@/lib/ai-core/visual-editor/button-config";
import { resolveButtonPreviewStyle } from "@/lib/ai-core/visual-editor/button-styles";
import {
  formatHref,
  type VisualButton,
} from "@/lib/ai-core/visual-editor/button-types";
import { updateComponentJsxStringProp } from "@/lib/ai-core/visual-editor/hydrate-node-text";
import type { CSSProperties } from "react";

function escapeJsxText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

function iconJsx(iconName: string, position: "left" | "right"): string {
  return `{/* wb-icon-${position}:${iconName} */}`;
}

function buildInnerContent(button: VisualButton): string {
  const parts: string[] = [];
  if (button.icon === "left" && button.iconName) {
    parts.push(iconJsx(button.iconName, "left"));
  }
  if (button.sourceKind === "prop" && button.propName) {
    parts.push(`{${button.propName}}`);
  } else {
    parts.push(escapeJsxText(button.label));
  }
  if (button.icon === "right" && button.iconName) {
    parts.push(iconJsx(button.iconName, "right"));
  }
  return parts.join("");
}

function buildPersistedStyle(button: VisualButton): CSSProperties {
  const style = resolveButtonPreviewStyle(button, "normal");
  return {
    ...style,
    ["--wb-hover-bg" as string]: button.colors.hoverBackground || style.background,
    ["--wb-hover-color" as string]: button.colors.hoverText || style.color,
    ["--wb-hover-border" as string]: button.colors.border || "inherit",
  };
}

function buildAttributes(button: VisualButton): string {
  const href = formatHref(button.linkType, button.href);
  const config = serializeButtonConfig(button);
  const attrs: string[] = [
    `${WB_BUTTON_ID_ATTR}="${escapeJsxAttr(button.id)}"`,
    `${WB_BUTTON_CONFIG_ATTR}="${escapeJsxAttr(config)}"`,
    `className="${WB_BUTTON_CLASS}"`,
    `href="${escapeJsxAttr(href)}"`,
  ];
  if (button.target === "new") {
    attrs.push(`target="_blank"`, `rel="noopener noreferrer"`);
  }
  if (button.ariaLabel.trim()) {
    attrs.push(`aria-label="${escapeJsxAttr(button.ariaLabel)}"`);
  }
  if (button.title.trim()) {
    attrs.push(`title="${escapeJsxAttr(button.title)}"`);
  }
  if (button.icon === "left" && button.iconName) {
    attrs.push(`data-wb-icon-left="${escapeJsxAttr(button.iconName)}"`);
  }
  if (button.icon === "right" && button.iconName) {
    attrs.push(`data-wb-icon-right="${escapeJsxAttr(button.iconName)}"`);
  }
  if (button.disabled) {
    attrs.push('aria-disabled="true"');
  }
  return attrs.join(" ") + styleToJsxObject(buildPersistedStyle(button));
}

function buildAnchorElement(button: VisualButton): string {
  const attrs = buildAttributes(button);
  const inner = buildInnerContent(button);
  return `<a ${attrs}>${inner}</a>`;
}

function buildButtonElement(button: VisualButton): string {
  const attrs = buildAttributes(button).replace(/href="[^"]*"\s*/i, "");
  const inner = buildInnerContent(button);
  const disabled = button.disabled ? " disabled" : "";
  return `<button type="button"${disabled} ${attrs}>${inner}</button>`;
}

function findPropAnchorMatch(
  source: string,
  propName: string,
): RegExpMatchArray | null {
  const propInner = new RegExp(
    `<a\\b[^>]*>[\\s\\S]*?\\{${propName}\\}[\\s\\S]*?<\\/a>`,
    "i",
  );
  return source.match(propInner);
}

function findInteractiveMatches(
  source: string,
  kind: "anchor" | "button",
): RegExpExecArray[] {
  const tag = kind === "anchor" ? "a" : "button";
  const tagRe = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(source))) {
    matches.push(match);
  }
  return matches;
}

function replaceMatch(
  source: string,
  match: RegExpMatchArray,
  replacement: string,
): string {
  if (match.index === undefined) return source;
  return (
    source.slice(0, match.index) +
    replacement +
    source.slice(match.index + match[0].length)
  );
}

function patchInteractiveElement(
  source: string,
  button: VisualButton,
): string | null {
  if (button.sourceKind === "prop" && button.propName) {
    const propMatch = findPropAnchorMatch(source, button.propName);
    if (propMatch) {
      return replaceMatch(source, propMatch, buildAnchorElement(button));
    }
  }

  const tag = button.sourceKind === "button" ? "button" : "a";
  const matches = findInteractiveMatches(source, tag === "button" ? "button" : "anchor");
  const targetMatch = matches[button.sourceIndex];
  if (!targetMatch) return null;

  const replacement =
    tag === "a" ? buildAnchorElement(button) : buildButtonElement(button);
  return replaceMatch(source, targetMatch, replacement);
}

export function applyButtonToSectionSource(
  sectionSource: string,
  button: VisualButton,
): string | null {
  return patchInteractiveElement(sectionSource, button);
}

export function applyButtonToPageSource(
  pageSource: string,
  exportName: string,
  button: VisualButton,
): string | null {
  if (button.sourceKind !== "prop" || !button.propName) return null;

  let next = pageSource;
  const hrefProp = button.hrefPropName ?? "href";
  const href = formatHref(button.linkType, button.href);
  const configProp = buttonConfigPropName(button.propName);

  const labelPatch = updateComponentJsxStringProp(
    next,
    exportName,
    button.propName,
    button.label,
  );
  if (!labelPatch) return null;
  next = labelPatch;

  const hrefPatch = updateComponentJsxStringProp(next, exportName, hrefProp, href);
  if (hrefPatch) next = hrefPatch;

  const configPatch = updateComponentJsxStringProp(
    next,
    exportName,
    configProp,
    serializeButtonConfig(button),
  );
  if (configPatch) next = configPatch;

  return next;
}

export function serializeButton(button: VisualButton): string {
  return JSON.stringify(button);
}

export function buttonsEqual(a: VisualButton, b: VisualButton): boolean {
  return serializeButton(a) === serializeButton(b);
}
