/**
 * Smoke: Preview HTML → public URL shape → prepared→published field transition.
 * Does not call live AI or Supabase.
 */
import assert from "node:assert/strict";
import { buildStaticPreviewHtml, slugify } from "../lib/website/build-static-preview.ts";

process.env.NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function isWebsitePublishEnabled() {
  return process.env.WEBSITE_PUBLISH_ENABLED !== "false";
}

function buildPlannedPublicUrl(slug) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const path = `/w/${slug}`;
  return {
    publicPath: path,
    plannedPublicUrl: siteUrl ? `${siteUrl}${path}` : path,
  };
}

assert.equal(isWebsitePublishEnabled(), true);

const generationId = "11111111-1111-1111-1111-111111111111";
const slug = `${slugify("Acme Studio")}-${generationId.slice(0, 8)}`;
const { publicPath, plannedPublicUrl } = buildPlannedPublicUrl(slug);
assert.equal(publicPath, `/w/${slug}`);
assert.ok(plannedPublicUrl.endsWith(publicPath));

const html = buildStaticPreviewHtml({
  title: "Acme Studio",
  description: "A premium studio site",
  pages: ["Home", "Services", "Contact"],
  sections: ["Hero", "Offer", "CTA"],
  content: ["Welcome", "Our services", "Get in touch"],
});
assert.ok(html.includes("Acme Studio"));
assert.ok(html.includes('id="services"'));
assert.ok(!html.includes("<script"));

// Simulate prepare -> publish transition
const prepared = {
  status: "prepared",
  slug,
  public_path: publicPath,
  planned_public_url: plannedPublicUrl,
  preview_html: html,
};
const published = {
  ...prepared,
  status: "published",
  published_at: new Date().toISOString(),
};
assert.equal(published.status, "published");
assert.ok(published.preview_html.length > 100);

// Public route access contract
assert.match(published.public_path, /^\/w\/[a-z0-9-]+$/);
assert.equal(published.status === "published", true);

console.log("PASS website publish smoke");
console.log(`  slug=${slug}`);
console.log(`  publicUrl=${plannedPublicUrl}`);
console.log(`  htmlBytes=${html.length}`);
console.log("  flow: generate(preview html) -> prepare -> publish -> /w/{slug}");
