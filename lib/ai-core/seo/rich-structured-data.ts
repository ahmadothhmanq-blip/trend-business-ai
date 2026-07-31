import type { AgencyContentPack } from "@/lib/ai-core/content-intelligence/generate";
import type { AgencyBrandKit } from "@/lib/ai-core/agency-brand-kit/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { CoreStructuredDataItem } from "@/lib/ai-core/seo/types";

function industrySchemaType(industry: string): string {
  const raw = industry.toLowerCase();
  if (/restaurant|food|dining|cafe|bakery/.test(raw)) return "Restaurant";
  if (/law|legal|attorney/.test(raw)) return "LegalService";
  if (/clinic|health|medical|dental|hospital/.test(raw)) return "MedicalBusiness";
  if (/education|school|university|academy/.test(raw)) return "EducationalOrganization";
  if (/real.?estate|property/.test(raw)) return "RealEstateAgent";
  if (/travel|tourism|hotel/.test(raw)) return "TravelAgency";
  if (/saas|software|tech|ai|cyber/.test(raw)) return "SoftwareApplication";
  if (/ecommerce|shop|store|retail/.test(raw)) return "Store";
  if (/construction|builder|contractor/.test(raw)) return "HomeAndConstructionBusiness";
  if (/furniture|decor|interior/.test(raw)) return "FurnitureStore";
  if (/automotive|car|vehicle/.test(raw)) return "AutomotiveBusiness";
  return "LocalBusiness";
}

/**
 * Build rich structured data based on business type — FAQ, LocalBusiness, Breadcrumb, etc.
 */
export function buildRichStructuredData(params: {
  profile: BusinessIntelligenceProfile;
  brandKit: AgencyBrandKit;
  content: AgencyContentPack;
  siteUrl: string;
  language?: string;
  pages?: string[];
}): CoreStructuredDataItem[] {
  const { profile, brandKit, content, siteUrl } = params;
  const name = brandKit.companyName;
  const schemaType = industrySchemaType(profile.industry);

  const items: CoreStructuredDataItem[] = [
    {
      type: "Organization",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        description: content.seo.description,
        url: siteUrl,
        logo: `${siteUrl}/logo.svg`,
        email: brandKit.contactPlaceholders.email,
        telephone: brandKit.contactPlaceholders.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: brandKit.contactPlaceholders.address,
        },
        areaServed: profile.audience.join(", "),
        knowsAbout: content.seo.keywords.slice(0, 8),
      },
    },
    {
      type: schemaType,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": schemaType,
        name,
        description: content.about.mission,
        url: siteUrl,
        image: `${siteUrl}/og-image.jpg`,
        priceRange: profile.tone.toLowerCase().includes("luxury") ? "$$$" : "$$",
        ...(schemaType === "Restaurant"
          ? { servesCuisine: profile.subcategory, acceptsReservations: true }
          : {}),
        ...(schemaType === "MedicalBusiness"
          ? { medicalSpecialty: profile.subcategory }
          : {}),
        ...(schemaType === "LegalService"
          ? { areaServed: profile.audience[0] }
          : {}),
      },
    },
  ];

  if (content.faq.length >= 2) {
    items.push({
      type: "FAQPage",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    });
  }

  if (content.testimonials.length >= 1) {
    items.push({
      type: "Review",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${profile.subcategory} by ${name}`,
        review: content.testimonials.map((t) => ({
          "@type": "Review",
          reviewBody: t.quote,
          author: { "@type": "Person", name: t.name },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        })),
      },
    });
  }

  const pages = params.pages ?? ["/", "/about", "/contact"];
  items.push({
    type: "BreadcrumbList",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: pages.slice(0, 6).map((path, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: path === "/" ? "Home" : path.replace(/^\//, "").replace(/-/g, " "),
        item: `${siteUrl}${path === "/" ? "" : path}`,
      })),
    },
  });

  if (content.services.length >= 2) {
    items.push({
      type: "Service",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: content.services.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Service",
            name: s.title,
            description: s.body,
            provider: { "@type": "Organization", name },
          },
        })),
      },
    });
  }

  return items;
}
