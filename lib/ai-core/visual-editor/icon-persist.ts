/**
 * Apply icon edits to generated TSX source files.
 */

import {
  applyButtonToPageSource,
  applyButtonToSectionSource,
} from "@/lib/ai-core/visual-editor/button-persist";
import type { VisualButton } from "@/lib/ai-core/visual-editor/button-types";
import {
  serializeIconConfig,
  WB_ICON_CLASS,
  WB_ICON_CONFIG_ATTR,
  WB_ICON_ID_ATTR,
  type PersistedArrayIcon,
} from "@/lib/ai-core/visual-editor/icon-config";
import { iconWrapperStyle } from "@/lib/ai-core/visual-editor/icon-styles";
import type { VisualIcon } from "@/lib/ai-core/visual-editor/icon-types";
import {
  parseComponentInvocation,
  updateComponentJsxStringProp,
} from "@/lib/ai-core/visual-editor/hydrate-node-text";
import type { CSSProperties } from "react";

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

function iconComment(name: string, position?: "left" | "right"): string {
  if (position) return `{/* wb-icon-${position}:${name} */}`;
  return `{/* wb-icon:${name} */}`;
}

function buildIconSpan(icon: VisualIcon, position?: "left" | "right"): string {
  const config = serializeIconConfig(icon);
  const attrs = [
    `className="${WB_ICON_CLASS}"`,
    `${WB_ICON_ID_ATTR}="${escapeJsxAttr(icon.id)}"`,
    `${WB_ICON_CONFIG_ATTR}="${escapeJsxAttr(config)}"`,
    `aria-hidden="${icon.decorative ? "true" : "false"}"`,
  ];
  if (!icon.decorative && icon.ariaLabel.trim()) {
    attrs.push(`aria-label="${escapeJsxAttr(icon.ariaLabel)}"`);
  }
  return `<span ${attrs.join(" ")}${styleToJsxObject(iconWrapperStyle(icon))}>${iconComment(icon.name, position)}</span>`;
}

function buttonIconPosition(icon: VisualIcon): VisualButton["icon"] {
  if (icon.position === "left" || icon.position === "right") return icon.position;
  return icon.name ? "left" : "none";
}

function iconToButtonPatch(icon: VisualIcon): Partial<VisualButton> {
  return {
    icon: buttonIconPosition(icon),
    iconName: icon.name,
    ariaLabel: icon.decorative ? "" : icon.ariaLabel,
  };
}

function patchButtonIconAttrs(
  source: string,
  icon: VisualIcon,
): string | null {
  const tagRe = /<(a|button)\b[^>]*>[\s\S]*?<\/\1>/gi;
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(source))) {
    matches.push(match);
  }
  const target = matches[icon.sourceIndex];
  if (!target || target.index === undefined) return null;

  const tag = target[0].match(/<(a|button)\b/i)?.[1]?.toLowerCase() ?? "a";
  const side = icon.position === "right" ? "right" : "left";
  const config = serializeIconConfig(icon);
  let attrs = target[0].match(new RegExp(`<${tag}\\b([^>]*)>`, "i"))?.[1] ?? "";

  attrs = attrs
    .replace(new RegExp(`data-wb-icon-${side}\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi"), "")
    .replace(
      new RegExp(`data-wb-icon-${side}-config\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi"),
      "",
    )
    .trim();

  if (icon.position !== "none" && icon.name) {
    attrs += ` data-wb-icon-${side}="${escapeJsxAttr(icon.name)}"`;
    attrs += ` data-wb-icon-${side}-config="${escapeJsxAttr(config)}"`;
  }

  let inner = target[0].replace(new RegExp(`^<${tag}\\b[^>]*>|</${tag}>$`, "gi"), "");
  inner = inner.replace(
    new RegExp(`\\{\\/\\*\\s*wb-icon-${side}:[A-Za-z0-9]+\\s*\\*\\/\\}`, "g"),
    "",
  );
  inner = inner.replace(
    new RegExp(
      `<span\\b[^>]*${WB_ICON_CLASS}[^>]*>[\\s\\S]*?<\\/span>`,
      "gi",
    ),
    "",
  );

  const parts: string[] = [];
  if (side === "left" && icon.position !== "none" && icon.name) {
    parts.push(buildIconSpan(icon, "left"));
  }
  parts.push(inner.trim());
  if (side === "right" && icon.position !== "none" && icon.name) {
    parts.push(buildIconSpan(icon, "right"));
  }

  const replacement = `<${tag} ${attrs}>${parts.join("")}</${tag}>`;
  return (
    source.slice(0, target.index) +
    replacement +
    source.slice(target.index + target[0].length)
  );
}

function parseNavArrayFromSource(
  sectionSource: string,
): { varName: string; body: string } | null {
  const patterns = ["links", "NAV", "navLinks"];
  for (const varName of patterns) {
    const re = new RegExp(
      `const\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*;`,
      "i",
    );
    const match = sectionSource.match(re);
    if (match?.[1]) return { varName, body: match[1] };
  }
  return null;
}

function parseNavItems(body: string): PersistedArrayIcon[] {
  const items: PersistedArrayIcon[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]!;
    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        const block = body.slice(start, i + 1);
        const hrefMatch = block.match(/href:\s*("([^"]*)"|'([^']*)')/);
        const labelMatch = block.match(/label:\s*("([^"]*)"|'([^']*)')/);
        const iconMatch = block.match(/icon:\s*("([^"]*)"|'([^']*)')/);
        const configMatch = block.match(
          /iconConfig:\s*("((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')/,
        );
        items.push({
          href: hrefMatch?.[2] ?? hrefMatch?.[3] ?? "#",
          label: labelMatch?.[2] ?? labelMatch?.[3] ?? "Link",
          icon: iconMatch?.[2] ?? iconMatch?.[3],
          iconConfig: configMatch?.[2]
            ? configMatch[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\")
            : configMatch?.[3],
        });
        start = -1;
      }
    }
  }
  return items;
}

function iconsArrayLiteral(items: PersistedArrayIcon[]): string {
  return `[${items
    .map((item) => {
      const parts = [
        `href: ${JSON.stringify(item.href)}`,
        `label: ${JSON.stringify(item.label)}`,
      ];
      if (item.icon) parts.push(`icon: ${JSON.stringify(item.icon)}`);
      if (item.iconConfig) parts.push(`iconConfig: ${JSON.stringify(item.iconConfig)}`);
      return `{ ${parts.join(", ")} }`;
    })
    .join(", ")}]`;
}

function patchNavArrayIcon(sectionSource: string, icon: VisualIcon): string | null {
  const parsed = parseNavArrayFromSource(sectionSource);
  if (!parsed) return null;

  const items = parseNavItems(parsed.body);
  while (items.length <= icon.sourceIndex) {
    items.push({ href: "#", label: "Link" });
  }
  items[icon.sourceIndex] = {
    ...items[icon.sourceIndex]!,
    icon: icon.name,
    iconConfig: serializeIconConfig(icon),
  };

  const literal = iconsArrayLiteral(items);
  const re = new RegExp(
    `const\\s+${parsed.varName}\\s*=\\s*\\[[\\s\\S]*?\\]\\s*;`,
    "i",
  );
  return sectionSource.replace(re, `const ${parsed.varName} = ${literal};`);
}

function replaceListItemByIndex(
  source: string,
  index: number,
  icon: VisualIcon,
): string | null {
  const liRe = /<li\b([^>]*)>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = liRe.exec(source))) {
    if (i !== index) {
      i += 1;
      continue;
    }
    if (match.index === undefined) return null;
    let inner = match[2] ?? "";
    inner = inner.replace(
      new RegExp(`<span\\b[^>]*${WB_ICON_CLASS}[^>]*>[\\s\\S]*?<\\/span>`, "gi"),
      "",
    );
    inner = inner.replace(/\{\/\*\s*wb-icon:[A-Za-z0-9]+\s*\*\/\}/g, "").trim();
    const span = buildIconSpan(icon);
    const replacement = `<li${match[1] ?? ""}>${span}${inner ? ` ${inner}` : ""}</li>`;
    return (
      source.slice(0, match.index) +
      replacement +
      source.slice(match.index + match[0].length)
    );
  }
  return null;
}

function replaceInlineIconByIndex(
  source: string,
  index: number,
  icon: VisualIcon,
): string | null {
  const tagRe = new RegExp(
    `<span\\b[^>]*(?:${WB_ICON_CLASS}|${WB_ICON_CONFIG_ATTR})[^>]*>[\\s\\S]*?<\\/span>`,
    "gi",
  );
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = tagRe.exec(source))) {
    if (i !== index) {
      i += 1;
      continue;
    }
    if (match.index === undefined) return null;
    return (
      source.slice(0, match.index) +
      buildIconSpan(icon) +
      source.slice(match.index + match[0].length)
    );
  }
  return null;
}

function replaceAnchorByIndex(
  source: string,
  index: number,
  icon: VisualIcon,
): string | null {
  const tagRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = tagRe.exec(source))) {
    if (i !== index) {
      i += 1;
      continue;
    }
    if (match.index === undefined) return null;
    const attrs = match[1] ?? "";
    let inner = match[2] ?? "";
    inner = inner.replace(
      new RegExp(`<span\\b[^>]*${WB_ICON_CLASS}[^>]*>[\\s\\S]*?<\\/span>`, "gi"),
      "",
    );
    const config = serializeIconConfig(icon);
    let nextAttrs = attrs
      .replace(new RegExp(`${WB_ICON_CONFIG_ATTR}\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi"), "")
      .trim();
    nextAttrs += ` ${WB_ICON_CONFIG_ATTR}="${escapeJsxAttr(config)}"`;
    if (!icon.decorative && icon.ariaLabel.trim()) {
      nextAttrs = nextAttrs.replace(/aria-label\s*=\s*("([^"]*)"|'([^']*)')/gi, "");
      nextAttrs += ` aria-label="${escapeJsxAttr(icon.ariaLabel)}"`;
    }
    const span = buildIconSpan(icon);
    const replacement = `<a ${nextAttrs}>${span}${inner.trim() ? ` ${inner.trim()}` : ""}</a>`;
    return (
      source.slice(0, match.index) +
      replacement +
      source.slice(match.index + match[0].length)
    );
  }
  return null;
}

export function applyIconToSectionSource(
  sectionSource: string,
  icon: VisualIcon,
  button?: VisualButton,
): string | null {
  if (icon.kind === "nav" && icon.sourceKind === "array") {
    return patchNavArrayIcon(sectionSource, icon);
  }

  if (icon.kind === "list" || icon.kind === "feature" || icon.kind === "service") {
    const listPatch = replaceListItemByIndex(sectionSource, icon.sourceIndex, icon);
    if (listPatch) return listPatch;
  }

  if (icon.kind === "contact" || icon.kind === "social") {
    const anchorPatch = replaceAnchorByIndex(sectionSource, icon.sourceIndex, icon);
    if (anchorPatch) return anchorPatch;
  }

  if (icon.sourceKind === "inline") {
    const inlinePatch = replaceInlineIconByIndex(sectionSource, icon.sourceIndex, icon);
    if (inlinePatch) return inlinePatch;
  }

  if (icon.kind === "button" || icon.buttonId || icon.sourceKind === "button") {
    let next = sectionSource;
    if (button) {
      const nextButton = { ...button, ...iconToButtonPatch(icon) };
      const buttonPatch = applyButtonToSectionSource(sectionSource, nextButton);
      if (buttonPatch) next = buttonPatch;
    }
    const iconPatch = patchButtonIconAttrs(next, icon);
    return iconPatch ?? next;
  }

  return replaceInlineIconByIndex(sectionSource, icon.sourceIndex, icon);
}

export function applyIconToPageSource(
  pageSource: string,
  exportName: string,
  icon: VisualIcon,
  button?: VisualButton,
): string | null {
  if (!button || button.sourceKind !== "prop") return null;
  const nextButton = { ...button, ...iconToButtonPatch(icon) };
  return applyButtonToPageSource(pageSource, exportName, nextButton);
}

export function serializeIcon(icon: VisualIcon): string {
  return JSON.stringify(icon);
}

export function iconsEqual(a: VisualIcon, b: VisualIcon): boolean {
  return serializeIcon(a) === serializeIcon(b);
}

export { iconToButtonPatch };
