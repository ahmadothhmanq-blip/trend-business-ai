/**
 * Inspect published /w/slug primary vs /ar locale content.
 */
import { loadEnvLocal, resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";

loadEnvLocal();
const base = resolveHarnessBaseUrl().replace(/\/$/, "");
const slug = process.argv[2] || "page-3c0690dc";

async function inspect(label, url) {
  const r = await fetch(url);
  const html = await r.text();
  const lang = html.match(/<html[^>]*\slang=["']([^"']+)["']/i)?.[1];
  const dir = html.match(/<html[^>]*\sdir=["']([^"']+)["']/i)?.[1];
  const title = html.match(/<title[^>]*>([^<]*)</i)?.[1]?.trim();
  const localeMarker = html.match(/tb-locale:([a-z-]+)/)?.[1];
  const h1 = html.match(/<h1[^>]*>([^<]{0,80})/i)?.[1]?.trim();
  const switcher = [...html.matchAll(/tb-language-switcher[^>]*>[\s\S]{0,500}/gi)][0]?.[0]?.slice(0, 200);
  return { label, url, status: r.status, lang, dir, title, localeMarker, h1, switcher };
}

const primary = await inspect("primary", `${base}/w/${slug}`);
const ar = await inspect("/ar", `${base}/w/${slug}/ar`);

console.log(JSON.stringify({ primary, ar }, null, 2));
