/**
 * Extract editable buttons from generated section components and page props.
 */

import {
  buttonConfigPropName,
  mergeButtonConfig,
  parseButtonConfig,
  WB_BUTTON_CONFIG_ATTR,
} from "@/lib/ai-core/visual-editor/button-config";
import {
  parseComponentInvocation,
  parseDefaultPropsFromComponent,
} from "@/lib/ai-core/visual-editor/hydrate-node-text";
import {
  createDefaultButton,
  inferLinkType,
  type ButtonSourceKind,
  type VisualButton,
} from "@/lib/ai-core/visual-editor/button-types";

const DISMISS_LABEL_RE = /^(×|x|dismiss|close)$/i;

const PROP_BUTTON_DEFS = [
  { propName: "primaryCta", hrefPropName: "primaryCtaHref", defaultHref: "#contact", style: "primary" as const },
  { propName: "secondaryCta", hrefPropName: "secondaryCtaHref", defaultHref: "#features", style: "outline" as const },
  { propName: "ctaLabel", hrefPropName: "ctaHref", defaultHref: "#contact", style: "primary" as const },
  { propName: "label", hrefPropName: "href", defaultHref: "#contact", style: "primary" as const },
] as const;

type RawElement = {
  kind: ButtonSourceKind;
  index: number;
  href: string;
  label: string;
  target?: string;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  configJson?: string;
  buttonId?: string;
};

function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTextContent(inner: string): string {
  const withoutIcons = inner
    .replace(/\{\/\*\s*wb-icon-(?:left|right):[A-Za-z]+\s*\*\/\}/g, "")
    .replace(/<span\b[\s\S]*?wb-btn-icon[\s\S]*?\/>/gi, "")
    .replace(/<span[^>]*wb-btn-icon[^>]*>[\s\S]*?<\/span>/gi, "");
  const withoutProp = withoutIcons.replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g, "").trim();
  if (withoutProp) {
    return unescapeHtml(withoutProp.replace(/<[^>]+>/g, "").trim());
  }
  const propMatch = inner.match(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/);
  return propMatch?.[1] ?? "";
}

function parseTarget(attrTarget?: string): "same" | "new" {
  return attrTarget === "_blank" ? "new" : "same";
}

function readConfigFromAttrs(attrs: string): string | undefined {
  const patterns = [
    new RegExp(`${WB_BUTTON_CONFIG_ATTR}\\s*=\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"),
    new RegExp(`${WB_BUTTON_CONFIG_ATTR}\\s*=\\s*'((?:\\\\.|[^'\\\\])*)'`, "i"),
    new RegExp(
      `${WB_BUTTON_CONFIG_ATTR}\\s*=\\s*\\{\\s*"((?:\\\\.|[^"\\\\])*)"\\s*\\}`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const match = attrs.match(re);
    if (match?.[1]) return unescapeHtml(match[1]);
  }
  return undefined;
}

function readIdFromAttrs(attrs: string): string | undefined {
  const match = attrs.match(/data-wb-button-id\s*=\s*("([^"]*)"|'([^']*)')/i);
  return match?.[2] ?? match?.[3];
}

function findInteractiveElements(source: string): RawElement[] {
  const elements: RawElement[] = [];
  const tagRe = /<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  let anchorIndex = 0;
  let buttonIndex = 0;

  while ((match = tagRe.exec(source))) {
    const tag = match[1]!.toLowerCase();
    const attrs = match[2] ?? "";
    const inner = match[3] ?? "";
    const label = extractTextContent(inner);
    if (!label || DISMISS_LABEL_RE.test(label)) continue;
    if (/aria-label\s*=\s*["']Dismiss["']/i.test(attrs)) continue;

    const hrefMatch = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|\{([^}]+)\})/i);
    const href =
      tag === "a"
        ? unescapeHtml(
            (hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "#").replace(
              /^["'{]|["'}]$/g,
              "",
            ),
          )
        : "#";
    const targetMatch = attrs.match(/target\s*=\s*("([^"]*)"|'([^']*)')/i);
    const ariaMatch = attrs.match(/aria-label\s*=\s*("([^"]*)"|'([^']*)')/i);
    const titleMatch = attrs.match(/title\s*=\s*("([^"]*)"|'([^']*)')/i);
    const disabled = /\bdisabled\b/i.test(attrs) || /aria-disabled\s*=\s*["']true["']/i.test(attrs);

    const kind: ButtonSourceKind = tag === "a" ? "anchor" : "button";
    const index = kind === "anchor" ? anchorIndex++ : buttonIndex++;

    elements.push({
      kind,
      index,
      href,
      label,
      target: targetMatch?.[2] ?? targetMatch?.[3],
      ariaLabel: ariaMatch?.[2] ?? ariaMatch?.[3],
      title: titleMatch?.[2] ?? titleMatch?.[3],
      disabled,
      configJson: readConfigFromAttrs(attrs),
      buttonId: readIdFromAttrs(attrs),
    });
  }

  return elements;
}

function findAnchorConfigForProp(
  componentSource: string | undefined,
  propName: string,
): string | undefined {
  if (!componentSource) return undefined;
  const anchorMatch = componentSource.match(
    new RegExp(`<a\\b([^>]*)>[\\s\\S]*?\\{${propName}\\}[\\s\\S]*?<\\/a>`, "i"),
  );
  return anchorMatch?.[1] ? readConfigFromAttrs(anchorMatch[1]) : undefined;
}

function findPropAnchorHref(
  componentSource: string | undefined,
  propName: string,
): string | undefined {
  if (!componentSource) return undefined;
  const anchorMatch = componentSource.match(
    new RegExp(`<a\\b([^>]*)>[\\s\\S]*?\\{${propName}\\}[\\s\\S]*?<\\/a>`, "i"),
  );
  if (!anchorMatch?.[1]) return undefined;
  const hrefMatch = anchorMatch[1].match(/href\s*=\s*("([^"]*)"|'([^']*)')/i);
  return hrefMatch?.[2] ?? hrefMatch?.[3];
}

function extractPropButtons(
  exportName: string,
  pageProps: Record<string, string>,
  defaultProps: Record<string, string>,
  componentSource?: string,
): VisualButton[] {
  const buttons: VisualButton[] = [];
  const merged = { ...defaultProps, ...pageProps };

  for (const def of PROP_BUTTON_DEFS) {
    const label = merged[def.propName]?.trim();
    if (!label) continue;
    const anchorHref = findPropAnchorHref(componentSource, def.propName);
    const href = merged[def.hrefPropName] ?? anchorHref ?? def.defaultHref;
    const pageConfig = parseButtonConfig(merged[buttonConfigPropName(def.propName)]);
    const anchorConfig = parseButtonConfig(findAnchorConfigForProp(componentSource, def.propName));

    const base = createDefaultButton({
      id: `${exportName}-${def.propName}`,
      label,
      href,
      linkType: inferLinkType(href),
      style: def.style,
      sourceKind: "prop",
      sourceIndex: buttons.length,
      propName: def.propName,
      hrefPropName: def.hrefPropName,
    });

    buttons.push(mergeButtonConfig(mergeButtonConfig(base, pageConfig), anchorConfig));
  }

  return buttons;
}

/**
 * Extract buttons for a home-page section component.
 */
export function extractButtonsFromSection(params: {
  exportName: string;
  componentSource?: string;
  pageSource?: string;
  bodyFont?: string;
}): VisualButton[] {
  const { exportName, componentSource, pageSource, bodyFont } = params;
  const pageProps = pageSource
    ? parseComponentInvocation(pageSource, exportName)
    : {};
  const defaultProps = componentSource
    ? parseDefaultPropsFromComponent(componentSource)
    : {};

  const propButtons = extractPropButtons(
    exportName,
    pageProps,
    defaultProps,
    componentSource,
  );
  const propLabels = new Set(propButtons.map((b) => b.label.toLowerCase()));

  const inlineButtons: VisualButton[] = [];
  if (componentSource) {
    for (const el of findInteractiveElements(componentSource)) {
      if (propLabels.has(el.label.toLowerCase())) continue;
      const propRef = el.label.match(/^\{?([a-zA-Z_][a-zA-Z0-9_]*)\}?$/)?.[1];
      if (propRef && propButtons.some((b) => b.propName === propRef)) continue;

      const config = parseButtonConfig(el.configJson);
      const base = createDefaultButton({
        id: el.buttonId ?? `${exportName}-${el.kind}-${el.index}`,
        label: el.label,
        href: el.href,
        linkType: inferLinkType(el.href),
        target: parseTarget(el.target),
        sourceKind: el.kind,
        sourceIndex: el.index,
        ariaLabel: el.ariaLabel ?? "",
        title: el.title ?? "",
        disabled: el.disabled ?? false,
        typography: {
          fontFamily: bodyFont ?? "inherit",
          fontWeight: "600",
          fontSize: "0.875rem",
          letterSpacing: "0.02em",
        },
      });
      inlineButtons.push(mergeButtonConfig(base, config));
    }
  }

  if (propButtons.length > 0) return propButtons;
  return inlineButtons;
}

/** List internal routes from generated project files. */
export function listInternalPageRoutes(
  files: Array<{ path: string }>,
): Array<{ path: string; label: string }> {
  const routes = new Map<string, string>();
  routes.set("/", "Home");

  for (const file of files) {
    const normalized = file.path.replace(/\\/g, "/");
    const match = normalized.match(/^app\/(.+?)\/page\.tsx$/i);
    if (!match?.[1]) continue;
    const segments = match[1].split("/");
    if (segments.some((s) => s.startsWith("(") && s.endsWith(")"))) continue;
    const route = `/${match[1]}`;
    const label = segments
      .map((s) => s.replace(/-/g, " "))
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" / ");
    routes.set(route, label);
  }

  return [...routes.entries()]
    .map(([path, label]) => ({ path, label }))
    .sort((a, b) => a.path.localeCompare(b.path));
}
