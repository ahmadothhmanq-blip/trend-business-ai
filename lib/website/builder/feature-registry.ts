/**
 * Website Builder — unified feature registry & pipeline resolution.
 * Single source of truth for feature IDs, AI planning, pages, components, and file plans.
 */

import type { PlannedFileLike, ProjectCapabilityFlags } from "@/lib/ai/validator";
import type { WebsiteFeatureId } from "@/lib/constants/website-builder";
import { WEBSITE_FEATURE_IDS } from "@/lib/constants/website-builder";
import type {
  StrategyPage,
  StrategySection,
  WebsiteStrategy,
} from "@/plugins/website/layers/types";
import type { WebsiteProjectAnalysis } from "@/plugins/website/types";

export type WebsiteFeatureCategory =
  | "content"
  | "commerce"
  | "marketing"
  | "business"
  | "authentication"
  | "communication"
  | "analytics"
  | "administration"
  | "seo"
  | "media"
  | "localization"
  | "user-management"
  | "integrations";

export type WebsiteFeatureDefinition = {
  id: WebsiteFeatureId;
  name: string;
  labelKey: string;
  description: string;
  category: WebsiteFeatureCategory;
  icon: string;
  aliases: string[];
  capabilityFlags?: Partial<ProjectCapabilityFlags>;
  pages?: Array<{
    name: string;
    path: string;
    purpose: string;
    keySections?: string[];
    primaryCta?: string;
  }>;
  navItems?: Array<{ label: string; href: string }>;
  sections?: Array<{
    name: string;
    goal: string;
    componentId?: string;
  }>;
  componentIds?: string[];
  requiredFiles?: PlannedFileLike[];
  aiPlanning: string;
  exportSupport: boolean;
  publishSupport: boolean;
  builderDefault?: boolean;
};

export type ResolvedWebsiteFeatures = {
  ids: WebsiteFeatureId[];
  definitions: WebsiteFeatureDefinition[];
  capabilityFlags: Partial<ProjectCapabilityFlags>;
  componentIds: string[];
  aiPlanningBlock: string;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pageFile(path: string, purpose: string): PlannedFileLike {
  const category = path.includes("/api/") ? "api" : "pages";
  return {
    path,
    purpose,
    language: path.endsWith(".ts") ? "typescript" : "tsx",
    category,
  };
}

const REGISTRY_LIST: WebsiteFeatureDefinition[] = [
  {
    id: "login",
    name: "Authentication",
    labelKey: "authentication",
    description: "Login, register, and protected sessions",
    category: "authentication",
    icon: "Shield",
    aliases: [
      "authentication",
      "auth",
      "sign-in",
      "signin",
      "register",
      "social-login",
      "user-profiles",
    ],
    capabilityFlags: { requiresAuth: true, requiresDatabase: true },
    pages: [
      {
        name: "Login",
        path: "/login",
        purpose: "User sign-in",
        keySections: ["Login form", "Trust signals"],
        primaryCta: "Sign in",
      },
      {
        name: "Register",
        path: "/register",
        purpose: "Create account",
        keySections: ["Registration form"],
        primaryCta: "Create account",
      },
    ],
    navItems: [{ label: "Login", href: "/login" }],
    requiredFiles: [
      pageFile("app/login/page.tsx", "Login page with email/password form"),
      pageFile("app/register/page.tsx", "Registration page"),
      pageFile("lib/auth/session.ts", "Session helpers for auth state"),
      pageFile("middleware.ts", "Route protection middleware"),
    ],
    aiPlanning:
      "Implement authentication: login + register pages, session helpers, protected routes, and user-aware navigation.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    labelKey: "dashboard",
    description: "Authenticated user or admin dashboard",
    category: "administration",
    icon: "LayoutDashboard",
    aliases: ["admin-dashboard", "admin panel", "admin-panel", "administration"],
    capabilityFlags: { requiresDashboard: true, requiresAuth: true },
    pages: [
      {
        name: "Dashboard",
        path: "/dashboard",
        purpose: "Overview metrics and quick actions",
        keySections: ["KPI cards", "Recent activity", "Shortcuts"],
        primaryCta: "View reports",
      },
    ],
    navItems: [{ label: "Dashboard", href: "/dashboard" }],
    requiredFiles: [
      pageFile("app/dashboard/layout.tsx", "Dashboard shell layout"),
      pageFile("app/dashboard/page.tsx", "Dashboard overview page"),
      pageFile(
        "components/dashboard/sidebar.tsx",
        "Dashboard sidebar navigation",
      ),
    ],
    aiPlanning:
      "Add a protected dashboard with KPI cards, sidebar navigation, and role-aware overview.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "cms",
    name: "CMS",
    labelKey: "cms",
    description: "Content management for pages and posts",
    category: "content",
    icon: "FileStack",
    aliases: [
      "content-management",
      "content management",
      "knowledge-base",
      "support-center",
    ],
    capabilityFlags: { requiresDatabase: true },
    pages: [
      {
        name: "CMS",
        path: "/admin/content",
        purpose: "Manage site content",
        keySections: ["Content list", "Editor"],
      },
    ],
    componentIds: ["BlogSection"],
    aiPlanning:
      "Structure content for CMS management: typed content models, admin list views, and editable page blocks.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "blog",
    name: "Blog",
    labelKey: "blog",
    description: "Blog listing and article pages",
    category: "content",
    icon: "Newspaper",
    aliases: ["articles", "news", "posts", "comments"],
    pages: [
      {
        name: "Blog",
        path: "/blog",
        purpose: "Articles and insights",
        keySections: ["Featured post", "Article grid"],
        primaryCta: "Read article",
      },
    ],
    navItems: [{ label: "Blog", href: "/blog" }],
    sections: [
      { name: "Blog", goal: "Show latest articles", componentId: "BlogSection" },
    ],
    componentIds: ["BlogSection"],
    requiredFiles: [
      pageFile("app/blog/page.tsx", "Blog index with article cards"),
      pageFile("app/blog/[slug]/page.tsx", "Blog article detail page"),
    ],
    aiPlanning:
      "Generate blog index + article detail routes, editorial cards, categories, and SEO metadata per post.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "contact",
    name: "Contact",
    labelKey: "contact",
    description: "Contact forms and lead capture",
    category: "communication",
    icon: "Mail",
    aliases: ["forms", "contact-forms", "contact forms", "leads", "lead-collection"],
    pages: [
      {
        name: "Contact",
        path: "/contact",
        purpose: "Lead capture and inquiries",
        keySections: ["Contact form", "Business details"],
        primaryCta: "Send message",
      },
    ],
    navItems: [{ label: "Contact", href: "/contact" }],
    sections: [
      { name: "Contact", goal: "Capture leads", componentId: "ContactSection" },
    ],
    componentIds: ["ContactSection"],
    requiredFiles: [
      pageFile("app/contact/page.tsx", "Contact page with validated form"),
      pageFile("app/api/contact/route.ts", "Contact form API handler"),
    ],
    aiPlanning:
      "Implement a production contact form with validation, success state, and API route for submissions.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "booking",
    name: "Booking",
    labelKey: "booking",
    description: "Appointments and reservations",
    category: "business",
    icon: "Calendar",
    aliases: ["appointments", "booking-system", "reservations", "schedule"],
    pages: [
      {
        name: "Book",
        path: "/book",
        purpose: "Schedule appointments",
        keySections: ["Booking form", "Availability"],
        primaryCta: "Book now",
      },
    ],
    sections: [
      { name: "Booking", goal: "Schedule appointments", componentId: "BookingForm" },
    ],
    componentIds: ["BookingForm"],
    requiredFiles: [
      pageFile("app/book/page.tsx", "Booking / appointment page"),
      pageFile("app/api/booking/route.ts", "Booking request API"),
    ],
    aiPlanning:
      "Add appointment booking flow with date/time selection, confirmation, and booking API route.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "payment",
    name: "Payments",
    labelKey: "payments",
    description: "Checkout and payment collection",
    category: "commerce",
    icon: "CreditCard",
    aliases: ["payments", "checkout", "stripe", "billing"],
    capabilityFlags: { isEcommerce: true, requiresDatabase: true },
    pages: [
      {
        name: "Checkout",
        path: "/checkout",
        purpose: "Complete purchase",
        keySections: ["Order summary", "Payment form"],
        primaryCta: "Pay now",
      },
    ],
    requiredFiles: [
      pageFile("app/checkout/page.tsx", "Checkout page"),
      pageFile("app/api/checkout/route.ts", "Checkout / payment API stub"),
    ],
    aiPlanning:
      "Implement checkout page with order summary, payment form UI, and secure checkout API stub.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    labelKey: "ecommerce",
    description: "Product catalog, cart, and store flows",
    category: "commerce",
    icon: "ShoppingBag",
    aliases: [
      "e-commerce",
      "ecommerce",
      "shop",
      "store",
      "product-catalog",
      "shopping-cart",
      "cart",
      "wishlist",
      "favorites",
      "inventory",
      "order-tracking",
      "customer-accounts",
    ],
    capabilityFlags: {
      isEcommerce: true,
      requiresDatabase: true,
      requiresAuth: true,
    },
    pages: [
      {
        name: "Shop",
        path: "/shop",
        purpose: "Product catalog",
        keySections: ["Product grid", "Filters"],
        primaryCta: "Add to cart",
      },
      {
        name: "Cart",
        path: "/cart",
        purpose: "Shopping cart",
        keySections: ["Line items", "Totals"],
        primaryCta: "Checkout",
      },
    ],
    navItems: [
      { label: "Shop", href: "/shop" },
      { label: "Cart", href: "/cart" },
    ],
    sections: [
      {
        name: "Products",
        goal: "Showcase products",
        componentId: "ProductShowcase",
      },
    ],
    componentIds: ["ProductShowcase", "PricingModern"],
    requiredFiles: [
      pageFile("app/shop/page.tsx", "Product catalog page"),
      pageFile("app/cart/page.tsx", "Shopping cart page"),
      pageFile("app/api/products/route.ts", "Products API"),
    ],
    aiPlanning:
      "Build e-commerce catalog, cart, product detail patterns, and customer account hooks.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "chat",
    name: "Chat",
    labelKey: "chat",
    description: "Live chat or messaging widget",
    category: "communication",
    icon: "MessageCircle",
    aliases: ["live-chat", "messaging", "support-chat"],
    sections: [
      { name: "Chat", goal: "Offer live assistance", componentId: "ContactSection" },
    ],
    aiPlanning:
      "Add a floating chat / messaging widget with CTA to contact and optional webhook integration.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "notifications",
    name: "Notifications",
    labelKey: "notifications",
    description: "Toast and notification UX",
    category: "communication",
    icon: "Bell",
    aliases: ["alerts", "toasts", "push-notifications"],
    aiPlanning:
      "Include user notification patterns: toast feedback on forms, success/error states, and optional notification center in dashboard.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "analytics",
    name: "Analytics",
    labelKey: "analytics",
    description: "Traffic and conversion tracking",
    category: "analytics",
    icon: "BarChart3",
    aliases: ["tracking", "metrics", "experiments", "ab-testing"],
    aiPlanning:
      "Wire analytics hooks in layout metadata, conversion events on CTAs/forms, and optional dashboard metrics cards.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "crm",
    name: "CRM",
    labelKey: "crm",
    description: "Lead routing and CRM integrations",
    category: "integrations",
    icon: "Users",
    aliases: ["crm-integration", "marketing", "lead-routing"],
    aiPlanning:
      "Connect forms and booking flows to CRM webhook patterns and lead status tracking in dashboard.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: true,
  },
  {
    id: "newsletter",
    name: "Newsletter",
    labelKey: "newsletter",
    description: "Email signup and list growth",
    category: "marketing",
    icon: "Send",
    aliases: ["email-signup", "mailing-list"],
    sections: [
      { name: "Newsletter", goal: "Grow email list", componentId: "CtaSplit" },
    ],
    componentIds: ["CtaSplit"],
    requiredFiles: [
      pageFile("app/api/newsletter/route.ts", "Newsletter signup API"),
    ],
    aiPlanning:
      "Add newsletter signup block in footer or CTA with email validation and API route.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "search",
    name: "Search",
    labelKey: "search",
    description: "Site search for pages and content",
    category: "content",
    icon: "Search",
    aliases: ["site-search", "find"],
    aiPlanning:
      "Add header search input with client-side filter across pages/blog/products.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "testimonials",
    name: "Testimonials",
    labelKey: "testimonials",
    description: "Social proof and client reviews",
    category: "marketing",
    icon: "Star",
    aliases: ["reviews", "social-proof", "ratings"],
    sections: [
      {
        name: "Testimonials",
        goal: "Build trust",
        componentId: "TestimonialsModern",
      },
    ],
    componentIds: ["TestimonialsModern"],
    aiPlanning: "Include a testimonials/reviews section with quotes, names, and ratings.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "gallery",
    name: "Gallery",
    labelKey: "gallery",
    description: "Visual gallery and media grid",
    category: "media",
    icon: "Images",
    aliases: ["media", "photos", "image-gallery"],
    sections: [
      {
        name: "Gallery",
        goal: "Showcase visuals",
        componentId: "PortfolioGallery",
      },
    ],
    componentIds: ["PortfolioGallery"],
    aiPlanning: "Add a responsive image gallery with lightbox-style layout.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    labelKey: "portfolio",
    description: "Case studies and project showcase",
    category: "content",
    icon: "Briefcase",
    aliases: ["case-studies", "work", "projects"],
    pages: [
      {
        name: "Portfolio",
        path: "/portfolio",
        purpose: "Showcase work",
        keySections: ["Project grid", "Case study highlights"],
      },
    ],
    navItems: [{ label: "Portfolio", href: "/portfolio" }],
    componentIds: ["PortfolioGallery"],
    requiredFiles: [pageFile("app/portfolio/page.tsx", "Portfolio showcase page")],
    aiPlanning:
      "Generate portfolio/case-study pages with project cards and detail modals or subpages.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "faq",
    name: "FAQ",
    labelKey: "faq",
    description: "Frequently asked questions",
    category: "content",
    icon: "HelpCircle",
    aliases: ["questions", "help-center"],
    sections: [
      { name: "FAQ", goal: "Answer objections", componentId: "FaqAccordion" },
    ],
    componentIds: ["FaqAccordion"],
    aiPlanning: "Add FAQ accordion section with industry-specific Q&A.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "pricing",
    name: "Pricing",
    labelKey: "pricing",
    description: "Pricing tables and plans",
    category: "commerce",
    icon: "Tags",
    aliases: ["pricing-tables", "plans", "packages"],
    sections: [
      { name: "Pricing", goal: "Present plans", componentId: "PricingModern" },
    ],
    componentIds: ["PricingModern"],
    pages: [
      {
        name: "Pricing",
        path: "/pricing",
        purpose: "Plans and packages",
        keySections: ["Pricing table", "FAQ"],
        primaryCta: "Choose plan",
      },
    ],
    navItems: [{ label: "Pricing", href: "/pricing" }],
    requiredFiles: [pageFile("app/pricing/page.tsx", "Pricing plans page")],
    aiPlanning: "Include pricing table with tier comparison and featured plan.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "maps",
    name: "Maps",
    labelKey: "maps",
    description: "Location map and directions",
    category: "media",
    icon: "MapPin",
    aliases: ["location", "directions", "store-locator"],
    sections: [
      { name: "Location", goal: "Show address", componentId: "MapsSection" },
    ],
    componentIds: ["MapsSection"],
    aiPlanning: "Embed maps/location section with address, hours, and directions CTA.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "seo",
    name: "SEO Tools",
    labelKey: "seo",
    description: "Metadata, schema, and SEO structure",
    category: "seo",
    icon: "Globe2",
    aliases: ["seo-tools", "metadata", "schema"],
    aiPlanning:
      "Ensure every page exports metadata, OpenGraph tags, structured data (JSON-LD), and sitemap-ready routes.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "localization",
    name: "Multi-language",
    labelKey: "localization",
    description: "Locale switcher and translated routes",
    category: "localization",
    icon: "Languages",
    aliases: ["multi-language", "i18n", "rtl", "bilingual"],
    aiPlanning:
      "Support locale-aware navigation, lang attributes, RTL when needed, and language toggle in header.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "membership",
    name: "Membership",
    labelKey: "membership",
    description: "Gated content and member areas",
    category: "user-management",
    icon: "UserCheck",
    aliases: [
      "members",
      "role-management",
      "roles",
      "user-management",
      "customer-accounts",
    ],
    capabilityFlags: { requiresAuth: true, requiresDatabase: true },
    pages: [
      {
        name: "Members",
        path: "/members",
        purpose: "Member-only area",
        keySections: ["Gated content"],
      },
    ],
    aiPlanning:
      "Add membership gates, role-aware navigation, and protected member routes.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
  {
    id: "uploads",
    name: "File Uploads",
    labelKey: "uploads",
    description: "File upload forms and assets",
    category: "media",
    icon: "Upload",
    aliases: ["file-uploads", "documents", "attachments"],
    requiredFiles: [
      pageFile("app/api/upload/route.ts", "File upload API handler"),
    ],
    aiPlanning:
      "Support secure file upload UI on contact/booking forms with server handler stub.",
    exportSupport: true,
    publishSupport: true,
    builderDefault: false,
  },
];

export const WEBSITE_FEATURE_REGISTRY: Record<
  WebsiteFeatureId,
  WebsiteFeatureDefinition
> = Object.fromEntries(
  REGISTRY_LIST.map((def) => [def.id, def]),
) as Record<WebsiteFeatureId, WebsiteFeatureDefinition>;

for (const id of WEBSITE_FEATURE_IDS) {
  if (!WEBSITE_FEATURE_REGISTRY[id]) {
    throw new Error(`Missing WEBSITE_FEATURE_REGISTRY entry for "${id}"`);
  }
}

const ALIAS_INDEX = new Map<string, WebsiteFeatureId>();
for (const def of REGISTRY_LIST) {
  ALIAS_INDEX.set(def.id.toLowerCase(), def.id);
  ALIAS_INDEX.set(def.name.toLowerCase(), def.id);
  for (const alias of def.aliases) {
    ALIAS_INDEX.set(alias.toLowerCase(), def.id);
  }
  ALIAS_INDEX.set(def.labelKey.toLowerCase(), def.id);
}

export function normalizeWebsiteFeatureId(
  raw: string,
): WebsiteFeatureId | null {
  const key = raw.trim().toLowerCase();
  if (!key || key.startsWith("product:") || key.startsWith("template:")) {
    return null;
  }
  if (key.startsWith("component:") || key.startsWith("marketplace:")) {
    return null;
  }
  if (key.startsWith("feature:")) {
    return normalizeWebsiteFeatureId(key.slice("feature:".length));
  }
  return ALIAS_INDEX.get(key) ?? null;
}

export function resolveWebsiteFeatures(
  rawFeatures: string[] | undefined | null,
): ResolvedWebsiteFeatures {
  const ids = new Set<WebsiteFeatureId>();
  for (const raw of rawFeatures ?? []) {
    const id = normalizeWebsiteFeatureId(raw);
    if (id) ids.add(id);
  }

  const definitions = [...ids].map((id) => WEBSITE_FEATURE_REGISTRY[id]);
  const capabilityFlags: Partial<ProjectCapabilityFlags> = {};
  const componentIds = new Set<string>();

  for (const def of definitions) {
    if (def.capabilityFlags) {
      capabilityFlags.requiresAuth =
        capabilityFlags.requiresAuth || def.capabilityFlags.requiresAuth;
      capabilityFlags.requiresDashboard =
        capabilityFlags.requiresDashboard || def.capabilityFlags.requiresDashboard;
      capabilityFlags.requiresDatabase =
        capabilityFlags.requiresDatabase || def.capabilityFlags.requiresDatabase;
      capabilityFlags.isEcommerce =
        capabilityFlags.isEcommerce || def.capabilityFlags.isEcommerce;
      capabilityFlags.isSaas =
        capabilityFlags.isSaas || def.capabilityFlags.isSaas;
      if (def.capabilityFlags.databaseProvider) {
        capabilityFlags.databaseProvider = def.capabilityFlags.databaseProvider;
      }
    }
    for (const c of def.componentIds ?? []) componentIds.add(c);
  }

  if (capabilityFlags.requiresDatabase && !capabilityFlags.databaseProvider) {
    capabilityFlags.databaseProvider = "supabase";
  }

  const aiPlanningBlock = definitions.length
    ? [
        "SELECTED WEBSITE FEATURES (must be implemented in structure, pages, routes, navigation, and components — not mentioned only):",
        ...definitions.map((d) => `- ${d.name} (${d.id}): ${d.aiPlanning}`),
      ].join("\n")
    : "";

  return {
    ids: [...ids],
    definitions,
    capabilityFlags,
    componentIds: [...componentIds],
    aiPlanningBlock,
  };
}

export function listBuilderDefaultFeatures(): WebsiteFeatureDefinition[] {
  return REGISTRY_LIST.filter((d) => d.builderDefault);
}

export function listAllWebsiteBuilderFeatures(): WebsiteFeatureDefinition[] {
  return REGISTRY_LIST;
}

/** Original Website Builder advanced panel — display order preserved from pre-refactor UI. */
export const BUILDER_PANEL_FEATURES = [
  "Authentication",
  "Dashboard",
  "CMS",
  "Blog",
  "Payments",
  "Booking",
  "Chat",
  "Notifications",
  "Analytics",
  "CRM",
  "Admin Panel",
] as const;

export type BuilderPanelFeatureLabel = (typeof BUILDER_PANEL_FEATURES)[number];

export const BUILDER_PANEL_FEATURE_I18N: Record<BuilderPanelFeatureLabel, string> = {
  Authentication: "authentication",
  Dashboard: "dashboard",
  CMS: "cms",
  Blog: "blog",
  Payments: "payments",
  Booking: "booking",
  Chat: "chat",
  Notifications: "notifications",
  Analytics: "analytics",
  CRM: "crm",
  "Admin Panel": "adminPanel",
};

const REGISTRY_ID_TO_PANEL_LABEL: Partial<
  Record<WebsiteFeatureId, BuilderPanelFeatureLabel>
> = {
  login: "Authentication",
  dashboard: "Dashboard",
  cms: "CMS",
  blog: "Blog",
  payment: "Payments",
  booking: "Booking",
  chat: "Chat",
  notifications: "Notifications",
  analytics: "Analytics",
  crm: "CRM",
};

/**
 * Restore original panel selections from legacy display names, canonical ids,
 * or feature: prefixed values saved in older generations.
 */
export function hydrateBuilderPanelFeatures(
  raw: string[] | undefined | null,
): BuilderPanelFeatureLabel[] {
  const selected = new Set<BuilderPanelFeatureLabel>();

  for (const item of raw ?? []) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    if (
      (BUILDER_PANEL_FEATURES as readonly string[]).includes(trimmed)
    ) {
      selected.add(trimmed as BuilderPanelFeatureLabel);
      continue;
    }

    if (/admin/i.test(trimmed)) {
      selected.add("Admin Panel");
      continue;
    }

    const id = normalizeWebsiteFeatureId(trimmed);
    const panelLabel = id ? REGISTRY_ID_TO_PANEL_LABEL[id] : undefined;
    if (panelLabel) {
      selected.add(panelLabel);
    }
  }

  return BUILDER_PANEL_FEATURES.filter((label) => selected.has(label));
}

export const DEFAULT_BUILDER_PANEL_FEATURES: BuilderPanelFeatureLabel[] = [
  "Dashboard",
  "Booking",
  "Admin Panel",
];

export function applyFeaturesToCapabilityFlags(
  base: ProjectCapabilityFlags,
  resolved: ResolvedWebsiteFeatures,
): ProjectCapabilityFlags {
  return {
    ...base,
    requiresAuth: base.requiresAuth || Boolean(resolved.capabilityFlags.requiresAuth),
    requiresDashboard:
      base.requiresDashboard || Boolean(resolved.capabilityFlags.requiresDashboard),
    requiresDatabase:
      base.requiresDatabase || Boolean(resolved.capabilityFlags.requiresDatabase),
    isEcommerce: base.isEcommerce || Boolean(resolved.capabilityFlags.isEcommerce),
    isSaas: base.isSaas || Boolean(resolved.capabilityFlags.isSaas),
    databaseProvider:
      resolved.capabilityFlags.databaseProvider || base.databaseProvider,
  };
}

export function applyFeaturesToAnalysis(
  analysis: WebsiteProjectAnalysis,
  resolved: ResolvedWebsiteFeatures,
): WebsiteProjectAnalysis {
  const flags = applyFeaturesToCapabilityFlags(analysis, resolved);
  const pageNames = new Set(analysis.pages);
  const featureNames = new Set(analysis.features);

  for (const def of resolved.definitions) {
    featureNames.add(`feature:${def.id}`);
    for (const page of def.pages ?? []) {
      pageNames.add(page.name);
    }
  }

  const requiredSections = new Set(analysis.businessProfile.requiredSections);
  for (const def of resolved.definitions) {
    for (const section of def.sections ?? []) {
      requiredSections.add(section.name);
    }
    for (const page of def.pages ?? []) {
      for (const s of page.keySections ?? []) requiredSections.add(s);
    }
  }

  return {
    ...analysis,
    ...flags,
    pages: [...pageNames],
    features: [...featureNames],
    businessProfile: {
      ...analysis.businessProfile,
      requiredSections: [...requiredSections],
    },
  };
}

function mergePages(
  existing: StrategyPage[],
  incoming: StrategyPage[],
): StrategyPage[] {
  const byPath = new Map(existing.map((p) => [p.path, p]));
  for (const page of incoming) {
    if (!byPath.has(page.path)) byPath.set(page.path, page);
  }
  return [...byPath.values()];
}

function mergeSections(
  existing: StrategySection[],
  incoming: StrategySection[],
  homePage: string,
): StrategySection[] {
  const seen = new Set(existing.map((s) => `${s.page}:${s.name}`));
  const merged = [...existing];
  for (const section of incoming) {
    const key = `${section.page}:${section.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(section);
  }
  if (!merged.length && incoming.length) {
    return incoming.map((s, i) => ({
      ...s,
      page: s.page || homePage,
      id: s.id || `feature-section-${i}`,
    }));
  }
  return merged;
}

export function applyFeaturesToStrategy(
  strategy: WebsiteStrategy,
  resolved: ResolvedWebsiteFeatures,
): WebsiteStrategy {
  if (!resolved.definitions.length) return strategy;

  const homePage = strategy.pages[0]?.name || "Home";
  const newPages: StrategyPage[] = [];
  const newSections: StrategySection[] = [];
  const navCtas: string[] = [];

  for (const def of resolved.definitions) {
    for (const page of def.pages ?? []) {
      newPages.push({
        name: page.name,
        path: page.path,
        purpose: page.purpose,
        keySections: page.keySections ?? [def.name],
        primaryCta: page.primaryCta ?? "Learn more",
      });
    }
    for (const section of def.sections ?? []) {
      newSections.push({
        id: slugify(`${def.id}-${section.name}`),
        page: homePage,
        name: section.name,
        goal: section.goal,
        contentNotes: section.componentId
          ? `Component: ${section.componentId}`
          : def.aiPlanning,
      });
    }
    for (const nav of def.navItems ?? []) {
      navCtas.push(nav.label);
    }
  }

  const pages = mergePages(strategy.pages ?? [], newPages);
  const sectionPlan = mergeSections(
    strategy.sectionPlan ?? [],
    newSections,
    homePage,
  );
  const sitemap = Array.from(
    new Set([...(strategy.sitemap ?? []), ...pages.map((p) => p.path)]),
  );
  const ctas = Array.from(new Set([...(strategy.ctas ?? []), ...navCtas]));

  return {
    ...strategy,
    pages,
    sectionPlan,
    sitemap,
    ctas,
    contentStructure: Array.from(
      new Set([
        ...(strategy.contentStructure ?? []),
        ...resolved.definitions.map((d) => d.name),
      ]),
    ),
  };
}

export function mergeFeatureFilePlans<T extends PlannedFileLike>(
  plannedFiles: T[],
  resolved: ResolvedWebsiteFeatures,
): T[] {
  const byPath = new Map(plannedFiles.map((f) => [f.path, f]));
  for (const def of resolved.definitions) {
    for (const file of def.requiredFiles ?? []) {
      if (!byPath.has(file.path)) {
        byPath.set(file.path, file as T);
      }
    }
  }
  return [...byPath.values()];
}

export function normalizeWebsiteFeatureList(
  rawFeatures: string[] | undefined | null,
): string[] {
  const resolved = resolveWebsiteFeatures(rawFeatures);
  const meta = (rawFeatures ?? []).filter((f) =>
    /^(product|template|marketplace|component):/i.test(f),
  );
  return [...resolved.ids.map((id) => `feature:${id}`), ...meta];
}
