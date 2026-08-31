import { FLAGSHIP_SKIN_MANIFEST } from "../visual-skin-catalog-manifest.mjs";

export const premiumSectionPadding = "py-20 sm:py-28";
export const premiumContainer = "mx-auto max-w-[82rem] px-5 sm:px-8";
export const premiumContainerWide = "mx-auto max-w-[88rem] px-5 sm:px-8";

/**
 * @param {string} p CSS prefix
 * @param {"default"|"glass"|"flat"} [variant]
 */
export function premiumCardClasses(p, variant = "default") {
  const base = `group ${p}-card transition-all duration-300`;
  if (variant === "glass") {
    return `${base} border border-[var(--border-accent)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] backdrop-blur-md hover:border-[color-mix(in_srgb,var(--color-accent)_45%,transparent)] hover:shadow-[0_24px_48px_-24px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]`;
  }
  if (variant === "flat") {
    return `${base} border border-[var(--border-default)] bg-[var(--color-surface)] hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]`;
  }
  return `${base} border border-[var(--border-default)] bg-[var(--color-surface)] hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] hover:shadow-[0_24px_48px_-24px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]`;
}

/**
 * @param {string} p
 * @param {{ eyebrow?: string; titleVar?: string; subtitleVar?: string; titleId: string; headerClass?: string }} opts
 */
export function premiumSectionHeader(p, opts) {
  const {
    eyebrow = "eyebrow",
    titleVar = "title",
    subtitleVar = "subtitle",
    titleId,
    headerClass = "mb-10 max-w-2xl",
  } = opts;
  return `<header className="${headerClass}">
          <p className="${p}-eyebrow mb-3">{${eyebrow}}</p>
          <h2 id="${titleId}" className="${p}-headline-sm">{${titleVar}}</h2>
          <p className="${p}-body mt-5 text-[var(--color-muted)]">{${subtitleVar}}</p>
        </header>`;
}

/** @type {Record<string, object>} */
const SECTOR_CONTENT = {
  saas: {
    featuresEyebrow: "Platform capabilities",
    featuresTitle: "Built for modern product teams",
    featuresSubtitle: "A control plane designed for clarity, scale, and measurable impact at global velocity.",
    features: [
      { title: "Model routing", description: "Route workloads across providers with latency-aware policies and automatic failover.", icon: "01", span: "hero" },
      { title: "Observability mesh", description: "Trace every request and deployment across your stack in one unified timeline.", icon: "02", span: "tall" },
      { title: "Secure deployment", description: "Enterprise-grade controls with audit-ready governance for regulated industries.", icon: "03", span: "compact" },
      { title: "Global scale", description: "Multi-region infrastructure designed for production workloads at signal-grade reliability.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "They transformed how our platform team ships — measurable impact within the first quarter.", name: "Sarah Chen", role: "VP Engineering", company: "Northwind" },
      { quote: "The level of craft in their developer experience is unmatched. A true global partner.", name: "Marcus Webb", role: "CTO", company: "Helix Group" },
      { quote: "We finally have infrastructure our board trusts. Deployments went from weeks to hours.", name: "Elena Vasquez", role: "CFO", company: "Axiom Labs" },
    ],
    stats: [
      { value: "12ms", label: "Inference latency", detail: "p99 edge" },
      { value: "99.99%", label: "Platform uptime", detail: "global SLA" },
      { value: "140+", label: "API endpoints", detail: "production" },
      { value: "48", label: "Regions live", detail: "multi-cloud" },
    ],
  },
  finance: {
    featuresEyebrow: "Advisory capabilities",
    featuresTitle: "Institutional strength across markets",
    featuresSubtitle: "Portfolio strategy, risk governance, and wealth architecture for families and institutions.",
    features: [
      { title: "Portfolio strategy", description: "Multi-asset allocation with scenario modeling and disciplined rebalancing.", icon: "01", span: "hero" },
      { title: "Risk governance", description: "Institutional-grade controls with fiduciary oversight on every mandate.", icon: "02", span: "tall" },
      { title: "Global coverage", description: "Advisory desks across major financial centers with cross-border expertise.", icon: "03", span: "compact" },
      { title: "Wealth architecture", description: "Generational planning, trust structures, and philanthropic advisory.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "Measured counsel through volatile markets — our family office relies on their discipline.", name: "James Whitfield", role: "Family Office Principal", company: "Whitfield Capital" },
      { quote: "Institutional rigor with the responsiveness of a boutique. Exceptional partnership.", name: "Priya Sharma", role: "CFO", company: "Meridian Holdings" },
      { quote: "Their risk framework gave our board confidence during our most complex transaction.", name: "Robert Klein", role: "Chairman", company: "Atlas Ventures" },
    ],
    stats: [
      { value: "$48B", label: "Assets advised", detail: "Global AUM" },
      { value: "97%", label: "Client retention", detail: "10-year average" },
      { value: "28", label: "Financial centers", detail: "Active desks" },
      { value: "150+", label: "Advisory specialists", detail: "CFA, CPA credentialed" },
    ],
  },
  "creative-studio": {
    featuresEyebrow: "Studio capabilities",
    featuresTitle: "Craft that moves culture forward",
    featuresSubtitle: "Brand systems, digital products, and campaigns for teams who compete on design.",
    features: [
      { title: "Brand systems", description: "Identity, guidelines, and launch assets that scale across every touchpoint.", icon: "01", span: "hero" },
      { title: "Product design", description: "End-to-end UX for digital products that feel inevitable in market.", icon: "02", span: "tall" },
      { title: "Campaign craft", description: "Launch narratives and motion systems built for global attention.", icon: "03", span: "compact" },
      { title: "Design ops", description: "Systems, tooling, and governance that keep creative teams shipping fast.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "They gave us a visual language our competitors still haven't matched three years later.", name: "Alex Rivera", role: "CMO", company: "Archetype" },
      { quote: "Rare studio that understands both brand poetry and product engineering.", name: "Nina Okonkwo", role: "Head of Design", company: "Monolith" },
      { quote: "Our rebrand wasn't cosmetic — it repositioned us in every market we entered.", name: "Tom Berg", role: "CEO", company: "Helix" },
    ],
    stats: [
      { value: "240+", label: "Global launches", detail: "2020–2026" },
      { value: "38", label: "Markets served", detail: "6 continents" },
      { value: "92%", label: "Repeat clients", detail: "studio average" },
      { value: "18", label: "Design awards", detail: "last 3 years" },
    ],
  },
  "law-firm": {
    featuresEyebrow: "Practice areas",
    featuresTitle: "Depth across disciplines that matter",
    featuresSubtitle: "Cross-border litigation, regulatory strategy, and corporate advisory for global organizations.",
    features: [
      { title: "Corporate advisory", description: "M&A, governance, and capital markets counsel for complex transactions.", icon: "01", span: "hero" },
      { title: "Litigation", description: "Trial-ready teams for high-stakes disputes across jurisdictions.", icon: "02", span: "tall" },
      { title: "Regulatory strategy", description: "Compliance frameworks and government affairs for evolving policy landscapes.", icon: "03", span: "compact" },
      { title: "International arbitration", description: "Dispute resolution in major arbitration centers worldwide.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "Counsel we trust in matters that define our market position.", name: "Catherine Moore", role: "General Counsel", company: "Vertex Industries" },
      { quote: "Their regulatory team navigated three jurisdictions without missing a beat.", name: "David Park", role: "CEO", company: "Pacific Rail" },
      { quote: "Institutional rigor with the agility of a focused boutique practice.", name: "Helena Strauss", role: "Board Chair", company: "Meridian AG" },
    ],
    stats: [
      { value: "120+", label: "Partners worldwide", detail: "Global network" },
      { value: "40", label: "Practice areas", detail: "Full-service" },
      { value: "98%", label: "Matter success rate", detail: "5-year average" },
      { value: "25", label: "Office locations", detail: "Major capitals" },
    ],
  },
  "real-estate": {
    featuresEyebrow: "Property expertise",
    featuresTitle: "Curated residences for discerning buyers",
    featuresSubtitle: "Waterfront penthouses, vineyard estates, and landmark properties with gallery-level presentation.",
    features: [
      { title: "Private advisory", description: "Off-market access and discreet representation for ultra-high-net-worth buyers.", icon: "01", span: "hero" },
      { title: "Global portfolio", description: "Curated listings across premier markets with local market intelligence.", icon: "02", span: "tall" },
      { title: "Investment strategy", description: "Portfolio analysis and acquisition guidance for institutional investors.", icon: "03", span: "compact" },
      { title: "White-glove service", description: "Concierge coordination from viewing through closing and beyond.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "They found our vineyard estate before it reached the open market.", name: "Isabella Romano", role: "Private collector", company: "Tuscany" },
      { quote: "Gallery-level presentation that matched the caliber of the property.", name: "William Ashford", role: "Investor", company: "Ashford Group" },
      { quote: "Discretion, expertise, and an eye for properties others overlook.", name: "Mei Lin", role: "Family office", company: "Pacific Holdings" },
    ],
    stats: [
      { value: "$2.4B", label: "Transactions closed", detail: "last 24 months" },
      { value: "180+", label: "Premier listings", detail: "active portfolio" },
      { value: "14", label: "Global markets", detail: "advisory desks" },
      { value: "96%", label: "Client satisfaction", detail: "verified reviews" },
    ],
  },
  healthcare: {
    featuresEyebrow: "Clinical excellence",
    featuresTitle: "Care designed around your wellbeing",
    featuresSubtitle: "Evidence-based treatments, compassionate specialists, and outcomes you can trust.",
    features: [
      { title: "Specialist care", description: "Board-certified physicians across primary and specialty disciplines.", icon: "01", span: "hero" },
      { title: "Diagnostic precision", description: "Advanced imaging and lab partnerships for accurate, timely results.", icon: "02", span: "tall" },
      { title: "Patient experience", description: "Seamless scheduling, digital records, and concierge coordination.", icon: "03", span: "compact" },
      { title: "Preventive programs", description: "Wellness screenings and lifestyle medicine for long-term health.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "Finally a practice that treats the whole person, not just symptoms.", name: "Dr. Amanda Reyes", role: "Patient", company: "San Francisco" },
      { quote: "The coordination between specialists saved us months of uncertainty.", name: "Michael Torres", role: "Caregiver", company: "Boston" },
      { quote: "Clinical excellence with the warmth you hope for in healthcare.", name: "Jennifer Walsh", role: "Patient", company: "Chicago" },
    ],
    stats: [
      { value: "50K+", label: "Patients served", detail: "annual volume" },
      { value: "98%", label: "Satisfaction score", detail: "verified surveys" },
      { value: "24", label: "Specialty departments", detail: "integrated care" },
      { value: "4.9", label: "Provider rating", detail: "patient reviews" },
    ],
  },
  hospitality: {
    featuresEyebrow: "Resort experiences",
    featuresTitle: "Every detail curated for your escape",
    featuresSubtitle: "Oceanfront sanctuaries, bespoke itineraries, and service that anticipates your needs.",
    features: [
      { title: "Signature suites", description: "Ocean-view residences with private terraces and butler service.", icon: "01", span: "hero" },
      { title: "Culinary program", description: "Chef-driven dining with locally sourced, seasonal menus.", icon: "02", span: "tall" },
      { title: "Wellness sanctuary", description: "Spa rituals, movement classes, and holistic treatment programs.", icon: "03", span: "compact" },
      { title: "Curated excursions", description: "Private guides and bespoke adventures beyond the property.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "The most seamless luxury stay we've experienced across three continents.", name: "Sophie Laurent", role: "Guest", company: "Paris" },
      { quote: "Every staff member anticipated our preferences before we asked.", name: "James & Claire Wu", role: "Guests", company: "Singapore" },
      { quote: "A sanctuary that redefined what resort hospitality should feel like.", name: "Carlos Mendez", role: "Travel editor", company: "Condé Nast" },
    ],
    stats: [
      { value: "5★", label: "Forbes rating", detail: "consecutive years" },
      { value: "92", label: "Private suites", detail: "oceanfront" },
      { value: "3", label: "Michelin stars", description: "on-property dining" },
      { value: "18", label: "Wellness rituals", detail: "signature program" },
    ],
  },
  restaurant: {
    featuresEyebrow: "Seasonal offerings",
    featuresTitle: "Cuisine rooted in place and provenance",
    featuresSubtitle: "Wild herbs, hearth cooking, and a wine program shaped by biodynamic growers.",
    features: [
      { title: "Tasting menu", description: "Twelve courses celebrating the season's finest local harvest.", icon: "01", span: "hero" },
      { title: "Wine cellar", description: "800+ labels curated by our sommelier team and guest vintners.", icon: "02", span: "tall" },
      { title: "Private dining", description: "Intimate rooms for celebrations and chef's table experiences.", icon: "03", span: "compact" },
      { title: "Farm partnerships", description: "Direct relationships with regional growers and foragers.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "Every plate tells a story of the land — unforgettable from amuse to digestif.", name: "Elena Marchand", role: "Food critic", company: "The Times" },
      { quote: "The wine pairings elevated an already extraordinary menu.", name: "Thomas Berg", role: "Sommelier", company: "Nordic Guide" },
      { quote: "Hospitality that matches the ambition of the kitchen.", name: "Yuki Tanaka", role: "Guest", company: "Tokyo" },
    ],
    stats: [
      { value: "2", label: "Michelin stars", detail: "since 2022" },
      { value: "48", label: "Seat dining room", detail: "intimate setting" },
      { value: "12", label: "Course tasting", detail: "seasonal menu" },
      { value: "96%", label: "Return guests", detail: "annual average" },
    ],
  },
  education: {
    featuresEyebrow: "Academic excellence",
    featuresTitle: "Education that shapes leaders",
    featuresSubtitle: "Rigorous programs, distinguished faculty, and a legacy of global alumni impact.",
    features: [
      { title: "Undergraduate programs", description: "Liberal arts foundation with interdisciplinary depth and research opportunities.", icon: "01", span: "hero" },
      { title: "Graduate studies", description: "Professional degrees designed for leaders in business, law, and public service.", icon: "02", span: "tall" },
      { title: "Research institutes", description: "Centers of excellence driving innovation across science and humanities.", icon: "03", span: "compact" },
      { title: "Global campus", description: "Exchange programs and partnerships across 40+ international universities.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "The faculty challenged me to think beyond convention — it changed my trajectory.", name: "Dr. Sarah Okonkwo", role: "Alumna, Class of 2015", company: "Oxford Research" },
      { quote: "A community that values intellectual rigor and character in equal measure.", name: "James Whitmore", role: "Parent", company: "Boston" },
      { quote: "Our graduates lead in every sector — the network is extraordinary.", name: "Prof. Elena Vasquez", role: "Dean", company: "Graduate School" },
    ],
    stats: [
      { value: "12K+", label: "Students enrolled", detail: "global community" },
      { value: "94%", label: "Graduate placement", detail: "within 6 months" },
      { value: "180", label: "Years of heritage", detail: "established 1846" },
      { value: "40+", label: "Partner universities", detail: "worldwide" },
    ],
  },
  logistics: {
    featuresEyebrow: "Operational capabilities",
    featuresTitle: "Systems built for scale and resilience",
    featuresSubtitle: "Supply chain orchestration, asset intelligence, and field networks for global operations.",
    features: [
      { title: "Supply chain control", description: "End-to-end visibility across suppliers, warehouses, and last-mile delivery.", icon: "01", span: "hero" },
      { title: "Asset intelligence", description: "Predictive maintenance and fleet optimization powered by live telemetry.", icon: "02", span: "tall" },
      { title: "Field service network", description: "Dispatch, routing, and technician management across distributed teams.", icon: "03", span: "compact" },
      { title: "Compliance automation", description: "Regulatory documentation and audit trails built into every workflow.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "Downtime dropped 34% in the first year — the ROI was undeniable.", name: "Robert Chen", role: "COO", company: "Steelworks Global" },
      { quote: "Finally a platform our plant managers actually want to use.", name: "Maria Santos", role: "VP Operations", company: "Pacific Manufacturing" },
      { quote: "They understand industrial operations at a depth rare in technology partners.", name: "Klaus Weber", role: "Director", company: "Rhein Logistics" },
    ],
    stats: [
      { value: "99.7%", label: "System uptime", detail: "mission-critical" },
      { value: "2.4M", label: "Assets tracked", detail: "global fleet" },
      { value: "180+", label: "Enterprise clients", detail: "manufacturing" },
      { value: "42", label: "Countries deployed", detail: "active markets" },
    ],
  },
  medical: {
    featuresEyebrow: "Wellness rituals",
    featuresTitle: "Restore balance with intentional care",
    featuresSubtitle: "Clinical aesthetics, movement therapy, and nutrition programs blending science and serenity.",
    features: [
      { title: "Clinical aesthetics", description: "Evidence-based treatments administered by board-certified specialists.", icon: "01", span: "hero" },
      { title: "Movement therapy", description: "Personalized programs integrating Pilates, yoga, and recovery science.", icon: "02", span: "tall" },
      { title: "Nutrition programs", description: "Metabolic assessments and chef-curated meal plans for lasting results.", icon: "03", span: "compact" },
      { title: "Mind-body rituals", description: "Meditation, breathwork, and thermal experiences for deep restoration.", icon: "04", span: "wide" },
    ],
    testimonials: [
      { quote: "The most thoughtful wellness experience I've had — every detail considered.", name: "Amelia Hart", role: "Guest", company: "London" },
      { quote: "Science-backed treatments in an environment that actually helps you unwind.", name: "Dr. Priya Nair", role: "Physician", company: "Wellness advocate" },
      { quote: "I left feeling genuinely restored, not just pampered.", name: "Claire Morrison", role: "Member", company: "Annual program" },
    ],
    stats: [
      { value: "15K+", label: "Rituals delivered", detail: "annual volume" },
      { value: "4.9", label: "Guest rating", detail: "verified reviews" },
      { value: "28", label: "Treatment modalities", detail: "integrated care" },
      { value: "92%", label: "Return visits", detail: "member average" },
    ],
  },
};

const DEFAULT_SECTOR = SECTOR_CONTENT.saas;

/**
 * @param {string} skinId
 */
export function getSkinContent(skinId) {
  const entry = FLAGSHIP_SKIN_MANIFEST.find((s) => s.skinId === skinId);
  /** @type {Record<string, string>} */
  const skinSectorOverrides = {
    serenity: "healthcare",
    lumina: "medical",
    citadel: "law-firm",
    atlas: "law-firm",
    forge: "logistics",
    atelier: "logistics",
  };
  const sector = skinSectorOverrides[skinId] ?? entry?.sectorDnaId ?? "saas";
  const base = SECTOR_CONTENT[sector] ?? DEFAULT_SECTOR;
  return {
    ...base,
    brandName: entry?.label?.split(" — ")[0] ?? "Your Company",
    sectorDnaId: sector,
  };
}

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 */
export function heroPropsType(Pascal) {
  return `type ${Pascal}HeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};`;
}

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 */
export function heroDefaults(Pascal, h) {
  return `${heroPropsType(Pascal)}

export function ${Pascal}Hero({
  title = ${JSON.stringify(h.title)},
  subtitle = ${JSON.stringify(h.subtitle)},
  eyebrow = ${JSON.stringify(h.eyebrow)},
  primaryCta = ${JSON.stringify(h.primaryCta)},
  secondaryCta = ${JSON.stringify(h.secondaryCta)},
  imageUrl = null,
}: ${Pascal}HeroProps)`;
}
