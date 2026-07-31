import type { ImageAspectRatio } from "@/lib/ai-core/assets/settings";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import type { ImagePurpose } from "@/lib/ai-core/image-engine/types";

/** Website section keys used for section-specific image strategies. */
export type SectionKey =
  | "hero"
  | "about"
  | "services"
  | "features"
  | "team"
  | "gallery"
  | "portfolio"
  | "testimonials"
  | "pricing"
  | "faq"
  | "contact"
  | "blog"
  | "cta"
  | "footer";

export type SectionImageStrategy = {
  key: SectionKey;
  purpose: ImagePurpose;
  layout: "wide-hero" | "portrait-card" | "square-card" | "background" | "banner" | "gallery" | "thumbnail";
  aspectRatio: ImageAspectRatio;
  /** Base shot description — never reuse hero wording for other sections. */
  shotSeed: string;
  cameraAngle: string;
  composition: string;
};

const QUALITY_RULES =
  "Professional photography, ultra realistic, premium quality, high detail, natural lighting, correct camera angle, website hero quality, editorial quality, high resolution, clean background, no watermark, no text, no logo.";

export function imageQualityGuardrails(): string {
  return QUALITY_RULES;
}

/** Infer section key from human-readable section name / key. */
export function inferSectionKey(name: string): SectionKey {
  const hay = name.toLowerCase().replace(/[_-]/g, " ");
  if (/hero|banner|masthead/.test(hay)) return "hero";
  if (/about|story|mission|who we/.test(hay)) return "about";
  if (/service|offering|solution/.test(hay)) return "services";
  if (/feature|benefit|capabilit/.test(hay)) return "features";
  if (/team|staff|people|leadership/.test(hay)) return "team";
  if (/gallery|showcase/.test(hay)) return "gallery";
  if (/portfolio|work|case stud|project/.test(hay)) return "portfolio";
  if (/testimonial|review|client|trust|social proof/.test(hay)) return "testimonials";
  if (/pricing|plan|package/.test(hay)) return "pricing";
  if (/faq|question/.test(hay)) return "faq";
  if (/contact|location|map|office/.test(hay)) return "contact";
  if (/blog|article|news|insight|post/.test(hay)) return "blog";
  if (/cta|call to action|get started|book now/.test(hay)) return "cta";
  if (/footer/.test(hay)) return "footer";
  return "features";
}

const SECTION_STRATEGIES: Record<SectionKey, Omit<SectionImageStrategy, "key">> = {
  hero: {
    purpose: "hero",
    layout: "wide-hero",
    aspectRatio: "16:9",
    shotSeed: "Dominant wide hero photograph with cinematic depth and clear subject hierarchy",
    cameraAngle: "wide cinematic eye-level or slight low angle",
    composition: "full-bleed hero frame with negative space for headline overlay",
  },
  about: {
    purpose: "section",
    layout: "banner",
    aspectRatio: "3:2",
    shotSeed: "Authentic behind-the-scenes or brand story moment, editorial narrative",
    cameraAngle: "environmental mid-shot at eye level",
    composition: "story-driven subject with warm context, not a generic office",
  },
  services: {
    purpose: "service",
    layout: "square-card",
    aspectRatio: "1:1",
    shotSeed: "Service delivery in action — craft, consultation, or hands-on expertise",
    cameraAngle: "environmental portrait or process close-up",
    composition: "people or process in authentic professional context",
  },
  features: {
    purpose: "section",
    layout: "square-card",
    aspectRatio: "1:1",
    shotSeed: "Feature highlight detail shot — product capability or benefit in use",
    cameraAngle: "supporting mid-shot with clear focal point",
    composition: "single strong subject, intentional crop for card layout",
  },
  team: {
    purpose: "section",
    layout: "portrait-card",
    aspectRatio: "4:5",
    shotSeed: "Professional team portrait in workplace environment, diverse and approachable",
    cameraAngle: "group or individual portrait, natural light",
    composition: "editorial team photography, shallow depth of field",
  },
  gallery: {
    purpose: "gallery",
    layout: "gallery",
    aspectRatio: "3:2",
    shotSeed: "Gallery showcase photograph with editorial magazine crop",
    cameraAngle: "varied editorial angles across the set",
    composition: "strong single subject, intentional asymmetry",
  },
  portfolio: {
    purpose: "gallery",
    layout: "gallery",
    aspectRatio: "3:2",
    shotSeed: "Portfolio case-study hero frame showcasing completed work",
    cameraAngle: "editorial wide or detail depending on work type",
    composition: "project-forward staging with premium finish",
  },
  testimonials: {
    purpose: "testimonial",
    layout: "portrait-card",
    aspectRatio: "1:1",
    shotSeed: "Authentic client portrait in natural light, trustworthy presence",
    cameraAngle: "natural portrait, shallow depth of field",
    composition: "warm human subject, soft bokeh background",
  },
  pricing: {
    purpose: "background",
    layout: "background",
    aspectRatio: "16:9",
    shotSeed: "Subtle atmospheric background suggesting value and professionalism",
    cameraAngle: "wide soft-focus atmospheric",
    composition: "low-contrast depth plane suitable behind pricing cards",
  },
  faq: {
    purpose: "background",
    layout: "background",
    aspectRatio: "16:9",
    shotSeed: "Calm minimal background texture with soft depth, non-distracting",
    cameraAngle: "wide atmospheric",
    composition: "gentle blur, suitable as section backdrop",
  },
  contact: {
    purpose: "section",
    layout: "banner",
    aspectRatio: "3:2",
    shotSeed: "Welcoming reception, storefront, or consultation space inviting contact",
    cameraAngle: "environmental wide inviting perspective",
    composition: "approachable space with clear entry or desk focal point",
  },
  blog: {
    purpose: "section",
    layout: "thumbnail",
    aspectRatio: "3:2",
    shotSeed: "Editorial blog header photography — writing, publishing, or topic mood",
    cameraAngle: "editorial flat-lay or lifestyle mid-shot",
    composition: "magazine editorial crop for article cards",
  },
  cta: {
    purpose: "background",
    layout: "wide-hero",
    aspectRatio: "16:9",
    shotSeed: "Motivating atmospheric wide shot driving action without competing with CTA text",
    cameraAngle: "wide cinematic",
    composition: "dramatic depth with space for centered CTA overlay",
  },
  footer: {
    purpose: "background",
    layout: "background",
    aspectRatio: "16:9",
    shotSeed: "Subtle brand atmosphere texture for footer band, very low contrast",
    cameraAngle: "wide minimal",
    composition: "soft gradient-like photographic depth, optional",
  },
};

export function getSectionStrategy(sectionKey: SectionKey): SectionImageStrategy {
  const base = SECTION_STRATEGIES[sectionKey];
  return { key: sectionKey, ...base };
}

export function aspectForSection(sectionKey: SectionKey): ImageAspectRatio {
  return SECTION_STRATEGIES[sectionKey].aspectRatio;
}

export function aspectForLayout(
  layout: SectionImageStrategy["layout"],
): ImageAspectRatio {
  switch (layout) {
    case "wide-hero":
    case "banner":
      return "16:9";
    case "portrait-card":
      return "4:5";
    case "square-card":
    case "thumbnail":
      return "1:1";
    case "gallery":
      return "3:2";
    case "background":
      return "16:9";
    default:
      return "3:2";
  }
}

/** Industry-specific visual shot libraries — each industry gets distinct subjects. */
const INDUSTRY_VISUALS: Record<IndustryId, Record<SectionKey, string[]>> = {
  restaurant: {
    hero: ["Luxury food photography hero spread", "Fine dining restaurant interior at golden hour"],
    about: ["Chef portrait in professional kitchen", "Farm-to-table ingredient story"],
    services: ["Plated signature dish close-up", "Wine pairing service moment"],
    features: ["Open kitchen action shot", "Seasonal menu ingredients"],
    team: ["Executive chef and kitchen brigade", "Front-of-house hospitality team"],
    gallery: ["Gourmet dish gallery", "Dining room ambiance"],
    portfolio: ["Tasting menu progression", "Private dining setup"],
    testimonials: ["Happy diner portrait in restaurant", "Couple celebrating at table"],
    pricing: ["Elegant table setting soft focus", "Candlelit dining atmosphere"],
    faq: ["Warm restaurant interior blur", "Subtle kitchen steam atmosphere"],
    contact: ["Restaurant entrance and signage area", "Reservation desk welcome"],
    blog: ["Food editorial flat-lay", "Recipe ingredients styling"],
    cta: ["Inviting dining room wide shot", "Chef presenting signature dish"],
    footer: ["Soft bokeh restaurant lights"],
  },
  "real-estate": {
    hero: ["Luxury modern home exterior at dusk", "Panoramic property hero with landscaping"],
    about: ["Real estate agency team in modern office", "Architect reviewing floor plans"],
    services: ["Property staging consultation", "Home showing with agent"],
    features: ["Smart home features detail", "Premium kitchen and living space"],
    team: ["Real estate agents professional group", "Broker leadership portrait"],
    gallery: ["Luxury interior living room", "Master suite and bathroom"],
    portfolio: ["Sold property showcase exterior", "Modern architecture detail"],
    testimonials: ["Happy homeowner portrait at new home", "Family at property closing"],
    pricing: ["Elegant home interior soft focus", "City skyline from penthouse"],
    faq: ["Neutral modern interior blur", "Subtle architectural lines"],
    contact: ["Real estate office reception", "Property listing consultation desk"],
    blog: ["Market report laptop and keys", "Neighborhood aerial editorial"],
    cta: ["Stunning home exterior wide", "Open house welcome scene"],
    footer: ["Soft architectural facade blur"],
  },
  clinic: {
    hero: ["Modern medical clinic reception", "Caring doctor in bright examination room"],
    about: ["Medical team in hospital corridor", "Healthcare mission compassionate care"],
    services: ["Doctor patient consultation", "Advanced medical equipment in use"],
    features: ["Diagnostic technology detail", "Clean sterile treatment room"],
    team: ["Medical staff diverse team portrait", "Specialist physician portrait"],
    gallery: ["Hospital facility gallery", "Dental clinic modern suite"],
    portfolio: ["Healthcare facility case study", "Laboratory research environment"],
    testimonials: ["Patient portrait natural light trusting", "Family with pediatrician"],
    pricing: ["Calm clinic waiting area soft focus", "Medical office neutral tones"],
    faq: ["Soft healthcare interior blur", "Clean medical environment"],
    contact: ["Clinic entrance and reception", "Appointment desk welcome"],
    blog: ["Health education editorial", "Medical research laptop"],
    cta: ["Welcoming clinic wide shot", "Book appointment consultation scene"],
    footer: ["Soft medical blue-toned atmosphere"],
  },
  law: {
    hero: ["Prestigious law office library", "Lawyer in courtroom or consultation"],
    about: ["Law firm partners portrait", "Legal heritage and credentials display"],
    services: ["Attorney client legal consultation", "Contract review professional scene"],
    features: ["Legal research and case preparation", "Courtroom advocacy moment"],
    team: ["Law firm attorneys group portrait", "Senior partner portrait"],
    gallery: ["Law office interior gallery", "Courtroom architecture"],
    portfolio: ["Case success milestone editorial", "Legal document signing"],
    testimonials: ["Client portrait professional trust", "Business owner legal advisor meeting"],
    pricing: ["Law library soft focus", "Executive office neutral tones"],
    faq: ["Subtle law office blur", "Legal books atmosphere"],
    contact: ["Law firm reception desk", "Consultation room welcome"],
    blog: ["Legal editorial writing desk", "Gavel and law books flat-lay"],
    cta: ["Confident attorney wide shot", "Free consultation invitation scene"],
    footer: ["Dark wood law library blur"],
  },
  education: {
    hero: ["University campus aerial hero", "Students on vibrant campus walkway"],
    about: ["Campus history and mission", "Dean or principal leadership portrait"],
    services: ["Classroom teaching moment", "Student mentorship session"],
    features: ["Science lab hands-on learning", "Digital learning technology"],
    team: ["Faculty group portrait", "Teachers in collaborative meeting"],
    gallery: ["Campus life gallery", "Graduation ceremony moments"],
    portfolio: ["Student achievement showcase", "Research project presentation"],
    testimonials: ["Graduate portrait proud achievement", "Parent and student testimonial"],
    pricing: ["Campus quad soft focus", "Library interior atmosphere"],
    faq: ["Classroom soft blur background", "Campus greenery atmosphere"],
    contact: ["Admissions office welcome", "Campus visitor center"],
    blog: ["Student writing laptop editorial", "Academic research publishing"],
    cta: ["Apply now campus wide shot", "Open day welcome scene"],
    footer: ["Soft campus autumn atmosphere"],
  },
  blog: {
    hero: ["Editorial writing desk with laptop", "Publishing workspace creative mood"],
    about: ["Author portrait in creative studio", "Editorial team behind the publication"],
    services: ["Content creation workflow", "Interview recording setup"],
    features: ["Featured article topic mood", "Newsletter and media kit"],
    team: ["Editorial team portrait", "Writers collaborative session"],
    gallery: ["Article photography gallery", "Event coverage editorial"],
    portfolio: ["Published story highlights", "Media appearance moments"],
    testimonials: ["Reader portrait engaged", "Subscriber testimonial natural"],
    pricing: ["Minimal desk soft focus", "Coffee shop writing atmosphere"],
    faq: ["Subtle notebook blur", "Soft editorial texture"],
    contact: ["Creative studio contact area", "Co-working editorial space"],
    blog: ["Magazine layout flat-lay", "Typewriter and coffee editorial"],
    cta: ["Subscribe wide editorial shot", "Read more inviting scene"],
    footer: ["Soft paper texture atmosphere"],
  },
  "landing-page": {
    hero: ["Startup product hero wide shot", "SaaS dashboard on modern laptop"],
    about: ["Founder team in startup office", "Product mission story moment"],
    services: ["Product demo on screen", "Customer onboarding session"],
    features: ["Feature highlight UI context", "Integration ecosystem visual"],
    team: ["Startup team diverse portrait", "Product and engineering collaboration"],
    gallery: ["Product screenshot gallery context", "Customer use-case moments"],
    portfolio: ["Case study success metric visual", "Before-after transformation"],
    testimonials: ["Startup customer portrait", "Enterprise buyer testimonial"],
    pricing: ["Clean tech office soft focus", "Minimal product staging"],
    faq: ["Subtle gradient tech atmosphere", "Abstract data visualization blur"],
    contact: ["Startup office welcome", "Demo booking desk"],
    blog: ["Growth marketing editorial", "Product update announcement"],
    cta: ["Get started motivating wide shot", "Free trial signup scene"],
    footer: ["Dark tech gradient atmosphere"],
  },
  saas: {
    hero: ["SaaS product on modern display", "Cloud technology abstract hero"],
    about: ["Product team in tech office", "Engineering culture moment"],
    services: ["Customer success onboarding", "API integration workflow"],
    features: ["Dashboard feature highlight", "Automation workflow visual"],
    team: ["Product engineering team portrait", "Leadership in standup"],
    gallery: ["Product UI in context gallery", "Integration partner logos context"],
    portfolio: ["Customer case study visual", "ROI metrics dashboard"],
    testimonials: ["SaaS customer portrait professional", "CTO testimonial tech office"],
    pricing: ["Clean SaaS office atmosphere", "Minimal product on desk"],
    faq: ["Abstract cloud data blur", "Subtle interface gradient"],
    contact: ["Sales demo room", "Support team welcome"],
    blog: ["Product changelog editorial", "Developer documentation laptop"],
    cta: ["Start free trial wide shot", "Book demo motivating scene"],
    footer: ["Dark interface atmosphere blur"],
  },
  technology: {
    hero: ["AI and cloud data center hero", "Cybersecurity operations center wide"],
    about: ["Technology company culture", "Innovation lab research team"],
    services: ["IT consulting session", "Cloud migration architecture review"],
    features: ["AI machine learning visualization", "Cybersecurity threat monitoring"],
    team: ["Engineering team diverse portrait", "Security analysts at workstations"],
    gallery: ["Data center gallery", "Server rack and network infrastructure"],
    portfolio: ["Enterprise deployment case study", "Digital transformation milestone"],
    testimonials: ["CTO portrait tech leadership", "Enterprise client testimonial"],
    pricing: ["Server room soft focus", "Dark tech interface atmosphere"],
    faq: ["Abstract circuit blur", "Blue data stream atmosphere"],
    contact: ["Tech campus reception", "Innovation center welcome"],
    blog: ["Tech editorial whitepaper desk", "Developer conference coverage"],
    cta: ["Transform your business wide shot", "Schedule technical consultation"],
    footer: ["Dark SOC atmosphere blur"],
  },
  automotive: {
    hero: ["Luxury vehicle hero in showroom", "Performance car dynamic studio shot"],
    about: ["Dealership heritage and team", "Automotive brand story"],
    services: ["Vehicle service bay professional", "Test drive handover moment"],
    features: ["Vehicle technology interior detail", "EV charging and sustainability"],
    team: ["Dealership sales team portrait", "Master technician portrait"],
    gallery: ["Vehicle inventory gallery", "Showroom display angles"],
    portfolio: ["Custom build showcase", "Restored classic vehicle"],
    testimonials: ["Happy car owner portrait", "Family with new vehicle"],
    pricing: ["Showroom soft focus atmosphere", "Garage workshop ambient"],
    faq: ["Tire and workshop blur", "Showroom lights bokeh"],
    contact: ["Dealership entrance", "Sales consultation desk"],
    blog: ["Automotive review editorial", "New model launch coverage"],
    cta: ["Book test drive wide shot", "View inventory motivating scene"],
    footer: ["Soft showroom reflection blur"],
  },
  tourism: {
    hero: ["Breathtaking destination landscape hero", "Luxury resort beach aerial"],
    about: ["Travel company team and story", "Local guide cultural moment"],
    services: ["Guided tour experience", "Luxury travel concierge service"],
    features: ["Adventure activity highlight", "Cultural immersion experience"],
    team: ["Travel experts team portrait", "Tour guide in destination"],
    gallery: ["Destination photo gallery", "Hotel and resort showcase"],
    portfolio: ["Curated itinerary highlight", "Exclusive travel package"],
    testimonials: ["Traveler portrait at destination", "Couple honeymoon testimonial"],
    pricing: ["Tropical resort soft focus", "Mountain vista atmosphere"],
    faq: ["Beach sunset blur", "Travel map atmosphere"],
    contact: ["Travel agency welcome desk", "Airport lounge consultation"],
    blog: ["Travel journal editorial", "Destination guide photography"],
    cta: ["Book your adventure wide shot", "Plan your trip motivating scene"],
    footer: ["Soft travel destination blur"],
  },
  ecommerce: {
    hero: ["Premium product hero staging", "Retail store front display"],
    about: ["Brand story and craftsmanship", "Founder artisan portrait"],
    services: ["Personal shopping consultation", "Product unboxing experience"],
    features: ["Product detail macro shot", "Sustainable packaging highlight"],
    team: ["Retail team portrait", "Customer service team"],
    gallery: ["Product collection gallery", "Lifestyle product in use"],
    portfolio: ["Bestseller showcase", "Seasonal collection highlight"],
    testimonials: ["Happy shopper portrait", "Customer with product"],
    pricing: ["Store interior soft focus", "Product shelf atmosphere"],
    faq: ["Neutral retail blur", "Soft shopping bag texture"],
    contact: ["Store entrance welcome", "Customer service desk"],
    blog: ["Shopping editorial flat-lay", "Style guide photography"],
    cta: ["Shop now wide product shot", "Limited offer motivating scene"],
    footer: ["Soft retail atmosphere blur"],
  },
  agency: {
    hero: ["Creative agency workspace hero", "Bold campaign mood board wall"],
    about: ["Agency founders story", "Creative culture behind the scenes"],
    services: ["Brand strategy workshop", "Creative campaign production"],
    features: ["Design process in action", "Digital marketing analytics"],
    team: ["Creative team diverse portrait", "Account and strategy leads"],
    gallery: ["Campaign work gallery", "Studio production moments"],
    portfolio: ["Award-winning campaign case study", "Brand identity launch"],
    testimonials: ["Client CEO portrait", "Marketing director testimonial"],
    pricing: ["Creative studio soft focus", "Minimal agency office"],
    faq: ["Abstract creative texture blur", "Color swatch atmosphere"],
    contact: ["Agency reception creative space", "Pitch room welcome"],
    blog: ["Creative industry editorial", "Design trend analysis laptop"],
    cta: ["Start your project wide shot", "Get a proposal motivating scene"],
    footer: ["Soft creative studio blur"],
  },
  furniture: {
    hero: ["Designer furniture showroom hero", "Luxury interior living space wide"],
    about: ["Craftsmanship and heritage story", "Artisan workshop moment"],
    services: ["Interior design consultation", "Custom furniture crafting"],
    features: ["Material and texture detail", "Ergonomic design highlight"],
    team: ["Design team portrait in showroom", "Craftspeople at work"],
    gallery: ["Furniture collection gallery", "Room setting showcases"],
    portfolio: ["Interior design project showcase", "Custom piece highlight"],
    testimonials: ["Homeowner in designed space", "Interior designer client portrait"],
    pricing: ["Showroom soft focus atmosphere", "Fabric swatch staging"],
    faq: ["Wood grain texture blur", "Neutral interior atmosphere"],
    contact: ["Showroom entrance welcome", "Design consultation area"],
    blog: ["Interior design editorial", "Furniture trend flat-lay"],
    cta: ["Visit showroom wide shot", "Book design consultation scene"],
    footer: ["Soft linen and wood atmosphere"],
  },
  business: {
    hero: ["Corporate headquarters hero wide", "Executive boardroom premium"],
    about: ["Company mission and leadership", "Corporate heritage timeline"],
    services: ["Business consultation meeting", "Professional advisory session"],
    features: ["Business capability highlight", "Growth strategy visualization"],
    team: ["Corporate team professional portrait", "Executive leadership group"],
    gallery: ["Office environment gallery", "Global presence showcase"],
    portfolio: ["Client success case study", "Industry milestone achievement"],
    testimonials: ["Business executive portrait trust", "Enterprise client testimonial"],
    pricing: ["Corporate office soft focus", "City skyline from office"],
    faq: ["Neutral office blur", "Subtle corporate texture"],
    contact: ["Corporate reception welcome", "Meeting room consultation"],
    blog: ["Business insights editorial", "Industry report laptop"],
    cta: ["Partner with us wide shot", "Schedule consultation motivating scene"],
    footer: ["Soft corporate atmosphere blur"],
  },
};

const FALLBACK_INDUSTRY: IndustryId = "business";

function normalizeIndustryId(raw: string): IndustryId {
  const v = raw.toLowerCase().trim().replace(/\s+/g, "-");
  if (v in INDUSTRY_VISUALS) return v as IndustryId;
  if (
    v.includes("furniture") ||
    v.includes("furnish") ||
    v.includes("sofa") ||
    v.includes("bedroom")
  ) {
    return "furniture";
  }
  const aliases: Record<string, IndustryId> = {
    medical: "clinic",
    healthcare: "clinic",
    health: "clinic",
    dental: "clinic",
    legal: "law",
    "law-firm": "law",
    travel: "tourism",
    retail: "ecommerce",
    shop: "ecommerce",
    store: "ecommerce",
    tech: "technology",
    startup: "landing-page",
    corporate: "business",
    fitness: "business",
    beauty: "business",
    spa: "business",
    luxury: "business",
    jewelry: "business",
    fashion: "ecommerce",
    hotel: "tourism",
    gym: "business",
  };
  if (aliases[v]) return aliases[v];
  return FALLBACK_INDUSTRY;
}

/** Pick a diverse industry-specific shot brief for a section (rotates by index). */
export function resolveIndustryVisualBrief(
  industry: string,
  sectionKey: SectionKey,
  varietyIndex = 0,
  usedBriefs?: Set<string>,
  businessProfile?: {
    industry: string;
    photographyStyle: string[];
    forbiddenSubjects: string[];
  },
): string {
  if (businessProfile?.photographyStyle.length) {
    const pool = businessProfile.photographyStyle;
    const start = varietyIndex % pool.length;
    for (let i = 0; i < pool.length; i += 1) {
      const brief = `${pool[(start + i) % pool.length]} — ${sectionKey} section for ${businessProfile.industry}`;
      if (!usedBriefs?.has(brief)) return brief;
    }
    return `${pool[start]} — ${sectionKey} for ${businessProfile.industry}`;
  }

  const id = normalizeIndustryId(industry);
  const pool =
    INDUSTRY_VISUALS[id]?.[sectionKey] ||
    INDUSTRY_VISUALS[FALLBACK_INDUSTRY][sectionKey];
  if (!pool.length) return getSectionStrategy(sectionKey).shotSeed;

  const start = varietyIndex % pool.length;
  for (let i = 0; i < pool.length; i += 1) {
    const brief = pool[(start + i) % pool.length];
    if (!usedBriefs?.has(brief)) return brief;
  }
  return pool[start];
}

export function buildSectionPromptSeed(
  sectionKey: SectionKey,
  projectName: string,
  industry: string,
  shotBrief?: string,
): string {
  const strategy = getSectionStrategy(sectionKey);
  const brief = shotBrief || strategy.shotSeed;
  return [
    `${brief} for ${projectName} (${industry}).`,
    `Layout: ${strategy.layout}.`,
    `Camera: ${strategy.cameraAngle}.`,
    `Composition: ${strategy.composition}.`,
    imageQualityGuardrails(),
  ].join(" ");
}

export function designToneFragment(
  designStyle: string,
  designPreset: string,
  brandStyle: string,
): string {
  const hay = `${designStyle} ${designPreset} ${brandStyle}`.toLowerCase();
  if (/luxury|premium|exclusive/.test(hay)) {
    return "Luxury editorial tone, refined materials, aspirational mood";
  }
  if (/minimal|clean|scandinavian/.test(hay)) {
    return "Minimal clean tone, negative space, calm restrained palette";
  }
  if (/corporate|trust|professional/.test(hay)) {
    return "Corporate professional tone, trustworthy, polished clarity";
  }
  if (/creative|editorial|agency|bold/.test(hay)) {
    return "Creative editorial tone, expressive contrast, distinctive framing";
  }
  if (/dark|noir|night/.test(hay)) {
    return "Dark moody tone, dramatic shadows, cinematic depth";
  }
  if (/tech|saas|modern|digital/.test(hay)) {
    return "Modern tech tone, crisp lines, contemporary lighting";
  }
  return "Premium contemporary tone, balanced exposure, agency-grade polish";
}

export const SUPPORTED_IMAGE_INDUSTRIES = Object.keys(
  INDUSTRY_VISUALS,
) as IndustryId[];

export const SUPPORTED_SECTION_KEYS = Object.keys(
  SECTION_STRATEGIES,
) as SectionKey[];
