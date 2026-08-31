import type { IndustryId } from "@/lib/ai-core/templates/types";
import type { IndustryConversionRule } from "@/lib/ai-core/conversion/types";
import { isIndustryId } from "@/lib/ai-core/templates/industries";

const RULES: Record<IndustryId, IndustryConversionRule> = {
  "real-estate": {
    industryId: "real-estate",
    label: "Real Estate",
    defaultGoal: "service-requests",
    requiredElements: [
      "listing",
      "inquiry",
      "contact",
      "testimonial",
      "trust",
      "location",
    ],
    sectionOrder: [
      "Hero",
      "Listings",
      "Features",
      "Testimonials",
      "Trust",
      "Inquiry",
      "Contact",
    ],
    heroGuidance:
      "Lead with featured property imagery and a clear inquiry / schedule-viewing CTA above the fold.",
    ctaGuidance:
      "Primary CTA: Request a viewing / Inquire. Secondary: Browse listings. Repeat inquiry CTA after listings.",
    trustElements: [
      "Agent credentials",
      "Client testimonials",
      "Transaction proof",
      "Local expertise",
    ],
    journeySteps: [
      "Discover property",
      "Browse listings",
      "Build trust",
      "Submit inquiry",
      "Schedule viewing",
    ],
    contentStructure: [
      "Property benefits",
      "Neighborhood value",
      "Process clarity",
      "Contact path",
    ],
  },
  tourism: {
    industryId: "tourism",
    label: "Tourism",
    defaultGoal: "bookings",
    requiredElements: [
      "destination",
      "booking",
      "tour",
      "testimonial",
      "package",
    ],
    sectionOrder: [
      "Hero",
      "Destinations",
      "Tours",
      "Packages",
      "Testimonials",
      "Booking",
      "Contact",
    ],
    heroGuidance:
      "Cinematic destination hero with Book a trip / Explore packages as dual CTAs.",
    ctaGuidance:
      "Primary CTA: Book now. Place booking after destinations and again in a closing band.",
    trustElements: [
      "Traveler reviews",
      "Ratings",
      "Safety / inclusions",
      "Operator credentials",
    ],
    journeySteps: [
      "Inspire",
      "Browse destinations",
      "Compare packages",
      "Read reviews",
      "Book",
    ],
    contentStructure: [
      "Destination desire",
      "Itinerary clarity",
      "Social proof",
      "Booking form",
    ],
  },
  restaurant: {
    industryId: "restaurant",
    label: "Restaurant",
    defaultGoal: "bookings",
    requiredElements: ["menu", "reservation", "location", "gallery", "hours"],
    sectionOrder: [
      "Hero",
      "Menu",
      "Gallery",
      "Reservation",
      "Location",
      "Contact",
    ],
    heroGuidance:
      "Food-forward hero with Reserve a table CTA and menu secondary action.",
    ctaGuidance:
      "Primary CTA: Reserve a table. Keep reservation form short; show hours and map nearby.",
    trustElements: [
      "Guest reviews",
      "Chef credentials",
      "Signature dishes",
      "Awards",
    ],
    journeySteps: [
      "Crave",
      "View menu",
      "See atmosphere",
      "Reserve",
      "Find location",
    ],
    contentStructure: [
      "Signature dishes",
      "Atmosphere",
      "Reservation",
      "Directions",
    ],
  },
  saas: {
    industryId: "saas",
    label: "SaaS",
    defaultGoal: "leads",
    requiredElements: [
      "feature",
      "pricing",
      "demo",
      "testimonial",
      "faq",
      "cta",
    ],
    sectionOrder: [
      "Hero",
      "Features",
      "Product",
      "Testimonials",
      "Pricing",
      "FAQ",
      "CTA",
    ],
    heroGuidance:
      "Product-led hero with Start free trial / Book a demo dual CTAs and clear value prop.",
    ctaGuidance:
      "Primary CTA: Start free trial or Book demo. Repeat after features and pricing.",
    trustElements: [
      "Customer logos",
      "Case metrics",
      "Security badges",
      "Reviews",
    ],
    journeySteps: [
      "Understand value",
      "Explore features",
      "See proof",
      "Compare plans",
      "Start trial",
    ],
    contentStructure: [
      "Outcome-led copy",
      "Feature benefits",
      "Social proof",
      "Objection handling",
    ],
  },
  gaming: {
    industryId: "gaming",
    label: "Gaming & Esports",
    defaultGoal: "leads",
    requiredElements: [
      "game",
      "community",
      "tournament",
      "testimonial",
      "trailer",
      "cta",
    ],
    sectionOrder: [
      "Hero",
      "Games",
      "Features",
      "Community",
      "Testimonials",
      "Tournaments",
      "CTA",
    ],
    heroGuidance:
      "Cinematic game-world hero with Play now / Join community dual CTAs and franchise energy.",
    ctaGuidance:
      "Primary CTA: Play / Pre-order / Join beta. Repeat after featured games and community proof.",
    trustElements: [
      "Player counts",
      "Streamer endorsements",
      "Award badges",
      "Press quotes",
    ],
    journeySteps: [
      "Hook with trailer",
      "Explore games",
      "See community",
      "Build hype",
      "Convert to play",
    ],
    contentStructure: [
      "Franchise story",
      "Gameplay highlights",
      "Community proof",
      "Download path",
    ],
  },
  technology: {
    industryId: "technology",
    label: "Technology",
    defaultGoal: "leads",
    requiredElements: [
      "solution",
      "product",
      "support",
      "case-study",
      "trust",
      "contact",
    ],
    sectionOrder: [
      "Hero",
      "Solutions",
      "Products",
      "Case Studies",
      "Trust",
      "Contact",
      "CTA",
    ],
    heroGuidance:
      "Modern technology hero with computers, office, or server imagery and Request demo CTA.",
    ctaGuidance:
      "Primary CTA: Request demo / Contact sales. Secondary: View solutions.",
    trustElements: [
      "Enterprise clients",
      "Certifications",
      "Support SLAs",
      "Case study metrics",
    ],
    journeySteps: [
      "Understand capability",
      "Explore solutions",
      "See proof",
      "Contact sales",
    ],
    contentStructure: [
      "Technology outcomes",
      "Product highlights",
      "Trust signals",
      "Support path",
    ],
  },
  ecommerce: {
    industryId: "ecommerce",
    label: "E-commerce",
    defaultGoal: "sales",
    requiredElements: [
      "product",
      "offer",
      "price",
      "cart",
      "shipping",
      "review",
    ],
    sectionOrder: [
      "Hero",
      "Products",
      "Collections",
      "Offers",
      "Testimonials",
      "CTA",
    ],
    heroGuidance:
      "Offer-led hero with Shop now CTA and featured product visual.",
    ctaGuidance:
      "Primary CTA: Shop now / Add to cart path. Surface offers and shipping trust near products.",
    trustElements: [
      "Reviews",
      "Return policy",
      "Secure checkout cues",
      "Shipping clarity",
    ],
    journeySteps: [
      "Discover offer",
      "Browse products",
      "Compare",
      "Add trust",
      "Checkout intent",
    ],
    contentStructure: [
      "Product benefits",
      "Offers",
      "Social proof",
      "Purchase CTA",
    ],
  },
  furniture: {
    industryId: "furniture",
    label: "Furniture",
    defaultGoal: "sales",
    requiredElements: [
      "collection",
      "showroom",
      "product",
      "gallery",
      "testimonial",
      "contact",
    ],
    sectionOrder: [
      "Hero",
      "Collections",
      "Living Room",
      "Bedroom",
      "Showroom",
      "Testimonials",
      "Contact",
    ],
    heroGuidance:
      "Showroom hero with sofas, living rooms, or bedroom sets — never travel imagery.",
    ctaGuidance:
      "Primary CTA: Browse collections / Visit showroom. Repeat after room inspiration.",
    trustElements: [
      "Craftsmanship",
      "Material quality",
      "Customer reviews",
      "Showroom locations",
    ],
    journeySteps: [
      "Inspire",
      "Browse collections",
      "See room sets",
      "Visit showroom",
      "Contact",
    ],
    contentStructure: [
      "Room inspiration",
      "Product highlights",
      "Craft story",
      "Showroom CTA",
    ],
  },
  automotive: {
    industryId: "automotive",
    label: "Automotive",
    defaultGoal: "service-requests",
    requiredElements: [
      "vehicle",
      "inventory",
      "test-drive",
      "financing",
      "location",
      "contact",
    ],
    sectionOrder: [
      "Hero",
      "Vehicles",
      "Services",
      "Testimonials",
      "Locations",
      "Booking",
      "Contact",
    ],
    heroGuidance:
      "Flagship vehicle hero with Book a test drive / View inventory CTAs.",
    ctaGuidance:
      "Primary CTA: Book a test drive. Secondary: View inventory / Get financing.",
    trustElements: [
      "Dealer credentials",
      "Warranty",
      "Customer reviews",
      "Transparent pricing",
    ],
    journeySteps: [
      "Desire",
      "Browse inventory",
      "Compare models",
      "Book test drive",
      "Visit dealership",
    ],
    contentStructure: [
      "Model highlights",
      "Offers",
      "Trust",
      "Appointment CTA",
    ],
  },
  clinic: {
    industryId: "clinic",
    label: "Healthcare",
    defaultGoal: "bookings",
    requiredElements: [
      "service",
      "doctor",
      "appointment",
      "insurance",
      "location",
      "trust",
    ],
    sectionOrder: [
      "Hero",
      "Services",
      "Doctors",
      "Testimonials",
      "Booking",
      "FAQ",
      "Locations",
    ],
    heroGuidance:
      "Calm trust-first hero with Book appointment CTA and insurance reassurance.",
    ctaGuidance:
      "Primary CTA: Book appointment. Keep form fields minimal; FAQ covers insurance/process.",
    trustElements: [
      "Credentials",
      "Patient stories",
      "Accreditations",
      "Safety cues",
    ],
    journeySteps: [
      "Understand care",
      "Meet specialists",
      "Read proof",
      "Book",
      "Find clinic",
    ],
    contentStructure: [
      "Care offerings",
      "Clinician trust",
      "Process clarity",
      "Booking",
    ],
  },
  education: {
    industryId: "education",
    label: "Education",
    defaultGoal: "leads",
    requiredElements: [
      "program",
      "admission",
      "outcome",
      "testimonial",
      "faq",
      "contact",
    ],
    sectionOrder: [
      "Hero",
      "Programs",
      "Outcomes",
      "Testimonials",
      "Admissions",
      "FAQ",
      "Contact",
    ],
    heroGuidance:
      "Outcome-led hero with Apply / Request info dual CTAs.",
    ctaGuidance:
      "Primary CTA: Apply now or Request information. Repeat after programs.",
    trustElements: [
      "Outcomes / placements",
      "Faculty",
      "Accreditation",
      "Student stories",
    ],
    journeySteps: [
      "Explore programs",
      "See outcomes",
      "Build trust",
      "Apply / inquire",
    ],
    contentStructure: [
      "Program clarity",
      "Outcomes",
      "Admissions path",
      "FAQ",
    ],
  },
  law: {
    industryId: "law",
    label: "Law",
    defaultGoal: "service-requests",
    requiredElements: [
      "practice-area",
      "attorney",
      "case",
      "consultation",
      "testimonial",
      "contact",
    ],
    sectionOrder: [
      "Hero",
      "Practice Areas",
      "Attorneys",
      "Cases",
      "Testimonials",
      "Consultation",
      "Contact",
    ],
    heroGuidance:
      "Authority-led hero with Book consultation as primary CTA.",
    ctaGuidance:
      "Primary CTA: Book consultation. Secondary: Practice areas. Repeat after case proof.",
    trustElements: [
      "Bar credentials",
      "Case outcomes",
      "Client testimonials",
      "Years of experience",
    ],
    journeySteps: [
      "Understand expertise",
      "Review practice areas",
      "Meet attorneys",
      "Book consult",
    ],
    contentStructure: [
      "Practice clarity",
      "Attorney trust",
      "Case proof",
      "Consultation path",
    ],
  },
  blog: {
    industryId: "blog",
    label: "Blog",
    defaultGoal: "brand-awareness",
    requiredElements: [
      "article",
      "category",
      "author",
      "newsletter",
      "cta",
      "contact",
    ],
    sectionOrder: [
      "Hero",
      "Featured",
      "Categories",
      "Popular",
      "Latest",
      "Newsletter",
      "Contact",
    ],
    heroGuidance:
      "Editorial hero with Subscribe / Read latest dual CTAs.",
    ctaGuidance:
      "Primary CTA: Subscribe. Secondary: Read latest. Repeat newsletter CTA mid-page.",
    trustElements: [
      "Author expertise",
      "Publishing cadence",
      "Reader testimonials",
      "Featured coverage",
    ],
    journeySteps: [
      "Discover topics",
      "Read articles",
      "Follow author",
      "Subscribe",
    ],
    contentStructure: [
      "Featured stories",
      "Category browse",
      "Author credibility",
      "Newsletter signup",
    ],
  },
  "landing-page": {
    industryId: "landing-page",
    label: "Landing Page",
    defaultGoal: "leads",
    requiredElements: [
      "hero",
      "benefit",
      "feature",
      "proof",
      "pricing",
      "faq",
      "cta",
    ],
    sectionOrder: [
      "Hero",
      "Benefits",
      "Features",
      "Statistics",
      "Testimonials",
      "Pricing",
      "FAQ",
      "CTA",
    ],
    heroGuidance:
      "Single-value hero with one primary conversion CTA above the fold.",
    ctaGuidance:
      "Primary CTA: Get started / Start trial. Sticky CTA on scroll. Repeat before FAQ.",
    trustElements: [
      "Metrics",
      "Customer logos",
      "Testimonials",
      "Risk reversal",
    ],
    journeySteps: [
      "Understand value",
      "See proof",
      "Compare offer",
      "Convert",
    ],
    contentStructure: [
      "Benefit bullets",
      "Feature proof",
      "Pricing clarity",
      "Objection handling",
    ],
  },
  agency: {
    industryId: "agency",
    label: "Agency",
    defaultGoal: "service-requests",
    requiredElements: [
      "service",
      "portfolio",
      "process",
      "testimonial",
      "contact",
      "cta",
    ],
    sectionOrder: [
      "Hero",
      "Services",
      "Portfolio",
      "Process",
      "Testimonials",
      "CTA",
      "Contact",
    ],
    heroGuidance:
      "Craft-led hero with Start a project / View work CTAs.",
    ctaGuidance:
      "Primary CTA: Start a project / Book a call. Place after portfolio proof.",
    trustElements: [
      "Case studies",
      "Client logos",
      "Process transparency",
      "Results",
    ],
    journeySteps: [
      "See craft",
      "Understand services",
      "Review work",
      "Request consult",
    ],
    contentStructure: [
      "Capabilities",
      "Selected work",
      "Process",
      "Contact CTA",
    ],
  },
  business: {
    industryId: "business",
    label: "Luxury Business",
    defaultGoal: "service-requests",
    requiredElements: [
      "service",
      "proof",
      "team",
      "testimonial",
      "contact",
      "consultation",
    ],
    sectionOrder: [
      "Hero",
      "Services",
      "Features",
      "Testimonials",
      "Team",
      "Contact",
      "CTA",
    ],
    heroGuidance:
      "Refined prestige hero with Request consultation as the primary CTA.",
    ctaGuidance:
      "Primary CTA: Request consultation. Keep secondary CTAs low-pressure (View services).",
    trustElements: [
      "Select clients",
      "Credentials",
      "Outcomes",
      "Discretion cues",
    ],
    journeySteps: [
      "Prestige impression",
      "Understand offer",
      "Proof",
      "Consult",
    ],
    contentStructure: [
      "Positioning",
      "Services",
      "Proof",
      "Private contact",
    ],
  },
};

export function getIndustryConversionRules(
  industryId?: string | null,
): IndustryConversionRule {
  const raw = String(industryId || "").toLowerCase().trim();
  const id: IndustryId =
    raw === "healthcare"
      ? "clinic"
      : isIndustryId(raw)
        ? raw
        : "agency";
  return RULES[id] ?? RULES.agency;
}

export function listIndustryConversionRules(): IndustryConversionRule[] {
  return Object.values(RULES);
}
