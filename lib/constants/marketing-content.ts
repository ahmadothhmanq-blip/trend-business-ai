export const REF_HERO = {
  badge: "Next-Generation Business Intelligence.",
  headlineLine1: "One AI Platform.",
  headlineLine2: "Every Business Solution.",
  sub: "Build websites, apps, videos, automate marketing, manage projects, CRM, ERP and grow your business faster with the power of AI.",
} as const;

export const REF_STATS = [
  { value: "5000+", label: "Projects Completed" },
  { value: "120+", label: "Countries Served" },
  { value: "99.9%", label: "Success Rate" },
  { value: "24/7", label: "AI Support" },
] as const;

/** Homepage feature strip — same black/gold language as the reference board. */
export const REF_FEATURES = [
  {
    title: "AI Website & App Builder",
    description: "Generate premium websites, apps and landing pages with structure, flows and launch direction.",
    icon: "Layout",
  },
  {
    title: "AI Design Studio",
    description: "Create logos, brand systems and luxury visual concepts in one cohesive identity workflow.",
    icon: "Palette",
  },
  {
    title: "AI Content & Video",
    description: "Produce captions, calendars, storyboards and cinematic video concepts for every channel.",
    icon: "Clapperboard",
  },
  {
    title: "AI Marketing Engine",
    description: "Build campaign angles, offers, audiences and conversion-focused ad concepts instantly.",
    icon: "Megaphone",
  },
  {
    title: "Business Intelligence",
    description: "Map competitors, demand signals, risks and growth insights into executive-ready reports.",
    icon: "LineChart",
  },
  {
    title: "Private AI Workspace",
    description: "Authenticated dashboard, saved projects, history and export-ready assets scoped to your account.",
    icon: "Shield",
  },
] as const;

export const REF_FOOTER_TAGLINE =
  "Your all-in-one AI platform to build, automate and scale your business with next-generation solutions.";

export const REF_FOOTER_NEWSLETTER =
  "Subscribe to get the latest updates and offers from Trend Business AI.";

export const REF_FOOTER_SERVICES_LINKS = [
  { label: "AI Website Builder", href: "/products/create" },
  { label: "AI App Development", href: "/products/create" },
  { label: "AI Video Studio", href: "/products/content" },
  { label: "AI Marketing", href: "/products/business" },
  { label: "AI Business Management", href: "/products/business" },
  { label: "AI Agents", href: "/products/business" },
] as const;

export const REF_FOOTER_COMPANY = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/contact" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
] as const;

export const REF_FOOTER_RESOURCES = [
  { label: "Documentation", href: "/docs" },
  { label: "Help Center", href: "/faq" },
  { label: "API", href: "/docs" },
  { label: "Community", href: "/contact" },
] as const;

export type AiProductCategoryId = "create" | "design" | "content" | "business";

export type AiProductItem = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type AiProductCategory = {
  id: AiProductCategoryId;
  title: string;
  description: string;
  href: string;
  legacyHref: string;
  productCount: number;
  image: string;
  imageAlt: string;
  accent: string;
  eyebrow: string;
  headline: string;
  body: string;
  products: AiProductItem[];
};

export const AI_PRODUCT_CATEGORIES: AiProductCategory[] = [
  {
    id: "create",
    title: "Create",
    description: "Build websites, apps and landing pages with AI.",
    href: "/products/create",
    legacyHref: "/solutions/create",
    productCount: 3,
    image: "/images/ai/create-suite.png",
    imageAlt: "AI website and app builder interface in black and gold",
    accent: "from-[#D4AF37]/25 via-transparent to-transparent",
    eyebrow: "AI Products · Create",
    headline: "Ship websites, apps and landing pages with AI.",
    body: "Turn a product brief into structured pages, conversion sections, and launch-ready build direction — without starting from a blank canvas.",
    products: [
      {
        title: "AI Website & App Builder",
        description:
          "Generate premium website and app concepts with structure, pages, user flows and conversion sections.",
        image: "/images/ai/website-builder.png",
        imageAlt: "Luxury black and gold website and app builder illustration",
        href: "/products/website-builder",
      },
      {
        title: "Landing Page Builder",
        description:
          "Create high-converting landing page layouts, hero sections and offer messaging in minutes.",
        image: "/images/ai/template-landing.png",
        imageAlt: "AI landing page composition illustration",
        href: "/products/landing-page-builder",
      },
      {
        title: "App Concept Studio",
        description:
          "Plan mobile and web app experiences with screens, flows and launch-ready product direction.",
        image: "/images/ai/app-builder.png",
        imageAlt: "AI app concept and workflow illustration",
        href: "/products/app-builder",
      },
    ],
  },
  {
    id: "design",
    title: "Design",
    description: "Create logos, brand identities and AI images.",
    href: "/products/design",
    legacyHref: "/solutions/design",
    productCount: 3,
    image: "/images/ai/design-suite.png",
    imageAlt: "AI logo and brand identity designer in black and gold",
    accent: "from-[#F1C44D]/20 via-transparent to-transparent",
    eyebrow: "AI Products · Design",
    headline: "Craft logos, identities and visual systems.",
    body: "Generate brand direction, logo concepts, color systems and image prompts that feel premium from the first impression.",
    products: [
      {
        title: "AI Logo Designer",
        description:
          "Create refined logo concepts, brand marks and visual identity directions for modern companies.",
        image: "/images/ai/logo-designer.png",
        imageAlt: "Premium black and gold logo design illustration",
        href: "/products/logo-maker",
      },
      {
        title: "Brand Identity Studio",
        description:
          "Build color systems, typography guidance and brand voice for a cohesive luxury presence.",
        image: "/images/ai/template-brand.png",
        imageAlt: "Brand identity system illustration",
        href: "/products/brand-studio",
      },
      {
        title: "AI Image Generator",
        description:
          "Produce luxury visual concepts for products, campaigns, social media and brand storytelling.",
        image: "/images/ai/image-generator.png",
        imageAlt: "AI image generation illustration in black and gold",
        href: "/products/image-generator",
      },
    ],
  },
  {
    id: "content",
    title: "Content",
    description: "Generate videos, content and manage social media.",
    href: "/products/content",
    legacyHref: "/solutions/content",
    productCount: 3,
    image: "/images/ai/content-suite.png",
    imageAlt: "AI video and content studio in black and gold",
    accent: "from-[#D4AF37]/18 via-transparent to-transparent",
    eyebrow: "AI Products · Content",
    headline: "Produce content, video concepts and social plans.",
    body: "Build captions, calendars, storyboards and channel strategies so your brand stays consistent across every platform.",
    products: [
      {
        title: "AI Video Generator",
        description:
          "Storyboard cinematic video concepts for ads, explainers, launches and high-impact brand narratives.",
        image: "/images/ai/video-studio.png",
        imageAlt: "Professional black and gold video studio illustration",
        href: "/products/video-studio",
      },
      {
        title: "Social Content Writer",
        description:
          "Write captions, hooks, carousels and channel-specific campaigns for premium social growth.",
        image: "/images/ai/social-content.png",
        imageAlt: "Social content writing dashboard illustration",
        href: "/products/content-studio",
      },
      {
        title: "Social Media Analyzer",
        description:
          "Analyze social presence and performance signals to improve positioning, content and growth.",
        image: "/images/ai/social-analytics.png",
        imageAlt: "Social media analytics illustration",
        href: "/products/social-media-manager",
      },
    ],
  },
  {
    id: "business",
    title: "Business",
    description:
      "Marketing, Business Management, Business Intelligence and Feasibility Studies.",
    href: "/products/business",
    legacyHref: "/solutions/business",
    productCount: 4,
    image: "/images/ai/business-suite.png",
    imageAlt: "AI business intelligence and feasibility analytics in black and gold",
    accent: "from-[#B8941F]/22 via-transparent to-transparent",
    eyebrow: "AI Products · Business",
    headline: "Run growth, intelligence and feasibility with AI.",
    body: "Connect marketing strategy, operations planning, business intelligence and feasibility studies in one decision-ready workspace.",
    products: [
      {
        title: "AI Advertising Campaigns",
        description:
          "Generate campaign angles, offers, audiences, hooks and conversion-focused ad concepts.",
        image: "/images/ai/marketing-ads.png",
        imageAlt: "Advertising campaign dashboard illustration",
        href: "/products/marketing-ai",
      },
      {
        title: "Business & Project Management",
        description:
          "Turn goals into organized roadmaps, priorities, tasks and execution workflows.",
        image: "/images/ai/project-management.png",
        imageAlt: "Project management kanban illustration",
        href: "/products/business-manager",
      },
      {
        title: "Business Intelligence",
        description:
          "Map competitors, demand signals, risks and growth insights into executive-ready intelligence.",
        image: "/images/ai/crm-analytics.png",
        imageAlt: "Business intelligence charts illustration",
        href: "/products/business-intelligence",
      },
      {
        title: "Feasibility Study",
        description:
          "Evaluate viability, risks, competitors, audience demand and revenue models before launch.",
        image: "/images/ai/feasibility-study.png",
        imageAlt: "Feasibility study analytics illustration",
        href: "/products/feasibility-study",
      },
    ],
  },
];

/** @deprecated Prefer AI_PRODUCT_CATEGORIES — kept for compatibility */
export const REF_SOLUTIONS = AI_PRODUCT_CATEGORIES;

export const REF_FOOTER_SOLUTIONS = AI_PRODUCT_CATEGORIES.map((category) => ({
  label: category.title,
  href: category.href,
})) as readonly { label: string; href: string }[];

/** @deprecated Use REF_FOOTER_SOLUTIONS / AI Products */
export const REF_FOOTER_SERVICES = REF_FOOTER_SOLUTIONS;

export const REF_FOOTER_PRODUCTS = [
  { label: "Website & App Builder", href: "/dashboard/website-builder" },
  { label: "Brand Designer", href: "/dashboard/brand-designer" },
  { label: "Content Studio", href: "/dashboard/content-studio" },
  { label: "Business Intelligence", href: "/dashboard/business-intelligence" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const REF_FOOTER_DEVELOPERS = [
  { label: "Guides", href: "/docs" },
  { label: "API reference", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
  { label: "Support", href: "/contact" },
] as const;

export const REF_LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookies Policy", href: "/privacy" },
] as const;

export const REF_SERVICES = [
  {
    title: "AI Website & App Builder",
    description: "Generate premium website and app concepts with structure, pages, user flows, conversion sections and launch direction.",
    eyebrow: "Web & Apps",
  },
  {
    title: "AI Logo Designer",
    description: "Create refined logo concepts, brand marks, color systems and visual identity directions for modern companies.",
    eyebrow: "Branding",
  },
  {
    title: "AI Image Generator",
    description: "Produce luxury visual concepts for products, campaigns, social media, launch assets and brand storytelling.",
    eyebrow: "Creative",
  },
  {
    title: "AI Video Generator",
    description: "Storyboard cinematic video concepts for ads, explainers, launches, reels and high-impact brand narratives.",
    eyebrow: "Video",
  },
  {
    title: "AI Social Media Content Creator",
    description: "Write captions, hooks, carousels, content calendars and channel-specific campaigns for premium social growth.",
    eyebrow: "Content",
  },
  {
    title: "AI Business Feasibility Study",
    description: "Evaluate viability, risks, competitors, audience demand, revenue models and market opportunities before launch.",
    eyebrow: "Feasibility",
  },
  {
    title: "AI Business & Project Management",
    description: "Turn business goals into organized roadmaps, priorities, tasks, execution plans and project workflows.",
    eyebrow: "Operations",
  },
  {
    title: "AI Advertising Campaign Generator",
    description: "Generate campaign angles, offers, audiences, hooks, headlines and conversion-focused ad concepts.",
    eyebrow: "Advertising",
  },
  {
    title: "AI Social Media Analyzer",
    description: "Analyze social media presence and performance signals to improve positioning, content and growth opportunities.",
    eyebrow: "Analytics",
  },
] as const;

export const REF_WORKFLOW = [
  {
    step: "01",
    title: "Choose an AI product category",
    description: "Start in Create, Design, Content, or Business — each suite is built for a clear stage of growth.",
  },
  {
    step: "02",
    title: "Describe your brief",
    description: "Share your product, audience, offer, and goals. The clearer the brief, the stronger the output.",
  },
  {
    step: "03",
    title: "Generate premium assets",
    description: "Receive structured websites, brand systems, content plans, campaigns, and business intelligence.",
  },
  {
    step: "04",
    title: "Save, export, and execute",
    description: "Keep results in your private dashboard, export what you need, and turn insights into next steps.",
  },
] as const;

export const REF_PRICING = [
  {
    name: "Free Beta",
    price: "$0",
    description: "For founders exploring AI products across create, design, content, and business.",
    features: [
      "Access to all four AI product categories",
      "Private authenticated dashboard",
      "Saved projects and history",
      "Export-ready outputs",
      "Core workspace tools",
    ],
    cta: "Start Free",
    href: "/signup",
    featured: true,
  },
  {
    name: "Pro",
    price: "Coming Soon",
    description: "For teams that need higher limits, collaboration, and advanced usage controls.",
    features: [
      "Higher AI usage limits",
      "Team workspaces",
      "Advanced exports",
      "Priority support",
      "Billing and plan controls",
    ],
    cta: "Join Beta First",
    href: "/signup",
    featured: false,
  },
] as const;

export const REF_TRUST = [
  "Supabase authentication protects every private dashboard session.",
  "Generated assets stay scoped to your authenticated account.",
  "Export reports and projects without locking your work inside the platform.",
  "Built as a focused AI SaaS workspace — not a scattered tool pile.",
] as const;

/** Homepage — Why Trend Business AI */
export const REF_WHY = [
  {
    title: "One premium platform",
    description:
      "Create, Design, Content and Business live in one black-and-gold workspace — no tool sprawl, no fragmented brand.",
    image: "/images/ai/create-suite.png",
    imageAlt: "Unified AI platform workspace illustration",
  },
  {
    title: "Private by design",
    description:
      "Every session is authenticated. Projects, history and exports stay scoped to your account.",
    image: "/images/ai/business-suite.png",
    imageAlt: "Private business intelligence workspace illustration",
  },
  {
    title: "Export-ready output",
    description:
      "Move from brief to structured assets you can save, refine and take into real execution.",
    image: "/images/ai/project-management.png",
    imageAlt: "Project export and management illustration",
  },
] as const;

/** Homepage — featured individual AI products */
export const REF_FEATURED_PRODUCTS = [
  {
    title: "AI Website & App Builder",
    description: "Structure pages, flows and conversion sections from a single brief.",
    image: "/images/ai/website-builder.png",
    imageAlt: "AI website and app builder",
    href: "/products/website-builder",
    category: "Create",
  },
  {
    title: "AI Logo Designer",
    description: "Generate refined marks, color systems and identity direction.",
    image: "/images/ai/logo-designer.png",
    imageAlt: "AI logo designer",
    href: "/products/logo-maker",
    category: "Design",
  },
  {
    title: "AI Video Generator",
    description: "Storyboard cinematic ads, explainers and launch narratives.",
    image: "/images/ai/video-studio.png",
    imageAlt: "AI video studio",
    href: "/products/video-studio",
    category: "Content",
  },
  {
    title: "AI Advertising Campaigns",
    description: "Build angles, offers, audiences and conversion-focused concepts.",
    image: "/images/ai/marketing-ads.png",
    imageAlt: "AI advertising campaigns",
    href: "/products/marketing-ai",
    category: "Business",
  },
  {
    title: "AI Image Generator",
    description: "Luxury visual concepts for products, campaigns and storytelling.",
    image: "/images/ai/image-generator.png",
    imageAlt: "AI image generator",
    href: "/products/image-generator",
    category: "Design",
  },
  {
    title: "Business Intelligence",
    description: "Map demand, competitors and risks into executive-ready reports.",
    image: "/images/ai/crm-analytics.png",
    imageAlt: "Business intelligence analytics",
    href: "/products/business-intelligence",
    category: "Business",
  },
] as const;

/** Homepage — starter templates */
export const REF_TEMPLATES = [
  {
    title: "Luxury Landing Launch",
    description: "Hero, proof, offer and CTA structure for a premium product launch.",
    image: "/images/ai/template-landing.png",
    imageAlt: "Luxury landing page template",
    href: "/products/landing-page-builder",
    tag: "Create",
  },
  {
    title: "Brand Identity System",
    description: "Logo direction, palette and typography for a cohesive luxury brand.",
    image: "/images/ai/template-brand.png",
    imageAlt: "Brand identity template",
    href: "/products/brand-studio",
    tag: "Design",
  },
  {
    title: "30-Day Content Calendar",
    description: "Hooks, captions and channel plans for consistent social growth.",
    image: "/images/ai/template-content.png",
    imageAlt: "Content calendar template",
    href: "/products/content-studio",
    tag: "Content",
  },
  {
    title: "Full-Funnel Campaign",
    description: "Meta and Google angles with offer messaging and audience cues.",
    image: "/images/ai/template-campaign.png",
    imageAlt: "Advertising campaign template",
    href: "/products/marketing-ai",
    tag: "Business",
  },
] as const;

/** Homepage — testimonials */
export const REF_TESTIMONIALS = [
  {
    quote:
      "Trend Business AI feels like a full creative and strategy team in one premium workspace. We went from brief to launch assets in a single afternoon.",
    name: "Sara Al-Mansouri",
    role: "Founder, Lumen Commerce",
  },
  {
    quote:
      "The black-and-gold experience matches the quality of the output. Website concepts, brand marks and campaign angles finally live in one place.",
    name: "James Okonkwo",
    role: "Head of Growth, Northline",
  },
  {
    quote:
      "Private dashboard, exportable projects, and serious AI depth. It replaced four scattered tools for our studio.",
    name: "Elena Vargas",
    role: "Creative Director, Atelier V",
  },
] as const;

/** Homepage — FAQ */
export const REF_FAQ = [
  {
    question: "What can I build with Trend Business AI?",
    answer:
      "Websites, apps, landing pages, logos, brand systems, images, video concepts, social content, campaigns, business intelligence and feasibility studies — all from one authenticated workspace.",
  },
  {
    question: "Is the Free Beta really free?",
    answer:
      "Yes. During beta you can explore all four AI product categories, save projects to your private dashboard, and export outputs without a paid plan.",
  },
  {
    question: "Is my work private?",
    answer:
      "Yes. Dashboard records are scoped to your authenticated account. Public marketing pages never expose private workspace data.",
  },
  {
    question: "Can I export my projects?",
    answer:
      "Yes. Generated projects can be saved, revisited and exported so you are never locked into the platform.",
  },
  {
    question: "Do I need design or coding experience?",
    answer:
      "No. Describe your brief, choose a product category, and generate structured premium assets you can refine and ship.",
  },
  {
    question: "How is this different from other AI tools?",
    answer:
      "Trend Business AI is built as one luxury AI company — Create, Design, Content and Business — with a private dashboard, not a pile of disconnected chat prompts.",
  },
] as const;

/** How It Works step artwork */
export const REF_WORKFLOW_ART = [
  "/images/ai/create-suite.png",
  "/images/ai/design-suite.png",
  "/images/ai/content-suite.png",
  "/images/ai/business-suite.png",
] as const;

/** Individual product marketing pages keyed by URL slug. */
export type MarketingProductSlug =
  | "website-builder"
  | "app-builder"
  | "landing-page-builder"
  | "logo-maker"
  | "image-generator"
  | "brand-studio"
  | "video-studio"
  | "content-studio"
  | "social-media-manager"
  | "marketing-ai"
  | "business-manager"
  | "business-intelligence"
  | "feasibility-study";

export type MarketingProduct = {
  slug: MarketingProductSlug;
  categoryId: AiProductCategoryId;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  imageAlt: string;
  highlights: string[];
  capabilities: string[];
  outcomes: string[];
  dashboardHref: string;
};

export const MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: "website-builder",
    categoryId: "create",
    title: "AI Website & App Builder",
    eyebrow: "Create · Website Builder",
    description:
      "Generate premium website and app concepts with structure, pages, user flows, conversion sections and launch direction.",
    image: "/images/ai/website-builder.png",
    imageAlt: "AI website and app builder",
    highlights: [
      "Structured pages and conversion sections",
      "User flows and launch-ready direction",
      "Exportable project packages",
    ],
    capabilities: [
      "Generate structured page maps and conversion sections from a brief",
      "Define user flows for websites and app experiences",
      "Export project packages ready for refinement and handoff",
    ],
    outcomes: [
      "A clear build direction instead of a blank canvas",
      "Premium section hierarchy with launch-ready messaging",
      "Assets saved to your private authenticated dashboard",
    ],
    dashboardHref: "/dashboard/website-builder",
  },
  {
    slug: "landing-page-builder",
    categoryId: "create",
    title: "Landing Page Builder",
    eyebrow: "Create · Landing Pages",
    description:
      "Create high-converting landing page layouts, hero sections and offer messaging in minutes.",
    image: "/images/ai/template-landing.png",
    imageAlt: "AI landing page builder",
    highlights: [
      "Hero and offer messaging layouts",
      "Conversion-focused section structure",
      "Fast brief-to-page workflows",
    ],
    capabilities: [
      "Compose hero, proof, offer and CTA structures quickly",
      "Shape conversion-focused landing layouts from a brief",
      "Iterate messaging and section order without starting over",
    ],
    outcomes: [
      "Campaign-ready landing page concepts",
      "Offer messaging that matches your audience",
      "Faster launches with reusable page patterns",
    ],
    dashboardHref: "/dashboard/website-builder",
  },
  {
    slug: "app-builder",
    categoryId: "create",
    title: "App Concept Studio",
    eyebrow: "Create · Apps",
    description:
      "Plan mobile and web app experiences with screens, flows and launch-ready product direction.",
    image: "/images/ai/app-builder.png",
    imageAlt: "AI app concept studio",
    highlights: [
      "Screen and flow planning",
      "Product direction for launches",
      "Clear handoff for development",
    ],
    capabilities: [
      "Plan mobile and web screens with clear flows",
      "Translate product ideas into launch-ready direction",
      "Organize experience maps for design and engineering handoff",
    ],
    outcomes: [
      "A product concept your team can execute",
      "Screen and flow clarity before development",
      "Premium app direction aligned to your brand",
    ],
    dashboardHref: "/dashboard/website-builder",
  },
  {
    slug: "logo-maker",
    categoryId: "design",
    title: "AI Logo Designer",
    eyebrow: "Design · Logos",
    description:
      "Create refined logo concepts, brand marks and visual identity directions for modern companies.",
    image: "/images/ai/logo-designer.png",
    imageAlt: "AI logo designer",
    highlights: [
      "Logo concepts and brand marks",
      "Premium visual identity directions",
      "Ready for brand system expansion",
    ],
    capabilities: [
      "Generate refined logo concepts and brand marks",
      "Explore visual identity directions for modern companies",
      "Build marks ready to expand into a full brand system",
    ],
    outcomes: [
      "Distinctive logo directions in minutes",
      "Premium identity cues for your brand",
      "A foundation for brand studio expansion",
    ],
    dashboardHref: "/dashboard/brand-designer",
  },
  {
    slug: "brand-studio",
    categoryId: "design",
    title: "Brand Identity Studio",
    eyebrow: "Design · Brand",
    description:
      "Build color systems, typography guidance and brand voice for a cohesive luxury presence.",
    image: "/images/ai/template-brand.png",
    imageAlt: "Brand identity studio",
    highlights: [
      "Color and typography systems",
      "Brand voice guidance",
      "Cohesive luxury positioning",
    ],
    capabilities: [
      "Define color systems and typography guidance",
      "Shape brand voice for a cohesive luxury presence",
      "Align identity across products and campaigns",
    ],
    outcomes: [
      "A coherent brand system",
      "Consistent luxury positioning",
      "Ready-to-apply identity guidelines",
    ],
    dashboardHref: "/dashboard/brand-designer",
  },
  {
    slug: "image-generator",
    categoryId: "design",
    title: "AI Image Generator",
    eyebrow: "Design · Images",
    description:
      "Produce luxury visual concepts for products, campaigns, social media and brand storytelling.",
    image: "/images/ai/image-generator.png",
    imageAlt: "AI image generator",
    highlights: [
      "Campaign and product visuals",
      "Social storytelling concepts",
      "Premium black-and-gold aesthetic",
    ],
    capabilities: [
      "Produce luxury visual concepts for products and campaigns",
      "Create social and storytelling imagery direction",
      "Keep black-and-gold premium aesthetic consistency",
    ],
    outcomes: [
      "Campaign-ready visual concepts",
      "On-brand creative direction",
      "Assets you can refine and export",
    ],
    dashboardHref: "/dashboard/creative-studio",
  },
  {
    slug: "video-studio",
    categoryId: "content",
    title: "AI Video Generator",
    eyebrow: "Content · Video",
    description:
      "Storyboard cinematic video concepts for ads, explainers, launches and high-impact brand narratives.",
    image: "/images/ai/video-studio.png",
    imageAlt: "AI video studio",
    highlights: [
      "Ad and explainer storyboards",
      "Launch narrative concepts",
      "Channel-ready creative direction",
    ],
    capabilities: [
      "Storyboard ads, explainers and launch narratives",
      "Structure cinematic concepts for high-impact channels",
      "Plan scenes and messaging before production",
    ],
    outcomes: [
      "Clear video direction for your team",
      "Channel-ready narrative concepts",
      "Faster creative alignment before shoot or edit",
    ],
    dashboardHref: "/dashboard/content-studio",
  },
  {
    slug: "content-studio",
    categoryId: "content",
    title: "Social Content Writer",
    eyebrow: "Content · Writing",
    description:
      "Write captions, hooks, carousels and channel-specific campaigns for premium social growth.",
    image: "/images/ai/social-content.png",
    imageAlt: "Social content writer",
    highlights: [
      "Captions, hooks and carousels",
      "Channel-specific campaign plans",
      "Consistent brand voice",
    ],
    capabilities: [
      "Write captions, hooks and carousel concepts",
      "Plan channel-specific campaigns",
      "Keep brand voice consistent across platforms",
    ],
    outcomes: [
      "Publish-ready content direction",
      "Stronger hooks and offers",
      "A reusable content system for growth",
    ],
    dashboardHref: "/dashboard/content-studio",
  },
  {
    slug: "social-media-manager",
    categoryId: "content",
    title: "Social Media Analyzer",
    eyebrow: "Content · Social",
    description:
      "Analyze social presence and performance signals to improve positioning, content and growth.",
    image: "/images/ai/social-analytics.png",
    imageAlt: "Social media analyzer",
    highlights: [
      "Presence and performance signals",
      "Positioning recommendations",
      "Growth-focused content insights",
    ],
    capabilities: [
      "Analyze presence and performance signals",
      "Recommend positioning and content improvements",
      "Surface growth opportunities across channels",
    ],
    outcomes: [
      "Clearer social strategy",
      "Better content prioritization",
      "Insights scoped to your private workspace",
    ],
    dashboardHref: "/dashboard/social-media",
  },
  {
    slug: "marketing-ai",
    categoryId: "business",
    title: "AI Advertising Campaigns",
    eyebrow: "Business · Marketing",
    description:
      "Generate campaign angles, offers, audiences, hooks and conversion-focused ad concepts.",
    image: "/images/ai/marketing-ads.png",
    imageAlt: "AI advertising campaigns",
    highlights: [
      "Audience and offer angles",
      "Hooks and conversion concepts",
      "Campaign-ready creative briefs",
    ],
    capabilities: [
      "Generate campaign angles, offers and audiences",
      "Create hooks and conversion-focused ad concepts",
      "Build briefs ready for creative production",
    ],
    outcomes: [
      "Campaign concepts you can test quickly",
      "Stronger offer and audience fit",
      "Marketing direction without tool sprawl",
    ],
    dashboardHref: "/dashboard/marketing",
  },
  {
    slug: "business-manager",
    categoryId: "business",
    title: "Business & Project Management",
    eyebrow: "Business · Operations",
    description:
      "Turn goals into organized roadmaps, priorities, tasks and execution workflows.",
    image: "/images/ai/project-management.png",
    imageAlt: "Business project management",
    highlights: [
      "Roadmaps and priorities",
      "Task and execution workflows",
      "Operator-ready planning",
    ],
    capabilities: [
      "Turn goals into roadmaps and priorities",
      "Organize tasks and execution workflows",
      "Keep operators aligned in one workspace",
    ],
    outcomes: [
      "An actionable execution plan",
      "Clear ownership of next steps",
      "Less chaos across projects",
    ],
    dashboardHref: "/dashboard/business-manager",
  },
  {
    slug: "business-intelligence",
    categoryId: "business",
    title: "Business Intelligence",
    eyebrow: "Business · Intelligence",
    description:
      "Map competitors, demand signals, risks and growth insights into executive-ready intelligence.",
    image: "/images/ai/crm-analytics.png",
    imageAlt: "Business intelligence",
    highlights: [
      "Competitor and demand mapping",
      "Risk and growth insights",
      "Executive-ready summaries",
    ],
    capabilities: [
      "Map competitors, demand and risk signals",
      "Summarize growth insights for executives",
      "Keep intelligence exportable and account-scoped",
    ],
    outcomes: [
      "Decision-ready intelligence reports",
      "Faster competitive clarity",
      "Confidence before major bets",
    ],
    dashboardHref: "/dashboard/business-intelligence",
  },
  {
    slug: "feasibility-study",
    categoryId: "business",
    title: "Feasibility Study",
    eyebrow: "Business · Feasibility",
    description:
      "Evaluate viability, risks, competitors, audience demand and revenue models before launch.",
    image: "/images/ai/feasibility-study.png",
    imageAlt: "Feasibility study",
    highlights: [
      "Viability and risk evaluation",
      "Audience demand analysis",
      "Revenue model exploration",
    ],
    capabilities: [
      "Evaluate viability, risks and audience demand",
      "Explore competitors and revenue models",
      "Produce launch-readiness analysis before spend",
    ],
    outcomes: [
      "A clear go / no-go picture",
      "Risk-aware launch planning",
      "Executive-ready feasibility output",
    ],
    dashboardHref: "/dashboard/business-audit",
  },
];

export function getMarketingProduct(slug: string) {
  return MARKETING_PRODUCTS.find((p) => p.slug === slug);
}
