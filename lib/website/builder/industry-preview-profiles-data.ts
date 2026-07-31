/**
 * Per-TI preview copy packs — industry-authentic headlines, CTAs, and nav labels.
 */
import type { IndustryPreviewProfile } from "@/lib/website/builder/industry-preview-profiles";

const PROFILES: Record<string, IndustryPreviewProfile> = {
  "ti-corporate-trust": {
    heroEyebrow: "Trusted since day one",
    heroHeadlineTemplate: "{brand} — clarity for complex decisions",
    heroSubheadline:
      "Enterprise-grade consulting with transparent process, senior expertise, and outcomes you can measure.",
    primaryCta: "Schedule consultation",
    secondaryCta: "View capabilities",
    heroLayout: "split",
    navLinkLabels: ["About", "Services", "Insights", "Contact"],
    contentBlocks: [
      "Strategic advisory across operations, finance, and digital transformation.",
      "Dedicated partner teams with industry-specific playbooks.",
      "Governance-ready reporting and stakeholder communication.",
    ],
  },
  "ti-consulting-clarity": {
    heroEyebrow: "Global enterprise",
    heroHeadlineTemplate: "{brand} scales with your ambition",
    heroSubheadline:
      "Capability matrices, stakeholder alignment, and execution at enterprise velocity.",
    primaryCta: "Request briefing",
    secondaryCta: "Explore solutions",
    heroLayout: "split",
    navLinkLabels: ["About", "Solutions", "Industries", "Contact"],
    contentBlocks: [
      "Operating model design for multi-region organizations.",
      "Change management with measurable adoption metrics.",
      "Executive workshops and board-ready deliverables.",
    ],
  },
  "ti-saas-growth": {
    heroEyebrow: "Ship faster",
    heroHeadlineTemplate: "{brand} turns ideas into recurring revenue",
    heroSubheadline:
      "Modern product infrastructure with conversion-optimized flows and analytics built in.",
    primaryCta: "Start free trial",
    secondaryCta: "Book a demo",
    heroLayout: "dashboard",
    navLinkLabels: ["Features", "Pricing", "Customers", "Contact"],
    contentBlocks: [
      "Onboarding flows that activate users in under five minutes.",
      "Usage-based billing and expansion revenue tooling.",
      "Integrations with your existing stack out of the box.",
    ],
  },
  "ti-ai-company-signal": {
    heroEyebrow: "Production AI",
    heroHeadlineTemplate: "{brand} — intelligence that ships",
    heroSubheadline:
      "Deploy models with eval pipelines, guardrails, and observability from day one.",
    primaryCta: "Deploy now",
    secondaryCta: "View platform",
    heroLayout: "dashboard",
    navLinkLabels: ["Platform", "Use cases", "Security", "Contact"],
    contentBlocks: [
      "Orchestrate LLMs, embeddings, and agents in one control plane.",
      "Real-time evals with regression detection and human review.",
      "Enterprise SSO, audit logs, and data residency controls.",
    ],
  },
  "ti-creative-studio": {
    heroEyebrow: "Award-winning studio",
    heroHeadlineTemplate: "{brand} crafts brands that move culture",
    heroSubheadline:
      "Strategy, identity, and digital experiences for teams who refuse to blend in.",
    primaryCta: "View work",
    secondaryCta: "Start a project",
    heroLayout: "cinematic",
    navLinkLabels: ["Work", "Studio", "Services", "Contact"],
    contentBlocks: [
      "Brand systems that scale across every touchpoint.",
      "Campaign creative with performance accountability.",
      "Motion, 3D, and interactive experiences that win awards.",
    ],
  },
  "ti-agency-portfolio": {
    heroEyebrow: "Growth agency",
    heroHeadlineTemplate: "{brand} — campaigns that convert",
    heroSubheadline:
      "Full-funnel marketing with creative excellence and performance discipline.",
    primaryCta: "Get proposal",
    secondaryCta: "Case studies",
    heroLayout: "editorial",
    navLinkLabels: ["Work", "Services", "Results", "Contact"],
    contentBlocks: [
      "Paid media with creative testing at scale.",
      "SEO and content engines that compound over time.",
      "CRO programs with statistically rigorous experimentation.",
    ],
  },
  "ti-blog-editorial": {
    heroEyebrow: "Editorial portfolio",
    heroHeadlineTemplate: "{brand} — stories worth sharing",
    heroSubheadline:
      "A journal of craft, process, and projects from a studio that leads with ideas.",
    primaryCta: "Read journal",
    secondaryCta: "View projects",
    heroLayout: "editorial",
    navLinkLabels: ["Journal", "Work", "About", "Contact"],
    contentBlocks: [
      "Long-form essays on design, technology, and culture.",
      "Project breakdowns with process and outcomes.",
      "Speaking, workshops, and open-source contributions.",
    ],
  },
  "ti-restaurant-dining": {
    heroEyebrow: "Fine dining · reservations open",
    heroHeadlineTemplate: "{brand} — cuisine as ceremony",
    heroSubheadline:
      "Seasonal tasting menus, sommelier pairings, and an atmosphere designed for celebration.",
    primaryCta: "Reserve a table",
    secondaryCta: "View menu",
    heroLayout: "cinematic",
    navLinkLabels: ["Menu", "Gallery", "About", "Reserve"],
    contentBlocks: [
      "Chef-driven courses with local sourcing and global technique.",
      "Private dining rooms for milestones and corporate events.",
      "Wine cellar with rare allocations and guided pairings.",
    ],
  },
  "ti-cafe-artisan": {
    heroEyebrow: "Artisan roastery",
    heroHeadlineTemplate: "{brand} — morning ritual, perfected",
    heroSubheadline:
      "Single-origin pours, house pastries, and a neighborhood space built for slow mornings.",
    primaryCta: "Order ahead",
    secondaryCta: "See menu",
    heroLayout: "minimal",
    navLinkLabels: ["Menu", "Story", "Events", "Visit"],
    contentBlocks: [
      "Rotating single-origin beans roasted in small batches.",
      "Seasonal pastries baked fresh every morning.",
      "Community events, cuppings, and barista workshops.",
    ],
  },
  "ti-hotel-sanctuary": {
    heroEyebrow: "Five-star sanctuary",
    heroHeadlineTemplate: "{brand} — where stillness meets luxury",
    heroSubheadline:
      "Suites with ocean views, spa rituals, and concierge service that anticipates every need.",
    primaryCta: "Book your stay",
    secondaryCta: "Explore suites",
    heroLayout: "cinematic",
    navLinkLabels: ["Rooms", "Spa", "Dining", "Reserve"],
    contentBlocks: [
      "Oceanfront suites with private terraces and butler service.",
      "Award-winning spa with signature thermal journeys.",
      "Michelin-inspired dining with locally sourced ingredients.",
    ],
  },
  "ti-travel-horizon": {
    heroEyebrow: "Curated journeys",
    heroHeadlineTemplate: "{brand} — destinations worth the detour",
    heroSubheadline:
      "Handcrafted itineraries with local experts, premium stays, and seamless logistics.",
    primaryCta: "Explore trips",
    secondaryCta: "Plan custom",
    heroLayout: "cinematic",
    navLinkLabels: ["Destinations", "Packages", "About", "Book"],
    contentBlocks: [
      "Small-group expeditions with expert local guides.",
      "Luxury accommodations vetted for character and comfort.",
      "24/7 travel support before and during your journey.",
    ],
  },
  "ti-real-estate-listings": {
    heroEyebrow: "Premier brokerage",
    heroHeadlineTemplate: "{brand} — residences of distinction",
    heroSubheadline:
      "Architecturally significant homes with neighborhood intelligence and white-glove service.",
    primaryCta: "Browse listings",
    secondaryCta: "Request valuation",
    heroLayout: "split",
    navLinkLabels: ["Listings", "Neighborhoods", "Agents", "Contact"],
    contentBlocks: [
      "Verified listings with immersive photography and floor plans.",
      "Market analysis and pricing strategy from local experts.",
      "Concierge closing support and post-sale introductions.",
    ],
  },
  "ti-architecture-monograph": {
    heroEyebrow: "Architecture studio",
    heroHeadlineTemplate: "{brand} — form follows intention",
    heroSubheadline:
      "Monograph-worthy projects spanning residential, cultural, and civic commissions.",
    primaryCta: "View projects",
    secondaryCta: "Commission inquiry",
    heroLayout: "editorial",
    navLinkLabels: ["Projects", "Process", "Studio", "Contact"],
    contentBlocks: [
      "Site-sensitive design with sustainable material palettes.",
      "Full-service from concept through construction administration.",
      "Published work in leading architectural journals.",
    ],
  },
  "ti-construction-industrial": {
    heroEyebrow: "Built to last",
    heroHeadlineTemplate: "{brand} — industrial construction excellence",
    heroSubheadline:
      "Heavy civil, commercial, and industrial projects delivered on schedule with zero compromise on safety.",
    primaryCta: "Request bid",
    secondaryCta: "View projects",
    heroLayout: "split",
    navLinkLabels: ["Capabilities", "Safety", "Projects", "Contact"],
    contentBlocks: [
      "OSHA-compliant sites with industry-leading safety records.",
      "Design-build delivery with transparent milestone reporting.",
      "Specialized crews for complex structural and MEP work.",
    ],
  },
  "ti-medical-care": {
    heroEyebrow: "Patient-first care",
    heroHeadlineTemplate: "{brand} — clinical excellence, human touch",
    heroSubheadline:
      "Board-certified physicians, same-week appointments, and care plans built around you.",
    primaryCta: "Book appointment",
    secondaryCta: "Our services",
    heroLayout: "minimal",
    navLinkLabels: ["Services", "Physicians", "Patients", "Contact"],
    contentBlocks: [
      "Comprehensive primary and specialty care under one roof.",
      "Telehealth visits with secure messaging and records access.",
      "Accredited facilities with evidence-based treatment protocols.",
    ],
  },
  "ti-dental-smile": {
    heroEyebrow: "Bright smiles",
    heroHeadlineTemplate: "{brand} — dentistry reimagined",
    heroSubheadline:
      "Gentle care, advanced technology, and treatment plans explained in plain language.",
    primaryCta: "Book visit",
    secondaryCta: "Treatments",
    heroLayout: "minimal",
    navLinkLabels: ["Treatments", "Team", "Reviews", "Book"],
    contentBlocks: [
      "Cosmetic and restorative dentistry with digital smile design.",
      "Sedation options for anxious patients in a spa-like setting.",
      "Flexible financing and insurance coordination.",
    ],
  },
  "ti-pharmacy-wellness": {
    heroEyebrow: "Wellness pharmacy",
    heroHeadlineTemplate: "{brand} — care beyond the counter",
    heroSubheadline:
      "Clinical consultations, wellness programs, and prescription services with pharmacist expertise.",
    primaryCta: "Refill prescription",
    secondaryCta: "Wellness services",
    heroLayout: "split",
    navLinkLabels: ["Services", "Wellness", "About", "Contact"],
    contentBlocks: [
      "Medication therapy management and immunizations.",
      "Compounding and specialty prescription fulfillment.",
      "Nutrition and supplement guidance from licensed pharmacists.",
    ],
  },
  "ti-law-firm": {
    heroEyebrow: "Counsel of record",
    heroHeadlineTemplate: "{brand} — authority in every matter",
    heroSubheadline:
      "Full-service litigation and advisory with senior partner attention and decades of precedent.",
    primaryCta: "Schedule consultation",
    secondaryCta: "Practice areas",
    heroLayout: "dark-authority",
    navLinkLabels: ["Practice", "Attorneys", "Results", "Contact"],
    contentBlocks: [
      "Complex litigation with trial-ready preparation.",
      "Corporate transactions and regulatory compliance.",
      "Discreet counsel for high-stakes personal matters.",
    ],
  },
  "ti-finance-ledger": {
    heroEyebrow: "Institutional trust",
    heroHeadlineTemplate: "{brand} — wealth stewardship",
    heroSubheadline:
      "Fiduciary advisory, portfolio management, and financial planning for discerning clients.",
    primaryCta: "Speak with advisor",
    secondaryCta: "Our approach",
    heroLayout: "split",
    navLinkLabels: ["Services", "Insights", "Team", "Contact"],
    contentBlocks: [
      "Custom portfolios aligned to risk tolerance and goals.",
      "Tax-aware strategies and estate planning coordination.",
      "Quarterly reporting with transparent fee structures.",
    ],
  },
  "ti-insurance-shield": {
    heroEyebrow: "Protection simplified",
    heroHeadlineTemplate: "{brand} — coverage you can count on",
    heroSubheadline:
      "Personal and commercial insurance with clear policies and responsive claims support.",
    primaryCta: "Get a quote",
    secondaryCta: "Compare plans",
    heroLayout: "split",
    navLinkLabels: ["Plans", "Claims", "About", "Contact"],
    contentBlocks: [
      "Tailored coverage for home, auto, life, and business.",
      "Dedicated agents who answer when you need them.",
      "Fast claims processing with transparent status updates.",
    ],
  },
  "ti-education-campus": {
    heroEyebrow: "Learn forward",
    heroHeadlineTemplate: "{brand} — education that opens doors",
    heroSubheadline:
      "Career-focused programs, expert faculty, and a campus community built for growth.",
    primaryCta: "Apply now",
    secondaryCta: "Explore programs",
    heroLayout: "split",
    navLinkLabels: ["Programs", "Campus", "Admissions", "Contact"],
    contentBlocks: [
      "Industry-aligned curricula with internship placement.",
      "Small class sizes and mentorship from working professionals.",
      "Scholarships and flexible scheduling for working adults.",
    ],
  },
  "ti-university-heritage": {
    heroEyebrow: "Est. heritage",
    heroHeadlineTemplate: "{brand} — scholarship with legacy",
    heroSubheadline:
      "A research university where tradition meets innovation and graduates lead their fields.",
    primaryCta: "Apply for admission",
    secondaryCta: "Explore campus",
    heroLayout: "editorial",
    navLinkLabels: ["Academics", "Research", "Campus", "Apply"],
    contentBlocks: [
      "Renowned faculty and nationally ranked programs.",
      "Research centers driving breakthroughs across disciplines.",
      "A global alumni network spanning industry and public service.",
    ],
  },
  "ti-ecommerce-atelier": {
    heroEyebrow: "Curated commerce",
    heroHeadlineTemplate: "{brand} — objects of lasting value",
    heroSubheadline:
      "Editorial product curation with artisan craftsmanship and seamless checkout.",
    primaryCta: "Shop collection",
    secondaryCta: "Our story",
    heroLayout: "minimal",
    navLinkLabels: ["Shop", "Collections", "About", "Contact"],
    contentBlocks: [
      "Limited-run pieces from independent makers worldwide.",
      "Gift wrapping and concierge delivery options.",
      "Easy returns with responsive customer care.",
    ],
  },
  "ti-luxury-brands-atelier": {
    heroEyebrow: "Haute couture",
    heroHeadlineTemplate: "{brand} — fashion as art",
    heroSubheadline:
      "Runway collections with atelier craftsmanship and editorial presentation.",
    primaryCta: "View collection",
    secondaryCta: "Book appointment",
    heroLayout: "cinematic",
    navLinkLabels: ["Collection", "Lookbook", "Atelier", "Contact"],
    contentBlocks: [
      "Seasonal collections with hand-finished details.",
      "Private fittings and bespoke alterations.",
      "Global flagship experiences and trunk shows.",
    ],
  },
  "ti-beauty-glow": {
    heroEyebrow: "Luminous rituals",
    heroHeadlineTemplate: "{brand} — beauty elevated",
    heroSubheadline:
      "Clinical-grade treatments and spa rituals in a sanctuary of calm and light.",
    primaryCta: "Book treatment",
    secondaryCta: "Explore services",
    heroLayout: "cinematic",
    navLinkLabels: ["Treatments", "Spa", "Products", "Book"],
    contentBlocks: [
      "Signature facials with medical-grade formulations.",
      "Body rituals inspired by global wellness traditions.",
      "Retail collections curated by licensed aestheticians.",
    ],
  },
  "ti-fitness-pulse": {
    heroEyebrow: "Train harder",
    heroHeadlineTemplate: "{brand} — performance redefined",
    heroSubheadline:
      "Elite coaching, cutting-edge equipment, and programming that delivers measurable results.",
    primaryCta: "Start membership",
    secondaryCta: "Free trial",
    heroLayout: "cinematic",
    navLinkLabels: ["Programs", "Pricing", "Trainers", "Join"],
    contentBlocks: [
      "Strength, conditioning, and recovery under one roof.",
      "Certified coaches with sport-specific expertise.",
      "Member app with workout tracking and nutrition plans.",
    ],
  },
  "ti-automotive-showroom": {
    heroEyebrow: "Performance luxury",
    heroHeadlineTemplate: "{brand} — engineered exhilaration",
    heroSubheadline:
      "Curated inventory, white-glove delivery, and service that matches the marque.",
    primaryCta: "View inventory",
    secondaryCta: "Schedule test drive",
    heroLayout: "cinematic",
    navLinkLabels: ["Inventory", "Models", "Service", "Contact"],
    contentBlocks: [
      "Certified pre-owned and new vehicles with full history.",
      "Concierge test drives and trade-in valuations.",
      "Factory-trained technicians and genuine parts.",
    ],
  },
  "ti-logistics-freight": {
    heroEyebrow: "Global freight",
    heroHeadlineTemplate: "{brand} — logistics without friction",
    heroSubheadline:
      "End-to-end freight, warehousing, and last-mile with real-time visibility.",
    primaryCta: "Get quote",
    secondaryCta: "Track shipment",
    heroLayout: "split",
    navLinkLabels: ["Services", "Fleet", "Coverage", "Contact"],
    contentBlocks: [
      "Air, ocean, and ground freight with customs brokerage.",
      "Temperature-controlled and hazmat-certified handling.",
      "API integrations for ERP and e-commerce platforms.",
    ],
  },
  "ti-manufacturing-precision": {
    heroEyebrow: "Precision engineering",
    heroHeadlineTemplate: "{brand} — manufacturing at micron scale",
    heroSubheadline:
      "CNC machining, quality systems, and supply chain reliability for mission-critical parts.",
    primaryCta: "Request RFQ",
    secondaryCta: "Capabilities",
    heroLayout: "dashboard",
    navLinkLabels: ["Capabilities", "Quality", "Industries", "Contact"],
    contentBlocks: [
      "ISO-certified processes with full traceability.",
      "Prototype to production with DFM consultation.",
      "Just-in-time delivery and vendor-managed inventory.",
    ],
  },
  "ti-nonprofit-impact": {
    heroEyebrow: "Mission driven",
    heroHeadlineTemplate: "{brand} — impact that endures",
    heroSubheadline:
      "Programs that change lives, transparent reporting, and a community you can join.",
    primaryCta: "Donate now",
    secondaryCta: "Volunteer",
    heroLayout: "split",
    navLinkLabels: ["Mission", "Programs", "Stories", "Give"],
    contentBlocks: [
      "Community programs with measurable outcomes.",
      "Annual impact reports with full financial transparency.",
      "Volunteer opportunities and corporate partnership paths.",
    ],
  },
};

export function getIndustryPreviewProfile(
  templateIntelligenceId: string,
): IndustryPreviewProfile | null {
  return PROFILES[templateIntelligenceId] ?? null;
}

export const INDUSTRY_PREVIEW_PROFILE_IDS = Object.keys(PROFILES);
