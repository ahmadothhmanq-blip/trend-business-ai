/**
 * Extract editable links from generated section components and page props.
 */

import { listInternalPageRoutes } from "@/lib/ai-core/visual-editor/button-extract";
import { extractButtonsFromSection } from "@/lib/ai-core/visual-editor/button-extract";
import {
  mergeLinkConfig,
  parseLinkConfig,
  WB_LINK_CONFIG_ATTR,
} from "@/lib/ai-core/visual-editor/link-config";
import {
  inferLinkType,
  parseRelAttribute,
  stripHrefForEditor,
} from "@/lib/ai-core/visual-editor/link-format";
import {
  createDefaultLink,
  defaultLinkRel,
  type LinkElementKind,
  type LinkSourceKind,
  type VisualLink,
} from "@/lib/ai-core/visual-editor/link-types";
import {
  parseComponentInvocation,
  parseDefaultPropsFromComponent,
} from "@/lib/ai-core/visual-editor/hydrate-node-text";
import type { VisualButton } from "@/lib/ai-core/visual-editor/button-types";

const DISMISS_LABEL_RE = /^(×|x|dismiss|close)$/i;

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
    new RegExp(`${WB_LINK_CONFIG_ATTR}\\s*=\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"),
    new RegExp(`${WB_LINK_CONFIG_ATTR}\\s*=\\s*'((?:\\\\.|[^'\\\\])*)'`, "i"),
  ];
  for (const re of patterns) {
    const match = attrs.match(re);
    if (match?.[1]) return unescapeHtml(match[1]);
  }
  return undefined;
}

function parseTarget(attrTarget?: string): "same" | "new" {
  if (!attrTarget) return "same";
  if (attrTarget === "_blank" || attrTarget === "new") return "new";
  return "same";
}

function extractTextContent(inner: string): string {
  const cleaned = inner
    .replace(/\{\/\*\s*wb-icon-(?:left|right):[A-Za-z]+\s*\*\/\}/g, "")
    .replace(/<span\b[\s\S]*?wb-btn-icon[\s\S]*?\/>/gi, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g, "");
  return unescapeHtml(cleaned.replace(/<[^>]+>/g, "").trim());
}

type RawAnchor = {
  index: number;
  href: string;
  label: string;
  target?: string;
  rel?: string;
  configJson?: string;
  linkId?: string;
  isImageWrap: boolean;
  isLogo: boolean;
  isNav: boolean;
};

function findAnchors(source: string): RawAnchor[] {
  const anchors: RawAnchor[] = [];
  const tagRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = tagRe.exec(source))) {
    const attrs = match[1] ?? "";
    const inner = match[2] ?? "";
    const label = extractTextContent(inner);
    if (!label && !/<img\b/i.test(inner)) continue;
    if (label && DISMISS_LABEL_RE.test(label)) continue;
    if (/aria-label\s*=\s*["']Dismiss["']/i.test(attrs)) continue;

    const hrefMatch = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|\{([^}]+)\})/i);
    const href = unescapeHtml(
      (hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "#").replace(
        /^["'{]|["'}]$/g,
        "",
      ),
    );
    const targetMatch = attrs.match(/target\s*=\s*("([^"]*)"|'([^']*)')/i);
    const relMatch = attrs.match(/rel\s*=\s*("([^"]*)"|'([^']*)')/i);
    const idMatch = attrs.match(/data-wb-link-id\s*=\s*("([^"]*)"|'([^']*)')/i);

    const isImageWrap = /<img\b/i.test(inner);
    const isLogo = /href\s*=\s*["']\/["']/i.test(attrs) && index === 0;
    const isNav = /nav\b/i.test(source.slice(Math.max(0, (match.index ?? 0) - 200), match.index ?? 0));

    anchors.push({
      index,
      href,
      label: label || (isImageWrap ? "Image link" : "Link"),
      target: targetMatch?.[2] ?? targetMatch?.[3],
      rel: relMatch?.[2] ?? relMatch?.[3],
      configJson: readConfigFromAttrs(attrs),
      linkId: idMatch?.[2] ?? idMatch?.[3],
      isImageWrap,
      isLogo,
      isNav,
    });
    index += 1;
  }

  return anchors;
}

function parseNavItemBlock(block: string): {
  href: string;
  label: string;
  linkConfig?: string;
  target?: string;
  rel?: string;
} {
  const hrefMatch = block.match(/href:\s*("([^"]*)"|'([^']*)')/);
  const labelMatch = block.match(/label:\s*("([^"]*)"|'([^']*)')/);
  const configMatch = block.match(/linkConfig:\s*("((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')/);
  const targetMatch = block.match(/target:\s*("([^"]*)"|'([^']*)')/);
  const relMatch = block.match(/rel:\s*("([^"]*)"|'([^']*)')/);
  return {
    href: hrefMatch?.[2] ?? hrefMatch?.[3] ?? "",
    label: labelMatch?.[2] ?? labelMatch?.[3] ?? "",
    linkConfig: configMatch?.[2]
      ? configMatch[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\")
      : configMatch?.[3],
    target: targetMatch?.[2] ?? targetMatch?.[3],
    rel: relMatch?.[2] ?? relMatch?.[3],
  };
}

function parseLinksArrayLiteral(source: string, varName: string): Array<{ href: string; label: string; linkConfig?: string; target?: string; rel?: string }> {
  const re = new RegExp(
    `(?:const|let)\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*;`,
    "i",
  );
  const match = source.match(re);
  if (!match?.[1]) return [];

  const items: Array<{ href: string; label: string; linkConfig?: string; target?: string; rel?: string }> = [];
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

function parseLinksFromPageJsx(
  pageSource: string,
  exportName: string,
): Array<{ href: string; label: string }> {
  const tagRe = new RegExp(
    `<${exportName}\\b[^>]*links=\\{(\\[[\\s\\S]*?\\])\\}`,
    "i",
  );
  const match = pageSource.match(tagRe);
  if (!match?.[1]) return [];
  const items: Array<{ href: string; label: string }> = [];
  const itemRe =
    /\{\s*href:\s*("([^"]*)"|'([^']*)'|([^,}]+))\s*,\s*label:\s*("([^"]*)"|'([^']*)'|([^,}]+))\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(match[1]!))) {
    items.push({
      href: (m[2] ?? m[3] ?? m[4] ?? "").replace(/['"]/g, ""),
      label: (m[6] ?? m[7] ?? m[8] ?? "").replace(/['"]/g, ""),
    });
  }
  return items;
}

function parseFooterLinksProp(
  pageSource: string | undefined,
  exportName: string,
  pageProps: Record<string, string>,
  defaultProps: Record<string, string>,
  componentSource?: string,
): Array<{ href: string; label: string; linkConfig?: string }> {
  if (pageSource) {
    const fromJsx = parseLinksFromPageJsx(pageSource, exportName);
    if (fromJsx.length) return fromJsx;
  }
  const raw = pageProps.links ?? defaultProps.links;
  if (!raw) {
    if (componentSource) {
      const defaults = parseLinksArrayLiteral(componentSource, "links");
      if (defaults.length) return defaults;
    }
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as Array<{ href: string; label: string; linkConfig?: string }>;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buttonToLink(button: VisualButton, exportName: string): VisualLink {
  return createDefaultLink({
    id: button.id,
    kind: button.sourceKind === "prop" ? "cta" : "button",
    label: button.label,
    href: button.href,
    linkType: button.linkType as VisualLink["linkType"],
    target: button.target,
    rel: defaultLinkRel(button.target),
    sourceKind: button.sourceKind === "prop" ? "prop" : "inline",
    sourceIndex: button.sourceIndex,
    sectionExportName: exportName,
    propName: button.propName,
    hrefPropName: button.hrefPropName,
    buttonId: button.id,
  });
}

function classifyInlineAnchor(
  anchor: RawAnchor,
  exportName: string,
  buttonLabels: Set<string>,
): VisualLink | null {
  if (buttonLabels.has(anchor.label.toLowerCase())) return null;

  let kind: LinkElementKind = "text";
  if (anchor.isLogo) kind = "logo";
  else if (anchor.isImageWrap) kind = "image";
  else if (anchor.isNav) kind = "nav";

  const config = parseLinkConfig(anchor.configJson);
  const target = parseTarget(anchor.target);
  const base = createDefaultLink({
    id: anchor.linkId ?? `${exportName}-link-${anchor.index}`,
    kind,
    label: anchor.label,
    href: anchor.href,
    linkType: inferLinkType(anchor.href),
    target,
    rel: anchor.rel ? parseRelAttribute(anchor.rel) : defaultLinkRel(target),
    sourceKind: "inline",
    sourceIndex: anchor.index,
    sectionExportName: exportName,
  });
  return mergeLinkConfig(base, config);
}

/** Detect anchor section ids from component sources. */
export function listAnchorSections(
  files: Array<{ path: string; content?: string }>,
): Array<{ id: string; label: string }> {
  const ids = new Map<string, string>();
  const defaults = [
    { id: "contact", label: "Contact" },
    { id: "features", label: "Features" },
    { id: "services", label: "Services" },
    { id: "pricing", label: "Pricing" },
    { id: "about", label: "About" },
  ];
  for (const d of defaults) ids.set(d.id, d.label);

  for (const file of files) {
    if (!file.content) continue;
    const idRe = /\bid\s*=\s*["']([a-zA-Z][\w-]*)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = idRe.exec(file.content))) {
      const id = match[1]!;
      if (!ids.has(id)) {
        ids.set(id, id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      }
    }
  }

  return [...ids.entries()].map(([id, label]) => ({ id, label }));
}

export function extractLinksFromSection(params: {
  exportName: string;
  componentSource?: string;
  pageSource?: string;
  bodyFont?: string;
  kindHint?: string;
}): VisualLink[] {
  const { exportName, componentSource, pageSource, kindHint } = params;
  const links: VisualLink[] = [];

  const buttons = extractButtonsFromSection({
    exportName,
    componentSource,
    pageSource,
    bodyFont: params.bodyFont,
  });
  const buttonLabels = new Set(buttons.map((b) => b.label.toLowerCase()));
  for (const button of buttons) {
    links.push(buttonToLink(button, exportName));
  }

  if (componentSource) {
    if (/SiteHeader|NavModern/i.test(exportName)) {
      const navItems =
        parseLinksArrayLiteral(componentSource, "links") ||
        parseLinksArrayLiteral(componentSource, "NAV") ||
        parseLinksArrayLiteral(componentSource, "navLinks");
      navItems.forEach((item, index) => {
        const config = parseLinkConfig(item.linkConfig);
        const target = parseTarget(item.target);
        const base = createDefaultLink({
          id: `${exportName}-nav-${index}`,
          kind: "nav",
          label: item.label,
          href: item.href,
          linkType: inferLinkType(item.href),
          target: config?.target ?? target,
          rel: config?.rel ?? (item.rel ? parseRelAttribute(item.rel) : defaultLinkRel(target)),
          sourceKind: "array-const",
          sourceIndex: index,
          sectionExportName: exportName,
          arrayPropName: "links",
        });
        links.push(mergeLinkConfig(base, config));
      });
    }

    if (/SiteFooter/i.test(exportName)) {
      const pageProps = pageSource ? parseComponentInvocation(pageSource, exportName) : {};
      const defaultProps = parseDefaultPropsFromComponent(componentSource);
      const footerItems = parseFooterLinksProp(
        pageSource,
        exportName,
        pageProps,
        defaultProps,
        componentSource,
      );
      footerItems.forEach((item, index) => {
        const config = parseLinkConfig(item.linkConfig);
        const base = createDefaultLink({
          id: `${exportName}-footer-${index}`,
          kind: "footer",
          label: item.label,
          href: item.href,
          linkType: inferLinkType(item.href),
          target: "same",
          rel: [],
          sourceKind: "array-prop",
          sourceIndex: index,
          sectionExportName: exportName,
          arrayPropName: "links",
        });
        links.push(mergeLinkConfig(base, config));
      });
    }

    for (const anchor of findAnchors(componentSource)) {
      const link = classifyInlineAnchor(anchor, exportName, buttonLabels);
      if (link && !links.some((l) => l.id === link.id)) {
        links.push(link);
      }
    }
  }

  if (kindHint === "header" && !links.some((l) => l.kind === "logo") && componentSource) {
    const logoMatch = componentSource.match(/<a\b([^>]*href\s*=\s*["']\/["'][^>]*)>/i);
    if (logoMatch) {
      links.unshift(
        createDefaultLink({
          id: `${exportName}-logo`,
          kind: "logo",
          label: "Logo",
          href: "/",
          linkType: "internal",
          target: "same",
          rel: [],
          sourceKind: "logo",
          sourceIndex: 0,
          sectionExportName: exportName,
        }),
      );
    }
  }

  return links;
}

export { listInternalPageRoutes };
