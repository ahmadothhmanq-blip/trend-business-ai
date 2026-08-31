/**
 * Semantic HTML tree builder (Phase 4).
 * Emits a DOM document model. No React, JSX, class names, or CSS.
 */

import type {
  NavigationItem,
  WebsiteComponent,
  WebsitePage,
  WebsiteSection,
} from "@/lib/ai-core/website-builder/domain/contracts";
import type { WebsiteGeneratedStructure } from "@/lib/ai-core/website-builder/generation/contracts";
import type {
  Html5Tag,
  HtmlNode,
  RenderAsset,
  RenderDocument,
  RenderLink,
  RenderNavItem,
  RenderPageDocument,
  WebsiteRenderContext,
} from "@/lib/ai-core/website-builder/render/contracts";
import { WebsiteRenderError } from "@/lib/ai-core/website-builder/render/errors";

const FORBIDDEN_ATTRS = new Set(["class", "classname", "style"]);

export function htmlNode(tag: Html5Tag, attrs: Record<string, string> = {}, children: HtmlNode[] = [], text?: string): HtmlNode {
  for (const key of Object.keys(attrs)) {
    if (FORBIDDEN_ATTRS.has(key.toLowerCase())) {
      throw new WebsiteRenderError("HTML nodes cannot include class or style attributes.", "invalid_document");
    }
  }
  return { tag, attrs, children, text };
}

export function walkHtml(node: HtmlNode, visit: (node: HtmlNode, parent: HtmlNode | null) => void, parent: HtmlNode | null = null): void {
  visit(node, parent);
  for (const child of node.children) walkHtml(child, visit, node);
}

export function findHtml(node: HtmlNode, tag: Html5Tag): HtmlNode[] {
  const matches: HtmlNode[] = [];
  walkHtml(node, (current) => {
    if (current.tag === tag) matches.push(current);
  });
  return matches;
}

export function canonicalUrlFor(baseUrl: string, path: string): string {
  const origin = new URL(baseUrl);
  return new URL(path || "/", origin).toString();
}

function textOf(component: WebsiteComponent, fallback: string): string {
  const value = component.props.text ?? component.props.label ?? component.props.alt;
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function altOf(component: WebsiteComponent, fallback: string): string {
  const value = component.props.alt ?? component.props.text;
  if (typeof value === "string" && value.trim().length >= 3) return value.trim();
  return fallback;
}

function fieldNames(component: WebsiteComponent): string[] {
  const raw = component.props.fields;
  if (typeof raw !== "string" || !raw.trim()) return ["name", "email", "message"];
  return raw.split(",").map((field) => field.trim()).filter(Boolean);
}

function mapNav(items: NavigationItem[], pagesById: Map<string, WebsitePage>): RenderNavItem[] {
  return items.map((item) => {
    const page = pagesById.get(item.pageId);
    if (!page) throw new WebsiteRenderError("Navigation points at a missing page.", "broken_link");
    return {
      href: page.path,
      label: item.label,
      pageId: page.id,
      children: mapNav(item.children, pagesById),
    };
  });
}

function resolveInternalHref(
  component: WebsiteComponent,
  page: WebsitePage,
  pages: WebsitePage[],
): string {
  const explicit = component.props.href;
  if (typeof explicit === "string" && explicit.startsWith("/")) return explicit;
  const role = String(component.props.role ?? "");
  if (role === "home") return "/";
  if (role === "all-articles") {
    const articles = pages.find((item) => item.slug === "articles" || item.slug === "blog");
    return articles?.path ?? "/";
  }
  const byTitle = pages.find((item) => item.title.toLowerCase() === textOf(component, "").toLowerCase());
  if (byTitle) return byTitle.path;
  return page.path;
}

function headingTag(level: 1 | 2 | 3): Html5Tag {
  if (level === 1) return "h1";
  if (level === 2) return "h2";
  return "h3";
}

function renderComponent(
  component: WebsiteComponent,
  children: WebsiteComponent[],
  ctx: {
    page: WebsitePage;
    pages: WebsitePage[];
    section: WebsiteSection;
    sectionLevel: 1 | 2;
    assets: RenderAsset[];
    links: RenderLink[];
  },
): HtmlNode[] {
  const byParent = children.filter((child) => child.parentComponentId === component.id);
  const nested = byParent
    .sort((a, b) => a.order - b.order)
    .flatMap((child) => renderComponent(child, children, ctx));
  const copy = textOf(component, ctx.page.title);

  switch (component.type) {
    case "heading":
      return [htmlNode(headingTag(ctx.sectionLevel), { id: `heading-${ctx.page.slug}-${component.id.slice(0, 8)}` }, [], copy)];
    case "text":
      return [htmlNode("p", {}, [], copy)];
    case "button":
      return [htmlNode("button", { type: "button" }, [], copy)];
    case "image": {
      const alt = altOf(component, `${ctx.page.title} visual`);
      const href = `/assets/image/${ctx.page.slug}-${component.id.slice(0, 8)}.webp`;
      ctx.assets.push({ kind: "image", href, alt, pageId: ctx.page.id });
      return [
        htmlNode("picture", {}, [
          htmlNode("source", { srcset: href, type: "image/webp" }),
          htmlNode("img", { src: href, alt }),
        ]),
      ];
    }
    case "list":
      return [htmlNode("ul", {}, copy.split(/(?<=\.)\s+/).filter(Boolean).map((item) => htmlNode("li", {}, [], item)))];
    case "card":
      return [
        htmlNode("article", {}, [
          htmlNode(headingTag(ctx.sectionLevel === 1 ? 2 : 3), {}, [], copy),
          ...nested,
        ]),
      ];
    case "form": {
      const fields = fieldNames(component);
      return [
        htmlNode(
          "form",
          { method: "post", "aria-label": String(component.props.kind ?? "contact") },
          [
            ...fields.map((field) => {
              const id = `field-${ctx.page.slug}-${field.replace(/\s+/g, "-")}`;
              return htmlNode("label", { for: id }, [
                htmlNode("input", { id, name: field, type: field.includes("email") ? "email" : "text" }),
              ], field);
            }),
            htmlNode("button", { type: "submit" }, [], "Submit"),
          ],
        ),
      ];
    }
    case "metric":
      return [htmlNode("article", {}, [htmlNode("p", {}, [], copy)])];
    case "quote":
      return [htmlNode("aside", {}, [htmlNode("blockquote", {}, [], copy)])];
    case "link": {
      const href = resolveInternalHref(component, ctx.page, ctx.pages);
      ctx.links.push({ href, label: copy, internal: href.startsWith("/"), pageId: ctx.page.id });
      return [htmlNode("a", { href }, [], copy)];
    }
    case "divider":
      return [htmlNode("hr")];
    case "group":
      return nested;
    default:
      return [htmlNode("p", {}, [], copy)];
  }
}

function renderSection(
  section: WebsiteSection,
  components: WebsiteComponent[],
  ctx: {
    page: WebsitePage;
    pages: WebsitePage[];
    usedH1: boolean;
    assets: RenderAsset[];
    links: RenderLink[];
  },
): { nodes: HtmlNode[]; usedH1: boolean } {
  const tree = components
    .filter((component) => component.sectionId === section.id)
    .sort((a, b) => a.order - b.order);
  const roots = tree.filter((component) => !component.parentComponentId);
  const hasHeading = roots.some((component) => component.type === "heading");
  const sectionLevel: 1 | 2 = !ctx.usedH1 && hasHeading ? 1 : 2;
  const usedH1 = ctx.usedH1 || hasHeading;
  const children = roots.flatMap((component) =>
    renderComponent(component, tree, {
      page: ctx.page,
      pages: ctx.pages,
      section,
      sectionLevel,
      assets: ctx.assets,
      links: ctx.links,
    }),
  );
  const heading = children.find((node) => node.tag === "h1" || node.tag === "h2" || node.tag === "h3");
  const attrs: Record<string, string> = {
    id: `section-${ctx.page.slug}-${section.type}-${section.order}`,
  };
  if (heading?.attrs.id) attrs["aria-labelledby"] = heading.attrs.id;

  if (section.type === "footer") {
    return { nodes: [htmlNode("footer", attrs, children)], usedH1 };
  }
  if (section.type === "testimonials") {
    return { nodes: [htmlNode("aside", attrs, children)], usedH1 };
  }
  return { nodes: [htmlNode("section", attrs, children)], usedH1 };
}

function renderHead(page: WebsitePage, canonicalUrl: string, ogImage: string, siteName: string): HtmlNode {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.seo.title,
    description: page.seo.description,
    url: canonicalUrl,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: new URL("/", canonicalUrl).toString(),
    },
  };
  return htmlNode("head", {}, [
    htmlNode("title", {}, [], page.seo.title),
    htmlNode("meta", { charset: "utf-8" }),
    htmlNode("meta", { name: "description", content: page.seo.description }),
    htmlNode("meta", { name: "robots", content: page.seo.robots }),
    htmlNode("link", { rel: "canonical", href: canonicalUrl }),
    htmlNode("meta", { property: "og:type", content: "website" }),
    htmlNode("meta", { property: "og:title", content: page.seo.ogTitle ?? page.seo.title }),
    htmlNode("meta", { property: "og:description", content: page.seo.ogDescription ?? page.seo.description }),
    htmlNode("meta", { property: "og:url", content: canonicalUrl }),
    htmlNode("meta", { property: "og:image", content: ogImage }),
    htmlNode("meta", { property: "og:locale", content: page.seo.locale }),
    htmlNode("script", { type: "application/ld+json" }, [], JSON.stringify(jsonLd)),
  ]);
}

function renderHeader(structure: WebsiteGeneratedStructure, nav: RenderNavItem[]): HtmlNode {
  const toList = (items: RenderNavItem[]): HtmlNode =>
    htmlNode(
      "ul",
      {},
      items.map((item) =>
        htmlNode("li", {}, [
          htmlNode("a", { href: item.href }, [], item.label),
          ...(item.children.length ? [toList(item.children)] : []),
        ]),
      ),
    );
  return htmlNode("header", {}, [
    htmlNode("p", {}, [htmlNode("a", { href: "/" }, [], structure.project.name)]),
    htmlNode("nav", { "aria-label": "Primary" }, [toList(nav)]),
  ]);
}

function ensureH1(mainChildren: HtmlNode[], page: WebsitePage): HtmlNode[] {
  const hasH1 = mainChildren.some((node) => {
    let found = false;
    walkHtml(node, (current) => {
      if (current.tag === "h1") found = true;
    });
    return found;
  });
  if (hasH1) return mainChildren;
  return [htmlNode("h1", { id: `heading-${page.slug}-title` }, [], page.title), ...mainChildren];
}

export function renderPageDocument(
  structure: WebsiteGeneratedStructure,
  page: WebsitePage,
  baseUrl: string,
  navigation: RenderNavItem[],
): RenderPageDocument {
  const pageSections = structure.sections
    .filter((section) => section.pageId === page.id)
    .sort((a, b) => a.order - b.order);
  const assets: RenderAsset[] = [];
  const links: RenderLink[] = [];
  let usedH1 = false;
  const mainNodes: HtmlNode[] = [];
  const footerNodes: HtmlNode[] = [];

  for (const section of pageSections) {
    const rendered = renderSection(section, structure.components, {
      page,
      pages: structure.pages,
      usedH1,
      assets,
      links,
    });
    usedH1 = rendered.usedH1;
    if (section.type === "footer") footerNodes.push(...rendered.nodes);
    else mainNodes.push(...rendered.nodes);
  }

  const canonical = canonicalUrlFor(baseUrl, page.path);
  const ogImagePath = `/assets/og/${page.slug}.webp`;
  const ogImage = canonicalUrlFor(baseUrl, ogImagePath);
  assets.push({ kind: "og", href: ogImagePath, alt: `${page.title} social preview`, pageId: page.id });

  const heroHasVisual = pageSections.some((section) => section.type === "hero");
  if (heroHasVisual) {
    assets.push({
      kind: "video",
      href: `/assets/video/${page.slug}-hero.webm`,
      alt: `${page.title} motion preview`,
      pageId: page.id,
    });
  }

  const header = renderHeader(structure, navigation);
  walkHtml(header, (node) => {
    if (node.tag === "a") {
      links.push({ href: node.attrs.href, label: node.text ?? "", internal: true, pageId: page.id });
    }
  });

  const main = htmlNode("main", { id: `main-${page.slug}` }, ensureH1(mainNodes, page));
  const videoNodes: HtmlNode[] = heroHasVisual
    ? [
        htmlNode("video", { "aria-label": `${page.title} motion preview` }, [
          htmlNode("source", { src: `/assets/video/${page.slug}-hero.webm`, type: "video/webm" }),
        ]),
      ]
    : [];
  if (videoNodes.length) {
    const firstSection = main.children.find((node) => node.tag === "section");
    if (firstSection) firstSection.children.push(...videoNodes);
  }

  const tree = htmlNode("html", { lang: page.seo.locale }, [
    renderHead(page, canonical, ogImage, structure.project.name),
    htmlNode("body", {}, [header, main, ...footerNodes]),
  ]);

  return {
    pageId: page.id,
    slug: page.slug,
    path: page.path,
    canonicalUrl: canonical,
    tree,
    assets,
    links,
  };
}

export function renderWebsiteDocument(context: WebsiteRenderContext): RenderDocument {
  const { structure, documentBaseUrl } = context;
  const pagesById = new Map(structure.pages.map((page) => [page.id, page]));
  const navigation = mapNav(structure.navigation.items, pagesById);
  const pages = structure.pages
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((page) => renderPageDocument(structure, page, documentBaseUrl, navigation));

  return {
    projectId: structure.project.id,
    userId: structure.project.userId,
    planId: structure.plan.id,
    baseUrl: documentBaseUrl,
    pages,
    navigation,
    assets: pages.flatMap((page) => page.assets),
    createdAt: context.now(),
  };
}
