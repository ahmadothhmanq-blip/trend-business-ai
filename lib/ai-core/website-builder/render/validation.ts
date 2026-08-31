/**
 * Render document validation (Phase 4).
 * SEO, accessibility, and semantic HTML rules. No CSS or publish checks.
 */

import { assertGeneratedWebsite } from "@/lib/ai-core/website-builder/generation/validation";
import type {
  HtmlNode,
  RenderDocument,
  WebsiteRenderInput,
} from "@/lib/ai-core/website-builder/render/contracts";
import { HTML5_TAGS } from "@/lib/ai-core/website-builder/render/contracts";
import { WebsiteRenderError } from "@/lib/ai-core/website-builder/render/errors";
import { findHtml, walkHtml } from "@/lib/ai-core/website-builder/render/renderer";

const HTTPS_ORIGIN_RE = /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i;
const HEADING_RANK: Record<string, number> = { h1: 1, h2: 2, h3: 3 };

export function assertWebsiteRenderInput(input: WebsiteRenderInput): void {
  if (!input.structure) {
    throw new WebsiteRenderError("Render input is missing a generated structure.", "invalid_input");
  }
  try {
    assertGeneratedWebsite(input.structure, input.structure.project);
  } catch (error) {
    throw new WebsiteRenderError(
      error instanceof Error ? error.message : "Generated structure is invalid.",
      "invalid_structure",
    );
  }
  const base = input.documentBaseUrl?.trim().replace(/\/$/, "") ?? "";
  if (!HTTPS_ORIGIN_RE.test(base)) {
    throw new WebsiteRenderError("documentBaseUrl must be an https origin without a path.", "invalid_input");
  }
}

function attr(node: HtmlNode, name: string): string | undefined {
  return node.attrs[name];
}

function headingSequence(root: HtmlNode): string[] {
  const tags: string[] = [];
  walkHtml(root, (node) => {
    if (node.tag === "h1" || node.tag === "h2" || node.tag === "h3") tags.push(node.tag);
  });
  return tags;
}

function assertHeadingOrder(pageTree: HtmlNode, slug: string): void {
  const mains = findHtml(pageTree, "main");
  if (mains.length !== 1) {
    throw new WebsiteRenderError(`Page "${slug}" must contain exactly one main element.`, "missing_main");
  }
  const headings = headingSequence(pageTree);
  const h1Count = headings.filter((tag) => tag === "h1").length;
  if (h1Count !== 1) {
    throw new WebsiteRenderError(`Page "${slug}" must contain exactly one h1.`, "heading_order");
  }
  const mainHeadings = headingSequence(mains[0]);
  if (mainHeadings[0] !== "h1") {
    throw new WebsiteRenderError(`Page "${slug}" must start its heading outline with h1.`, "heading_order");
  }
  let previous = 0;
  for (const tag of mainHeadings) {
    const rank = HEADING_RANK[tag];
    if (previous === 0 && rank !== 1) {
      throw new WebsiteRenderError(`Page "${slug}" heading outline must begin at h1.`, "heading_order");
    }
    if (previous > 0 && rank > previous + 1) {
      throw new WebsiteRenderError(`Page "${slug}" skips a heading level.`, "heading_order");
    }
    previous = rank;
  }
}

function assertSeo(pageTree: HtmlNode, canonicalUrl: string, slug: string): void {
  const titles = findHtml(pageTree, "title");
  if (titles.length !== 1 || !titles[0].text?.trim() || titles[0].text.trim().length < 10) {
    throw new WebsiteRenderError(`Page "${slug}" is missing a valid title.`, "incomplete_seo");
  }
  const metas = findHtml(pageTree, "meta");
  const description = metas.find((node) => attr(node, "name") === "description");
  if (!description?.attrs.content || description.attrs.content.length < 50 || description.attrs.content.length > 160) {
    throw new WebsiteRenderError(`Page "${slug}" is missing a valid meta description.`, "incomplete_seo");
  }
  const canonical = findHtml(pageTree, "link").find((node) => attr(node, "rel") === "canonical");
  if (!canonical?.attrs.href?.startsWith("https://") || canonical.attrs.href !== canonicalUrl) {
    throw new WebsiteRenderError(`Page "${slug}" canonical URL is missing or invalid.`, "incomplete_seo");
  }
  for (const property of ["og:title", "og:description", "og:type", "og:url", "og:image"]) {
    if (!metas.some((node) => attr(node, "property") === property && attr(node, "content"))) {
      throw new WebsiteRenderError(`Page "${slug}" is missing ${property}.`, "incomplete_seo");
    }
  }
  const jsonLd = findHtml(pageTree, "script").find((node) => attr(node, "type") === "application/ld+json");
  if (!jsonLd?.text) {
    throw new WebsiteRenderError(`Page "${slug}" is missing JSON-LD.`, "incomplete_seo");
  }
  try {
    const parsed = JSON.parse(jsonLd.text) as { "@type"?: string; url?: string };
    if (parsed["@type"] !== "WebPage" || parsed.url !== canonicalUrl) {
      throw new Error("JSON-LD WebPage url mismatch.");
    }
  } catch {
    throw new WebsiteRenderError(`Page "${slug}" JSON-LD is invalid.`, "incomplete_seo");
  }
}

function assertAccessibility(pageTree: HtmlNode, pagePaths: Set<string>, slug: string): void {
  walkHtml(pageTree, (node) => {
    if (!(HTML5_TAGS as readonly string[]).includes(node.tag)) {
      throw new WebsiteRenderError(`Page "${slug}" contains a non-HTML5 tag "${node.tag}".`, "invalid_document");
    }
    if ("class" in node.attrs || "style" in node.attrs) {
      throw new WebsiteRenderError(`Page "${slug}" cannot include class or style attributes.`, "invalid_document");
    }
    if (node.tag === "img") {
      const alt = attr(node, "alt") ?? "";
      if (alt.trim().length < 3) {
        throw new WebsiteRenderError(`Page "${slug}" has an image without usable alt text.`, "missing_alt");
      }
    }
    if (node.tag === "a") {
      const href = attr(node, "href") ?? "";
      if (!href) throw new WebsiteRenderError(`Page "${slug}" has an empty link.`, "broken_link");
      if (href.startsWith("/") && !href.startsWith("/assets/") && !pagePaths.has(href)) {
        throw new WebsiteRenderError(`Page "${slug}" has a broken internal link "${href}".`, "broken_link");
      }
    }
    if (node.tag === "video" && !(attr(node, "aria-label") || "").trim()) {
      throw new WebsiteRenderError(`Page "${slug}" has a video without an accessible name.`, "missing_alt");
    }
  });
}

export function assertRenderDocument(document: RenderDocument): void {
  if (!document.pages.length) {
    throw new WebsiteRenderError("Render document has no pages.", "invalid_document");
  }
  const pagePaths = new Set(document.pages.map((page) => page.path));
  if (!pagePaths.has("/")) {
    throw new WebsiteRenderError("Render document is missing the homepage path.", "invalid_document");
  }
  for (const page of document.pages) {
    if (page.tree.tag !== "html") {
      throw new WebsiteRenderError(`Page "${page.slug}" root must be html.`, "invalid_document");
    }
    if (findHtml(page.tree, "main").length !== 1) {
      throw new WebsiteRenderError(`Page "${page.slug}" must contain exactly one main element.`, "missing_main");
    }
    assertHeadingOrder(page.tree, page.slug);
    assertSeo(page.tree, page.canonicalUrl, page.slug);
    assertAccessibility(page.tree, pagePaths, page.slug);
  }
  for (const item of document.navigation) {
    if (!pagePaths.has(item.href)) {
      throw new WebsiteRenderError(`Navigation href "${item.href}" is not a known page.`, "broken_link");
    }
  }
}
