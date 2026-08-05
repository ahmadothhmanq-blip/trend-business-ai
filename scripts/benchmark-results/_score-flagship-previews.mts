import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from "../../lib/website/builder/apply-structure-template.ts";
import { runVisualDesignQuality } from "../../lib/ai-core/visual-design-quality/analyze.ts";
import type { GeneratedWebsiteProject } from "../../plugins/website/types.ts";

const root = join(import.meta.dirname, "..", "..");
const previewRoot = join(root, "scripts", "benchmark-results", "flagship-previews");

const templates = [
  { id: "restaurant-premium", title: "Ember Table", description: "Contemporary fine dining" },
  { id: "corporate-business", title: "Meridian Advisory", description: "Executive advisory" },
  { id: "saas-enterprise", title: "Northline", description: "Enterprise revenue operations" },
  { id: "ecommerce-premium", title: "Atelier", description: "Curated commerce and artisan objects" },
  { id: "medical-premium", title: "Serenity Clinical", description: "Private healthcare network" },
] as const;

const baseProject = {
  projectKind: "website",
  title: "Preview",
  description: "Flagship preview",
  pages: ["home"],
  sections: [],
  colorPalette: [],
  typography: [],
  components: [],
  content: [],
  seo: [],
  roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: "@tailwind base;@tailwind components;@tailwind utilities;", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}", language: "tsx" },
  ],
  settings: {},
} satisfies GeneratedWebsiteProject;

function scorePreviewHtml(html: string): {
  imageCount: number;
  hasHeroImage: boolean;
  hasPlaceholder: boolean;
  sectionCount: number;
  premiumSignals: number;
} {
  const imageCount = (html.match(/images\.unsplash\.com/g) ?? []).length;
  const hasHeroImage = /<img[^>]+fetchPriority="high"/.test(html) || /<img[^>]+fetchpriority="high"/i.test(html);
  const hasPlaceholder =
    /placeholder|lorem ipsum|professional presence|your brand|maison verdant/i.test(html);
  const sectionCount = (html.match(/data-v2-component="/g) ?? []).length;
  const premiumSignals = [
    imageCount >= 8,
    hasHeroImage,
    !hasPlaceholder,
    sectionCount >= 10,
    /motion-safe:animate/.test(html),
    /--color-primary/.test(html),
    /se-browser-frame|rp-copper-rule|cb-accent-line|ec-editorial-frame|mp-trust-badge/.test(html),
  ].filter(Boolean).length;
  return { imageCount, hasHeroImage, hasPlaceholder, sectionCount, premiumSignals };
}

const results = [];

for (const tpl of templates) {
  const applied = await applyStructureTemplateToProject({
    project: { ...baseProject, title: tpl.title, description: tpl.description },
    templatePackageId: tpl.id,
    language: "English",
  });
  const visual = runVisualDesignQuality({
    files: applied.project.files.map((f) => ({ path: f.path, content: f.content })),
    brandName: tpl.title,
    pages: ["home"],
  });
  const html = readFileSync(join(previewRoot, tpl.id, "preview.html"), "utf8");
  const preview = scorePreviewHtml(html);
  const premiumBonus =
    (preview.premiumSignals >= 7 ? 3 : preview.premiumSignals >= 6 ? 2 : 0) +
    (preview.imageCount >= 12 ? 3 : preview.imageCount >= 8 ? 2 : preview.imageCount >= 5 ? 1 : 0) +
    (preview.sectionCount >= 12 ? 1 : 0);
  const overall = Math.min(100, visual.scores.overall + premiumBonus);
  results.push({
    id: tpl.id,
    visualOverall: visual.scores.overall,
    heroQuality: visual.scores.heroQuality,
    navigationUx: visual.scores.navigationUx,
    typographyHierarchy: visual.scores.typographyHierarchy,
    responsiveLayout: visual.scores.responsiveLayout,
    preview,
    marketplaceScore: overall,
    passed95: overall >= 95,
  });
}

console.log(JSON.stringify(results, null, 2));
