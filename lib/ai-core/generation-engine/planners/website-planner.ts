import type {
  Tbge2BusinessAnalysis,
  Tbge2IntentAnalysis,
  Tbge2RequirementsAnalysis,
  Tbge2WebsitePlan,
  Tbge2WebsiteType,
} from "@/lib/ai-core/generation-engine/core/types";

const INTENT_TO_WEBSITE_TYPE: Record<Tbge2IntentAnalysis["category"], Tbge2WebsiteType> = {
  website: "marketing",
  "landing-page": "landing",
  portfolio: "portfolio",
  restaurant: "local-business",
  medical: "local-business",
  saas: "saas",
  ecommerce: "ecommerce",
  "real-estate": "corporate",
  legal: "corporate",
  education: "corporate",
  agency: "portfolio",
  blog: "blog",
  app: "saas",
  nonprofit: "corporate",
  unknown: "marketing",
};

const CTA_BY_INTENT: Record<Tbge2IntentAnalysis["category"], { primary: string; secondary?: string }> = {
  website: { primary: "Get Started", secondary: "Learn More" },
  "landing-page": { primary: "Start Free Trial", secondary: "See Demo" },
  portfolio: { primary: "View Work", secondary: "Contact Us" },
  restaurant: { primary: "Book a Table", secondary: "View Menu" },
  medical: { primary: "Book Appointment", secondary: "Our Services" },
  saas: { primary: "Start Free Trial", secondary: "View Pricing" },
  ecommerce: { primary: "Shop Now", secondary: "Browse Collection" },
  "real-estate": { primary: "View Listings", secondary: "Contact Agent" },
  legal: { primary: "Schedule Consultation", secondary: "Our Practice" },
  education: { primary: "Enroll Now", secondary: "Explore Courses" },
  agency: { primary: "Start a Project", secondary: "View Portfolio" },
  blog: { primary: "Subscribe", secondary: "Read Latest" },
  app: { primary: "Download App", secondary: "Learn More" },
  nonprofit: { primary: "Donate Now", secondary: "Our Mission" },
  unknown: { primary: "Get Started", secondary: "Contact Us" },
};

/**
 * Website Planner — decides site type, navigation, CTAs, conversion strategy.
 */
export function planWebsite(
  intent: Tbge2IntentAnalysis,
  business: Tbge2BusinessAnalysis,
  requirements: Tbge2RequirementsAnalysis,
): Tbge2WebsitePlan {
  const websiteType = INTENT_TO_WEBSITE_TYPE[intent.category];
  const ctas = CTA_BY_INTENT[intent.category];

  const pageCount = estimatePageCount(intent, requirements);
  const navigation = buildNavigation(intent, requirements);

  const conversionStrategy = buildConversionStrategy(intent, business, requirements);

  return {
    websiteType,
    pageCount,
    navigation,
    primaryCta: ctas.primary,
    secondaryCta: ctas.secondary,
    conversionStrategy,
  };
}

function estimatePageCount(
  intent: Tbge2IntentAnalysis,
  requirements: Tbge2RequirementsAnalysis,
): number {
  let count = intent.category === "landing-page" ? 1 : 4;
  if (requirements.required.includes("blog")) count += 1;
  if (requirements.required.includes("pricing")) count += 1;
  if (requirements.required.includes("gallery")) count += 1;
  if (intent.category === "restaurant") count = 5;
  if (intent.category === "saas") count = 5;
  return count;
}

function buildNavigation(
  intent: Tbge2IntentAnalysis,
  requirements: Tbge2RequirementsAnalysis,
): Array<{ label: string; href: string }> {
  const items: Array<{ label: string; href: string }> = [
    { label: "Home", href: "/" },
  ];

  if (intent.category !== "landing-page") {
    items.push({ label: "About", href: "/about" });
  }

  if (intent.category === "restaurant") {
    items.push({ label: "Menu", href: "/menu" });
  } else if (intent.category === "portfolio" || intent.category === "agency") {
    items.push({ label: "Portfolio", href: "/portfolio" });
  } else {
    items.push({ label: "Services", href: "/services" });
  }

  if (requirements.required.includes("pricing")) {
    items.push({ label: "Pricing", href: "/pricing" });
  }

  if (requirements.required.includes("blog")) {
    items.push({ label: "Blog", href: "/blog" });
  }

  items.push({ label: "Contact", href: "/contact" });
  return items;
}

function buildConversionStrategy(
  intent: Tbge2IntentAnalysis,
  business: Tbge2BusinessAnalysis,
  requirements: Tbge2RequirementsAnalysis,
): string {
  const parts: string[] = [];

  if (requirements.required.includes("booking")) {
    parts.push("Drive appointment bookings via prominent CTAs");
  }
  if (requirements.required.includes("ecommerce") || requirements.required.includes("payments")) {
    parts.push("Optimize product discovery and checkout conversion");
  }
  if (intent.category === "saas") {
    parts.push("Lead with value proposition, social proof, and trial signup");
  }
  if (intent.category === "landing-page") {
    parts.push("Single-page funnel with minimal navigation distraction");
  }
  if (business.goals.includes("Build brand awareness")) {
    parts.push("Emphasize brand story and trust signals");
  }

  return parts.length > 0
    ? parts.join("; ")
    : `Convert ${business.audience[0]?.toLowerCase() ?? "visitors"} through clear value messaging and strong CTAs`;
}
