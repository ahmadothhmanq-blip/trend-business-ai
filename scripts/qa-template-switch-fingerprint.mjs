const id = process.argv[2];
const label = process.argv[3] || "snapshot";
if (!id) {
  console.error("usage: node qa-template-switch-fingerprint.mjs <generationId> [label]");
  process.exit(1);
}

const base = process.env.QA_BASE_URL || "http://localhost:3003";
const res = await fetch(`${base}/api/website-builder/${id}/live-preview`);
const html = await res.text();
const h1 = (html.match(/<h1[^>]*>([^<]{0,160})/i) || [])[1] || "";
const navBlock = (html.match(/<nav[^>]*>([\s\S]{0,800})/i) || [])[1] || "";
const hero = (html.match(/data-component="Theme[^"]*Hero[^"]*"[\s\S]{0,400}/i) || [])[0] || "";
const colors = (html.match(/--[a-z-]*(?:primary|accent|background)[^;]{0,80}/gi) || []).slice(0, 5);
const fonts = (html.match(/font-family:[^;]{0,80}/gi) || []).slice(0, 3);
const sections = (html.match(/data-component="Theme[^"]+"/gi) || []).slice(0, 12);
const layout = (html.match(/data-layout="[^"]+"/i) || [])[0] || "";
const hash = [...html].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);

console.log(
  JSON.stringify(
    {
      label,
      status: res.status,
      bytes: html.length,
      hash,
      h1: h1.trim(),
      navLinkCount: (navBlock.match(/<a /g) || []).length,
      heroSnippet: hero.slice(0, 120),
      colors,
      fonts,
      sections,
      layout,
    },
    null,
    2,
  ),
);
