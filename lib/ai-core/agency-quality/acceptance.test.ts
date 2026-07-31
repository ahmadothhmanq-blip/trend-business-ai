import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agencyContentToProductionPack } from "@/lib/ai-core/content-intelligence/to-production-pack";
import { generateAgencyContent } from "@/lib/ai-core/content-intelligence/generate";
import { generateBrandLogoAssets } from "@/lib/ai-core/agency-brand-kit/logo-svg";
import { buildRichStructuredData } from "@/lib/ai-core/seo/rich-structured-data";
import { validateAccessibility, repairAccessibility } from "@/lib/ai-core/accessibility/validate";
import { resolveDesignDNA } from "@/lib/ai-core/design-dna/resolve";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { AgencyBrandKit } from "@/lib/ai-core/agency-brand-kit/types";

const INDUSTRIES: Array<{ prompt: string; profile: BusinessIntelligenceProfile; brand: AgencyBrandKit }> = [
  {
    prompt: "Create a restaurant website",
    profile: baseProfile("Restaurant", "Fine Dining", "restaurant", "Reserve a Table"),
    brand: baseBrand("Saffron Terrace"),
  },
  {
    prompt: "Create a law firm website",
    profile: baseProfile("Law Firm", "Corporate Law", "law", "Free Consultation"),
    brand: baseBrand("Sterling Legal"),
  },
  {
    prompt: "Create a furniture company website",
    profile: baseProfile("Furniture", "Modern Furniture", "furniture", "Shop Collection"),
    brand: baseBrand("Atelier Forma"),
  },
  {
    prompt: "Create a healthcare clinic website",
    profile: baseProfile("Healthcare", "Medical Clinic", "clinic", "Book Appointment"),
    brand: baseBrand("Vitae Clinic"),
  },
  {
    prompt: "Create an education website",
    profile: baseProfile("Education", "University", "education", "Apply Now"),
    brand: baseBrand("Horizon Academy"),
  },
  {
    prompt: "Create a construction company website",
    profile: baseProfile("Construction", "Commercial Builder", "business", "Get a Quote"),
    brand: baseBrand("Crest Builders"),
  },
  {
    prompt: "Create a travel agency website",
    profile: baseProfile("Travel", "Luxury Tours", "tourism", "Book Your Trip"),
    brand: baseBrand("Odyssey Travel"),
  },
  {
    prompt: "Create a real estate website",
    profile: baseProfile("Real Estate", "Luxury Properties", "real-estate", "Browse Listings"),
    brand: baseBrand("Landmark Realty"),
  },
  {
    prompt: "Create a technology startup website",
    profile: baseProfile("Technology", "AI Platform", "saas", "Schedule Demo"),
    brand: baseBrand("Nexus AI"),
  },
  {
    prompt: "Create an e-commerce website",
    profile: baseProfile("E-commerce", "Fashion Retail", "ecommerce", "Shop Now"),
    brand: baseBrand("Curate Market"),
  },
];

function baseProfile(
  industry: string,
  sub: string,
  routing: string,
  cta: string,
): BusinessIntelligenceProfile {
  return {
    industry,
    subcategory: sub,
    audience: ["Professionals", "Consumers"],
    tone: "Premium",
    visualStyle: ["Modern", "Clean"],
    colorPalette: ["Neutral"],
    typography: ["Modern"],
    photographyStyle: [`${industry} professional photography`],
    forbiddenSubjects: ["unrelated imagery"],
    heroMessaging: [`Premium ${sub.toLowerCase()} for discerning clients`],
    recommendedSections: ["Hero", "Services", "About", "Testimonials", "Contact"],
    primaryCta: cta,
    navigationStyle: "standard",
    designSystemHints: { mood: "Professional", layoutApproach: "conversion-focused" },
    routingIndustryId: routing,
    confidence: 0.9,
    reason: `${industry} business`,
  };
}

function baseBrand(name: string): AgencyBrandKit {
  return {
    companyName: name,
    tagline: `Excellence in every detail`,
    logoConcept: "Geometric mark",
    logoStyle: "icon-wordmark",
    colorPalette: {
      primary: "#1e3a5f",
      secondary: "#64748b",
      accent: "#3b82f6",
      background: "#ffffff",
      foreground: "#0f172a",
      surface: "#f8fafc",
    },
    typography: { display: "Inter", heading: "Inter", body: "Inter" },
    trustElements: ["Trusted"],
    contactPlaceholders: {
      email: `hello@${name.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: "+1 (555) 000-0000",
      address: "123 Main St",
    },
  };
}

describe("agency acceptance — 10 industries", () => {
  for (const { prompt, profile, brand } of INDUSTRIES) {
    it(`produces unique content for ${profile.industry}`, () => {
      const dna = resolveDesignDNA({ prompt, businessProfile: profile });
      const content = generateAgencyContent({ profile, brandKit: brand, designDNA: dna });
      const pack = agencyContentToProductionPack({ content, brandKit: brand, profile });

      assert.ok(pack.heroHeadline.length > 10);
      assert.ok(pack.heroHeadline.toLowerCase().includes(profile.industry.toLowerCase().split(" ")[0]!) ||
        pack.heroSubheadline.toLowerCase().includes(profile.subcategory.toLowerCase().split(" ")[0]!));
      assert.equal(pack.primaryCta, profile.primaryCta);
      assert.ok(pack.services.length >= 2);
      assert.ok(pack.faqs.length >= 2);
    });

    it(`generates brand assets for ${profile.industry}`, () => {
      const logos = generateBrandLogoAssets(brand);
      assert.ok(logos.logoLight.includes("<svg"));
      assert.ok(logos.monogram.includes(brand.companyName.slice(0, 1)));
    });

    it(`builds rich SEO schema for ${profile.industry}`, () => {
      const content = generateAgencyContent({
        profile,
        brandKit: brand,
        designDNA: resolveDesignDNA({ prompt, businessProfile: profile }),
      });
      const schema = buildRichStructuredData({
        profile,
        brandKit: brand,
        content,
        siteUrl: "https://example.com",
      });
      assert.ok(schema.length >= 3);
      assert.ok(schema.some((s) => s.type === "Organization"));
      assert.ok(schema.some((s) => s.type === "FAQPage"));
    });
  }

  it("repairs accessibility issues automatically", () => {
    const files = [
      {
        path: "app/layout.tsx",
        content: '<html><body><img src="/x.jpg"><h1>Test</h1></body></html>',
        language: "typescript",
      },
      { path: "app/globals.css", content: "body { margin: 0; }", language: "css" },
    ];
    const report = validateAccessibility(files);
    assert.equal(report.passed, false);
    const fixed = repairAccessibility(files);
    const fixedReport = validateAccessibility(fixed);
    assert.ok(fixedReport.score > report.score);
  });
});
