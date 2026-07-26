/**
 * Inject CMS content into published HTML snapshots.
 */

import type { CmsEntry } from "@/lib/ai-core/website-management/types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function blogSectionHtml(entries: CmsEntry[]): string {
  const posts = entries.filter((e) => e.kind === "post" && e.published);
  if (!posts.length) return "";

  const cards = posts
    .slice(0, 6)
    .map(
      (p) => `<article style="border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px;margin-bottom:16px">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:.15em;opacity:.6">${escapeHtml((p.categories || []).join(", ") || "Blog")}</p>
      <h3 style="margin:8px 0;font-size:1.25rem">${escapeHtml(p.title)}</h3>
      <p style="opacity:.75;font-size:14px;line-height:1.6">${escapeHtml((p.body || "").slice(0, 160))}</p>
    </article>`,
    )
    .join("");

  return `<section data-cms-blog="true" style="padding:48px 24px;max-width:960px;margin:0 auto">
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:.2em;opacity:.5">From the blog</p>
    <h2 style="font-size:2rem;margin:12px 0 24px">Latest updates</h2>
    ${cards}
  </section>`;
}

function announcementBanner(entries: CmsEntry[]): string {
  const item = entries.find(
    (e) =>
      e.published &&
      (e.kind === "announcement" || e.kind === "page-block") &&
      e.body,
  );
  if (!item) return "";
  return `<aside data-cms-announcement="true" style="background:rgba(212,175,55,.12);border-bottom:1px solid rgba(212,175,55,.25);padding:12px 20px;text-align:center;font-size:14px">
    <strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.body || "")}
  </aside>`;
}

/**
 * Apply CMS entries to frozen publish HTML (announcements + blog section).
 */
export function applyCmsToPublishHtml(
  html: string,
  entries: CmsEntry[],
): string {
  if (!entries.length) return html;

  let next = html;
  const banner = announcementBanner(entries);
  const blog = blogSectionHtml(entries);

  if (banner && /<body[^>]*>/i.test(next)) {
    next = next.replace(/<body([^>]*)>/i, `<body$1>${banner}`);
  }

  if (blog && /<\/body>/i.test(next)) {
    next = next.replace(/<\/body>/i, `${blog}</body>`);
  }

  return next;
}
