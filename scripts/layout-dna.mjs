/**
 * Per-skin layout DNA — each skin gets a unique hero + features + nav structure.
 * Used by write-distinct-template-layouts.mjs
 */

/** @type {Record<string, {
 *   hero: string; features: string; nav: string; footer: string; testimonials: string; pricing: string;
 *   about: string; contact: string; stats: string; faq: string;
 *   portfolio: string; integrations: string; floatingCta: string; utilityBand: string;
 *   sectionShell: string;
 * }>} */
export const SKIN_LAYOUT_DNA = {
  signal: { hero: "glass-dashboard", features: "bento-asymmetric", nav: "product-glass", footer: "saas-compliance", testimonials: "grid-cards", pricing: "three-column-cards", about: "saas-origin", contact: "demo-request", stats: "dashboard-metrics", faq: "saas-faq", portfolio: "saas-customers", integrations: "pipeline-connectors", floatingCta: "saas-dock", utilityBand: "saas-pipeline-band", sectionShell: "saas-glass" },
  volt: { hero: "kinetic-split", features: "horizontal-scroll", nav: "creative-minimal", footer: "minimal-bar", testimonials: "marquee-scroll", pricing: "two-tier-compare", about: "studio-manifesto", contact: "project-brief", stats: "horizontal-strip", faq: "studio-faq", portfolio: "work-grid-large", integrations: "tool-strip", floatingCta: "studio-bold", utilityBand: "portfolio-band", sectionShell: "creative-border" },
  ledger: { hero: "split-trust", features: "numbered-list", nav: "editorial-underline", footer: "mega-columns", testimonials: "split-quote-stats", pricing: "table-comparison", about: "editorial-columns", contact: "corporate-offices", stats: "corporate-counters", faq: "numbered-faq", portfolio: "case-study-rows", integrations: "category-columns", floatingCta: "corporate-banner", utilityBand: "corporate-band", sectionShell: "finance-accent-line" },
  atlas: { hero: "corporate-image", features: "icon-rows", nav: "corporate-classic", footer: "dark-split", testimonials: "masonry-quotes", pricing: "horizontal-tiers", about: "split-image-right", contact: "enterprise-form", stats: "four-column-grid", faq: "corporate-accordion", portfolio: "outcome-cards", integrations: "corporate-partners", floatingCta: "bottom-bar", utilityBand: "trust-badges", sectionShell: "corporate-contained" },
  monolith: { hero: "fullbleed-overlay", features: "masonry-cards", nav: "luxury-transparent", footer: "luxury-minimal", testimonials: "single-spotlight", pricing: "single-enterprise-cta", about: "estate-legacy", contact: "luxury-inquiry", stats: "fullscreen-numbers", faq: "minimal-list", portfolio: "fullscreen-case", integrations: "minimal-logos", floatingCta: "luxury-minimal", utilityBand: "luxury-minimal-band", sectionShell: "fullscreen-minimal" },
  serenity: { hero: "centered-clinical", features: "soft-grid", nav: "minimal-pill", footer: "centered-stack", testimonials: "bubble-cards", pricing: "clinical-packages", about: "mission-centered", contact: "clinical-booking", stats: "clinical-stats", faq: "clinical-faq", portfolio: "clinical-outcomes", integrations: "clinical-systems", floatingCta: "soft-pill", utilityBand: "clinical-band", sectionShell: "clinical-centered" },
  haven: { hero: "ocean-immersive", features: "amenity-pills", nav: "resort-floating", footer: "resort-warm", testimonials: "resort-guest", pricing: "resort-packages", about: "hospitality-story", contact: "resort-reservation", stats: "resort-highlights", faq: "resort-faq", portfolio: "gallery-grid", integrations: "amenity-icons", floatingCta: "resort-chip", utilityBand: "resort-band", sectionShell: "resort-wide" },
  ember: { hero: "culinary-asymmetric", features: "menu-cards", nav: "warm-bordered", footer: "culinary-hours", testimonials: "chef-review", pricing: "menu-pricing", about: "chef-narrative", contact: "table-booking", stats: "culinary-awards", faq: "culinary-faq", portfolio: "menu-showcase", integrations: "supplier-list", floatingCta: "warm-bordered", utilityBand: "culinary-band", sectionShell: "culinary-warm" },
  heritage: { hero: "academy-crest", features: "timeline", nav: "academic-split", footer: "academic-sitemap", testimonials: "alumni-grid", pricing: "tuition-tiers", about: "academic-heritage", contact: "admissions-form", stats: "alumni-stats", faq: "academic-faq", portfolio: "alumni-success", integrations: "academic-partners", floatingCta: "academic-badge", utilityBand: "academic-band", sectionShell: "academic-crest" },
  atelier: { hero: "commerce-editorial", features: "editorial-split", nav: "shop-minimal", footer: "shop-compact", testimonials: "shop-reviews", pricing: "product-tiers", about: "brand-manifesto", contact: "wholesale-inquiry", stats: "commerce-kpis", faq: "shop-faq", portfolio: "product-lookbook", integrations: "commerce-platforms", floatingCta: "shop-fab", utilityBand: "shop-band", sectionShell: "commerce-gold-rule" },
  nexus: { hero: "pipeline-flow", features: "saas-columns", nav: "product-tabs", footer: "newsletter-band", testimonials: "saas-logos-row", pricing: "saas-feature-matrix", about: "values-grid", contact: "split-form-map", stats: "saas-pipeline", faq: "accordion-sidebar", portfolio: "logo-wall", integrations: "marquee-strip", floatingCta: "slide-up-minimal", utilityBand: "split-cta", sectionShell: "contained-standard" },
  kinetic: { hero: "portfolio-mega", features: "showcase-strip", nav: "portfolio-center", footer: "portfolio-quote", testimonials: "portfolio-case-study", pricing: "project-based", about: "full-width-statement", contact: "minimal-inline", stats: "portfolio-metrics", faq: "two-column-grid", portfolio: "masonry-portfolio", integrations: "logo-grid", floatingCta: "corner-pill", utilityBand: "full-bleed-bold", sectionShell: "editorial-split-header" },
  estates: { hero: "estate-search", features: "property-list", nav: "luxury-transparent", footer: "estate-contact", testimonials: "estate-client", pricing: "property-fees", about: "timeline-story", contact: "property-viewing", stats: "property-stats", faq: "estate-faq", portfolio: "property-showcase", integrations: "property-systems", floatingCta: "estate-elegant", utilityBand: "estate-band", sectionShell: "estate-dark-surface" },
  forest: { hero: "forest-frame", features: "organic-bento", nav: "warm-bordered", footer: "organic-rounded", testimonials: "nature-cards", pricing: "organic-cards", about: "organic-story", contact: "reservation-form", stats: "nature-metrics", faq: "organic-faq", portfolio: "nature-gallery", integrations: "organic-icons", floatingCta: "organic-float", utilityBand: "forest-band", sectionShell: "organic-framed" },
  prism: { hero: "aurora-orbit", features: "gradient-orbs", nav: "floating-pill", footer: "gradient-glow", testimonials: "aurora-glass", pricing: "gradient-tiers", about: "aurora-narrative", contact: "glass-form", stats: "gradient-stats", faq: "glass-faq", portfolio: "aurora-showcase", integrations: "gradient-logos", floatingCta: "glass-float", utilityBand: "prism-gradient", sectionShell: "aurora-glow" },
  obsidian: { hero: "noir-terminal", features: "minimal-list", nav: "dark-compact", footer: "terminal-minimal", testimonials: "noir-minimal-quote", pricing: "minimal-list-pricing", about: "noir-minimal-about", contact: "terminal-contact", stats: "minimal-counters", faq: "terminal-faq", portfolio: "minimal-list-portfolio", integrations: "terminal-modules", floatingCta: "terminal-toast", utilityBand: "noir-minimal", sectionShell: "noir-terminal-frame" },
  pulse: { hero: "fintech-terminal", features: "terminal-metrics", nav: "terminal-bar", footer: "fintech-legal", testimonials: "terminal-output", pricing: "terminal-pricing", about: "fintech-origin", contact: "secure-inquiry", stats: "terminal-stats", faq: "compliance-faq", portfolio: "terminal-cases", integrations: "api-terminal", floatingCta: "fintech-alert", utilityBand: "terminal-band", sectionShell: "fintech-terminal-wrap" },
  forge: { hero: "blueprint-grid", features: "spec-table", nav: "industrial-bold", footer: "industrial-stamp", testimonials: "blueprint-testimonials", pricing: "spec-packages", about: "blueprint-specs", contact: "rfq-form", stats: "industrial-output", faq: "spec-faq", portfolio: "blueprint-projects", integrations: "spec-connectors", floatingCta: "industrial-bar", utilityBand: "blueprint-band", sectionShell: "blueprint-dashed" },
  citadel: { hero: "authority-triple", features: "practice-grid", nav: "law-classic", footer: "law-formal", testimonials: "authority-quotes", pricing: "retainer-columns", about: "firm-history", contact: "consultation-form", stats: "firm-metrics", faq: "legal-faq", portfolio: "client-roster", integrations: "firm-network", floatingCta: "law-subtle", utilityBand: "law-formal-band", sectionShell: "law-formal-columns" },
  lumina: { hero: "wellness-wave", features: "ritual-cards", nav: "wellness-soft", footer: "wellness-calm", testimonials: "wellness-soft-stack", pricing: "ritual-packages", about: "wellness-philosophy", contact: "wellness-booking", stats: "wellness-stats", faq: "wellness-faq", portfolio: "wellness-journey", integrations: "wellness-apps", floatingCta: "wellness-soft", utilityBand: "wellness-calm-band", sectionShell: "wellness-soft-centered" },
};

export const DEFAULT_FEATURES = [
  { title: "Unified platform", description: "One operating layer for strategy, execution, and measurable outcomes.", icon: "01" },
  { title: "Global scale", description: "Infrastructure and workflows designed for multi-market teams.", icon: "02" },
  { title: "Trusted security", description: "Enterprise-grade controls with audit-ready governance.", icon: "03" },
  { title: "Expert support", description: "Dedicated specialists from onboarding through expansion.", icon: "04" },
];

export const DEFAULT_NAV_LINKS = [
  { href: "/platform", label: "Platform" },
  { href: "/customers", label: "Customers" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export const DEFAULT_FOOTER_LINKS = [
  { href: "/platform", label: "Platform" },
  { href: "/pricing", label: "Pricing" },
  { href: "/customers", label: "Customers" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export const DEFAULT_TESTIMONIALS = [
  { quote: "They transformed how our team operates — measurable impact within the first quarter.", name: "Sarah Chen", role: "VP Operations", company: "Northwind" },
  { quote: "The level of craft and attention to detail is unmatched. A true global partner.", name: "Marcus Webb", role: "Chief Marketing Officer", company: "Helix Group" },
  { quote: "We finally have a platform our board trusts. Reporting went from weeks to hours.", name: "Elena Vasquez", role: "CFO", company: "Axiom Labs" },
];

export const DEFAULT_PRICING_TIERS = [
  { name: "Growth", price: "$499", period: "/mo", description: "For teams building their foundation.", features: ["Core platform", "Standard support", "Team dashboards"], cta: "Start trial", highlighted: false },
  { name: "Enterprise", price: "$899", period: "/mo", description: "Full platform for scaling organizations.", features: ["Everything in Growth", "Advanced analytics", "Dedicated CSM", "SSO"], cta: "Book a demo", highlighted: true },
  { name: "Global", price: "Custom", period: "", description: "Multi-region with enterprise SLAs.", features: ["Everything in Enterprise", "Custom integrations", "24/7 support"], cta: "Contact sales", highlighted: false },
];

export const DEFAULT_ABOUT_HIGHLIGHTS = [
  "Founded by industry veterans with global experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

export const DEFAULT_STATS = [
  { value: "500+", label: "Enterprise clients", detail: "Global footprint" },
  { value: "97%", label: "Client retention", detail: "3-year average" },
  { value: "28", label: "Countries served", detail: "Active markets" },
  { value: "4.9/5", label: "Satisfaction score", detail: "Verified reviews" },
];

export const DEFAULT_FAQ = [
  { question: "How long does onboarding take?", answer: "Most teams are fully operational within two weeks with guided implementation and dedicated support." },
  { question: "Do you integrate with existing tools?", answer: "Yes — native connectors and open APIs integrate with your current stack without disrupting workflows." },
  { question: "What security standards do you meet?", answer: "Enterprise-grade security with SOC 2, GDPR compliance, and role-based access controls." },
  { question: "Can we customize for our industry?", answer: "Absolutely. Modules and workflows adapt to your sector, governance model, and operating cadence." },
];

export const DEFAULT_PORTFOLIO_ITEMS = [
  { company: "Vertex Systems", industry: "Technology", outcome: "42%", outcomeLabel: "faster cycles", detail: "Unified operations across six regions with measurable ROI in quarter one." },
  { company: "Helix Group", industry: "Healthcare", outcome: "$3.1M", outcomeLabel: "value unlocked", detail: "Identified expansion opportunities weeks earlier with proactive insights." },
  { company: "Axiom Logistics", industry: "Supply Chain", outcome: "99%", outcomeLabel: "accuracy", detail: "Replaced manual workflows with live intelligence dashboards." },
];

export const DEFAULT_INTEGRATIONS = [
  { abbr: "CRM", name: "Customer platform", category: "Native" },
  { abbr: "DWH", name: "Data warehouse", category: "ETL" },
  { abbr: "COM", name: "Collaboration", category: "Realtime" },
  { abbr: "API", name: "Open API", category: "Custom" },
  { abbr: "SSO", name: "Identity", category: "Security" },
  { abbr: "BI", name: "Analytics", category: "Insights" },
];
