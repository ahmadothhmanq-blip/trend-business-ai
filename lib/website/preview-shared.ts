export const PREVIEW_PATH = "preview/index.html";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "page";
}

const TAILWIND_CDN_MARKER = "cdn.tailwindcss.com";
const V2_REVEAL_BOOT_MARKER = "__V2_REVEAL_BOOT__";

function isAllowedPreviewScript(attrs: string, body: string): boolean {
  if (attrs.includes(TAILWIND_CDN_MARKER)) return true;
  if (/\btailwind\.config\b/.test(body)) return true;
  if (body.includes(V2_REVEAL_BOOT_MARKER)) return true;
  return false;
}

export function sanitizePreviewHtml(html: string): string {
  return html
    .replace(
      /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
      (match, attrs: string, body: string) =>
        isAllowedPreviewScript(attrs, body) ? match : "",
    )
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export type { StaticPreviewInput } from "@/lib/website/preview-input";
