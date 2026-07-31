/**
 * Industry-specific preview content — authentic copy, nav, and hero modes per TI.
 */
import { getIndustryPreviewProfile } from "@/lib/website/builder/industry-preview-profiles-data";

export type HeroLayoutMode =
  | "split"
  | "cinematic"
  | "dashboard"
  | "editorial"
  | "minimal"
  | "dark-authority";

export type IndustryPreviewProfile = {
  heroEyebrow: string;
  heroHeadlineTemplate: string;
  heroSubheadline: string;
  primaryCta: string;
  secondaryCta: string;
  heroLayout: HeroLayoutMode;
  navLinkLabels: string[];
  contentBlocks: string[];
};

export function resolveIndustryPreviewProfile(
  templateIntelligenceId: string | null | undefined,
): IndustryPreviewProfile | null {
  if (!templateIntelligenceId) return null;
  return getIndustryPreviewProfile(templateIntelligenceId);
}

export function applyIndustryPreviewProfile(
  base: {
    title: string;
    description: string;
    brandName: string;
    heroHeadline: string;
    heroSubheadline: string;
    heroEyebrow: string;
    primaryCta: string;
    secondaryCta: string;
    content: string[];
    navLinks: Array<{ href: string; label: string }>;
  },
  profile: IndustryPreviewProfile,
  pageSlugs: Array<{ slug: string; name: string }>,
): typeof base {
  const brand = base.brandName;
  const heroHeadline = profile.heroHeadlineTemplate.replace(/\{brand\}/g, brand);

  const navLinks =
    pageSlugs.length > 1
      ? pageSlugs.slice(1, 5).map((page, index) => ({
          href: `#${page.slug}`,
          label:
            profile.navLinkLabels[index] ??
            page.name,
        }))
      : base.navLinks;

  const content =
    profile.contentBlocks.length > 0
      ? [...profile.contentBlocks, ...base.content]
      : base.content;

  return {
    ...base,
    heroHeadline,
    heroSubheadline: profile.heroSubheadline,
    heroEyebrow: profile.heroEyebrow,
    primaryCta: profile.primaryCta,
    secondaryCta: profile.secondaryCta,
    content,
    navLinks,
  };
}

export function heroLayoutClass(
  templateIntelligenceId: string | null | undefined,
): string {
  const profile = resolveIndustryPreviewProfile(templateIntelligenceId);
  if (!profile) return "";
  return `ti-hero-${profile.heroLayout}`;
}
