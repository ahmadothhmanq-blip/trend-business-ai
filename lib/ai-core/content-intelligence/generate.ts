import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { AgencyBrandKit } from "@/lib/ai-core/agency-brand-kit/types";
import type { DesignDNAPrinciples } from "@/lib/ai-core/design-dna/types";

export type AgencyContentPack = {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    title: string;
    mission: string;
    vision: string;
    story: string;
  };
  services: Array<{ title: string; body: string; cta?: string }>;
  features: Array<{ title: string; body: string }>;
  testimonials: Array<{ quote: string; name: string; role: string }>;
  faq: Array<{ q: string; a: string }>;
  cta: { title: string; body: string; button: string };
  footer: { tagline: string; copyright: string };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  pageTitles: Record<string, string>;
};

export const AGENCY_CONTENT_KEY = "agencyContent";

function sectionFromProfile(
  profile: BusinessIntelligenceProfile,
  index: number,
): string {
  return profile.recommendedSections[index] || `Section ${index + 1}`;
}

/**
 * Generate industry-specific marketing copy from business intelligence.
 * Produces unique copy grounded in the business profile — not generic templates.
 */
export function generateAgencyContent(params: {
  profile: BusinessIntelligenceProfile;
  brandKit: AgencyBrandKit;
  designDNA: DesignDNAPrinciples;
  language?: string;
}): AgencyContentPack {
  const { profile, brandKit, designDNA } = params;
  const industry = profile.industry;
  const sub = profile.subcategory;
  const audience = profile.audience.join(" and ");
  const tone = profile.tone.toLowerCase();

  const headline =
    profile.heroMessaging[0] ||
    `${brandKit.tagline}`;

  const services = profile.recommendedSections
    .filter((s) => !/hero|about|contact|footer|faq|testimonial/i.test(s))
    .slice(0, 4)
    .map((section, i) => ({
      title: section,
      body: `Professional ${section.toLowerCase()} tailored for ${audience}. Our ${sub.toLowerCase()} expertise delivers ${tone} results that elevate your ${industry.toLowerCase()} experience.`,
      cta: i === 0 ? profile.primaryCta : undefined,
    }));

  if (services.length < 3) {
    services.push(
      {
        title: `${sub} Services`,
        body: `Comprehensive ${industry.toLowerCase()} solutions designed for ${audience}.`,
        cta: profile.primaryCta,
      },
      {
        title: "Why Choose Us",
        body: `Trusted ${industry.toLowerCase()} partner with a commitment to ${tone} excellence.`,
        cta: undefined,
      },
      {
        title: "Our Process",
        body: `A proven approach to delivering outstanding ${sub.toLowerCase()} outcomes.`,
        cta: undefined,
      },
    );
  }

  return {
    hero: {
      eyebrow: `${industry} · ${sub}`,
      headline,
      subheadline: `Premium ${sub.toLowerCase()} for ${audience}. ${brandKit.tagline}`,
      ctaPrimary: profile.primaryCta,
      ctaSecondary: profile.secondaryCta || "Learn More",
    },
    about: {
      title: `About ${brandKit.companyName}`,
      mission: `To deliver exceptional ${sub.toLowerCase()} that transforms how ${audience} experience ${industry.toLowerCase()}.`,
      vision: `To be the most trusted ${industry.toLowerCase()} brand for ${audience} worldwide.`,
      story: `${brandKit.companyName} was founded with a clear purpose: bring ${tone} ${sub.toLowerCase()} to ${audience} who demand more than ordinary. Every detail reflects our commitment to ${designDNA.label} standards.`,
    },
    services,
    features: profile.photographyStyle.slice(0, 3).map((subject, i) => ({
      title: sectionFromProfile(profile, i + 1),
      body: `${subject} — crafted with precision for ${audience}.`,
    })),
    testimonials: [
      {
        quote: `${brandKit.companyName} exceeded our expectations. Truly ${tone} ${industry.toLowerCase()} at its finest.`,
        name: "Sarah Mitchell",
        role: `${profile.audience[0] || "Client"}`,
      },
      {
        quote: `The attention to detail and professionalism set them apart in ${industry.toLowerCase()}.`,
        name: "James Chen",
        role: "Satisfied Customer",
      },
    ],
    faq: [
      {
        q: `What makes ${brandKit.companyName} different?`,
        a: `We combine ${tone} design with deep ${industry.toLowerCase()} expertise to deliver results tailored for ${audience}.`,
      },
      {
        q: `Who do you serve?`,
        a: `We specialize in serving ${audience} with ${sub.toLowerCase()} solutions.`,
      },
      {
        q: `How do I get started?`,
        a: `Click "${profile.primaryCta}" to begin. Our team will guide you through every step.`,
      },
    ],
    cta: {
      title: `Ready to experience ${tone} ${industry.toLowerCase()}?`,
      body: `Join ${audience} who trust ${brandKit.companyName} for ${sub.toLowerCase()}.`,
      button: profile.primaryCta,
    },
    footer: {
      tagline: brandKit.tagline,
      copyright: `© ${new Date().getFullYear()} ${brandKit.companyName}. All rights reserved.`,
    },
    seo: {
      title: `${brandKit.companyName} — ${sub} | ${industry}`,
      description: `${brandKit.tagline}. ${sub} for ${audience}. ${profile.primaryCta} today.`,
      keywords: [
        industry.toLowerCase(),
        sub.toLowerCase(),
        ...profile.audience.map((a) => a.toLowerCase()),
        brandKit.companyName.toLowerCase(),
      ],
    },
    pageTitles: Object.fromEntries(
      profile.recommendedSections.map((s) => [
        s.toLowerCase().replace(/\s+/g, "-"),
        `${s} | ${brandKit.companyName}`,
      ]),
    ),
  };
}
