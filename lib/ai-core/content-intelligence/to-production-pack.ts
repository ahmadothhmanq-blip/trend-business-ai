import type { AgencyBrandKit } from "@/lib/ai-core/agency-brand-kit/types";
import type { AgencyContentPack } from "@/lib/ai-core/content-intelligence/generate";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";

/**
 * Convert agency LLM content into ProductionContentPack for component injection.
 * This is the bridge that replaces static industry-copy packs.
 */
export function agencyContentToProductionPack(params: {
  content: AgencyContentPack;
  brandKit: AgencyBrandKit;
  profile: BusinessIntelligenceProfile;
  language?: string;
}): ProductionContentPack {
  const { content, brandKit, profile } = params;
  const brand = brandKit.companyName;
  const industryId = profile.routingIndustryId || profile.industry.toLowerCase();

  const navLinks = profile.recommendedSections
    .filter((s) => !/hero|footer/i.test(s))
    .slice(0, 6)
    .map((label) => ({
      href: `#${label.toLowerCase().replace(/\s+/g, "-")}`,
      label,
    }));

  if (!navLinks.length) {
    navLinks.push(
      { href: "#services", label: "Services" },
      { href: "#about", label: "About" },
      { href: "#contact", label: "Contact" },
    );
  }

  return {
    industryId,
    heroHeadline: content.hero.headline,
    heroSubheadline: content.hero.subheadline,
    primaryCta: content.hero.ctaPrimary,
    secondaryCta: content.hero.ctaSecondary,
    serviceDescriptions: content.services.map((s) => s.body),
    trustLine: content.footer.tagline,
    contentBlocks: [
      content.about.story,
      content.about.mission,
      content.about.vision,
      ...content.features.map((f) => `${f.title}: ${f.body}`),
    ],
    heroEyebrow: content.hero.eyebrow,
    brandTagline: brandKit.tagline,
    servicesEyebrow: profile.industry,
    servicesTitle: content.services[0]?.title || "What We Offer",
    servicesSubtitle: `Professional ${profile.subcategory.toLowerCase()} for ${profile.audience[0] || "you"}`,
    services: content.services.map((s) => ({
      title: s.title,
      body: s.body,
      cta: s.cta,
    })),
    featuresEyebrow: "Why Us",
    featuresTitle: "What Sets Us Apart",
    featuresSubtitle: content.about.mission.slice(0, 120),
    features: content.features.map((f) => ({
      title: f.title,
      body: f.body,
    })),
    testimonialsEyebrow: "Testimonials",
    testimonialsTitle: "Trusted by Clients",
    testimonialsSubtitle: `What ${profile.audience[0] || "clients"} say about ${brand}`,
    testimonials: content.testimonials,
    faqEyebrow: "FAQ",
    faqTitle: "Common Questions",
    faqSubtitle: `Everything you need to know about ${brand}`,
    faqs: content.faq,
    pricingEyebrow: "Plans",
    pricingTitle: "Transparent Pricing",
    pricingSubtitle: `Choose the right ${profile.subcategory.toLowerCase()} option`,
    pricing: [],
    galleryEyebrow: "Gallery",
    galleryTitle: "Our Work",
    gallerySubtitle: profile.photographyStyle[0] || `${profile.industry} showcase`,
    galleryItems: profile.photographyStyle.slice(0, 4).map((subject, i) => ({
      title: subject,
      tag: profile.recommendedSections[i] || profile.industry,
    })),
    ctaEyebrow: profile.primaryCta,
    ctaTitle: content.cta.title,
    ctaBody: content.cta.body,
    contactTitle: "Get in Touch",
    contactSubtitle: `Reach ${brand} — ${brandKit.contactPlaceholders.email}`,
    navLinks,
    showcaseBullets: content.features.map((f) => f.title).slice(0, 4),
  };
}
