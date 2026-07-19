/**
 * Website Understanding System — analyze structure, sections, design, brand, images.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type { VisualDesignPlan } from "@/lib/ai-core/design-plan/types";
import type {
  UnderstoodSection,
  WebsiteUnderstanding,
} from "@/lib/ai-core/website-editor/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

function findFile(
  files: GeneratedProjectFile[],
  matcher: (path: string) => boolean,
): GeneratedProjectFile | undefined {
  return files.find((f) => matcher(f.path.replace(/\\/g, "/")));
}

function extractCssVar(css: string, name: string): string | undefined {
  const re = new RegExp(`--${name}\\s*:\\s*([^;]+);`, "i");
  const m = css.match(re);
  return m?.[1]?.trim();
}

function kindHintFromExport(name: string): string {
  const n = name.toLowerCase();
  if (/hero/.test(n)) return "hero";
  if (/case|stud/.test(n)) return "case-studies";
  if (/trust|social|testimonial/.test(n)) return "brand-trust";
  if (/timeline|process/.test(n)) return "timeline";
  if (/compar/.test(n)) return "comparison";
  if (/video/.test(n)) return "video";
  if (/galler/.test(n)) return "gallery-experience";
  if (/story|feature/.test(n)) return "feature-story";
  if (/product|showcase|interactive/.test(n)) return "interactive-product";
  if (/service/.test(n)) return "services";
  if (/pric/.test(n)) return "pricing";
  if (/faq/.test(n)) return "faq";
  if (/book|reserv/.test(n)) return "booking";
  if (/contact/.test(n)) return "contact";
  if (/cta/.test(n)) return "cta";
  if (/team/.test(n)) return "team";
  if (/blog/.test(n)) return "blog";
  if (/map/.test(n)) return "maps";
  if (/header|nav/.test(n)) return "header";
  if (/footer/.test(n)) return "footer";
  return "section";
}

/** Parse ordered component export names used in app/page.tsx JSX. */
export function parseHomeComponentOrder(pageSource: string): string[] {
  const order: string[] = [];
  const jsxRe = /<([A-Z][A-Za-z0-9]*)\b/g;
  let m: RegExpExecArray | null;
  while ((m = jsxRe.exec(pageSource))) {
    const name = m[1]!;
    if (name === "Metadata" || name === "Fragment") continue;
    if (!order.includes(name)) order.push(name);
  }
  return order;
}

function listSectionFiles(files: GeneratedProjectFile[]): UnderstoodSection[] {
  const sections: UnderstoodSection[] = [];
  for (const file of files) {
    const path = file.path.replace(/\\/g, "/");
    if (!path.includes("components/sections/") && !path.includes("components/layout/")) {
      continue;
    }
    const exportMatch = file.content.match(/export function ([A-Z][A-Za-z0-9]*)/);
    const exportName =
      exportMatch?.[1] ||
      path
        .split("/")
        .pop()
        ?.replace(/\.tsx?$/, "")
        ?.split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("") ||
      "Section";
    sections.push({
      exportName,
      path,
      kindHint: kindHintFromExport(exportName),
      usedOnHome: false,
    });
  }
  return sections;
}

/**
 * Analyze an existing generated website project for the editor.
 */
export function understandWebsite(params: {
  files: GeneratedProjectFile[];
  project?: GeneratedWebsiteProject | null;
  designPlan?: VisualDesignPlan | null;
  brandIdentity?: BrandIdentityBrief | null;
}): WebsiteUnderstanding {
  const files = params.files;
  const home =
    findFile(files, (p) => p === "app/page.tsx" || p.endsWith("/app/page.tsx")) ||
    findFile(files, (p) => p.endsWith("page.tsx") && p.includes("app/"));
  const globals = findFile(
    files,
    (p) => p.endsWith("globals.css") || p.includes("app/globals.css"),
  );
  const homeOrder = home ? parseHomeComponentOrder(home.content) : [];
  const sections = listSectionFiles(files).map((s) => ({
    ...s,
    usedOnHome: homeOrder.includes(s.exportName),
  }));

  const designPlan =
    params.designPlan || params.project?.designPlan || null;
  const brandIdentity =
    params.brandIdentity ||
    designPlan?.brandIdentity ||
    null;

  const css = globals?.content || "";
  const designTokens = {
    primary:
      extractCssVar(css, "color-primary") ||
      designPlan?.colorSystem.primary ||
      brandIdentity?.colors.primary,
    secondary:
      extractCssVar(css, "color-secondary") ||
      designPlan?.colorSystem.secondary ||
      brandIdentity?.colors.secondary,
    accent:
      extractCssVar(css, "color-accent") ||
      designPlan?.colorSystem.accent ||
      brandIdentity?.colors.accent,
    background:
      extractCssVar(css, "color-background") ||
      designPlan?.colorSystem.background,
    foreground:
      extractCssVar(css, "color-foreground") ||
      designPlan?.colorSystem.foreground,
    headingFont:
      extractCssVar(css, "font-heading")?.replace(/["']/g, "") ||
      designPlan?.typographySystem.headingFont ||
      brandIdentity?.typography.headingFont,
    bodyFont:
      extractCssVar(css, "font-body")?.replace(/["']/g, "") ||
      designPlan?.typographySystem.bodyFont ||
      brandIdentity?.typography.bodyFont,
    sectionY:
      extractCssVar(css, "section-y") || brandIdentity?.spacing.sectionY,
  };

  const imageCount =
    params.project?.assetManifest?.items?.filter((i) => i.url)?.length ||
    files.filter((f) => /site-images|public\/.*\.(png|jpe?g|webp)/i.test(f.path))
      .length;

  const brandName =
    brandIdentity?.brandName ||
    designPlan?.brandName ||
    params.project?.businessProfile?.projectName ||
    params.project?.title ||
    "Brand";

  const structureNotes = [
    home
      ? `Home composes ${homeOrder.length} components: ${homeOrder.slice(0, 8).join(" → ")}`
      : "Home page.tsx not found",
    `${sections.filter((s) => s.usedOnHome).length} section scaffolds used on home`,
    designPlan
      ? `Design plan: ${designPlan.visualIdentity} · ${designPlan.websiteStyle.heroTreatment}`
      : "No design plan attached",
    brandIdentity
      ? `Brand identity: ${brandIdentity.presetId} · ${brandIdentity.typography.pairing}`
      : "No brand identity package attached",
    `${imageCount} image assets detected`,
  ];

  return {
    brandName,
    homePath: home?.path ?? null,
    sections,
    homeComponentOrder: homeOrder,
    designTokens,
    designPlan,
    brandIdentity,
    imageCount,
    hasGlobalsCss: Boolean(globals),
    structureNotes,
    summary: `${brandName}: ${homeOrder.length} home components · ${sections.length} section files · ${designPlan?.websiteStyle.premiumStyleId || "style?"} · ${imageCount} images`,
  };
}
