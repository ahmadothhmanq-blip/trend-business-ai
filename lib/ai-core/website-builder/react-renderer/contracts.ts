/**
 * React renderer contracts (Phase 5).
 * RenderDocument → Next.js 16 App Router file tree. No publish, API, or database.
 */

import type { ThemeColors, ThemeFonts } from "@/lib/ai-core/website-builder/domain/contracts";
import type { RenderDocument } from "@/lib/ai-core/website-builder/render/contracts";

export const REACT_SECTION_COMPONENTS = [
  "Hero",
  "Features",
  "Services",
  "About",
  "Gallery",
  "Team",
  "Testimonials",
  "Pricing",
  "FAQ",
  "CTA",
  "Contact",
  "Footer",
] as const;

export type ReactSectionComponent = (typeof REACT_SECTION_COMPONENTS)[number];

export type ReactProjectFile = {
  path: string;
  contents: string;
  language: "tsx" | "ts" | "css";
};

export type ReactTreeNode = {
  name: string;
  server: boolean;
  filePath: string;
  children: ReactTreeNode[];
};

export type ReactSiteTheme = {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  radiusPx: number;
};

export type ReactSiteImage = {
  src: string;
  alt: string;
  priority: boolean;
};

export type ReactSiteSection = {
  id: string;
  component: ReactSectionComponent;
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

export type ReactSiteContent = {
  name: string;
  baseUrl: string;
  locale: string;
  navigation: Array<{ href: string; label: string }>;
  pages: ReactSitePage[];
  theme: ReactSiteTheme;
};

export type ReactWebsiteProject = {
  files: ReactProjectFile[];
  tree: ReactTreeNode;
  content: ReactSiteContent;
  createdAt: string;
};

export type WebsiteReactRenderInput = {
  document: RenderDocument;
  siteName?: string;
  theme?: ReactSiteTheme;
};

export type WebsiteReactRenderStatus = "ready" | "failed" | "reused";

export type WebsiteReactRenderResult = {
  status: WebsiteReactRenderStatus;
  project: ReactWebsiteProject | null;
  reused: boolean;
  attempts: number;
  errorCode?: string;
  errorMessage?: string;
};

export type WebsiteReactRenderStore = {
  get(key: string): ReactWebsiteProject | undefined;
  set(key: string, project: ReactWebsiteProject): void;
};

export type WebsiteReactRenderContext = {
  document: RenderDocument;
  siteName?: string;
  theme?: ReactSiteTheme;
  now: () => string;
};

export type WebsiteReactProjectBuilder = {
  build(context: WebsiteReactRenderContext): ReactWebsiteProject;
};

export const REQUIRED_REACT_FILES = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/[slug]/page.tsx",
  "app/globals.css",
  "app/sitemap.ts",
  "app/robots.ts",
  "app/manifest.ts",
  "lib/site/content.ts",
  "lib/site/metadata.ts",
  "components/header.tsx",
  "components/navigation.tsx",
  "components/hero.tsx",
  "components/features.tsx",
  "components/services.tsx",
  "components/about.tsx",
  "components/gallery.tsx",
  "components/team.tsx",
  "components/testimonials.tsx",
  "components/pricing.tsx",
  "components/faq.tsx",
  "components/cta.tsx",
  "components/contact.tsx",
  "components/footer.tsx",
  "components/site-page.tsx",
  "components/theme-toggle.tsx",
  "next.config.ts",
] as const;
