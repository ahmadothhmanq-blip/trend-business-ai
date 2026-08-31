/**
 * RenderDocument → Next.js 16 React project (Phase 5).
 */

import type { HtmlNode, RenderDocument, RenderPageDocument } from "@/lib/ai-core/website-builder/render/contracts";
import { findHtml, walkHtml } from "@/lib/ai-core/website-builder/render/renderer";
import { reactComponentFiles } from "@/lib/ai-core/website-builder/react-renderer/components";
import type {
  ReactSectionComponent,
  ReactSiteContent,
  ReactSitePage,
  ReactSiteSection,
  ReactSiteTheme,
  ReactTreeNode,
  ReactWebsiteProject,
  WebsiteReactRenderContext,
} from "@/lib/ai-core/website-builder/react-renderer/contracts";
import { reactLayoutFiles } from "@/lib/ai-core/website-builder/react-renderer/layout";
import { reactMetadataFiles } from "@/lib/ai-core/website-builder/react-renderer/metadata";
import { WebsiteReactRenderError } from "@/lib/ai-core/website-builder/react-renderer/errors";
import { assertReactWebsiteProject } from "@/lib/ai-core/website-builder/react-renderer/validation";

const SECTION_COMPONENT: Record<string, ReactSectionComponent> = {
  hero: "Hero",
  features: "Features",
  services: "Services",
  about: "About",
  gallery: "Gallery",
  team: "Team",
  testimonials: "Testimonials",
  pricing: "Pricing",
  faq: "FAQ",
  cta: "CTA",
  contact: "Contact",
  footer: "Footer",
};

const DEFAULT_THEME: ReactSiteTheme = {
  name: "Corporate Precision",
  colors: {
    background: "#0B1220",
    foreground: "#F8FAFC",
    accent: "#2563EB",
    muted: "#94A3B8",
  },
  fonts: { sans: "Inter", display: "Sora" },
  radiusPx: 8,
};

function textOf(node: HtmlNode): string {
  const parts = [node.text ?? "", ...node.children.map((child) => textOf(child))];
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function metaContent(tree: HtmlNode, nameOrProperty: string, key: "name" | "property"): string {
  const match = findHtml(tree, "meta").find((node) => node.attrs[key] === nameOrProperty);
  return match?.attrs.content ?? "";
}

function headingText(node: HtmlNode): string {
  const heading = [...findHtml(node, "h1"), ...findHtml(node, "h2"), ...findHtml(node, "h3")][0];
  return heading ? textOf(heading) : "";
}

function parseSection(node: HtmlNode, page: RenderPageDocument): ReactSiteSection | null {
  const id = node.attrs.id ?? "";
  const prefix = `section-${page.slug}-`;
  if (!id.startsWith(prefix)) return null;
  const rest = id.slice(prefix.length);
  const split = rest.lastIndexOf("-");
  const type = rest.slice(0, split);
  const component = SECTION_COMPONENT[type];
  if (!component || component === "Footer") return null;
  const images = findHtml(node, "img").map((image, index) => ({
    src: image.attrs.src ?? "",
    alt: image.attrs.alt ?? `${page.slug} visual`,
    priority: type === "hero" && index === 0,
  })).filter((image) => image.src && image.alt.length >= 3);
  const form = findHtml(node, "form")[0];
  const video = findHtml(node, "source").find((item) => (item.attrs.type ?? "").includes("video"));
  const articles = findHtml(node, "article");
  const items = articles.length
    ? articles.map((article) => ({
        title: headingText(article) || textOf(article).slice(0, 48),
        body: findHtml(article, "p")[0] ? textOf(findHtml(article, "p")[0]) : textOf(article),
      }))
    : findHtml(node, "li").map((item) => ({ title: textOf(item).slice(0, 48), body: textOf(item) }));
  const paragraphs = findHtml(node, "p").map((item) => textOf(item)).filter(Boolean);
  return {
    id,
    component,
    title: headingText(node) || page.slug,
    body: paragraphs[0] ?? textOf(node),
    cta: findHtml(node, "button")[0] ? textOf(findHtml(node, "button")[0]) : findHtml(node, "a").find((link) => !link.attrs.href?.startsWith("/")) ? textOf(findHtml(node, "a")[0]) : null,
    images,
    items,
    quotes: findHtml(node, "blockquote").map((quote) => textOf(quote)).filter(Boolean),
    form: form
      ? {
          label: form.attrs["aria-label"] ?? "contact",
          fields: findHtml(form, "input").map((input) => input.attrs.name ?? input.attrs.id ?? "field").filter(Boolean),
        }
      : null,
    videoSrc: video?.attrs.src ?? null,
  };
}

function parsePage(page: RenderPageDocument): ReactSitePage {
  const titleNode = findHtml(page.tree, "title")[0];
  const canonical = findHtml(page.tree, "link").find((node) => node.attrs.rel === "canonical")?.attrs.href ?? page.canonicalUrl;
  const mains = findHtml(page.tree, "main");
  if (mains.length !== 1) {
    throw new WebsiteReactRenderError(`Page "${page.slug}" must contain one main element.`, "invalid_document");
  }
  const sections: ReactSiteSection[] = [];
  walkHtml(mains[0], (node, parent) => {
    if (parent?.tag !== "main") return;
    if (node.tag === "section" || node.tag === "aside") {
      const parsed = parseSection(node, page);
      if (parsed) sections.push(parsed);
    }
  });
  if (!sections.some((section) => section.component === "Hero") && !sections.some((section) => section.title)) {
    throw new WebsiteReactRenderError(`Page "${page.slug}" has no renderable sections.`, "invalid_react_tree");
  }
  return {
    slug: page.slug,
    path: page.path,
    title: titleNode?.text?.trim() || page.slug,
    description: metaContent(page.tree, "description", "name"),
    canonicalUrl: canonical,
    ogImage: metaContent(page.tree, "og:image", "property") || `${page.path}og`,
    locale: page.tree.attrs.lang || "en",
    sections,
  };
}

export function parseReactSiteContent(context: WebsiteReactRenderContext): ReactSiteContent {
  const headerLink = findHtml(context.document.pages[0]?.tree ?? { tag: "html", attrs: {}, children: [] }, "a")[0];
  return {
    name: context.siteName || textOf(headerLink ?? { tag: "a", attrs: {}, children: [], text: "Site" }) || "Site",
    baseUrl: context.document.baseUrl,
    locale: context.document.pages[0]?.tree.attrs.lang || "en",
    navigation: context.document.navigation.map((item) => ({ href: item.href, label: item.label })),
    pages: context.document.pages.map(parsePage),
    theme: context.theme ?? DEFAULT_THEME,
  };
}

function contentModule(content: ReactSiteContent): string {
  return `export type ReactSiteImage = {
  src: string;
  alt: string;
  priority: boolean;
};

export type ReactSiteSection = {
  id: string;
  component: ${content.pages[0] ? `"Hero" | "Features" | "Services" | "About" | "Gallery" | "Team" | "Testimonials" | "Pricing" | "FAQ" | "CTA" | "Contact" | "Footer"` : "string"};
  title: string;
  body: string;
  cta: string | null;
  images: ReactSiteImage[];
  items: Array<{ title: string; body: string }>;
  quotes: string[];
  form: { label: string; fields: string[] } | null;
  videoSrc: string | null;
};

export type ReactSitePage = {
  slug: string;
  path: string;
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  locale: string;
  sections: ReactSiteSection[];
};

export const siteContent = ${JSON.stringify(
    {
      name: content.name,
      baseUrl: content.baseUrl,
      locale: content.locale,
      navigation: content.navigation,
      pages: content.pages,
      theme: content.theme,
    },
    null,
    2,
  )} as const;

export function getPage(slug: string) {
  return siteContent.pages.find((page) => page.slug === slug);
}
`;
}

function reactTree(content: ReactSiteContent): ReactTreeNode {
  const home = content.pages.find((page) => page.path === "/") ?? content.pages[0];
  return {
    name: "RootLayout",
    server: true,
    filePath: "app/layout.tsx",
    children: [
      { name: "Header", server: true, filePath: "components/header.tsx", children: [
        { name: "Navigation", server: true, filePath: "components/navigation.tsx", children: [] },
        { name: "ThemeToggle", server: false, filePath: "components/theme-toggle.tsx", children: [] },
      ] },
      {
        name: "SitePage",
        server: true,
        filePath: "components/site-page.tsx",
        children: home.sections.map((section) => ({
          name: section.component,
          server: true,
          filePath: `components/${section.component.toLowerCase()}.tsx`,
          children: [],
        })),
      },
      { name: "Footer", server: true, filePath: "components/footer.tsx", children: [] },
    ],
  };
}

export function buildReactWebsiteProject(context: WebsiteReactRenderContext): ReactWebsiteProject {
  if (!context.document.pages.length) {
    throw new WebsiteReactRenderError("Render document has no pages.", "invalid_document");
  }
  const content = parseReactSiteContent(context);
  const files = [
    { path: "lib/site/content.ts", language: "ts" as const, contents: contentModule(content) },
    ...reactComponentFiles(),
    ...reactLayoutFiles(content),
    ...reactMetadataFiles(content),
  ];
  const project: ReactWebsiteProject = {
    files,
    tree: reactTree(content),
    content,
    createdAt: context.now(),
  };
  assertReactWebsiteProject(project);
  return project;
}
