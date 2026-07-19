/**
 * Production-ready section content for generated websites.
 * Used after professional component inject to replace generic scaffold copy.
 */

import type { IndustryCopyPack } from "@/lib/ai-core/content/industry-copy";

export type ContentCard = {
  title: string;
  body: string;
  cta?: string;
};

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  blurb: string;
  features: string[];
  featured?: boolean;
};

export type GalleryItem = {
  title: string;
  tag: string;
};

export type NavLink = {
  href: string;
  label: string;
};

export type ProductionContentPack = IndustryCopyPack & {
  heroEyebrow: string;
  brandTagline: string;
  servicesEyebrow: string;
  servicesTitle: string;
  servicesSubtitle: string;
  services: ContentCard[];
  featuresEyebrow: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: ContentCard[];
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonials: TestimonialItem[];
  faqEyebrow: string;
  faqTitle: string;
  faqSubtitle: string;
  faqs: FaqItem[];
  pricingEyebrow: string;
  pricingTitle: string;
  pricingSubtitle: string;
  pricing: PricingPlan[];
  galleryEyebrow: string;
  galleryTitle: string;
  gallerySubtitle: string;
  galleryItems: GalleryItem[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  contactTitle: string;
  contactSubtitle: string;
  navLinks: NavLink[];
  showcaseBullets: string[];
};

type IndustryExtras = {
  heroEyebrow: string;
  brandTagline: string;
  serviceTitles: [string, string, string];
  featureTitles: [string, string, string, string];
  featureBodies: [string, string, string, string];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  galleryItems: GalleryItem[];
  pricing: PricingPlan[];
  servicesEyebrow: string;
  servicesTitle: string;
  servicesSubtitle: string;
  featuresEyebrow: string;
  featuresTitle: string;
  featuresSubtitle: string;
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  faqEyebrow: string;
  faqTitle: string;
  faqSubtitle: string;
  pricingEyebrow: string;
  pricingTitle: string;
  pricingSubtitle: string;
  galleryEyebrow: string;
  galleryTitle: string;
  gallerySubtitle: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  contactTitle: string;
  contactSubtitle: string;
  navLinks: NavLink[];
  showcaseBullets: string[];
};

const EXTRAS: Record<string, IndustryExtras> = {
  saas: {
    heroEyebrow: "Modern SaaS platform",
    brandTagline: "Software built for clarity, speed, and measurable growth.",
    serviceTitles: ["Product workflows", "Automation", "Insights & reporting"],
    featureTitles: [
      "Ship faster",
      "Stay aligned",
      "Scale securely",
      "Measure what matters",
    ],
    featureBodies: [
      "Opinionated workflows that remove busywork and keep teams productive.",
      "Shared dashboards and roles so product, sales, and ops stay in sync.",
      "Enterprise-ready permissions, audit trails, and reliable uptime.",
      "Clear analytics that connect usage to revenue — not vanity charts.",
    ],
    testimonials: [
      {
        quote:
          "We replaced three tools with one workflow. Onboarding went from weeks to days.",
        name: "Maya Chen",
        role: "Head of Operations, Lattice Labs",
      },
      {
        quote: "The product feels premium — crisp UI, clear CTAs, zero fluff.",
        name: "Evan Brooks",
        role: "Founder, Orbitly",
      },
      {
        quote: "Our team adopted it in a week. Support was sharp and human.",
        name: "Priya Nair",
        role: "VP Product, Northwind",
      },
    ],
    faqs: [
      {
        q: "How long does onboarding take?",
        a: "Most teams are productive in under a week with guided setup and templates.",
      },
      {
        q: "Can we integrate with our stack?",
        a: "Yes — connect CRM, billing, and analytics via native integrations and webhooks.",
      },
      {
        q: "Is there a free trial?",
        a: "Start with a full-feature trial. Upgrade when you are ready to scale seats.",
      },
    ],
    galleryItems: [
      { title: "Command center", tag: "Product" },
      { title: "Automation canvas", tag: "Workflows" },
      { title: "Team dashboards", tag: "Insights" },
      { title: "Billing overview", tag: "Growth" },
      { title: "Role permissions", tag: "Security" },
      { title: "Mobile companion", tag: "Experience" },
    ],
    pricing: [
      {
        name: "Starter",
        price: "$49",
        blurb: "For early teams",
        features: ["Up to 5 seats", "Core workflows", "Email support"],
        featured: false,
      },
      {
        name: "Growth",
        price: "$149",
        blurb: "For scaling SaaS",
        features: [
          "Unlimited projects",
          "Automations",
          "Priority support",
          "Analytics suite",
        ],
        featured: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        blurb: "For complex orgs",
        features: ["SSO & audit logs", "Dedicated success", "Custom SLA"],
        featured: false,
      },
    ],
    servicesEyebrow: "Platform",
    servicesTitle: "Everything your team needs to move faster",
    servicesSubtitle:
      "Purpose-built modules that replace fragmented tools with one coherent product experience.",
    featuresEyebrow: "Capabilities",
    featuresTitle: "Designed like a premium SaaS product",
    featuresSubtitle:
      "Webflow-level polish with product clarity — hierarchy, motion, and conversion paths that feel intentional.",
    testimonialsEyebrow: "Customers",
    testimonialsTitle: "Loved by teams shipping serious software",
    testimonialsSubtitle:
      "Specific outcomes from founders and operators who care about craft.",
    faqEyebrow: "FAQ",
    faqTitle: "Answers before you book a demo",
    faqSubtitle: "Clear expectations on setup, integrations, and pricing.",
    pricingEyebrow: "Pricing",
    pricingTitle: "Simple plans. Serious product.",
    pricingSubtitle:
      "Transparent tiers with a recommended path for growing teams.",
    galleryEyebrow: "Product",
    galleryTitle: "A UI worth showing investors",
    gallerySubtitle:
      "High-fidelity product moments — not generic stock placeholders.",
    ctaEyebrow: "Get started",
    ctaTitle: "Ready to see it with your data?",
    ctaBody:
      "Book a personalized demo and leave with a clear rollout plan for your team.",
    contactTitle: "Talk to product specialists",
    contactSubtitle:
      "Tell us your stack and goals — we will map the fastest path to value.",
    navLinks: [
      { href: "#features", label: "Product" },
      { href: "#services", label: "Solutions" },
      { href: "#pricing", label: "Pricing" },
      { href: "#testimonials", label: "Customers" },
      { href: "#contact", label: "Contact" },
    ],
    showcaseBullets: [
      "Guided onboarding that gets teams productive in days",
      "Automations that replace spreadsheet busywork",
      "Security and roles built for modern SaaS buyers",
    ],
  },
  tourism: {
    heroEyebrow: "Curated travel experiences",
    brandTagline: "Journeys planned with local expertise and effortless booking.",
    serviceTitles: ["Guided tours", "Custom itineraries", "Travel concierge"],
    featureTitles: [
      "Handpicked destinations",
      "Transparent packages",
      "Local experts",
      "Flexible booking",
    ],
    featureBodies: [
      "Destinations chosen for atmosphere, access, and traveler fit — not generic lists.",
      "Clear inclusions, pacing, and seasonal notes before you commit.",
      "On-the-ground specialists who know the routes, meals, and hidden stops.",
      "Change dates with confidence and get human help when plans shift.",
    ],
    testimonials: [
      {
        quote:
          "Every day felt intentional. Logistics disappeared so we could actually travel.",
        name: "Elena Vargas",
        role: "Traveler, Lisbon → Madeira",
      },
      {
        quote: "The itinerary was ambitious but never rushed. Truly premium.",
        name: "Noah Kim",
        role: "Couple retreat, 2025",
      },
      {
        quote: "Booking was simple and support replied within minutes.",
        name: "Harper Cole",
        role: "Family trip planner",
      },
    ],
    faqs: [
      {
        q: "Are tours private or small-group?",
        a: "Both — choose private itineraries or curated small groups with transparent capacity.",
      },
      {
        q: "What is included in packages?",
        a: "Each package lists lodging, transfers, guided activities, and exclusions clearly.",
      },
      {
        q: "Can you customize dates?",
        a: "Yes. Share preferred windows and we will propose available departures.",
      },
    ],
    galleryItems: [
      { title: "Coastal mornings", tag: "Destination" },
      { title: "Mountain trails", tag: "Adventure" },
      { title: "City evenings", tag: "Culture" },
      { title: "Local kitchens", tag: "Culinary" },
      { title: "Boutique stays", tag: "Lodging" },
      { title: "Golden hour", tag: "Moments" },
    ],
    pricing: [
      {
        name: "Explorer",
        price: "$890",
        blurb: "Short escapes",
        features: ["3–4 days", "Guided highlights", "Local transfers"],
        featured: false,
      },
      {
        name: "Signature",
        price: "$1,890",
        blurb: "Most loved",
        features: [
          "7 days",
          "Boutique stays",
          "Private options",
          "Concierge chat",
        ],
        featured: true,
      },
      {
        name: "Bespoke",
        price: "Custom",
        blurb: "Fully tailored",
        features: ["Private guide", "Custom pacing", "VIP experiences"],
        featured: false,
      },
    ],
    servicesEyebrow: "Experiences",
    servicesTitle: "Travel designed around how you want to feel",
    servicesSubtitle:
      "From first inquiry to return flight — itineraries with clarity, taste, and local depth.",
    featuresEyebrow: "Why travelers choose us",
    featuresTitle: "Less logistics. More place.",
    featuresSubtitle:
      "Premium travel pages that sell the destination with editorial photography and honest details.",
    testimonialsEyebrow: "Stories",
    testimonialsTitle: "Trips people still talk about",
    testimonialsSubtitle: "Real travelers, specific memories, zero stock clichés.",
    faqEyebrow: "Planning",
    faqTitle: "Travel questions, answered",
    faqSubtitle: "What to expect before you reserve.",
    pricingEyebrow: "Packages",
    pricingTitle: "Journeys with clear value",
    pricingSubtitle: "Pick a starting point — customize from there.",
    galleryEyebrow: "Gallery",
    galleryTitle: "Places worth the journey",
    gallerySubtitle: "Editorial frames that feel like a travel magazine, not a brochure.",
    ctaEyebrow: "Plan your trip",
    ctaTitle: "Tell us where you want to go",
    ctaBody:
      "Share dates and style — we will propose destinations and packages that fit.",
    contactTitle: "Speak with a travel advisor",
    contactSubtitle: "Human guidance for itineraries, seasons, and group needs.",
    navLinks: [
      { href: "#gallery", label: "Destinations" },
      { href: "#services", label: "Tours" },
      { href: "#pricing", label: "Packages" },
      { href: "#testimonials", label: "Stories" },
      { href: "#booking", label: "Book" },
    ],
    showcaseBullets: [
      "Transparent itineraries with seasonal timing notes",
      "Boutique lodging and trusted local partners",
      "Responsive advisors before and during travel",
    ],
  },
  restaurant: {
    heroEyebrow: "Dining destination",
    brandTagline: "Seasonal cooking, warm hospitality, and tables worth reserving.",
    serviceTitles: ["Dining room", "Private events", "Catering"],
    featureTitles: [
      "Seasonal menus",
      "Thoughtful service",
      "Atmosphere",
      "Easy reservations",
    ],
    featureBodies: [
      "Menus that change with the market while keeping signature dishes guests return for.",
      "Hosts and servers who anticipate without hovering.",
      "Lighting, pacing, and music tuned for conversation and celebration.",
      "Reserve online in minutes with instant confirmation.",
    ],
    testimonials: [
      {
        quote: "Anniversary dinner done right — food, pacing, and warmth.",
        name: "Claire & Tom",
        role: "Guests",
      },
      {
        quote: "The tasting menu was inventive without being precious.",
        name: "Diego Alvarez",
        role: "Food writer",
      },
      {
        quote: "Private dining for our team offsite was flawless.",
        name: "Nina Park",
        role: "People Ops Lead",
      },
    ],
    faqs: [
      {
        q: "Do you take walk-ins?",
        a: "Limited walk-ins when available. Reservations are recommended for weekends.",
      },
      {
        q: "Is there a vegetarian menu?",
        a: "Yes — seasonal vegetarian plates and modifications available on request.",
      },
      {
        q: "Can we host private events?",
        a: "Private dining and buyouts are available. Share your date and guest count.",
      },
    ],
    galleryItems: [
      { title: "Signature plate", tag: "Kitchen" },
      { title: "Dining room", tag: "Atmosphere" },
      { title: "Seasonal special", tag: "Menu" },
      { title: "Bar craft", tag: "Drinks" },
      { title: "Private room", tag: "Events" },
      { title: "Dessert course", tag: "Finale" },
    ],
    pricing: [
      {
        name: "Weeknight",
        price: "À la carte",
        blurb: "Relaxed dining",
        features: ["Full menu", "Bar seats", "Same-day booking"],
        featured: false,
      },
      {
        name: "Tasting",
        price: "$95",
        blurb: "Chef’s path",
        features: ["5–7 courses", "Wine pairings", "Priority seating"],
        featured: true,
      },
      {
        name: "Private",
        price: "Custom",
        blurb: "Events & groups",
        features: ["Dedicated room", "Custom menu", "Event host"],
        featured: false,
      },
    ],
    servicesEyebrow: "Experience",
    servicesTitle: "More than a reservation",
    servicesSubtitle:
      "From weeknight dinners to celebrations — hospitality with intention.",
    featuresEyebrow: "The house",
    featuresTitle: "What guests remember",
    featuresSubtitle: "Food, room, and service that read as premium — never template-y.",
    testimonialsEyebrow: "Guests",
    testimonialsTitle: "Tables that earn return visits",
    testimonialsSubtitle: "Notes from diners who notice the details.",
    faqEyebrow: "Before you visit",
    faqTitle: "Common questions",
    faqSubtitle: "Hours, dietary needs, and private dining.",
    pricingEyebrow: "Menus",
    pricingTitle: "Ways to dine with us",
    pricingSubtitle: "Choose the experience that fits the occasion.",
    galleryEyebrow: "Kitchen & room",
    galleryTitle: "A visual taste",
    gallerySubtitle: "Plates and spaces photographed with editorial restraint.",
    ctaEyebrow: "Reserve",
    ctaTitle: "Save your table",
    ctaBody: "Weekend seats go quickly — reserve now and we will confirm instantly.",
    contactTitle: "Host your evening with us",
    contactSubtitle: "Questions about allergies, groups, or private dining? Reach out.",
    navLinks: [
      { href: "#services", label: "Menu" },
      { href: "#gallery", label: "Gallery" },
      { href: "#testimonials", label: "Guests" },
      { href: "#booking", label: "Reserve" },
      { href: "#contact", label: "Contact" },
    ],
    showcaseBullets: [
      "Chef-driven seasonal menus with signature plates",
      "Private dining for milestones and teams",
      "Reservations confirmed in minutes",
    ],
  },
  "real-estate": {
    heroEyebrow: "Property advisory",
    brandTagline: "Listings, guidance, and a clear path from inquiry to keys.",
    serviceTitles: ["Buy with clarity", "Sell with strategy", "Invest with insight"],
    featureTitles: [
      "Verified listings",
      "Local market notes",
      "Viewings on your schedule",
      "Negotiation support",
    ],
    featureBodies: [
      "Homes screened for quality, location fit, and transparent details.",
      "Neighborhood context that helps you decide with confidence.",
      "Virtual or in-person tours arranged around your calendar.",
      "Offers and counteroffers handled with calm, data-backed advice.",
    ],
    testimonials: [
      {
        quote: "We found the right home without the usual pressure tactics.",
        name: "The Morales family",
        role: "Buyers",
      },
      {
        quote: "Listing photos and copy actually matched the property.",
        name: "Helen Grant",
        role: "Seller",
      },
      {
        quote: "Investment screening saved us from a costly mistake.",
        name: "Omar Siddiq",
        role: "Investor",
      },
    ],
    faqs: [
      {
        q: "How fast can we schedule a viewing?",
        a: "Most viewings can be arranged within 24–48 hours, including virtual options.",
      },
      {
        q: "Do you help with financing partners?",
        a: "Yes — we introduce trusted lenders without locking you into a single path.",
      },
      {
        q: "What areas do you cover?",
        a: "Primary coverage is listed on each property. Ask us about neighboring markets.",
      },
    ],
    galleryItems: [
      { title: "Living spaces", tag: "Interior" },
      { title: "Neighborhood", tag: "Location" },
      { title: "Kitchens", tag: "Detail" },
      { title: "Outdoor", tag: "Lifestyle" },
      { title: "Facades", tag: "Architecture" },
      { title: "City light", tag: "Atmosphere" },
    ],
    pricing: [
      {
        name: "Buyer advisory",
        price: "Included",
        blurb: "Search & offer",
        features: ["Listing shortlist", "Viewings", "Offer strategy"],
        featured: false,
      },
      {
        name: "Seller suite",
        price: "Market",
        blurb: "Full listing",
        features: ["Photography", "Staging notes", "Negotiation"],
        featured: true,
      },
      {
        name: "Investor desk",
        price: "Custom",
        blurb: "Portfolio focus",
        features: ["Yield screening", "Comparables", "Off-market alerts"],
        featured: false,
      },
    ],
    servicesEyebrow: "Services",
    servicesTitle: "Real estate without the noise",
    servicesSubtitle:
      "Clear process, honest pricing context, and homes photographed to convert interest into inquiries.",
    featuresEyebrow: "Advantage",
    featuresTitle: "Built for serious buyers and sellers",
    featuresSubtitle: "Premium listing pages with proof, not filler.",
    testimonialsEyebrow: "Clients",
    testimonialsTitle: "Moves that felt well managed",
    testimonialsSubtitle: "Feedback from people who closed with confidence.",
    faqEyebrow: "FAQ",
    faqTitle: "Before you inquire",
    faqSubtitle: "Process, timing, and coverage.",
    pricingEyebrow: "Engagement",
    pricingTitle: "How we work together",
    pricingSubtitle: "Transparent scopes for buying, selling, and investing.",
    galleryEyebrow: "Properties",
    galleryTitle: "Spaces that photograph beautifully",
    gallerySubtitle: "Architecture and lifestyle frames that feel editorial.",
    ctaEyebrow: "Next step",
    ctaTitle: "Request a valuation or shortlist",
    ctaBody: "Share your goals and timeline — we respond the same day.",
    contactTitle: "Connect with an advisor",
    contactSubtitle: "Buying, selling, or investing — tell us what you need.",
    navLinks: [
      { href: "#gallery", label: "Listings" },
      { href: "#services", label: "Services" },
      { href: "#testimonials", label: "Clients" },
      { href: "#contact", label: "Inquire" },
    ],
    showcaseBullets: [
      "Verified listings with clear neighborhood context",
      "Viewings scheduled around your calendar",
      "Negotiation support grounded in local comps",
    ],
  },
  ecommerce: {
    heroEyebrow: "Premium commerce",
    brandTagline: "Collections, offers, and checkout that feel effortless.",
    serviceTitles: ["Curated collections", "Secure checkout", "Care & returns"],
    featureTitles: [
      "Product storytelling",
      "Fast discovery",
      "Trusted checkout",
      "Order clarity",
    ],
    featureBodies: [
      "Hero product moments with benefits that read in seconds.",
      "Collections organized for browsing — not endless filters.",
      "Payments and shipping timelines stated without fine-print surprises.",
      "Tracking and support that resolve questions quickly.",
    ],
    testimonials: [
      {
        quote: "Packaging and product quality matched the site promise.",
        name: "Riley Stone",
        role: "Customer",
      },
      {
        quote: "Checkout was the smoothest I have used this year.",
        name: "Amelia Cho",
        role: "Repeat buyer",
      },
      {
        quote: "Returns were clear — no scavenger hunt for policies.",
        name: "Ben Torres",
        role: "Customer",
      },
    ],
    faqs: [
      {
        q: "How long is shipping?",
        a: "Standard delivery timelines are shown at checkout by region.",
      },
      {
        q: "What is your return window?",
        a: "Most items can be returned within 30 days in original condition.",
      },
      {
        q: "Do you ship internationally?",
        a: "Select regions are supported. Check shipping options at checkout.",
      },
    ],
    galleryItems: [
      { title: "Hero product", tag: "Featured" },
      { title: "New arrivals", tag: "Collection" },
      { title: "Lifestyle", tag: "Lookbook" },
      { title: "Detail craft", tag: "Quality" },
      { title: "Gift edit", tag: "Seasonal" },
      { title: "Unboxing", tag: "Experience" },
    ],
    pricing: [
      {
        name: "Essentials",
        price: "From $28",
        blurb: "Everyday favorites",
        features: ["Core collection", "Free returns*", "Member notes"],
        featured: false,
      },
      {
        name: "Signature",
        price: "From $68",
        blurb: "Bestsellers",
        features: ["Limited drops", "Priority shipping", "Gift wrap"],
        featured: true,
      },
      {
        name: "Studio",
        price: "Custom",
        blurb: "Wholesale / bulk",
        features: ["Volume pricing", "Dedicated buyer", "Sample kits"],
        featured: false,
      },
    ],
    servicesEyebrow: "Shop",
    servicesTitle: "Commerce that feels premium",
    servicesSubtitle:
      "Product pages and collections designed to convert without aggressive dark patterns.",
    featuresEyebrow: "Why shop here",
    featuresTitle: "Details customers notice",
    featuresSubtitle: "Clarity, photography, and trust signals that feel Webflow-polished.",
    testimonialsEyebrow: "Reviews",
    testimonialsTitle: "What buyers say after delivery",
    testimonialsSubtitle: "Specific praise — not anonymous five-star spam.",
    faqEyebrow: "Help",
    faqTitle: "Shipping, returns, and more",
    faqSubtitle: "Answers that reduce cart abandonment.",
    pricingEyebrow: "Collections",
    pricingTitle: "Start with a tier that fits",
    pricingSubtitle: "From essentials to signature drops.",
    galleryEyebrow: "Lookbook",
    galleryTitle: "Products in context",
    gallerySubtitle: "Lifestyle photography that sells the feeling, not just the SKU.",
    ctaEyebrow: "Shop",
    ctaTitle: "Find your next favorite",
    ctaBody: "Browse featured collections or jump straight to current offers.",
    contactTitle: "Need help with an order?",
    contactSubtitle: "Customer care responds quickly with clear next steps.",
    navLinks: [
      { href: "#product", label: "Shop" },
      { href: "#gallery", label: "Lookbook" },
      { href: "#pricing", label: "Offers" },
      { href: "#testimonials", label: "Reviews" },
      { href: "#contact", label: "Support" },
    ],
    showcaseBullets: [
      "Collections refreshed with seasonal bestsellers",
      "Secure checkout with clear shipping timelines",
      "Support that resolves order questions quickly",
    ],
  },
  automotive: {
    heroEyebrow: "Dealership experience",
    brandTagline: "Inventory, test drives, and ownership support without pressure.",
    serviceTitles: ["Inventory search", "Test drives", "Service plans"],
    featureTitles: [
      "Transparent specs",
      "Honest pricing",
      "Flexible test drives",
      "Ownership care",
    ],
    featureBodies: [
      "Vehicle details presented clearly — trim, mileage, and history.",
      "Pricing conversations grounded in listed offers, not surprises.",
      "Book on-site or delivery test drives around your schedule.",
      "Maintenance plans that keep ownership predictable.",
    ],
    testimonials: [
      {
        quote: "No pressure sales — just clear inventory and a great drive.",
        name: "Marcus Reed",
        role: "Buyer",
      },
      {
        quote: "Financing options were explained in plain language.",
        name: "Sofia Lang",
        role: "First-time buyer",
      },
      {
        quote: "Service scheduling online actually worked.",
        name: "Chris Nolan",
        role: "Owner",
      },
    ],
    faqs: [
      {
        q: "Can I book a test drive online?",
        a: "Yes — pick a vehicle and preferred time. We confirm shortly after.",
      },
      {
        q: "Do you offer certified pre-owned?",
        a: "Yes. CPO vehicles include inspection notes and warranty details.",
      },
      {
        q: "Is trade-in available?",
        a: "Bring your vehicle or share details online for an estimate.",
      },
    ],
    galleryItems: [
      { title: "Showroom", tag: "Floor" },
      { title: "Exterior lines", tag: "Design" },
      { title: "Cabin detail", tag: "Interior" },
      { title: "Night drive", tag: "Experience" },
      { title: "Service bay", tag: "Care" },
      { title: "Delivery day", tag: "Owners" },
    ],
    pricing: [
      {
        name: "Retail",
        price: "MSRP",
        blurb: "New inventory",
        features: ["Full warranty", "Delivery options", "Advisor support"],
        featured: false,
      },
      {
        name: "CPO",
        price: "Inspected",
        blurb: "Certified pre-owned",
        features: ["Multi-point check", "History report", "Limited warranty"],
        featured: true,
      },
      {
        name: "Service",
        price: "Plans",
        blurb: "Ownership",
        features: ["Scheduled care", "Loaner options", "Priority booking"],
        featured: false,
      },
    ],
    servicesEyebrow: "Dealership",
    servicesTitle: "Find the vehicle that fits your life",
    servicesSubtitle:
      "Browse inventory with clarity, book a drive, and get ownership support that lasts.",
    featuresEyebrow: "Why us",
    featuresTitle: "A modern buying experience",
    featuresSubtitle: "Premium automotive storytelling with decisive next steps.",
    testimonialsEyebrow: "Owners",
    testimonialsTitle: "Drivers who appreciated the process",
    testimonialsSubtitle: "Honest feedback from recent buyers.",
    faqEyebrow: "FAQ",
    faqTitle: "Buying & service questions",
    faqSubtitle: "Test drives, CPO, and trade-ins.",
    pricingEyebrow: "Paths",
    pricingTitle: "Ways to buy and own",
    pricingSubtitle: "Retail, certified, and service engagements.",
    galleryEyebrow: "Showroom",
    galleryTitle: "Vehicles in their best light",
    gallerySubtitle: "Photography that feels cinematic, not catalog-flat.",
    ctaEyebrow: "Visit",
    ctaTitle: "Book a test drive today",
    ctaBody: "Choose a vehicle and time — we will confirm and prepare the keys.",
    contactTitle: "Talk to an advisor",
    contactSubtitle: "Inventory questions, financing, or service — we are here.",
    navLinks: [
      { href: "#product", label: "Inventory" },
      { href: "#services", label: "Services" },
      { href: "#gallery", label: "Gallery" },
      { href: "#contact", label: "Contact" },
    ],
    showcaseBullets: [
      "Transparent vehicle specs and history notes",
      "Test drives scheduled around your day",
      "Service plans that keep ownership predictable",
    ],
  },
  clinic: {
    heroEyebrow: "Patient-centered care",
    brandTagline: "Expert clinicians, clear plans, and booking that respects your time.",
    serviceTitles: ["Consultations", "Specialized care", "Follow-up pathways"],
    featureTitles: [
      "Clear explanations",
      "Modern facilities",
      "Easy booking",
      "Continuity of care",
    ],
    featureBodies: [
      "Treatment plans explained in language patients understand.",
      "Clean, calm spaces designed for trust and comfort.",
      "Online booking with reminders and preferred time windows.",
      "Follow-ups that feel coordinated — not one-off visits.",
    ],
    testimonials: [
      {
        quote: "I finally understood my options without feeling rushed.",
        name: "Janet Moore",
        role: "Patient",
      },
      {
        quote: "Booking and reminders made the whole visit easier.",
        name: "Luis Ortega",
        role: "Patient",
      },
      {
        quote: "The team followed up after treatment — that mattered.",
        name: "Aisha Rahman",
        role: "Patient",
      },
    ],
    faqs: [
      {
        q: "How do I prepare for my first visit?",
        a: "Bring ID, insurance details if applicable, and a list of current medications.",
      },
      {
        q: "Do you accept new patients?",
        a: "Yes — new patient appointments are available most weeks.",
      },
      {
        q: "Is telehealth offered?",
        a: "Select visit types support telehealth. Ask when booking.",
      },
    ],
    galleryItems: [
      { title: "Reception", tag: "Clinic" },
      { title: "Care team", tag: "People" },
      { title: "Treatment room", tag: "Care" },
      { title: "Diagnostics", tag: "Technology" },
      { title: "Waiting lounge", tag: "Comfort" },
      { title: "Follow-up", tag: "Journey" },
    ],
    pricing: [
      {
        name: "Consultation",
        price: "From $120",
        blurb: "First visit",
        features: ["Assessment", "Care plan", "Next steps"],
        featured: false,
      },
      {
        name: "Care package",
        price: "Custom",
        blurb: "Ongoing",
        features: ["Follow-ups", "Care coordination", "Priority booking"],
        featured: true,
      },
      {
        name: "Specialist",
        price: "Varies",
        blurb: "Advanced care",
        features: ["Referral path", "Specialist consult", "Treatment plan"],
        featured: false,
      },
    ],
    servicesEyebrow: "Care",
    servicesTitle: "Services designed around patients",
    servicesSubtitle:
      "Healthcare pages that feel calm, credible, and easy to act on.",
    featuresEyebrow: "Why patients stay",
    featuresTitle: "Trust you can see",
    featuresSubtitle: "Premium clinic presentation without clinical coldness.",
    testimonialsEyebrow: "Patients",
    testimonialsTitle: "Experiences that build confidence",
    testimonialsSubtitle: "Voices from people who felt heard.",
    faqEyebrow: "Visiting us",
    faqTitle: "Patient questions",
    faqSubtitle: "Preparation, new patients, and telehealth.",
    pricingEyebrow: "Care options",
    pricingTitle: "Transparent starting points",
    pricingSubtitle: "Discuss final fees during consultation.",
    galleryEyebrow: "Clinic",
    galleryTitle: "Spaces built for calm",
    gallerySubtitle: "Facility photography that communicates care and cleanliness.",
    ctaEyebrow: "Appointments",
    ctaTitle: "Book your visit",
    ctaBody: "Choose a time that works — confirmations and reminders included.",
    contactTitle: "Contact the care team",
    contactSubtitle: "Questions about services or insurance? Message us.",
    navLinks: [
      { href: "#services", label: "Services" },
      { href: "#features", label: "Care" },
      { href: "#testimonials", label: "Patients" },
      { href: "#booking", label: "Book" },
      { href: "#contact", label: "Contact" },
    ],
    showcaseBullets: [
      "Consultations with clear, understandable plans",
      "Online booking with confirmation reminders",
      "Follow-up pathways designed for continuity",
    ],
  },
  education: {
    heroEyebrow: "Outcome-focused learning",
    brandTagline: "Programs, mentors, and a clear path from enrollment to results.",
    serviceTitles: ["Career programs", "Flexible formats", "Admissions support"],
    featureTitles: [
      "Practical curriculum",
      "Mentor feedback",
      "Flexible schedules",
      "Career outcomes",
    ],
    featureBodies: [
      "Projects and assessments tied to real job skills.",
      "Instructors who review work with actionable notes.",
      "Evening and cohort options for working professionals.",
      "Portfolio and placement support after completion.",
    ],
    testimonials: [
      {
        quote: "I shipped a portfolio project that actually got interview callbacks.",
        name: "Dev Patel",
        role: "Graduate",
      },
      {
        quote: "The pacing respected that I work full time.",
        name: "Sara Nguyen",
        role: "Student",
      },
      {
        quote: "Admissions made requirements and deadlines crystal clear.",
        name: "Leo Martins",
        role: "Applicant",
      },
    ],
    faqs: [
      {
        q: "What are the admission requirements?",
        a: "Requirements vary by program and are listed on each program page.",
      },
      {
        q: "Are there scholarships?",
        a: "Limited scholarships and payment plans may be available — ask admissions.",
      },
      {
        q: "Is the program online or in person?",
        a: "Formats vary. Filter programs by delivery mode that fits your life.",
      },
    ],
    galleryItems: [
      { title: "Studio work", tag: "Projects" },
      { title: "Cohort sessions", tag: "Learning" },
      { title: "Mentor reviews", tag: "Feedback" },
      { title: "Campus moments", tag: "Community" },
      { title: "Demo day", tag: "Outcomes" },
      { title: "Career labs", tag: "Growth" },
    ],
    pricing: [
      {
        name: "Foundation",
        price: "$490",
        blurb: "Short courses",
        features: ["4–6 weeks", "Core skills", "Community access"],
        featured: false,
      },
      {
        name: "Professional",
        price: "$2,400",
        blurb: "Career track",
        features: ["Mentor reviews", "Portfolio labs", "Career support"],
        featured: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        blurb: "Teams",
        features: ["Cohort for teams", "Custom syllabus", "Reporting"],
        featured: false,
      },
    ],
    servicesEyebrow: "Programs",
    servicesTitle: "Learn with a finish line in mind",
    servicesSubtitle:
      "Education marketing that sells outcomes — not vague inspiration.",
    featuresEyebrow: "Approach",
    featuresTitle: "Built for real progress",
    featuresSubtitle: "Premium academic branding with practical proof.",
    testimonialsEyebrow: "Alumni",
    testimonialsTitle: "Results students can point to",
    testimonialsSubtitle: "Stories tied to portfolios, jobs, and confidence.",
    faqEyebrow: "Admissions",
    faqTitle: "Before you apply",
    faqSubtitle: "Requirements, funding, and formats.",
    pricingEyebrow: "Tuition",
    pricingTitle: "Programs at a glance",
    pricingSubtitle: "Transparent starting points — confirm details with admissions.",
    galleryEyebrow: "Campus",
    galleryTitle: "Learning in motion",
    gallerySubtitle: "Student work and community moments that feel authentic.",
    ctaEyebrow: "Apply",
    ctaTitle: "Start your application",
    ctaBody: "Explore programs and submit interest — admissions follows up quickly.",
    contactTitle: "Talk to admissions",
    contactSubtitle: "Questions about fit, deadlines, or scholarships? Ask us.",
    navLinks: [
      { href: "#services", label: "Programs" },
      { href: "#features", label: "Approach" },
      { href: "#pricing", label: "Tuition" },
      { href: "#testimonials", label: "Alumni" },
      { href: "#contact", label: "Apply" },
    ],
    showcaseBullets: [
      "Career-focused curricula with mentor feedback",
      "Flexible formats for working professionals",
      "Admissions support with clear next steps",
    ],
  },
  agency: {
    heroEyebrow: "Creative partnership",
    brandTagline: "Strategy, design, and campaigns that look premium and perform.",
    serviceTitles: ["Brand systems", "Digital experiences", "Growth campaigns"],
    featureTitles: [
      "Strategic clarity",
      "Design craft",
      "Measurable launches",
      "Collaborative delivery",
    ],
    featureBodies: [
      "Positioning and messaging that executives can approve quickly.",
      "Interfaces and identities with Webflow-level polish.",
      "Launches tracked against KPIs — not vanity metrics.",
      "Milestones, reviews, and accountable project rhythm.",
    ],
    testimonials: [
      {
        quote: "They elevated our brand without losing what made us us.",
        name: "Ivy Laurent",
        role: "CMO, Atelier Nine",
      },
      {
        quote: "Delivery was crisp — milestones, reviews, no mystery.",
        name: "Jonah Blake",
        role: "Founder, Fieldwork",
      },
      {
        quote: "The site converts better and finally looks like our product.",
        name: "Tina Cho",
        role: "Product Lead",
      },
    ],
    faqs: [
      {
        q: "What does a typical engagement look like?",
        a: "Discovery, creative direction, production, and launch with clear milestones.",
      },
      {
        q: "Do you work with startups and enterprises?",
        a: "Yes — scopes adapt to stage, from brand foundations to multi-market campaigns.",
      },
      {
        q: "How do you measure success?",
        a: "We agree KPIs up front: conversion, engagement, brand lift, or launch velocity.",
      },
    ],
    galleryItems: [
      { title: "Brand system", tag: "Identity" },
      { title: "Product launch", tag: "Digital" },
      { title: "Campaign film", tag: "Motion" },
      { title: "Editorial site", tag: "Web" },
      { title: "Packaging", tag: "Physical" },
      { title: "Event world", tag: "Experience" },
    ],
    pricing: [
      {
        name: "Sprint",
        price: "$8k",
        blurb: "Focused push",
        features: ["2–3 weeks", "One core deliverable", "Async reviews"],
        featured: false,
      },
      {
        name: "Retainer",
        price: "$18k/mo",
        blurb: "Ongoing craft",
        features: ["Dedicated pod", "Priority slots", "Monthly roadmap"],
        featured: true,
      },
      {
        name: "Flagship",
        price: "Custom",
        blurb: "Major launches",
        features: ["Full brand + web", "Campaign system", "Executive workshops"],
        featured: false,
      },
    ],
    servicesEyebrow: "Capabilities",
    servicesTitle: "Creative work that grows brands",
    servicesSubtitle:
      "Agency sites that feel like case-study quality — not template filler.",
    featuresEyebrow: "Method",
    featuresTitle: "Craft with accountability",
    featuresSubtitle: "Premium process storytelling for sophisticated buyers.",
    testimonialsEyebrow: "Clients",
    testimonialsTitle: "Partnerships that raised the bar",
    testimonialsSubtitle: "Leaders who value pace and taste.",
    faqEyebrow: "Working together",
    faqTitle: "Engagement questions",
    faqSubtitle: "Scopes, stages, and success metrics.",
    pricingEyebrow: "Engagements",
    pricingTitle: "Ways to start",
    pricingSubtitle: "From focused sprints to flagship launches.",
    galleryEyebrow: "Selected work",
    galleryTitle: "Proof in the portfolio",
    gallerySubtitle: "A mosaic of brand, product, and campaign craft.",
    ctaEyebrow: "Start a project",
    ctaTitle: "Tell us what you are building",
    ctaBody: "Share goals and timeline — we will propose a clear engagement plan.",
    contactTitle: "Start the conversation",
    contactSubtitle: "Briefs welcome. Ambition required.",
    navLinks: [
      { href: "#gallery", label: "Work" },
      { href: "#services", label: "Services" },
      { href: "#features", label: "Method" },
      { href: "#pricing", label: "Engage" },
      { href: "#contact", label: "Contact" },
    ],
    showcaseBullets: [
      "Brand systems built for clarity and conversion",
      "Campaigns consistent across channels",
      "Delivery with milestones and measurable KPIs",
    ],
  },
  business: {
    heroEyebrow: "Professional presence",
    brandTagline:
      "Clear messaging and conversion-focused pages that earn trust quickly.",
    serviceTitles: ["Core services", "Proof & process", "Responsive follow-up"],
    featureTitles: [
      "Clear offer",
      "Premium presentation",
      "Conversion paths",
      "Trusted contact",
    ],
    featureBodies: [
      "Explain what you do and who you help without jargon.",
      "Typography, spacing, and imagery that feel established.",
      "CTAs that guide visitors to the next decisive step.",
      "Forms and contact paths that get answered.",
    ],
    testimonials: [
      {
        quote: "We finally look as professional as the work we deliver.",
        name: "Andrea Wells",
        role: "Owner, Wells Advisory",
      },
      {
        quote: "Inquiries went up after the redesign — messaging is clearer.",
        name: "Kevin Zhao",
        role: "Managing Partner",
      },
      {
        quote: "Clients comment on the site before meetings now.",
        name: "Ruth Okonkwo",
        role: "Consultant",
      },
    ],
    faqs: [
      {
        q: "How soon can we launch?",
        a: "Most first versions ship quickly once messaging and assets are aligned.",
      },
      {
        q: "Can we update content ourselves?",
        a: "Yes — structured sections make ongoing edits straightforward.",
      },
      {
        q: "Do you support bilingual sites?",
        a: "Language options can be configured during generation and refinement.",
      },
    ],
    galleryItems: [
      { title: "Brand moment", tag: "Identity" },
      { title: "Service story", tag: "Offer" },
      { title: "Team", tag: "People" },
      { title: "Process", tag: "Delivery" },
      { title: "Results", tag: "Proof" },
      { title: "Contact", tag: "Next step" },
    ],
    pricing: [
      {
        name: "Essential",
        price: "$1,200",
        blurb: "Launch ready",
        features: ["Core pages", "Contact path", "Mobile polish"],
        featured: false,
      },
      {
        name: "Growth",
        price: "$2,800",
        blurb: "Recommended",
        features: ["Expanded sections", "Proof blocks", "CTA system"],
        featured: true,
      },
      {
        name: "Custom",
        price: "Quote",
        blurb: "Complex needs",
        features: ["Custom components", "Integrations", "Ongoing support"],
        featured: false,
      },
    ],
    servicesEyebrow: "Services",
    servicesTitle: "What we deliver for clients",
    servicesSubtitle:
      "Plain-language offerings with outcomes — ready for a premium business site.",
    featuresEyebrow: "Why us",
    featuresTitle: "A presence that earns trust",
    featuresSubtitle: "Webflow-caliber spacing, type, and hierarchy for serious brands.",
    testimonialsEyebrow: "Clients",
    testimonialsTitle: "Businesses that raised their standard",
    testimonialsSubtitle: "Specific results from professional services teams.",
    faqEyebrow: "FAQ",
    faqTitle: "Common questions",
    faqSubtitle: "Launch timing, edits, and languages.",
    pricingEyebrow: "Packages",
    pricingTitle: "Simple engagement options",
    pricingSubtitle: "Start lean or go deeper — both look premium.",
    galleryEyebrow: "Studio",
    galleryTitle: "Moments from the work",
    gallerySubtitle: "Visual proof that feels editorial and intentional.",
    ctaEyebrow: "Next step",
    ctaTitle: "Ready to look established online?",
    ctaBody: "Share your goals — we will propose a clear path and timeline.",
    contactTitle: "Request a quote",
    contactSubtitle: "Tell us about your business and we will respond promptly.",
    navLinks: [
      { href: "#services", label: "Services" },
      { href: "#features", label: "Why us" },
      { href: "#pricing", label: "Packages" },
      { href: "#testimonials", label: "Clients" },
      { href: "#contact", label: "Contact" },
    ],
    showcaseBullets: [
      "Services explained with outcomes, not jargon",
      "Proof points that reduce hesitation for new clients",
      "Contact paths designed for fast follow-up",
    ],
  },
};

function getExtras(industryId: string): IndustryExtras {
  return EXTRAS[industryId] ?? EXTRAS.business;
}

/**
 * Expand an industry copy pack into full production section content.
 */
export function buildProductionContentPack(
  pack: IndustryCopyPack,
  brandName?: string | null,
): ProductionContentPack {
  const extras = getExtras(String(pack.industryId));
  const brand = brandName?.trim() || "Brand";
  const ctas = [pack.primaryCta, "Learn more", pack.secondaryCta];

  const services: ContentCard[] = extras.serviceTitles.map((title, i) => ({
    title,
    body: pack.serviceDescriptions[i] || extras.featureBodies[i] || pack.trustLine,
    cta: ctas[i] || pack.primaryCta,
  }));

  const features: ContentCard[] = extras.featureTitles.map((title, i) => ({
    title,
    body: extras.featureBodies[i],
  }));

  const personalizedTestimonials = extras.testimonials.map((t, i) =>
    i === 0
      ? {
          ...t,
          quote: t.quote.includes(brand)
            ? t.quote
            : t.quote.replace(/\.$/, ` — working with ${brand}.`),
        }
      : t,
  );

  return {
    ...pack,
    heroEyebrow: extras.heroEyebrow,
    brandTagline: extras.brandTagline,
    servicesEyebrow: extras.servicesEyebrow,
    servicesTitle: extras.servicesTitle,
    servicesSubtitle: extras.servicesSubtitle,
    services,
    featuresEyebrow: extras.featuresEyebrow,
    featuresTitle: extras.featuresTitle,
    featuresSubtitle: extras.featuresSubtitle,
    features,
    testimonialsEyebrow: extras.testimonialsEyebrow,
    testimonialsTitle: extras.testimonialsTitle,
    testimonialsSubtitle: extras.testimonialsSubtitle,
    testimonials: personalizedTestimonials,
    faqEyebrow: extras.faqEyebrow,
    faqTitle: extras.faqTitle,
    faqSubtitle: extras.faqSubtitle,
    faqs: extras.faqs,
    pricingEyebrow: extras.pricingEyebrow,
    pricingTitle: extras.pricingTitle,
    pricingSubtitle: extras.pricingSubtitle,
    pricing: extras.pricing,
    galleryEyebrow: extras.galleryEyebrow,
    galleryTitle: extras.galleryTitle,
    gallerySubtitle: extras.gallerySubtitle,
    galleryItems: extras.galleryItems,
    ctaEyebrow: extras.ctaEyebrow,
    ctaTitle: extras.ctaTitle.replace("it", brand).includes(brand)
      ? extras.ctaTitle
      : extras.ctaTitle,
    ctaBody: extras.ctaBody,
    contactTitle: extras.contactTitle,
    contactSubtitle: extras.contactSubtitle,
    navLinks: extras.navLinks,
    showcaseBullets: extras.showcaseBullets,
  };
}
