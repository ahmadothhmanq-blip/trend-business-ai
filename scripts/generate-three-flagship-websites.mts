/**
 * Generate three production flagship websites (AI) and compare to canonical previews.
 * Usage: npx tsx scripts/generate-three-flagship-websites.mts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { generateWebsite } from "../lib/website-generator.ts";
import {
  buildStaticPreviewHtml,
  ensureStaticPreviewFile,
} from "../lib/website/build-static-preview.server.ts";
import {
  projectContainsThemeComponents,
  projectUsesV2FlagshipComponents,
} from "../lib/website/template-v2/generation/v2-generation-bridge.ts";
import { clearV2PreviewCompilerCache } from "../lib/website/template-v2/preview/v2-preview-compiler.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(root, "scripts", "benchmark-results", "generated-flagship-websites");
const flagshipPreviewRoot = join(root, "scripts", "benchmark-results", "flagship-previews");

type SiteSpec = {
  id: string;
  slug: string;
  language: string;
  industryId: string;
  prompt: string;
  requiredComponents: string[];
};

const SITES: SiteSpec[] = [
  {
    id: "corporate-business",
    slug: "corporate-ai-en",
    language: "English",
    industryId: "technology",
    prompt:
      "Cortex Intelligence — an enterprise AI company building production-grade autonomous agents, " +
      "retrieval-augmented knowledge systems, and secure model orchestration for Fortune 500 operations teams. " +
      "Position as a trusted AI partner with board-level credibility, measurable ROI case studies, " +
      "enterprise security posture (SOC 2, GDPR), and executive advisory tone. Headquarters in San Francisco.",
    requiredComponents: [
      "corporate-business-hero",
      "corporate-business-features",
      "corporate-business-about",
      "corporate-business-stats",
      "corporate-business-portfolio",
      "corporate-business-testimonials",
      "corporate-business-pricing",
      "corporate-business-faq",
      "corporate-business-contact",
      "corporate-business-footer",
    ],
  },
  {
    id: "restaurant-premium",
    slug: "restaurant-ar",
    language: "Arabic",
    industryId: "restaurant",
    prompt:
      "مطعم نوار — مطعم فاخر للمأكولات المعاصرة في الرياض يقدم قائمة تذوق موسمية من 7 أطباق، " +
      "تجربة طهي على النار الحية، وخدمة سوميلييه حائزة على جوائز. أجواء حميمة على 12 طاولة فقط، " +
      "حجوزات خاصة، وقصة الشيف من المطبخ الفرنسي إلى المطبخ السعودي المعاصر. فخامة عصرية بدون مبالغة.",
    requiredComponents: [
      "restaurant-premium-hero",
      "restaurant-premium-tasting-menu",
      "restaurant-premium-chef-story",
      "restaurant-premium-signature-dishes",
      "restaurant-premium-gallery",
      "restaurant-premium-atmosphere",
      "restaurant-premium-reservation-cta",
      "restaurant-premium-contact",
      "restaurant-premium-footer",
    ],
  },
  {
    id: "saas-enterprise",
    slug: "saas-pm-fr",
    language: "French",
    industryId: "saas",
    prompt:
      "Planium — plateforme SaaS française de gestion de projet pour équipes distribuées. " +
      "Roadmaps, tableaux Kanban, suivi du temps, automatisations et rapports exécutifs en temps réel. " +
      "Intégrations natives (Slack, Jira, Notion, Salesforce), sécurité entreprise (SSO, SCIM), " +
      "et tarification transparente par siège. Ton premium, orienté productivité et gouvernance.",
    requiredComponents: [
      "saas-enterprise-hero",
      "saas-enterprise-features",
      "saas-enterprise-integrations",
      "saas-enterprise-about",
      "saas-enterprise-stats",
      "saas-enterprise-pricing",
      "saas-enterprise-faq",
      "saas-enterprise-contact",
      "saas-enterprise-footer",
    ],
  },
];

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function extractComponents(html: string): string[] {
  const matches = html.matchAll(/data-v2-component="([^"]+)"/g);
  return [...new Set([...matches].map((m) => m[1]))].sort();
}

function analyzePreview(html: string, language: string) {
  return {
    imageCount: (html.match(/images\.unsplash\.com/g) ?? []).length,
    hasHeroImage: /<img[^>]+fetchPriority="high"/i.test(html),
    hasPlaceholder: /placeholder|lorem ipsum|professional presence|your brand here/i.test(html),
    hasMotion: /motion-safe:animate|@keyframes/.test(html),
    hasRtl: /dir="rtl"/i.test(html) || /\[dir=.rtl.\]/i.test(html),
    isFrench: /gestion de projet|plateforme|tarification|démo/i.test(html),
    isArabic: /[\u0600-\u06FF]{8,}/.test(html),
    components: extractComponents(html),
    bytes: Buffer.byteLength(html),
  };
}

function compareToFlagship(
  generated: ReturnType<typeof analyzePreview>,
  flagship: ReturnType<typeof analyzePreview>,
  spec: SiteSpec,
) {
  const regressions: string[] = [];
  const missingComponents = flagship.components.filter(
    (c) => !generated.components.includes(c),
  );
  const extraOk = generated.components.filter((c) => !flagship.components.includes(c));

  if (missingComponents.length) {
    regressions.push(`Missing V2 components: ${missingComponents.join(", ")}`);
  }
  if (generated.imageCount < Math.max(3, Math.floor(flagship.imageCount * 0.5))) {
    regressions.push(
      `Image regression: ${generated.imageCount} vs flagship ${flagship.imageCount}`,
    );
  }
  if (!generated.hasHeroImage && flagship.hasHeroImage) {
    regressions.push("Hero image missing (fetchPriority=high)");
  }
  if (generated.hasPlaceholder) {
    regressions.push("Placeholder or generic shell copy detected");
  }
  if (!generated.hasMotion && flagship.hasMotion) {
    regressions.push("Motion/animation classes missing");
  }
  if (spec.language === "Arabic" && !generated.hasRtl) {
    regressions.push("RTL layout not applied for Arabic");
  }
  if (spec.language === "French" && !generated.isFrench) {
    regressions.push("French copy not detected in preview HTML");
  }
  if (spec.language === "Arabic" && !generated.isArabic) {
    regressions.push("Arabic copy not detected in preview HTML");
  }
  for (const id of spec.requiredComponents) {
    if (!generated.components.includes(id)) {
      regressions.push(`Required component absent: ${id}`);
    }
  }

  return { regressions, missingComponents, extraOk };
}

loadEnvLocal();

if (!process.env.DEEPSEEK_API_KEY?.trim() && !process.env.OPENAI_API_KEY?.trim()) {
  console.error("FAIL: No AI provider API key");
  process.exit(1);
}

mkdirSync(outRoot, { recursive: true });
const summary: unknown[] = [];

for (const spec of SITES) {
  const siteDir = join(outRoot, spec.slug);
  mkdirSync(siteDir, { recursive: true });

  console.error(`\n=== Generating ${spec.slug} (${spec.id}, ${spec.language}) ===`);
  const started = performance.now();

  const result = await generateWebsite({
    prompt: spec.prompt,
    projectType: "business",
    projectKind: "website",
    language: spec.language,
    theme: spec.id.includes("restaurant") ? "luxury" : spec.id.includes("saas") ? "tech" : "corporate",
    industryId: spec.industryId,
    websiteStructureTemplateId: spec.id,
    templateId: spec.id,
    features: ["contact-form", "seo", "analytics"],
    generationProfile: "ultra",
    autoFallback: true,
    userId: `flagship-gen-${spec.slug}`,
    onProgress: (msg) => console.error(`[${spec.slug}] ${msg}`),
  });

  const wallMs = Math.round(performance.now() - started);
  const settings = (result.settings ?? {}) as Record<string, unknown>;

  clearV2PreviewCompilerCache();
  const files = ensureStaticPreviewFile({
    title: result.title,
    description: result.description,
    pages: result.pages,
    sections: result.sections,
    colorPalette: result.colorPalette,
    typography: result.typography,
    content: result.content,
    components: result.components,
    files: result.files,
    templateArchitectureVersion: settings.templateArchitectureVersion as "v1" | "v2" | undefined,
    templatePackageId: (settings.templatePackageId as string | undefined) ?? spec.id,
    settings,
    language: spec.language,
  });

  const previewHtml =
    files.find((f) => f.path.replaceAll("\\", "/") === "preview/index.html")?.content ??
    buildStaticPreviewHtml({
      title: result.title,
      description: result.description,
      pages: result.pages,
      sections: result.sections,
      colorPalette: result.colorPalette,
      typography: result.typography,
      content: result.content,
      components: result.components,
      files: result.files,
      templateArchitectureVersion: "v2",
      templatePackageId: spec.id,
      settings,
      language: spec.language,
    });

  writeFileSync(join(siteDir, "preview.html"), previewHtml, "utf8");
  writeFileSync(join(siteDir, "project.json"), JSON.stringify({ ...result, files }, null, 2), "utf8");

  const flagshipPath = join(flagshipPreviewRoot, spec.id, "preview.html");
  const flagshipHtml = existsSync(flagshipPath)
    ? readFileSync(flagshipPath, "utf8")
    : "";

  const generatedAnalysis = analyzePreview(previewHtml, spec.language);
  const flagshipAnalysis = flagshipHtml ? analyzePreview(flagshipHtml, "English") : null;
  const comparison = flagshipAnalysis
    ? compareToFlagship(generatedAnalysis, flagshipAnalysis, spec)
    : { regressions: ["Flagship preview not found"], missingComponents: [], extraOk: [] };

  const checks = {
    v2: settings.templateArchitectureVersion === "v2",
    packageId: settings.templatePackageId === spec.id,
    noTheme: !projectContainsThemeComponents(result.files),
    usesV2Components: projectUsesV2FlagshipComponents(result.files, spec.id),
    v2Preview: previewHtml.includes('data-v2-render="v2-files"'),
    packageMarker: previewHtml.includes(`data-v2-package="${spec.id}"`),
  };

  const report = {
    slug: spec.slug,
    templateId: spec.id,
    language: spec.language,
    title: result.title,
    wallMs,
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
    fileCount: result.files.length,
    checks,
    generated: generatedAnalysis,
    flagship: flagshipAnalysis,
    comparison,
    passed: Object.values(checks).every(Boolean) && comparison.regressions.length === 0,
    previewPath: join(siteDir, "preview.html"),
  };

  writeFileSync(join(siteDir, "comparison-report.json"), JSON.stringify(report, null, 2), "utf8");
  summary.push(report);
  console.error(JSON.stringify(report, null, 2));
}

writeFileSync(
  join(outRoot, "index.html"),
  `<!DOCTYPE html><html><head><meta charset=utf-8><title>Generated Flagship Websites</title></head><body>
<h1>Generated flagship websites</h1>
<ul>${summary.map((r: { slug: string; passed: boolean }) => `<li><a href="./${r.slug}/preview.html">${r.slug}</a> — ${r.passed ? "PASS" : "NEEDS FIX"}</li>`).join("")}</ul>
<p><a href="../flagship-previews/">Compare to canonical flagship previews</a></p>
</body></html>`,
  "utf8",
);

writeFileSync(join(outRoot, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));

const anyFail = summary.some((r: { passed: boolean }) => !r.passed);
process.exit(anyFail ? 1 : 0);
