/**
 * Apply link edits to generated TSX source files.
 */

import {
  applyButtonToPageSource,
  applyButtonToSectionSource,
} from "@/lib/ai-core/visual-editor/button-persist";
import type { VisualButton } from "@/lib/ai-core/visual-editor/button-types";
import {
  linksArrayLiteral,
  navLinkToPersisted,
  serializeLinkConfig,
  type PersistedNavLink,
  WB_LINK_CONFIG_ATTR,
  WB_LINK_ID_ATTR,
} from "@/lib/ai-core/visual-editor/link-config";
import {
  buildRelAttribute,
  formatHref,
} from "@/lib/ai-core/visual-editor/link-format";
import type { VisualLink } from "@/lib/ai-core/visual-editor/link-types";
import { updateComponentJsxStringProp, parseComponentInvocation } from "@/lib/ai-core/visual-editor/hydrate-node-text";

function escapeJsxAttr(value: string): string {
  return value.replace(/"/g, "&quot;");
}

function escapeJsxText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildAnchorAttributes(link: VisualLink): string {
  const href = formatHref(link.linkType, link.href);
  const config = serializeLinkConfig(link);
  const rel = buildRelAttribute(link.rel);
  const attrs: string[] = [
    `${WB_LINK_ID_ATTR}="${escapeJsxAttr(link.id)}"`,
    `${WB_LINK_CONFIG_ATTR}="${escapeJsxAttr(config)}"`,
    `href="${escapeJsxAttr(href)}"`,
  ];
  if (link.target === "new") attrs.push(`target="_blank"`);
  if (rel) attrs.push(`rel="${escapeJsxAttr(rel)}"`);
  if (link.alt?.trim()) attrs.push(`aria-label="${escapeJsxAttr(link.alt)}"`);
  return attrs.join(" ");
}

function replaceAnchorByIndex(
  source: string,
  index: number,
  replacement: string,
): string | null {
  const tagRe = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = tagRe.exec(source))) {
    if (i === index) {
      if (match.index === undefined) return null;
      return (
        source.slice(0, match.index) +
        replacement +
        source.slice(match.index + match[0].length)
      );
    }
    i += 1;
  }
  return null;
}

function patchInlineLink(sectionSource: string, link: VisualLink): string | null {
  const attrs = buildAnchorAttributes(link);
  const inner =
    link.kind === "image"
      ? `<img src={imageUrl} alt="${escapeJsxAttr(link.label)}" className="h-full w-full object-cover" />`
      : escapeJsxText(link.label);
  const replacement = `<a ${attrs}>${inner}</a>`;
  return replaceAnchorByIndex(sectionSource, link.sourceIndex, replacement);
}

function parseLinksArrayFromSource(
  sectionSource: string,
): { varName: string; items: PersistedNavLink[] } | null {
  const patterns = [
    { re: /const\s+(links)\s*=\s*(\[[\s\S]*?\])\s*;/i, varName: "links" },
    { re: /const\s+(NAV)\s*=\s*(\[[\s\S]*?\])\s*;/i, varName: "NAV" },
    { re: /const\s+(navLinks)\s*=\s*(\[[\s\S]*?\])\s*;/i, varName: "navLinks" },
  ];
  for (const { re, varName } of patterns) {
    const match = sectionSource.match(re);
    if (!match?.[2]) continue;
    const items: PersistedNavLink[] = [];
    const itemRe =
      /\{\s*href:\s*("([^"]*)"|'([^']*)')[^}]*label:\s*("([^"]*)"|'([^']*)')[^}]*\}/g;
    let m: RegExpExecArray | null;
    while ((m = itemRe.exec(match[2]))) {
      const block = m[0];
      const configMatch = block.match(/linkConfig:\s*("((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')/);
      const targetMatch = block.match(/target:\s*("([^"]*)"|'([^']*)')/);
      const relMatch = block.match(/rel:\s*("([^"]*)"|'([^']*)')/);
      items.push({
        href: m[2] ?? m[3] ?? "",
        label: m[5] ?? m[6] ?? "",
        linkConfig: configMatch?.[2]
          ? configMatch[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\")
          : configMatch?.[3],
        target: (targetMatch?.[2] ?? targetMatch?.[3]) as PersistedNavLink["target"],
        rel: relMatch?.[2] ?? relMatch?.[3],
      });
    }
    if (items.length) return { varName, items };
  }
  return null;
}

function patchNavConstArray(sectionSource: string, link: VisualLink): string | null {
  const parsed = parseLinksArrayFromSource(sectionSource);
  if (!parsed) return null;

  const items = [...parsed.items];
  while (items.length <= link.sourceIndex) {
    items.push({ href: "#", label: "Link" });
  }
  items[link.sourceIndex] = navLinkToPersisted(link, formatHref(link.linkType, link.href));
  const literal = linksArrayLiteral(items);

  const re = new RegExp(
    `const\\s+${parsed.varName}\\s*=\\s*\\[[\\s\\S]*?\\]\\s*;`,
    "i",
  );
  return sectionSource.replace(re, `const ${parsed.varName} = ${literal};`);
}

function patchFooterLinksOnPage(
  pageSource: string,
  exportName: string,
  link: VisualLink,
): string | null {
  if (link.kind !== "footer") return null;

  const tagRe = new RegExp(
    `<${exportName}\\b([\\s\\S]*?)(\\s*/>|>)`,
    "i",
  );
  const match = pageSource.match(tagRe);
  if (!match?.[1]) return null;

  const pageProps = parseComponentInvocation(pageSource, exportName);
  let items: PersistedNavLink[] = [];
  if (pageProps.links) {
    try {
      items = JSON.parse(pageProps.links) as PersistedNavLink[];
    } catch {
      items = [];
    }
  }
  while (items.length <= link.sourceIndex) {
    items.push({ href: "#", label: "Link" });
  }
  items[link.sourceIndex] = navLinkToPersisted(link, formatHref(link.linkType, link.href));

  return updateComponentJsxStringProp(
    pageSource,
    exportName,
    "links",
    JSON.stringify(items),
  );
}

function linkToButton(link: VisualLink): VisualButton {
  return {
    id: link.buttonId ?? link.id,
    label: link.label,
    linkType: link.linkType as VisualButton["linkType"],
    href: link.href,
    target: link.target,
    style: link.kind === "cta" ? "outline" : "primary",
    size: "md",
    width: "auto",
    radius: "rounded",
    customRadiusPx: 8,
    colors: {
      background: "var(--color-accent)",
      text: "#000000",
      border: "transparent",
      hoverBackground: "var(--color-accent)",
      hoverText: "#000000",
    },
    typography: {
      fontFamily: "inherit",
      fontWeight: "600",
      fontSize: "0.875rem",
      letterSpacing: "0.02em",
    },
    spacing: { padding: "0.625rem 1.25rem", margin: "0" },
    icon: "none",
    iconName: "",
    disabled: false,
    ariaLabel: link.alt ?? "",
    title: "",
    sourceKind: link.sourceKind === "prop" ? "prop" : link.sourceKind === "inline" ? "anchor" : "anchor",
    sourceIndex: link.sourceIndex,
    propName: link.propName,
    hrefPropName: link.hrefPropName,
  };
}

export function applyLinkToSectionSource(
  sectionSource: string,
  link: VisualLink,
): string | null {
  if (link.kind === "nav") {
    return patchNavConstArray(sectionSource, link);
  }

  if (link.kind === "button" || link.kind === "cta") {
    return applyButtonToSectionSource(sectionSource, linkToButton(link));
  }

  if (link.kind === "logo") {
    const attrs = buildAnchorAttributes({ ...link, href: link.href || "/" });
    return replaceAnchorByIndex(
      sectionSource,
      link.sourceIndex,
      `<a ${attrs}>${escapeJsxText(link.label)}</a>`,
    );
  }

  return patchInlineLink(sectionSource, link);
}

export function applyLinkToPageSource(
  pageSource: string,
  exportName: string,
  link: VisualLink,
): string | null {
  if (link.kind === "footer") {
    return patchFooterLinksOnPage(pageSource, exportName, link);
  }

  if ((link.kind === "button" || link.kind === "cta") && link.sourceKind === "prop") {
    return applyButtonToPageSource(pageSource, exportName, linkToButton(link));
  }

  return null;
}

export function serializeLink(link: VisualLink): string {
  return JSON.stringify(link);
}

export function linksEqual(a: VisualLink, b: VisualLink): boolean {
  return serializeLink(a) === serializeLink(b);
}
