import type {
  AboutVariantId,
  ContactVariantId,
  CtaVariantId,
  FeaturesVariantId,
  FooterVariantId,
  HeroVariantId,
  PortfolioVariantId,
  PricingVariantId,
  SectionKind,
  SectionVariantId,
  ServicesVariantId,
  TestimonialsVariantId,
  VariantDefinition,
} from "@/lib/website/template-v2/variants/types";
import { SECTION_VARIANT_COUNTS } from "@/lib/website/template-v2/variants/types";

/** Server-safe hero variant metadata — kept here so registry.ts never imports client section modules for spread. */
export const HERO_VARIANT_REGISTRY: VariantDefinition<"hero">[] = [
  { id: "split-trust", sectionKind: "hero", label: "Split Trust", description: "Classic split layout — narrative left, visual right with elevated frame.", composition: "split", hierarchy: "H1 dominant, eyebrow → headline → body → CTAs", rhythm: "Generous vertical section padding, 12/20 column split", visualIdentity: "Trust-forward editorial split", imageSlots: ["hero"], responsiveStrategy: "Stack on mobile, image below copy", isDefault: true },
  { id: "centered-statement", sectionKind: "hero", label: "Centered Statement", description: "Centered typographic hero with supporting image band below.", composition: "centered", hierarchy: "Centered H1, subtitle, dual CTAs, wide image", rhythm: "Tight headline cluster, wide image gap", visualIdentity: "Confident manifesto", imageSlots: ["hero"], responsiveStrategy: "Full-width image scales down" },
  { id: "editorial-stack", sectionKind: "hero", label: "Editorial Stack", description: "Oversized stacked headline with offset corner image.", composition: "stacked", hierarchy: "Display type stack, corner accent image", rhythm: "Large top margin, asymmetric offset", visualIdentity: "Magazine editorial", imageSlots: ["hero"], responsiveStrategy: "Image drops below headline block" },
  { id: "product-spotlight", sectionKind: "hero", label: "Product Spotlight", description: "Compact copy header with dominant centered product visual.", composition: "centered", hierarchy: "Compact header, hero visual dominates 70%", rhythm: "Compressed intro, expansive visual", visualIdentity: "Product-first SaaS", imageSlots: ["hero", "products"], responsiveStrategy: "Visual maintains aspect ratio" },
  { id: "metrics-rail", sectionKind: "hero", label: "Metrics Rail", description: "Split hero with horizontal metrics rail anchoring the base.", composition: "rail", hierarchy: "Split copy/visual, metrics band below", rhythm: "Two-tier vertical rhythm", visualIdentity: "Data-backed credibility", imageSlots: ["hero"], responsiveStrategy: "Metrics grid 2×2 on mobile" },
  { id: "immersive-visual", sectionKind: "hero", label: "Immersive Visual", description: "Full-bleed background image with gradient overlay and inset copy.", composition: "immersive", hierarchy: "Overlay copy on cinematic visual", rhythm: "Edge-to-edge visual, inset text block", visualIdentity: "Cinematic immersion", imageSlots: ["hero", "backgrounds"], responsiveStrategy: "Min-height scales, text padding increases" },
  { id: "minimal-type", sectionKind: "hero", label: "Minimal Type", description: "Typography-only hero — no image, maximum whitespace.", composition: "minimal", hierarchy: "Display headline, single CTA", rhythm: "Extreme vertical breathing room", visualIdentity: "Refined minimalism", imageSlots: [], responsiveStrategy: "Type scales with clamp" },
  { id: "dual-cta-band", sectionKind: "hero", label: "Dual CTA Band", description: "Bold headline with full-width dual-action band.", composition: "band", hierarchy: "Headline block + contrasting CTA band", rhythm: "Sharp section break at CTA band", visualIdentity: "Conversion-focused", imageSlots: ["hero"], responsiveStrategy: "CTA band stacks buttons" },
  { id: "video-frame", sectionKind: "hero", label: "Video Frame", description: "Split copy with faux video frame using hero slot poster.", composition: "split", hierarchy: "Copy left, framed media right", rhythm: "Media frame with play affordance", visualIdentity: "Demo-driven", imageSlots: ["hero"], responsiveStrategy: "Frame full-width on mobile" },
  { id: "asymmetric-grid", sectionKind: "hero", label: "Asymmetric Grid", description: "12-column asymmetric grid with overlapping visual cell.", composition: "asymmetric", hierarchy: "Grid-positioned copy and visual", rhythm: "Broken grid, intentional overlap", visualIdentity: "Architectural tension", imageSlots: ["hero"], responsiveStrategy: "Grid collapses to single column" },
];

export const HERO_DEFAULT_VARIANT: HeroVariantId = "split-trust";

export const FEATURES_VARIANT_REGISTRY: VariantDefinition<"features">[] = [
  { id: "icon-grid", sectionKind: "features", label: "Icon Grid", description: "Uniform 3-column icon card grid.", composition: "grid", hierarchy: "Section header, equal cards", rhythm: "Even card spacing", visualIdentity: "Clean capability grid", imageSlots: [], responsiveStrategy: "1→2→3 columns", isDefault: true },
  { id: "bento-mosaic", sectionKind: "features", label: "Bento Mosaic", description: "Asymmetric bento box with featured large cell.", composition: "bento", hierarchy: "Featured cell + supporting tiles", rhythm: "Broken grid rhythm", visualIdentity: "Modern product bento", imageSlots: ["features"], responsiveStrategy: "Stack bento cells" },
  { id: "alternating-rows", sectionKind: "features", label: "Alternating Rows", description: "Zigzag rows alternating copy and visual.", composition: "split", hierarchy: "Row pairs flip direction", rhythm: "Alternating vertical cadence", visualIdentity: "Narrative walkthrough", imageSlots: ["features"], responsiveStrategy: "Always stack image below" },
  { id: "numbered-steps", sectionKind: "features", label: "Numbered Steps", description: "Sequential numbered feature steps.", composition: "stacked", hierarchy: "Large step numbers, title, body", rhythm: "Vertical step sequence", visualIdentity: "Process clarity", imageSlots: [], responsiveStrategy: "Full-width steps" },
  { id: "masonry-cards", sectionKind: "features", label: "Masonry Cards", description: "Varied-height cards in masonry layout.", composition: "mosaic", hierarchy: "Mixed card heights", rhythm: "Organic vertical flow", visualIdentity: "Editorial variety", imageSlots: [], responsiveStrategy: "Single column masonry" },
  { id: "comparison-columns", sectionKind: "features", label: "Comparison Columns", description: "Side-by-side before/after or us/them columns.", composition: "grid", hierarchy: "Two contrasting columns", rhythm: "Parallel comparison", visualIdentity: "Decisive contrast", imageSlots: [], responsiveStrategy: "Stack columns" },
  { id: "sticky-headline", sectionKind: "features", label: "Sticky Headline", description: "Pinned section header with scrolling feature list.", composition: "split", hierarchy: "Sticky left, scroll right", rhythm: "Fixed + flowing", visualIdentity: "Editorial scroll", imageSlots: [], responsiveStrategy: "Header unsticks on mobile" },
  { id: "horizontal-scroll", sectionKind: "features", label: "Horizontal Scroll", description: "Horizontally scrollable feature cards.", composition: "carousel", hierarchy: "Header + card rail", rhythm: "Horizontal snap scroll", visualIdentity: "App-like discovery", imageSlots: [], responsiveStrategy: "Native horizontal scroll" },
  { id: "tiered-lanes", sectionKind: "features", label: "Tiered Lanes", description: "Three horizontal lanes by capability tier.", composition: "grid", hierarchy: "Tier labels with feature lanes", rhythm: "Three-band horizontal", visualIdentity: "Structured tiers", imageSlots: [], responsiveStrategy: "Lanes stack vertically" },
  { id: "spotlight-list", sectionKind: "features", label: "Spotlight List", description: "Single featured item with supporting list.", composition: "asymmetric", hierarchy: "Large spotlight + compact list", rhythm: "1:2 width ratio", visualIdentity: "Hero feature focus", imageSlots: ["features"], responsiveStrategy: "Spotlight full-width first" },
];
export const FEATURES_DEFAULT_VARIANT: FeaturesVariantId = "icon-grid";

export const ABOUT_VARIANT_REGISTRY: VariantDefinition<"about">[] = [
  { id: "split-narrative", sectionKind: "about", label: "Split Narrative", description: "Classic split copy and image with highlights.", composition: "split", hierarchy: "Copy left, image right", rhythm: "Balanced 50/50", visualIdentity: "Trust narrative", imageSlots: ["about"], responsiveStrategy: "Stack on mobile", isDefault: true },
  { id: "overlap-portrait", sectionKind: "about", label: "Overlap Portrait", description: "Portrait image overlapping text block.", composition: "asymmetric", hierarchy: "Overlapping portrait accent", rhythm: "Negative space overlap", visualIdentity: "Editorial portrait", imageSlots: ["about"], responsiveStrategy: "Overlap removes on mobile" },
  { id: "timeline-story", sectionKind: "about", label: "Timeline Story", description: "Vertical timeline of company milestones.", composition: "stacked", hierarchy: "Timeline nodes with dates", rhythm: "Vertical chronology", visualIdentity: "Heritage story", imageSlots: [], responsiveStrategy: "Single column timeline" },
  { id: "mission-pillars", sectionKind: "about", label: "Mission Pillars", description: "Mission statement with three pillar cards.", composition: "grid", hierarchy: "Mission + 3 pillars", rhythm: "Header then 3-up grid", visualIdentity: "Values-driven", imageSlots: [], responsiveStrategy: "Pillars stack" },
  { id: "full-bleed-quote", sectionKind: "about", label: "Full Bleed Quote", description: "Large pull quote over subtle background image.", composition: "immersive", hierarchy: "Quote dominates, attribution below", rhythm: "Cinematic quote block", visualIdentity: "Manifesto moment", imageSlots: ["about", "backgrounds"], responsiveStrategy: "Quote scales with clamp" },
  { id: "editorial-columns", sectionKind: "about", label: "Editorial Columns", description: "Multi-column editorial text layout.", composition: "editorial", hierarchy: "2-3 column prose", rhythm: "Newspaper columns", visualIdentity: "Long-form editorial", imageSlots: [], responsiveStrategy: "Columns collapse to one" },
  { id: "stats-sidebar", sectionKind: "about", label: "Stats Sidebar", description: "Narrative with sticky stats sidebar.", composition: "split", hierarchy: "Copy + stats rail", rhythm: "Sidebar metrics anchor", visualIdentity: "Data-backed story", imageSlots: ["about"], responsiveStrategy: "Stats below copy on mobile" },
  { id: "image-duo", sectionKind: "about", label: "Image Duo", description: "Two offset images framing central copy.", composition: "asymmetric", hierarchy: "Dual images + center text", rhythm: "Triptych composition", visualIdentity: "Gallery framing", imageSlots: ["about", "gallery"], responsiveStrategy: "Images stack above/below" },
];
export const ABOUT_DEFAULT_VARIANT: AboutVariantId = "split-narrative";

export const SERVICES_VARIANT_REGISTRY: VariantDefinition<"services">[] = [
  { id: "card-grid", sectionKind: "services", label: "Card Grid", description: "Uniform service cards in responsive grid.", composition: "grid", hierarchy: "Equal service cards", rhythm: "Even grid spacing", visualIdentity: "Professional catalog", imageSlots: [], responsiveStrategy: "2-col mobile, 4-col desktop", isDefault: true },
  { id: "tabbed-list", sectionKind: "services", label: "Tabbed List", description: "Category tabs with filtered service list.", composition: "inline", hierarchy: "Tabs → list panel", rhythm: "Tab switch rhythm", visualIdentity: "Organized catalog", imageSlots: [], responsiveStrategy: "Scrollable tabs on mobile" },
  { id: "process-rail", sectionKind: "services", label: "Process Rail", description: "Horizontal process steps with connectors.", composition: "rail", hierarchy: "Step nodes connected", rhythm: "Linear process flow", visualIdentity: "Journey map", imageSlots: [], responsiveStrategy: "Vertical steps on mobile" },
  { id: "pricing-teaser", sectionKind: "services", label: "Pricing Teaser", description: "Service cards with price hints.", composition: "grid", hierarchy: "Title + price badge", rhythm: "Price-forward cards", visualIdentity: "Commercial clarity", imageSlots: [], responsiveStrategy: "Stack cards" },
  { id: "icon-rows", sectionKind: "services", label: "Icon Rows", description: "Full-width rows with icon, title, description.", composition: "stacked", hierarchy: "Row list with icons", rhythm: "Consistent row height", visualIdentity: "Clean service list", imageSlots: [], responsiveStrategy: "Rows stack naturally" },
  { id: "featured-spotlight", sectionKind: "services", label: "Featured Spotlight", description: "One hero service + supporting grid.", composition: "asymmetric", hierarchy: "Featured + grid", rhythm: "1 large + 3 small", visualIdentity: "Signature service", imageSlots: ["features"], responsiveStrategy: "Featured first on mobile" },
  { id: "category-columns", sectionKind: "services", label: "Category Columns", description: "Multi-column grouped by category.", composition: "grid", hierarchy: "Category headers + items", rhythm: "Column groups", visualIdentity: "Structured menu", imageSlots: [], responsiveStrategy: "Columns stack" },
  { id: "minimal-list", sectionKind: "services", label: "Minimal List", description: "Borderless minimal text list.", composition: "minimal", hierarchy: "Title + dash + description", rhythm: "Tight list rhythm", visualIdentity: "Understated luxury", imageSlots: [], responsiveStrategy: "Full-width list" },
];
export const SERVICES_DEFAULT_VARIANT: ServicesVariantId = "card-grid";

export const PORTFOLIO_VARIANT_REGISTRY: VariantDefinition<"portfolio">[] = [
  { id: "masonry-grid", sectionKind: "portfolio", label: "Masonry Grid", description: "Pinterest-style masonry image grid.", composition: "mosaic", hierarchy: "Varied tile heights", rhythm: "Organic flow", visualIdentity: "Gallery wall", imageSlots: ["gallery"], responsiveStrategy: "1-2 column masonry", isDefault: true },
  { id: "carousel-strip", sectionKind: "portfolio", label: "Carousel Strip", description: "Horizontal scrolling project strip.", composition: "carousel", hierarchy: "Wide cards in rail", rhythm: "Horizontal discovery", visualIdentity: "Showreel strip", imageSlots: ["gallery"], responsiveStrategy: "Snap scroll" },
  { id: "case-studies", sectionKind: "portfolio", label: "Case Studies", description: "Large case study cards with metadata.", composition: "stacked", hierarchy: "Image + title + category + desc", rhythm: "Vertical case blocks", visualIdentity: "Agency case studies", imageSlots: ["gallery"], responsiveStrategy: "Full-width cards" },
  { id: "editorial-reel", sectionKind: "portfolio", label: "Editorial Reel", description: "Numbered editorial project list.", composition: "editorial", hierarchy: "Index numbers + titles", rhythm: "Editorial index", visualIdentity: "Magazine index", imageSlots: ["gallery"], responsiveStrategy: "List stacks" },
  { id: "filter-grid", sectionKind: "portfolio", label: "Filter Grid", description: "Category filter chips above grid.", composition: "grid", hierarchy: "Filters + filtered grid", rhythm: "Filter then grid", visualIdentity: "Curated collection", imageSlots: ["gallery"], responsiveStrategy: "Filter wraps" },
  { id: "full-bleed-showcase", sectionKind: "portfolio", label: "Full Bleed Showcase", description: "Edge-to-edge alternating showcases.", composition: "immersive", hierarchy: "Full-bleed image bands", rhythm: "Alternating bands", visualIdentity: "Immersive gallery", imageSlots: ["gallery"], responsiveStrategy: "Full width images" },
  { id: "split-feature", sectionKind: "portfolio", label: "Split Feature", description: "Featured project split with list.", composition: "split", hierarchy: "Large feature + compact list", rhythm: "1:1 split", visualIdentity: "Featured work", imageSlots: ["gallery"], responsiveStrategy: "Feature first" },
  { id: "minimal-index", sectionKind: "portfolio", label: "Minimal Index", description: "Text-only project index with hover reveal.", composition: "minimal", hierarchy: "Title list with categories", rhythm: "Tight index lines", visualIdentity: "Swiss index", imageSlots: [], responsiveStrategy: "Full-width lines" },
];
export const PORTFOLIO_DEFAULT_VARIANT: PortfolioVariantId = "masonry-grid";

export const PRICING_VARIANT_REGISTRY: VariantDefinition<"pricing">[] = [
  { id: "tier-cards", sectionKind: "pricing", label: "Tier Cards", description: "Three-tier pricing card layout.", composition: "grid", hierarchy: "Equal cards, center featured", rhythm: "3-up card grid", visualIdentity: "SaaS pricing", imageSlots: [], responsiveStrategy: "Stack tiers", isDefault: true },
  { id: "comparison-table", sectionKind: "pricing", label: "Comparison Table", description: "Feature comparison table across tiers.", composition: "table", hierarchy: "Table rows × columns", rhythm: "Tabular scan", visualIdentity: "Analytical comparison", imageSlots: [], responsiveStrategy: "Horizontal scroll table" },
  { id: "toggle-annual", sectionKind: "pricing", label: "Toggle Annual", description: "Monthly/annual toggle above tier cards.", composition: "grid", hierarchy: "Toggle + cards", rhythm: "Toggle then grid", visualIdentity: "Flexible billing", imageSlots: [], responsiveStrategy: "Toggle centers, cards stack" },
  { id: "feature-matrix", sectionKind: "pricing", label: "Feature Matrix", description: "Dense feature matrix with checkmarks.", composition: "table", hierarchy: "Features × tiers matrix", rhythm: "Dense grid", visualIdentity: "Enterprise matrix", imageSlots: [], responsiveStrategy: "Scrollable matrix" },
  { id: "minimal-single", sectionKind: "pricing", label: "Minimal Single", description: "Single plan with feature list.", composition: "centered", hierarchy: "One plan centered", rhythm: "Focused single offer", visualIdentity: "Simple pricing", imageSlots: [], responsiveStrategy: "Narrow centered" },
  { id: "enterprise-callout", sectionKind: "pricing", label: "Enterprise Callout", description: "Two tiers + enterprise callout band.", composition: "band", hierarchy: "Cards + full-width CTA band", rhythm: "Cards then band", visualIdentity: "Enterprise upsell", imageSlots: [], responsiveStrategy: "Band full-width" },
  { id: "slider-tiers", sectionKind: "pricing", label: "Slider Tiers", description: "Highlighted tier with side previews.", composition: "carousel", hierarchy: "Center featured tier", rhythm: "Carousel focus", visualIdentity: "Interactive tiers", imageSlots: [], responsiveStrategy: "Single tier visible mobile" },
  { id: "horizontal-scroll", sectionKind: "pricing", label: "Horizontal Scroll", description: "Scrollable pricing cards rail.", composition: "carousel", hierarchy: "Horizontal card rail", rhythm: "Snap scroll cards", visualIdentity: "App-store pricing", imageSlots: [], responsiveStrategy: "Horizontal scroll" },
];
export const PRICING_DEFAULT_VARIANT: PricingVariantId = "tier-cards";

export const TESTIMONIALS_VARIANT_REGISTRY: VariantDefinition<"testimonials">[] = [
  { id: "grid-cards", sectionKind: "testimonials", label: "Grid Cards", description: "3-column testimonial card grid.", composition: "grid", hierarchy: "Equal quote cards", rhythm: "Even 3-up grid", visualIdentity: "Social proof grid", imageSlots: ["testimonials"], responsiveStrategy: "1→2→3 cols", isDefault: true },
  { id: "featured-quote", sectionKind: "testimonials", label: "Featured Quote", description: "Single large featured quote.", composition: "centered", hierarchy: "One dominant quote", rhythm: "Centered focal", visualIdentity: "Hero testimonial", imageSlots: ["testimonials"], responsiveStrategy: "Full-width quote" },
  { id: "logo-wall", sectionKind: "testimonials", label: "Logo Wall", description: "Client logos with one quote above.", composition: "grid", hierarchy: "Quote + logo grid", rhythm: "Quote then logos", visualIdentity: "Trust badges", imageSlots: [], responsiveStrategy: "Logo wrap" },
  { id: "carousel-strip", sectionKind: "testimonials", label: "Carousel Strip", description: "Horizontal scrolling quote cards.", composition: "carousel", hierarchy: "Scrollable cards", rhythm: "Horizontal snap", visualIdentity: "Review rail", imageSlots: ["testimonials"], responsiveStrategy: "Scroll rail" },
  { id: "split-spotlight", sectionKind: "testimonials", label: "Split Spotlight", description: "Large quote left, avatar grid right.", composition: "split", hierarchy: "Quote + avatar grid", rhythm: "50/50 split", visualIdentity: "Personal spotlight", imageSlots: ["testimonials"], responsiveStrategy: "Stack split" },
  { id: "masonry-quotes", sectionKind: "testimonials", label: "Masonry Quotes", description: "Varied-height quote masonry.", composition: "mosaic", hierarchy: "Mixed card heights", rhythm: "Organic masonry", visualIdentity: "Editorial quotes", imageSlots: [], responsiveStrategy: "Column masonry" },
  { id: "video-style", sectionKind: "testimonials", label: "Video Style", description: "Video-frame cards with quote overlay.", composition: "grid", hierarchy: "Frame + overlay quote", rhythm: "Media-forward cards", visualIdentity: "Video testimonials", imageSlots: ["testimonials"], responsiveStrategy: "Stack frames" },
  { id: "minimal-list", sectionKind: "testimonials", label: "Minimal List", description: "Simple quote list with attribution.", composition: "minimal", hierarchy: "Quote + name lines", rhythm: "Tight list", visualIdentity: "Understated proof", imageSlots: [], responsiveStrategy: "Full-width list" },
];
export const TESTIMONIALS_DEFAULT_VARIANT: TestimonialsVariantId = "grid-cards";

export const CTA_VARIANT_REGISTRY: VariantDefinition<"cta">[] = [
  { id: "centered-band", sectionKind: "cta", label: "Centered Band", description: "Centered headline with dual CTAs.", composition: "centered", hierarchy: "H2 + subtitle + CTAs", rhythm: "Symmetric band", visualIdentity: "Classic CTA band", imageSlots: [], responsiveStrategy: "Centered stack", isDefault: true },
  { id: "split-offer", sectionKind: "cta", label: "Split Offer", description: "Copy left, action panel right.", composition: "split", hierarchy: "50/50 split offer", rhythm: "Split conversion", visualIdentity: "Offer panel", imageSlots: [], responsiveStrategy: "Stack split" },
  { id: "gradient-banner", sectionKind: "cta", label: "Gradient Banner", description: "Full-width gradient banner CTA.", composition: "band", hierarchy: "Gradient band with CTAs", rhythm: "Bold color band", visualIdentity: "High-energy banner", imageSlots: [], responsiveStrategy: "Full-width band" },
  { id: "inline-newsletter", sectionKind: "cta", label: "Inline Newsletter", description: "Email capture inline with headline.", composition: "inline", hierarchy: "Headline + email form", rhythm: "Inline form row", visualIdentity: "Newsletter signup", imageSlots: [], responsiveStrategy: "Form stacks" },
  { id: "floating-card", sectionKind: "cta", label: "Floating Card", description: "Elevated card CTA on subtle background.", composition: "centered", hierarchy: "Card on surface", rhythm: "Floating elevation", visualIdentity: "Card CTA", imageSlots: [], responsiveStrategy: "Card full-width mobile" },
  { id: "minimal-line", sectionKind: "cta", label: "Minimal Line", description: "Single line with text link CTA.", composition: "minimal", hierarchy: "One line + link", rhythm: "Ultra minimal", visualIdentity: "Quiet CTA", imageSlots: [], responsiveStrategy: "Wrap line" },
];
export const CTA_DEFAULT_VARIANT: CtaVariantId = "centered-band";

export const CONTACT_VARIANT_REGISTRY: VariantDefinition<"contact">[] = [
  { id: "split-form", sectionKind: "contact", label: "Split Form", description: "Contact info left, form right.", composition: "split", hierarchy: "Info + form split", rhythm: "50/50 split", visualIdentity: "Professional contact", imageSlots: [], responsiveStrategy: "Stack form below", isDefault: true },
  { id: "centered-minimal", sectionKind: "contact", label: "Centered Minimal", description: "Centered minimal contact form.", composition: "centered", hierarchy: "Centered narrow form", rhythm: "Focused center", visualIdentity: "Minimal contact", imageSlots: [], responsiveStrategy: "Narrow centered" },
  { id: "map-sidebar", sectionKind: "contact", label: "Map Sidebar", description: "Map placeholder with sidebar form.", composition: "split", hierarchy: "Map + sidebar", rhythm: "Visual + form", visualIdentity: "Location-forward", imageSlots: ["backgrounds"], responsiveStrategy: "Map above form" },
  { id: "cards-grid", sectionKind: "contact", label: "Cards Grid", description: "Contact method cards + form below.", composition: "grid", hierarchy: "3 cards + form", rhythm: "Cards then form", visualIdentity: "Multi-channel", imageSlots: [], responsiveStrategy: "Cards stack" },
  { id: "stacked-inline", sectionKind: "contact", label: "Stacked Inline", description: "Inline horizontal form fields.", composition: "inline", hierarchy: "Single-row inline form", rhythm: "Compact inline", visualIdentity: "Quick contact", imageSlots: [], responsiveStrategy: "Fields stack" },
  { id: "dark-panel", sectionKind: "contact", label: "Dark Panel", description: "Dark panel with light form.", composition: "centered", hierarchy: "Dark container focal", rhythm: "Contained dark panel", visualIdentity: "Premium dark", imageSlots: [], responsiveStrategy: "Panel full-width mobile" },
];
export const CONTACT_DEFAULT_VARIANT: ContactVariantId = "split-form";

export const FOOTER_VARIANT_REGISTRY: VariantDefinition<"footer">[] = [
  { id: "four-column", sectionKind: "footer", label: "Four Column", description: "Brand + three link columns.", composition: "grid", hierarchy: "Brand col + 3 link cols", rhythm: "4-column grid", visualIdentity: "Standard footer", imageSlots: [], responsiveStrategy: "Columns stack", isDefault: true },
  { id: "minimal-centered", sectionKind: "footer", label: "Minimal Centered", description: "Centered brand and links.", composition: "centered", hierarchy: "Centered minimal", rhythm: "Compact center", visualIdentity: "Minimal footer", imageSlots: [], responsiveStrategy: "Centered stack" },
  { id: "mega-sitemap", sectionKind: "footer", label: "Mega Sitemap", description: "Large multi-column sitemap.", composition: "grid", hierarchy: "5+ link columns", rhythm: "Dense sitemap", visualIdentity: "Enterprise sitemap", imageSlots: [], responsiveStrategy: "Multi-col to stack" },
  { id: "newsletter-band", sectionKind: "footer", label: "Newsletter Band", description: "Newsletter signup above link columns.", composition: "band", hierarchy: "Newsletter band + links", rhythm: "Band then grid", visualIdentity: "Engagement footer", imageSlots: [], responsiveStrategy: "Band full-width" },
  { id: "compact-inline", sectionKind: "footer", label: "Compact Inline", description: "Single row inline links.", composition: "inline", hierarchy: "One-line footer", rhythm: "Horizontal inline", visualIdentity: "Compact footer", imageSlots: [], responsiveStrategy: "Wrap links" },
];
export const FOOTER_DEFAULT_VARIANT: FooterVariantId = "four-column";

/** Central registry of all section variants — consumed by AI selection in a future phase. */
export const SECTION_VARIANT_REGISTRY: VariantDefinition[] = [
  ...HERO_VARIANT_REGISTRY,
  ...FEATURES_VARIANT_REGISTRY,
  ...ABOUT_VARIANT_REGISTRY,
  ...SERVICES_VARIANT_REGISTRY,
  ...PORTFOLIO_VARIANT_REGISTRY,
  ...PRICING_VARIANT_REGISTRY,
  ...TESTIMONIALS_VARIANT_REGISTRY,
  ...CTA_VARIANT_REGISTRY,
  ...CONTACT_VARIANT_REGISTRY,
  ...FOOTER_VARIANT_REGISTRY,
];

export const SECTION_DEFAULT_VARIANTS: Record<SectionKind, SectionVariantId> = {
  hero: HERO_DEFAULT_VARIANT,
  features: FEATURES_DEFAULT_VARIANT,
  about: ABOUT_DEFAULT_VARIANT,
  services: SERVICES_DEFAULT_VARIANT,
  portfolio: PORTFOLIO_DEFAULT_VARIANT,
  pricing: PRICING_DEFAULT_VARIANT,
  testimonials: TESTIMONIALS_DEFAULT_VARIANT,
  cta: CTA_DEFAULT_VARIANT,
  contact: CONTACT_DEFAULT_VARIANT,
  footer: FOOTER_DEFAULT_VARIANT,
};

const REGISTRY_BY_SECTION = new Map<SectionKind, VariantDefinition[]>(
  (Object.keys(SECTION_VARIANT_COUNTS) as SectionKind[]).map((kind) => [
    kind,
    SECTION_VARIANT_REGISTRY.filter((v) => v.sectionKind === kind),
  ]),
);

const REGISTRY_BY_KEY = new Map<string, VariantDefinition>(
  SECTION_VARIANT_REGISTRY.map((v) => [`${v.sectionKind}:${v.id}`, v]),
);

export function listSectionVariants(sectionKind: SectionKind): VariantDefinition[] {
  return REGISTRY_BY_SECTION.get(sectionKind) ?? [];
}

export function getVariantDefinition(
  sectionKind: SectionKind,
  variantId: SectionVariantId,
): VariantDefinition | undefined {
  return REGISTRY_BY_KEY.get(`${sectionKind}:${variantId}`);
}

export function getDefaultVariantId(sectionKind: SectionKind): SectionVariantId {
  return SECTION_DEFAULT_VARIANTS[sectionKind];
}

export function validateVariantRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [kind, expected] of Object.entries(SECTION_VARIANT_COUNTS) as Array<
    [SectionKind, number]
  >) {
    const variants = listSectionVariants(kind);
    if (variants.length !== expected) {
      errors.push(`${kind}: expected ${expected} variants, found ${variants.length}`);
    }
    const defaults = variants.filter((v) => v.isDefault);
    if (defaults.length !== 1) {
      errors.push(`${kind}: expected exactly 1 default variant, found ${defaults.length}`);
    }
    const ids = new Set(variants.map((v) => v.id));
    if (ids.size !== variants.length) {
      errors.push(`${kind}: duplicate variant IDs detected`);
    }
  }

  if (SECTION_VARIANT_REGISTRY.length !== Object.values(SECTION_VARIANT_COUNTS).reduce((a, b) => a + b, 0)) {
    errors.push("Total registry count mismatch");
  }

  return { valid: errors.length === 0, errors };
}
