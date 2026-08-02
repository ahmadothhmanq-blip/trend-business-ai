/**
 * Golden Prompt Suite — Wave Scheduler production quality validation.
 * Minimum 12 industry archetypes for legacy vs WB_WAVE_SCHEDULER comparison.
 */

export type GoldenPromptCase = {
  id: string;
  industry: string;
  label: string;
  prompt: string;
  language: string;
  theme: string;
  features: string[];
};

export const WEBSITE_GOLDEN_PROMPT_SUITE: GoldenPromptCase[] = [
  {
    id: "restaurant",
    industry: "restaurant",
    label: "Restaurant",
    prompt:
      "Fine dining restaurant in Dubai with reservations, menu highlights, chef story, and private dining events. Premium luxury aesthetic.",
    language: "English",
    theme: "luxury",
    features: ["contact-form", "seo"],
  },
  {
    id: "saas",
    industry: "saas",
    label: "SaaS",
    prompt:
      "B2B SaaS platform for project management with pricing tiers, feature comparison, customer testimonials, and free trial signup.",
    language: "English",
    theme: "modern",
    features: ["contact-form", "seo", "analytics"],
  },
  {
    id: "corporate",
    industry: "corporate",
    label: "Corporate",
    prompt:
      "Corporate consulting firm website for strategy and digital transformation services. Professional, trustworthy, executive audience.",
    language: "English",
    theme: "corporate",
    features: ["contact-form", "seo"],
  },
  {
    id: "agency",
    industry: "agency",
    label: "Agency",
    prompt:
      "Creative digital agency showcasing branding, web design, and marketing campaigns. Bold portfolio and case studies.",
    language: "English",
    theme: "creative",
    features: ["contact-form", "seo", "portfolio"],
  },
  {
    id: "medical",
    industry: "medical",
    label: "Medical",
    prompt:
      "Private medical clinic offering family medicine, preventive care, and online appointment booking. Clean, calming, trustworthy design.",
    language: "English",
    theme: "minimal",
    features: ["contact-form", "seo", "booking"],
  },
  {
    id: "law-firm",
    industry: "law",
    label: "Law Firm",
    prompt:
      "Boutique law firm specializing in corporate litigation and business law. Authoritative, refined, client-focused practice areas.",
    language: "English",
    theme: "corporate",
    features: ["contact-form", "seo"],
  },
  {
    id: "construction",
    industry: "construction",
    label: "Construction",
    prompt:
      "Commercial construction company showcasing completed projects, safety standards, and quote requests for industrial builds.",
    language: "English",
    theme: "modern",
    features: ["contact-form", "seo"],
  },
  {
    id: "ecommerce",
    industry: "ecommerce",
    label: "Ecommerce",
    prompt:
      "Premium skincare ecommerce store with product catalog, ingredient transparency, customer reviews, and secure checkout.",
    language: "English",
    theme: "luxury",
    features: ["contact-form", "seo", "ecommerce"],
  },
  {
    id: "portfolio",
    industry: "portfolio",
    label: "Portfolio",
    prompt:
      "Freelance UX designer portfolio with case studies, design process, skills, and hire-me contact section.",
    language: "English",
    theme: "creative",
    features: ["contact-form", "seo", "portfolio"],
  },
  {
    id: "education",
    industry: "education",
    label: "Education",
    prompt:
      "Online coding bootcamp with curriculum overview, instructor profiles, student outcomes, and enrollment form.",
    language: "English",
    theme: "modern",
    features: ["contact-form", "seo"],
  },
  {
    id: "real-estate",
    industry: "real-estate",
    label: "Real Estate",
    prompt:
      "Luxury real estate agency with property listings, neighborhood guides, agent profiles, and schedule viewing requests.",
    language: "English",
    theme: "luxury",
    features: ["contact-form", "seo"],
  },
  {
    id: "hotel",
    industry: "tourism",
    label: "Hotel",
    prompt:
      "Boutique hotel with room types, amenities, dining, spa services, and direct booking. Elegant hospitality aesthetic.",
    language: "English",
    theme: "luxury",
    features: ["contact-form", "seo", "booking"],
  },
];

export function getGoldenPromptById(id: string): GoldenPromptCase | undefined {
  return WEBSITE_GOLDEN_PROMPT_SUITE.find((entry) => entry.id === id);
}
