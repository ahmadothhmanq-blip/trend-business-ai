/**
 * Inject CMS entries into blueprint files (blog, announcements, page blocks).
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { CmsEntry } from "@/lib/ai-core/website-management/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "post";
}

function escapeTs(value: string): string {
  return JSON.stringify(value);
}

function blogListingPage(brand: string, posts: CmsEntry[]): GeneratedProjectFile {
  return {
    path: "app/blog/page.tsx",
    language: "tsx",
    content: `import type { Metadata } from "next";
import React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: ${escapeTs(`${brand} · Blog`)},
  description: "Latest news and updates",
};

const POSTS = ${JSON.stringify(
      posts.map((p) => ({
        slug: p.slug || slugify(p.title),
        title: p.title,
        excerpt: (p.body || "").slice(0, 200),
        categories: p.categories || [],
        tags: p.tags || [],
      })),
      null,
      2,
    )};

export default function BlogListingPage() {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const perPage = 6;
  const filtered = POSTS.filter((p) =>
    !query.trim() ||
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
      <SiteHeader brandName=${escapeTs(brand)} />
      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[var(--container-max)] space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">Blog</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl md:text-5xl">${brand} Journal</h1>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search posts..."
              className="mt-6 w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {slice.map((p) => (
              <article key={p.slug} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-widest text-[var(--color-accent)]">{p.categories.join(", ") || "Blog"}</p>
                <h2 className="mt-2 text-2xl font-semibold"><a href={\`/blog/\${p.slug}\`}>{p.title}</a></h2>
                <p className="mt-3 text-sm text-white/70">{p.excerpt}</p>
              </article>
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-white/10 px-3 py-1 text-sm">Prev</button>
              <span className="text-sm text-white/50">Page {page} of {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-white/10 px-3 py-1 text-sm">Next</button>
            </div>
          ) : null}
        </div>
      </section>
      <SiteFooter brandName=${escapeTs(brand)} />
    </main>
  );
}
`,
  };
}

function blogPostPage(brand: string, post: CmsEntry): GeneratedProjectFile {
  const slug = post.slug || slugify(post.title);
  const seoTitle = post.seoJson?.title || post.title;
  const seoDesc = post.seoJson?.description || (post.body || "").slice(0, 160);

  return {
    path: `app/blog/${slug}/page.tsx`,
    language: "tsx",
    content: `import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: ${escapeTs(seoTitle)},
  description: ${escapeTs(seoDesc)},
};

export default function BlogPostPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
      <SiteHeader brandName=${escapeTs(brand)} />
      <article className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">${(post.categories || []).join(", ") || "Article"}</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl md:text-5xl">${post.title}</h1>
          ${post.mediaUrl ? `<img src=${escapeTs(post.mediaUrl)} alt=${escapeTs(post.title)} className="mt-8 w-full rounded-2xl" />` : ""}
          <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-white/80">${post.body || ""}</div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/40">${(post.tags || []).map((t) => `<span>#${t}</span>`).join(" ")}</div>
        </div>
      </article>
      <SiteFooter brandName=${escapeTs(brand)} />
    </main>
  );
}
`,
  };
}

function rssFeedFile(brand: string, posts: CmsEntry[]): GeneratedProjectFile {
  const items = posts
    .map((p) => {
      const slug = p.slug || slugify(p.title);
      return `  <item>
    <title>${p.title.replace(/&/g, "&amp;")}</title>
    <link>/blog/${slug}</link>
    <description>${(p.body || "").slice(0, 300).replace(/&/g, "&amp;")}</description>
    <pubDate>${new Date(p.updatedAt).toUTCString()}</pubDate>
  </item>`;
    })
    .join("\n");

  return {
    path: "public/blog/rss.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${brand} Blog</title>
  <description>Latest posts from ${brand}</description>
${items}
</channel>
</rss>
`,
  };
}

function cmsDataFile(entries: CmsEntry[]): GeneratedProjectFile {
  return {
    path: "lib/site-cms.ts",
    language: "typescript",
    content: `/** CMS content — synced from Website Management */
export const SITE_CMS_ENTRIES = ${JSON.stringify(entries, null, 2)} as const;

export function listPublishedCms(kind?: string) {
  return SITE_CMS_ENTRIES.filter((e) => e.published && (!kind || e.kind === kind));
}
`,
  };
}

/**
 * Merge CMS entries into blueprint files and generate blog/RSS artifacts.
 */
export function injectCmsIntoFiles(
  files: GeneratedProjectFile[],
  entries: CmsEntry[],
  brandName = "Brand",
): GeneratedProjectFile[] {
  const published = entries.filter((e) => e.published);
  const posts = published.filter((e) => e.kind === "post");
  let next = [...files.filter((f) => f.path !== "lib/site-cms.ts"), cmsDataFile(entries)];

  if (posts.length) {
    next = [
      ...next.filter(
        (f) =>
          f.path !== "app/blog/page.tsx" &&
          !f.path.startsWith("app/blog/") &&
          f.path !== "public/blog/rss.xml",
      ),
      blogListingPage(brandName, posts),
      rssFeedFile(brandName, posts),
      ...posts.map((p) => blogPostPage(brandName, p)),
    ];
  }

  return next;
}
