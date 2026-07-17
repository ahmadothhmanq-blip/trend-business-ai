import { buildStaticPreviewHtml } from "../lib/website/build-static-preview.ts";

const html = buildStaticPreviewHtml({
  title: "Acme",
  pages: ["Home", "Pricing"],
  sections: ["Hero", "CTA"],
  content: ["Hello", "Buy now"],
});

const ok =
  html.includes('id="pricing"') &&
  html.includes('id="home"') &&
  !html.includes("<script") &&
  html.includes("Live product preview");

if (!ok) {
  console.error("FAIL live preview smoke");
  process.exit(1);
}

console.log("PASS live preview smoke");
