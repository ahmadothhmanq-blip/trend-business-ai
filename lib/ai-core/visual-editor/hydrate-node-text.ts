/**
 * Resolve visual-editor node copy from generated project artifacts.
 * Scaffolds render `{title}` via props — never treat raw JSX placeholders as display text.
 */

import { buildIndustryCopyPack } from "@/lib/ai-core/content/industry-copy";
import { buildProductionContentPack } from "@/lib/ai-core/content/production-content";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { getThemeComponentRole } from "@/lib/website/builder/theme-component-registry";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { VisualNodeKind } from "@/lib/ai-core/visual-editor/types";

const TEMPLATE_TOKEN_RE = /^\{[a-zA-Z_][a-zA-Z0-9_]*\}$/;

export function isTemplateToken(value: string | undefined | null): boolean {
  if (!value?.trim()) return false;
  return TEMPLATE_TOKEN_RE.test(value.trim());
}

function cleanText(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || isTemplateToken(trimmed)) return undefined;
  return trimmed;
}

function unescapeJsString(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
}

/** Parse string props from a JSX opening tag attribute block. */
export function parseJsxStringProps(attrs: string): Record<string, string> {
  const props: Record<string, string> = {};
  const patterns = [
    /(\w+)\s*=\s*"((?:\\.|[^"\\])*)"/g,
    /(\w+)\s*=\s*'((?:\\.|[^'\\])*)'/g,
    /(\w+)\s*=\s*\{\s*"((?:\\.|[^"\\])*)"\s*\}/g,
    /(\w+)\s*=\s*\{\s*'((?:\\.|[^'\\])*)'\s*\}/g,
  ];
  for (const re of patterns) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(attrs))) {
      const key = match[1]!;
      const raw = match[2] ?? match[3];
      if (raw !== undefined) props[key] = unescapeJsString(raw);
    }
  }
  return props;
}

/** Read props passed to a component in app/page.tsx (or home page). */
export function parseComponentInvocation(
  pageSource: string,
  exportName: string,
): Record<string, string> {
  const tagRe = new RegExp(
    `<${exportName}\\b([\\s\\S]*?)(?:/>|>\\s*</${exportName}>)`,
    "i",
  );
  const match = pageSource.match(tagRe);
  if (!match?.[1]) return {};
  return parseJsxStringProps(match[1]);
}

/** Default destructured prop values from a section component file. */
export function parseDefaultPropsFromComponent(
  source: string,
): Record<string, string> {
  const fnMatch =
    source.match(/export function \w+\(\{([\s\S]*?)\}\s*:\s*\w+Props\)/) ||
    source.match(/export function \w+\(\{([\s\S]*?)\}\s*\)/);
  if (!fnMatch?.[1]) return {};

  const props: Record<string, string> = {};
  const defaultRe =
    /(\w+)\s*=\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  let match: RegExpExecArray | null;
  while ((match = defaultRe.exec(fnMatch[1]!))) {
    const key = match[1]!;
    const quoted = match[2]!;
    const raw = quoted.slice(1, -1);
    props[key] = unescapeJsString(raw);
  }
  return props;
}

function extractLiteralHeading(content: string): string | undefined {
  const h1 = content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1?.[1]) {
    const text = h1[1].replace(/<[^>]+>/g, "").trim();
    return cleanText(text);
  }
  const h2 = content.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  if (h2?.[1]) {
    const text = h2[1].replace(/<[^>]+>/g, "").trim();
    return cleanText(text);
  }
  return undefined;
}

function resolveProductionPack(
  project?: GeneratedWebsiteProject | null,
): ProductionContentPack | null {
  if (!project) return null;
  try {
    const language =
      (project.settings as { language?: string } | undefined)?.language ?? null;
    const copyPack = buildIndustryCopyPack({
      industryId: project.businessProfile?.industry,
      profile: project.businessProfile as never,
      strategy: project.strategy as never,
      language,
    });
    return buildProductionContentPack(
      copyPack,
      project.businessProfile?.projectName || project.title,
      language,
    );
  } catch {
    return null;
  }
}

function headlineFromProductionPack(
  role: ReturnType<typeof getThemeComponentRole>,
  kind: VisualNodeKind,
  pack: ProductionContentPack,
  project?: GeneratedWebsiteProject | null,
): string | undefined {
  if (role === "hero") return cleanText(pack.heroHeadline);
  if (role === "nav") {
    return cleanText(
      project?.businessProfile?.projectName || project?.title || pack.heroHeadline,
    );
  }
  if (role === "footer") {
    return cleanText(pack.brandTagline || project?.title);
  }
  if (role === "features" || role === "blog") {
    return cleanText(pack.featuresTitle);
  }
  if (role === "services" || role === "process") {
    return cleanText(pack.servicesTitle);
  }
  if (role === "testimonials" || role === "trust") {
    return cleanText(pack.testimonialsTitle);
  }
  if (role === "pricing") return cleanText(pack.pricingTitle);
  if (role === "faq") return cleanText(pack.faqTitle);
  if (role === "gallery" || role === "portfolio" || role === "cases") {
    return cleanText(pack.galleryTitle);
  }
  if (role === "cta") return cleanText(pack.ctaTitle);
  if (role === "contact") return cleanText(pack.contactTitle);
  if (role === "story") return cleanText(pack.featuresTitle);

  if (kind === "hero") return cleanText(pack.heroHeadline);
  if (kind === "header") {
    return cleanText(
      project?.businessProfile?.projectName || project?.title || pack.heroHeadline,
    );
  }
  if (kind === "footer") return cleanText(pack.brandTagline || project?.title);
  if (kind === "cta") return cleanText(pack.ctaTitle);
  if (kind === "proof") return cleanText(pack.testimonialsTitle);
  if (kind === "media") return cleanText(pack.galleryTitle);
  return cleanText(pack.featuresTitle || pack.servicesTitle);
}

function pickHeadlineProp(
  props: Record<string, string>,
  role: ReturnType<typeof getThemeComponentRole>,
  kind: VisualNodeKind,
): string | undefined {
  const candidates: string[] = [];
  if (role === "nav" || kind === "header") {
    candidates.push("brandName", "title");
  } else if (role === "footer" || kind === "footer") {
    candidates.push("tagline", "brandName", "title");
  } else if (role === "hero" || kind === "hero") {
    candidates.push("title", "headline", "heroHeadline");
  } else if (role === "cta" || kind === "cta") {
    candidates.push("title", "primaryCta", "ctaTitle");
  } else {
    candidates.push("title", "eyebrow", "headline");
  }
  for (const key of candidates) {
    const value = cleanText(props[key]);
    if (value) return value;
  }
  return undefined;
}

export function resolveVisualNodeText(params: {
  exportName: string;
  kind: VisualNodeKind;
  componentSource?: string;
  pageSource?: string;
  project?: GeneratedWebsiteProject | null;
}): string | undefined {
  const role = getThemeComponentRole(params.exportName as never);

  if (params.componentSource) {
    const literal = extractLiteralHeading(params.componentSource);
    if (literal) return literal;
  }

  const jsxProps = params.pageSource
    ? parseComponentInvocation(params.pageSource, params.exportName)
    : {};
  const fromPage = pickHeadlineProp(jsxProps, role, params.kind);
  if (fromPage) return fromPage;

  const pack = resolveProductionPack(params.project);
  if (pack) {
    const fromPack = headlineFromProductionPack(
      role,
      params.kind,
      pack,
      params.project,
    );
    if (fromPack) return fromPack;
  }

  if (params.project) {
    if (params.kind === "hero") {
      const hero = cleanText(
        params.project.strategy?.pages?.[0]?.name ||
          params.project.title ||
          params.project.content?.[0],
      );
      if (hero) return hero;
    }
    const fromContent = cleanText(
      params.project.content?.find((line) => line.trim().length > 8),
    );
    if (fromContent) return fromContent;
    const title = cleanText(params.project.title);
    if (title && params.kind === "hero") return title;
  }

  if (params.componentSource) {
    const defaults = parseDefaultPropsFromComponent(params.componentSource);
    const fromDefaults = pickHeadlineProp(defaults, role, params.kind);
    if (fromDefaults) return fromDefaults;
  }

  return undefined;
}

export function findHomePageSource(
  files: GeneratedProjectFile[],
): string | undefined {
  const home =
    files.find((f) => f.path.replace(/\\/g, "/") === "app/page.tsx") ||
    files.find(
      (f) => f.path.replace(/\\/g, "/").endsWith("/app/page.tsx"),
    );
  return home?.content;
}

/** Update or insert a string prop on a home-page component invocation. */
export function updateComponentJsxStringProp(
  pageSource: string,
  exportName: string,
  propName: string,
  value: string,
): string | null {
  const tagRe = new RegExp(
    `<${exportName}\\b([\\s\\S]*?)(\\s*/>|>)`,
    "i",
  );
  const match = pageSource.match(tagRe);
  if (!match || match.index === undefined) return null;

  const attrs = match[1] ?? "";
  const closing = match[2] ?? ">";
  const propAssign = `${propName}=${JSON.stringify(value)}`;
  const existingPropRe = new RegExp(
    `${propName}\\s*=\\s*(?:"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\\{[^}]+\\})`,
    "i",
  );

  const newAttrs = existingPropRe.test(attrs)
    ? attrs.replace(existingPropRe, propAssign)
    : `${attrs.trimEnd()}\n        ${propAssign}`;

  return (
    pageSource.slice(0, match.index) +
    `<${exportName}${newAttrs}${closing}` +
    pageSource.slice(match.index + match[0].length)
  );
}

export function resolveTextPropNameForComponent(exportName: string): string {
  const role = getThemeComponentRole(exportName as never);
  if (role === "nav") return "brandName";
  if (role === "footer") return "tagline";
  return "title";
}
