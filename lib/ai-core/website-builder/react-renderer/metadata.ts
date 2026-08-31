/**
 * Next.js 16 Metadata API, sitemap, robots, and manifest (Phase 5).
 */

import type { ReactProjectFile, ReactSiteContent } from "@/lib/ai-core/website-builder/react-renderer/contracts";

export function reactMetadataFiles(content: ReactSiteContent): ReactProjectFile[] {
  const home = content.pages.find((page) => page.path === "/") ?? content.pages[0];
  return [
    {
      path: "lib/site/metadata.ts",
      language: "ts",
      contents: `import type { Metadata } from "next";
import { getPage, siteContent } from "@/lib/site/content";

export function siteMetadata(): Metadata {
  const home = siteContent.pages.find((page) => page.path === "/") ?? siteContent.pages[0];
  return {
    metadataBase: new URL(siteContent.baseUrl),
    title: {
      default: home.title,
      template: \`%s | \${siteContent.name}\`,
    },
    description: home.description,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: siteContent.name,
      title: home.title,
      description: home.description,
      url: home.canonicalUrl,
      images: [{ url: home.ogImage }],
      locale: home.locale,
    },
  };
}

export function pageMetadata(slug: string): Metadata {
  const page = getPage(slug);
  if (!page) return siteMetadata();
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.canonicalUrl },
    openGraph: {
      type: "website",
      title: page.title,
      description: page.description,
      url: page.canonicalUrl,
      images: [{ url: page.ogImage }],
      locale: page.locale,
    },
    robots: { index: true, follow: true },
  };
}
`,
    },
    {
      path: "app/sitemap.ts",
      language: "ts",
      contents: `import type { MetadataRoute } from "next";
import { siteContent } from "@/lib/site/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return siteContent.pages.map((page) => ({
    url: page.canonicalUrl,
    lastModified: "2026-08-18",
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.path === "/" ? 1 : 0.7,
  }));
}
`,
    },
    {
      path: "app/robots.ts",
      language: "ts",
      contents: `import type { MetadataRoute } from "next";
import { siteContent } from "@/lib/site/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: \`\${siteContent.baseUrl}/sitemap.xml\`,
    host: siteContent.baseUrl,
  };
}
`,
    },
    {
      path: "app/manifest.ts",
      language: "ts",
      contents: `import type { MetadataRoute } from "next";
import { siteContent } from "@/lib/site/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteContent.name,
    short_name: siteContent.name.slice(0, 12),
    description: siteContent.pages[0]?.description ?? siteContent.name,
    start_url: "/",
    display: "standalone",
    background_color: "${content.theme.colors.background}",
    theme_color: "${content.theme.colors.accent}",
    lang: siteContent.locale,
  };
}
`,
    },
    {
      path: "app/page.tsx",
      language: "tsx",
      contents: `import type { Metadata } from "next";
import { SitePage } from "@/components/site-page";
import { pageMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = pageMetadata(${JSON.stringify(home?.slug ?? "home")});

export default function HomePage() {
  return <SitePage slug={${JSON.stringify(home?.slug ?? "home")}} />;
}
`,
    },
    {
      path: "app/[slug]/page.tsx",
      language: "tsx",
      contents: `import type { Metadata } from "next";
import { SitePage } from "@/components/site-page";
import { siteContent } from "@/lib/site/content";
import { pageMetadata } from "@/lib/site/metadata";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return siteContent.pages
    .filter((page) => page.path !== "/")
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(slug);
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = siteContent.pages.find((item) => item.slug === slug && item.path !== "/");
  if (!page) notFound();
  return <SitePage slug={slug} />;
}
`,
    },
  ];
}
