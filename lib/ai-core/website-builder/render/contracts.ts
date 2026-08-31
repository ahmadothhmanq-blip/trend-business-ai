/**
 * Website render contracts (Phase 4).
 * Semantic HTML document tree only — no React, JSX, Tailwind, CSS, or publish.
 */

import type { WebsiteGeneratedStructure } from "@/lib/ai-core/website-builder/generation/contracts";

export const HTML5_TAGS = [
  "html",
  "head",
  "body",
  "header",
  "nav",
  "main",
  "section",
  "article",
  "aside",
  "footer",
  "h1",
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "li",
  "a",
  "button",
  "form",
  "label",
  "input",
  "textarea",
  "picture",
  "img",
  "source",
  "video",
  "blockquote",
  "hr",
  "title",
  "meta",
  "link",
  "script",
] as const;

export type Html5Tag = (typeof HTML5_TAGS)[number];

export type HtmlNode = {
  tag: Html5Tag;
  attrs: Record<string, string>;
  children: HtmlNode[];
  text?: string;
};

export type RenderAsset = {
  kind: "image" | "logo" | "og" | "video";
  href: string;
  alt: string;
  pageId: string;
};

export type RenderLink = {
  href: string;
  label: string;
  internal: boolean;
  pageId: string;
};

export type RenderNavItem = {
  href: string;
  label: string;
  pageId: string;
  children: RenderNavItem[];
};

export type RenderPageDocument = {
  pageId: string;
  slug: string;
  path: string;
  canonicalUrl: string;
  tree: HtmlNode;
  assets: RenderAsset[];
  links: RenderLink[];
};

export type RenderDocument = {
  projectId: string;
  userId: string;
  planId: string;
  baseUrl: string;
  pages: RenderPageDocument[];
  navigation: RenderNavItem[];
  assets: RenderAsset[];
  createdAt: string;
};

export type WebsiteRenderInput = {
  structure: WebsiteGeneratedStructure;
  documentBaseUrl: string;
};

export type WebsiteRenderStatus = "ready" | "failed" | "reused";

export type WebsiteRenderResult = {
  status: WebsiteRenderStatus;
  document: RenderDocument | null;
  reused: boolean;
  attempts: number;
  errorCode?: string;
  errorMessage?: string;
};

export type WebsiteRenderStore = {
  get(key: string): RenderDocument | undefined;
  set(key: string, document: RenderDocument): void;
};

export type WebsiteRenderContext = {
  structure: WebsiteGeneratedStructure;
  documentBaseUrl: string;
  now: () => string;
};

export type WebsiteDocumentRenderer = {
  render(context: WebsiteRenderContext): RenderDocument;
};
