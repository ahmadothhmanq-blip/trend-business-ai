/**
 * React / Next.js project validation (Phase 5).
 */

import { assertRenderDocument } from "@/lib/ai-core/website-builder/render/validation";
import type {
  ReactProjectFile,
  ReactWebsiteProject,
  WebsiteReactRenderInput,
} from "@/lib/ai-core/website-builder/react-renderer/contracts";
import { REQUIRED_REACT_FILES } from "@/lib/ai-core/website-builder/react-renderer/contracts";
import { WebsiteReactRenderError } from "@/lib/ai-core/website-builder/react-renderer/errors";

function fileByPath(project: ReactWebsiteProject, path: string): ReactProjectFile | undefined {
  return project.files.find((file) => file.path === path);
}

function collectIds(contents: string): string[] {
  const ids: string[] = [];
  const quoted = contents.matchAll(/\bid=["']([^"']+)["']/g);
  for (const match of quoted) ids.push(match[1]);
  const jsx = contents.matchAll(/\bid=\{`([^`$]+)`\}/g);
  for (const match of jsx) ids.push(match[1]);
  return ids;
}

function assertHydrationSafety(file: ReactProjectFile): void {
  const client = file.contents.includes('"use client"');
  if (client && file.path !== "components/theme-toggle.tsx") {
    throw new WebsiteReactRenderError(`${file.path} must remain a Server Component.`, "hydration");
  }
  if (client) return;
  if (/\buseState\b|\buseEffect\b|\bwindow\./.test(file.contents) || /\bdocument\./.test(file.contents)) {
    throw new WebsiteReactRenderError(`${file.path} is not hydration-safe.`, "hydration");
  }
  if (/\bDate\.now\s*\(|\bMath\.random\s*\(/.test(file.contents)) {
    throw new WebsiteReactRenderError(`${file.path} uses non-deterministic values.`, "hydration");
  }
}

export function assertWebsiteReactRenderInput(input: WebsiteReactRenderInput): void {
  if (!input.document) {
    throw new WebsiteReactRenderError("React renderer requires a RenderDocument.", "invalid_input");
  }
  try {
    assertRenderDocument(input.document);
  } catch (error) {
    throw new WebsiteReactRenderError(
      error instanceof Error ? error.message : "Render document is invalid.",
      "invalid_document",
    );
  }
}

export function assertReactWebsiteProject(project: ReactWebsiteProject): void {
  for (const required of REQUIRED_REACT_FILES) {
    if (!fileByPath(project, required)) {
      throw new WebsiteReactRenderError(`Missing required file ${required}.`, "invalid_react_tree");
    }
  }
  const layout = fileByPath(project, "app/layout.tsx")!;
  if (!layout.contents.includes("export const metadata") || !layout.contents.includes("next/font/google")) {
    throw new WebsiteReactRenderError("Root layout must export metadata and optimized fonts.", "invalid_metadata");
  }
  if (!layout.contents.includes("Skip to content") || !layout.contents.includes("#main-content")) {
    throw new WebsiteReactRenderError("Layout is missing an accessible skip link.", "accessibility");
  }
  const home = fileByPath(project, "app/page.tsx")!;
  if (!home.contents.includes("export const metadata") || !home.contents.includes("SitePage")) {
    throw new WebsiteReactRenderError("Homepage is missing metadata or the page tree.", "invalid_metadata");
  }
  const dynamic = fileByPath(project, "app/[slug]/page.tsx")!;
  if (!dynamic.contents.includes("generateStaticParams") || !dynamic.contents.includes("generateMetadata")) {
    throw new WebsiteReactRenderError("Dynamic pages must use generateStaticParams and generateMetadata.", "invalid_metadata");
  }
  const sitemap = fileByPath(project, "app/sitemap.ts")!;
  const robots = fileByPath(project, "app/robots.ts")!;
  const manifest = fileByPath(project, "app/manifest.ts")!;
  if (!sitemap.contents.includes("MetadataRoute.Sitemap") || !robots.contents.includes("MetadataRoute.Robots")) {
    throw new WebsiteReactRenderError("Sitemap/robots metadata routes are incomplete.", "incomplete_seo");
  }
  if (!manifest.contents.includes("MetadataRoute.Manifest")) {
    throw new WebsiteReactRenderError("Web app manifest is missing.", "incomplete_seo");
  }
  const css = fileByPath(project, "app/globals.css")!;
  if (!css.contents.includes('@import "tailwindcss"') || !css.contents.includes("@custom-variant dark")) {
    throw new WebsiteReactRenderError("Tailwind v4 theme and dark mode are missing.", "invalid_react_tree");
  }
  const components = project.files.filter((file) => file.path.startsWith("components/"));
  if (!components.some((file) => file.contents.includes("sm:") && file.contents.includes("lg:"))) {
    throw new WebsiteReactRenderError("Components are missing responsive Tailwind utilities.", "invalid_react_tree");
  }
  if (!project.files.some((file) => file.contents.includes("from \"next/image\""))) {
    throw new WebsiteReactRenderError("Image optimization via next/image is missing.", "invalid_react_tree");
  }
  if (!project.content.pages.some((page) => page.path === "/")) {
    throw new WebsiteReactRenderError("React project is missing a homepage.", "invalid_react_tree");
  }
  for (const page of project.content.pages) {
    if (page.title.trim().length < 10 || page.description.trim().length < 50 || !page.canonicalUrl.startsWith("https://")) {
      throw new WebsiteReactRenderError(`Page "${page.slug}" metadata is incomplete.`, "incomplete_seo");
    }
    const h1Sections = page.sections.filter((section) => section.component === "Hero");
    if (page.sections.length < 1) {
      throw new WebsiteReactRenderError(`Page "${page.slug}" has an empty React tree.`, "invalid_react_tree");
    }
    if (h1Sections.length > 1) {
      throw new WebsiteReactRenderError(`Page "${page.slug}" has more than one Hero/h1.`, "accessibility");
    }
    const ids = page.sections.map((section) => section.id);
    if (new Set(ids).size !== ids.length) {
      throw new WebsiteReactRenderError(`Page "${page.slug}" has duplicate section IDs.`, "duplicate_id");
    }
    for (const image of page.sections.flatMap((section) => section.images)) {
      if (image.alt.trim().length < 3) {
        throw new WebsiteReactRenderError(`Page "${page.slug}" has an image without alt text.`, "accessibility");
      }
    }
  }
  const seenIds = new Map<string, string>();
  for (const file of project.files) {
    assertHydrationSafety(file);
    if (file.path === "lib/site/content.ts") continue;
    for (const id of collectIds(file.contents)) {
      if (id.includes("${")) continue;
      const owner = seenIds.get(id);
      if (owner && owner !== file.path && id !== "main-content") {
        throw new WebsiteReactRenderError(`Duplicate ID "${id}" in ${file.path} and ${owner}.`, "duplicate_id");
      }
      seenIds.set(id, file.path);
    }
  }
  if (project.files.some((file) => file.path.startsWith("app/api/"))) {
    throw new WebsiteReactRenderError("Generated projects cannot include API routes.", "invalid_react_tree");
  }
  if (!project.tree.children.some((node) => node.name === "Header") || !project.tree.children.some((node) => node.name === "Footer")) {
    throw new WebsiteReactRenderError("React tree must include Header and Footer.", "invalid_react_tree");
  }
  const clientNodes = flattenTree(project.tree).filter((node) => !node.server);
  if (clientNodes.some((node) => node.name !== "ThemeToggle")) {
    throw new WebsiteReactRenderError("Only ThemeToggle may be a Client Component.", "hydration");
  }
}

function flattenTree(node: ReactWebsiteProject["tree"]): ReactWebsiteProject["tree"][] {
  return [node, ...node.children.flatMap((child) => flattenTree(child))];
}
