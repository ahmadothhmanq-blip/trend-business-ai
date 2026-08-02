/**
 * Extract editable icons from generated section components and page props.
 */

import { extractButtonsFromSection } from "@/lib/ai-core/visual-editor/button-extract";
import {
  mergeIconConfig,
  parseIconConfig,
  WB_ICON_CONFIG_ATTR,
  WB_ICON_ID_ATTR,
} from "@/lib/ai-core/visual-editor/icon-config";
import { resolveIconName } from "@/lib/ai-core/visual-editor/icon-library";
import {
  createDefaultIcon,
  type IconElementKind,
  type IconPosition,
  type IconSourceKind,
  type VisualIcon,
} from "@/lib/ai-core/visual-editor/icon-types";
import type { VisualButton } from "@/lib/ai-core/visual-editor/button-types";
import {
  parseComponentInvocation,
  parseDefaultPropsFromComponent,
} from "@/lib/ai-core/visual-editor/hydrate-node-text";

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
    new RegExp(`${WB_ICON_CONFIG_ATTR}\\s*=\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"),
    new RegExp(`${WB_ICON_CONFIG_ATTR}\\s*=\\s*'((?:\\\\.|[^'\\\\])*)'`, "i"),
  ];
  for (const re of patterns) {
    const match = attrs.match(re);
    if (match?.[1]) return unescapeHtml(match[1]);
  }
  return undefined;
}

function readIdFromAttrs(attrs: string): string | undefined {
  const match = attrs.match(
    new RegExp(`${WB_ICON_ID_ATTR}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"),
  );
  return match?.[2] ?? match?.[3];
}

function readIconNameFromComment(inner: string): string | undefined {
  const match = inner.match(/\{\/\*\s*wb-icon(?:-(?:left|right))?:([A-Za-z0-9]+)\s*\*\/\}/);
  return match?.[1];
}

function readButtonIconConfig(attrs: string, side: "left" | "right"): string | undefined {
  const attr = `data-wb-icon-${side}-config`;
  const patterns = [
    new RegExp(`${attr}\\s*=\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"),
    new RegExp(`${attr}\\s*=\\s*'((?:\\\\.|[^'\\\\])*)'`, "i"),
  ];
  for (const re of patterns) {
    const match = attrs.match(re);
    if (match?.[1]) return unescapeHtml(match[1]);
  }
  return undefined;
}

function buttonPosition(icon: VisualButton["icon"]): IconPosition {
  if (icon === "left" || icon === "right") return icon;
  return "none";
}

function buttonToIcon(button: VisualButton, exportName: string): VisualIcon | null {
  if (button.icon === "none" && !button.iconName) return null;
  const name = resolveIconName(button.iconName || "ArrowRight");
  const base = createDefaultIcon({
    id: `${button.id}-icon`,
    name,
    label: button.label ? `${button.label} icon` : "Button icon",
    kind: "button",
    sourceKind: "button",
    sourceIndex: button.sourceIndex,
    sectionExportName: exportName,
    position: buttonPosition(button.icon),
    buttonId: button.id,
    decorative: !button.ariaLabel.trim(),
    ariaLabel: button.ariaLabel,
  });
  return base;
}

function parseNavItemBlock(block: string): {
  href: string;
  label: string;
  icon?: string;
  iconConfig?: string;
} {
  const hrefMatch = block.match(/href:\s*("([^"]*)"|'([^']*)')/);
  const labelMatch = block.match(/label:\s*("([^"]*)"|'([^']*)')/);
  const iconMatch = block.match(/icon:\s*("([^"]*)"|'([^']*)')/);
  const configMatch = block.match(
    /iconConfig:\s*("((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')/,
  );
  return {
    href: hrefMatch?.[2] ?? hrefMatch?.[3] ?? "",
    label: labelMatch?.[2] ?? labelMatch?.[3] ?? "",
    icon: iconMatch?.[2] ?? iconMatch?.[3],
    iconConfig: configMatch?.[2]
      ? configMatch[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\")
      : configMatch?.[3],
  };
}

function parseLinksArrayLiteral(
  source: string,
  varName: string,
): Array<{ href: string; label: string; icon?: string; iconConfig?: string }> {
  const re = new RegExp(
    `(?:const|let)\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*;`,
    "i",
  );
  const match = source.match(re);
  if (!match?.[1]) return [];

  const items: Array<{
    href: string;
    label: string;
    icon?: string;
    iconConfig?: string;
  }> = [];
  const body = match[1]!;
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
        items.push(parseNavItemBlock(body.slice(start, i + 1)));
        start = -1;
      }
    }
  }
  return items;
}

function inferKindFromSection(exportName: string, kindHint?: string): IconElementKind {
  if (/SiteHeader|Nav/i.test(exportName) || kindHint === "header") return "nav";
  if (/SiteFooter|Footer/i.test(exportName) || kindHint === "footer") return "footer";
  if (/Hero/i.test(exportName) || kindHint === "hero") return "hero";
  if (/Feature/i.test(exportName)) return "feature";
  if (/Service/i.test(exportName)) return "service";
  if (/Contact/i.test(exportName)) return "contact";
  if (/Cta|CTA/i.test(exportName) || kindHint === "cta") return "cta";
  if (/Info/i.test(exportName)) return "info";
  return "inline";
}

function findInlineIconSpans(source: string): Array<{
  index: number;
  attrs: string;
  inner: string;
  kind: IconElementKind;
}> {
  const spans: Array<{
    index: number;
    attrs: string;
    inner: string;
    kind: IconElementKind;
  }> = [];
  const tagRe = /<span\b([^>]*className\s*=\s*["'][^"']*wb-icon[^"']*["'][^>]*)>([\s\S]*?)<\/span>/gi;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = tagRe.exec(source))) {
    spans.push({
      index,
      attrs: match[1] ?? "",
      inner: match[2] ?? "",
      kind: "inline",
    });
    index += 1;
  }

  const configRe = new RegExp(
    `<span\\b([^>]*${WB_ICON_CONFIG_ATTR}[^>]*)>([\\s\\S]*?)<\\/span>`,
    "gi",
  );
  while ((match = configRe.exec(source))) {
    if (spans.some((s) => s.attrs === match![1])) continue;
    spans.push({
      index,
      attrs: match[1] ?? "",
      inner: match[2] ?? "",
      kind: "inline",
    });
    index += 1;
  }

  return spans;
}

function findListItemIcons(
  source: string,
  sectionKind: IconElementKind,
): Array<{ index: number; label: string }> {
  const items: Array<{ index: number; label: string }> = [];
  if (/<nav\b/i.test(source) || /<footer\b/i.test(source)) return items;
  const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = liRe.exec(source))) {
    const inner = match[1] ?? "";
    if (/wb-icon/.test(inner) || inner.includes(WB_ICON_CONFIG_ATTR)) {
      index += 1;
      continue;
    }
    const label = unescapeHtml(inner.replace(/<[^>]+>/g, "").trim()).slice(0, 80);
    if (label) items.push({ index, label });
    index += 1;
  }
  if (items.length && sectionKind === "inline") {
    return items.map((item) => ({ ...item }));
  }
  return items;
}

function findSocialIcons(source: string, exportName: string): VisualIcon[] {
  const icons: VisualIcon[] = [];
  const socialRe =
    /<a\b([^>]*href\s*=\s*["'][^"']*(?:instagram|twitter|linkedin|facebook|youtube|x\.com)[^"']*["'][^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = socialRe.exec(source))) {
    const attrs = match[1] ?? "";
    const config = parseIconConfig(readConfigFromAttrs(attrs));
    const base = createDefaultIcon({
      id: `${exportName}-social-${index}`,
      name: "Share2",
      label: "Social link",
      kind: "social",
      sourceKind: "inline",
      sourceIndex: index,
      sectionExportName: exportName,
      position: "left",
    });
    icons.push(mergeIconConfig(base, config));
    index += 1;
  }
  return icons;
}

function findContactIcons(source: string, exportName: string): VisualIcon[] {
  const icons: VisualIcon[] = [];
  const contactRe =
    /<a\b([^>]*href\s*=\s*["'](?:mailto:|tel:)[^"']*["'][^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = contactRe.exec(source))) {
    const attrs = match[1] ?? "";
    const href = attrs.match(/href\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    const defaultName = href.startsWith("mailto:") ? "Mail" : "Phone";
    const config = parseIconConfig(readConfigFromAttrs(attrs));
    const base = createDefaultIcon({
      id: `${exportName}-contact-${index}`,
      name: defaultName,
      label: href.startsWith("mailto:") ? "Email" : "Phone",
      kind: "contact",
      sourceKind: "inline",
      sourceIndex: index,
      sectionExportName: exportName,
      position: "left",
    });
    icons.push(mergeIconConfig(base, config));
    index += 1;
  }
  return icons;
}

function enrichButtonIconsFromSource(
  icons: VisualIcon[],
  componentSource: string | undefined,
): VisualIcon[] {
  if (!componentSource) return icons;
  const tagRe = /<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  let anchorIndex = 0;
  let buttonIndex = 0;

  while ((match = tagRe.exec(componentSource))) {
    const tag = match[1]!.toLowerCase();
    const attrs = match[2] ?? "";
    const inner = match[3] ?? "";
    const index = tag === "a" ? anchorIndex++ : buttonIndex++;

    for (const side of ["left", "right"] as const) {
      const iconAttr = attrs.match(
        new RegExp(`data-wb-icon-${side}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"),
      );
      const iconName = iconAttr?.[2] ?? iconAttr?.[3];
      const configRaw =
        readButtonIconConfig(attrs, side) ?? readConfigFromAttrs(attrs);
      const commentName = readIconNameFromComment(inner);
      const resolvedName = resolveIconName(iconName ?? commentName);

      const iconId = readIdFromAttrs(attrs);
      const existing = icons.find(
        (ic) =>
          ic.sourceKind === "button" &&
          ic.sourceIndex === index &&
          ic.position === side,
      );

      if (!existing && !iconName && !commentName) continue;

      const base = createDefaultIcon({
        id: iconId ?? `${existing?.id ?? `btn-${index}-${side}`}`,
        name: resolvedName,
        label: existing?.label ?? `${side} icon`,
        kind: "button",
        sourceKind: "button",
        sourceIndex: index,
        sectionExportName: existing?.sectionExportName ?? "",
        position: side,
        buttonId: existing?.buttonId,
      });
      const merged = mergeIconConfig(base, parseIconConfig(configRaw));
      if (existing) {
        const idx = icons.indexOf(existing);
        icons[idx] = { ...merged, id: existing.id, buttonId: existing.buttonId };
      } else {
        icons.push(merged);
      }
    }
  }
  return icons;
}

export function extractIconsFromSection(params: {
  exportName: string;
  componentSource?: string;
  pageSource?: string;
  kindHint?: string;
}): VisualIcon[] {
  const { exportName, componentSource, pageSource, kindHint } = params;
  const icons: VisualIcon[] = [];
  const sectionKind = inferKindFromSection(exportName, kindHint);

  const buttons = extractButtonsFromSection({
    exportName,
    componentSource,
    pageSource,
  });
  for (const button of buttons) {
    const icon = buttonToIcon(button, exportName);
    if (icon) icons.push(icon);
  }

  if (componentSource) {
    if (/SiteHeader|NavModern/i.test(exportName)) {
      const navItems =
        parseLinksArrayLiteral(componentSource, "links") ||
        parseLinksArrayLiteral(componentSource, "NAV") ||
        parseLinksArrayLiteral(componentSource, "navLinks");
      navItems.forEach((item, index) => {
        const config = parseIconConfig(item.iconConfig);
        const name = resolveIconName(item.icon);
        const base = createDefaultIcon({
          id: `${exportName}-nav-icon-${index}`,
          name,
          label: item.label ? `${item.label} icon` : "Nav icon",
          kind: "nav",
          sourceKind: "array",
          sourceIndex: index,
          sectionExportName: exportName,
          arrayPropName: "links",
          position: "left",
          linkId: `${exportName}-nav-${index}`,
        });
        icons.push(mergeIconConfig(base, config));
      });
    }

    for (const span of findInlineIconSpans(componentSource)) {
      const config = parseIconConfig(readConfigFromAttrs(span.attrs));
      const commentName = readIconNameFromComment(span.inner);
      const id = readIdFromAttrs(span.attrs) ?? `${exportName}-icon-${span.index}`;
      const base = createDefaultIcon({
        id,
        name: resolveIconName(commentName),
        label: "Icon",
        kind: span.kind,
        sourceKind: "inline",
        sourceIndex: span.index,
        sectionExportName: exportName,
      });
      icons.push(mergeIconConfig(base, config));
    }

    const listKind =
      sectionKind === "feature" || sectionKind === "service" || sectionKind === "list"
        ? sectionKind
        : sectionKind === "hero"
          ? "hero"
          : "list";
    findListItemIcons(componentSource, listKind).forEach((item, idx) => {
      icons.push(
        createDefaultIcon({
          id: `${exportName}-list-${item.index}`,
          name: "Check",
          label: item.label,
          kind: listKind,
          sourceKind: "inline",
          sourceIndex: item.index,
          sectionExportName: exportName,
          position: "left",
        }),
      );
    });

    icons.push(...findSocialIcons(componentSource, exportName));
    icons.push(...findContactIcons(componentSource, exportName));
  }

  enrichButtonIconsFromSource(icons, componentSource);

  const deduped = new Map<string, VisualIcon>();
  for (const icon of icons) {
    deduped.set(icon.id, icon);
  }
  return [...deduped.values()];
}
