import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  QualityReport,
  WebsiteStrategy,
  DesignSystem,
  AssetManifest,
} from "@/plugins/website/layers/types";

function fileContent(files: GeneratedProjectFile[], pathPart: string) {
  return files
    .filter((f) => f.path.includes(pathPart))
    .map((f) => f.content)
    .join("\n");
}

function allContent(files: GeneratedProjectFile[]) {
  return files.map((f) => f.content).join("\n");
}

export function runWebsiteQualityCheck(params: {
  files: GeneratedProjectFile[];
  strategy?: WebsiteStrategy;
  designSystem?: DesignSystem;
  assetManifest?: AssetManifest;
  pages: string[];
}): QualityReport {
  const { files, strategy, designSystem, assetManifest, pages } = params;
  const content = allContent(files);
  const layout = fileContent(files, "layout.tsx") + fileContent(files, "globals.css");
  const home = fileContent(files, "page.tsx");

  const structureIssues: string[] = [];
  if (!files.some((f) => f.path === "app/page.tsx" || f.path.endsWith("/page.tsx"))) {
    structureIssues.push("Missing app page entry");
  }
  if (!files.some((f) => f.path.includes("layout.tsx"))) {
    structureIssues.push("Missing layout");
  }
  if (strategy?.pages?.length) {
    const missingPages = strategy.pages
      .slice(0, 4)
      .filter((p) => {
        if (p.path === "/" || p.name.toLowerCase() === "home") {
          return !home.trim();
        }
        const slug = p.path.replace(/^\//, "").toLowerCase();
        return (
          slug &&
          !files.some((f) => f.path.toLowerCase().includes(slug)) &&
          !content.toLowerCase().includes(p.name.toLowerCase())
        );
      })
      .map((p) => `Weak/missing page coverage: ${p.name}`);
    structureIssues.push(...missingPages);
  }
  if (!pages.length) {
    structureIssues.push("No pages listed in blueprint");
  }

  const responsiveIssues: string[] = [];
  if (!/viewport/i.test(layout + home) && !/md:|sm:|lg:|flex|grid/.test(content)) {
    responsiveIssues.push("Few responsive utility classes detected");
  }
  if (!/md:|sm:|lg:/.test(content)) {
    responsiveIssues.push("No breakpoint utilities (sm/md/lg) found");
  }

  const seoIssues: string[] = [];
  if (!/metadata|metaTitle|title:|description:/i.test(content)) {
    seoIssues.push("Missing metadata/title/description signals");
  }
  if (strategy?.seoFocus?.length && !strategy.seoFocus.some((k) => content.includes(k))) {
    seoIssues.push("SEO focus keywords not reflected in generated content");
  }

  const weakSections: string[] = [];
  const contentIssues: string[] = [];
  if (home.trim().length < 200) {
    weakSections.push("Home page content is thin");
    contentIssues.push("Home page content is thin");
  }
  if (!/\b(cta|button|get started|contact|book|buy|sign up)\b/i.test(content)) {
    weakSections.push("Primary CTA may be missing");
    contentIssues.push("Primary CTA language not detected");
  }
  if (
    assetManifest?.items?.some((a) => a.role === "hero") &&
    !assetManifest.items.some((a) => a.role === "hero" && a.url) &&
    !/<img|Image |background/i.test(home)
  ) {
    weakSections.push("Hero visual not wired into home page");
    contentIssues.push("Hero asset not referenced in home page");
  }
  if (designSystem && !content.includes(designSystem.colors.primary) && !content.includes("--color-primary")) {
    contentIssues.push("Design tokens may not be applied in CSS/components");
  }

  const dimensions = [
    {
      name: "structure" as const,
      passed: structureIssues.length === 0,
      issues: structureIssues,
    },
    {
      name: "responsive" as const,
      passed: responsiveIssues.length === 0,
      issues: responsiveIssues,
    },
    {
      name: "seo" as const,
      passed: seoIssues.length === 0,
      issues: seoIssues,
    },
    {
      name: "content" as const,
      passed: contentIssues.length === 0,
      issues: contentIssues,
    },
  ];

  const issues = dimensions.flatMap((d) => d.issues);
  // Soft pass unless structure is catastrophically broken (no page/layout).
  const catastrophic =
    structureIssues.some((i) => i.startsWith("Missing app page")) ||
    structureIssues.some((i) => i.startsWith("Missing layout"));

  return {
    passed: !catastrophic,
    dimensions,
    weakSections,
    improveApplied: false,
    issues,
  };
}

export function buildQualityImproveInstruction(report: QualityReport): string {
  const lines = [
    "[quality] Improve the generated website to fix these quality issues:",
    ...report.issues.slice(0, 12).map((i) => `- ${i}`),
    ...report.weakSections.slice(0, 6).map((w) => `- Strengthen: ${w}`),
    "Keep existing architecture. Prefer editing app/page.tsx, layout, and shared components.",
  ];
  return lines.join("\n");
}
