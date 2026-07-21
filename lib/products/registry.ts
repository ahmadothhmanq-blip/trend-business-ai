import {
  BarChart3,
  Clapperboard,
  Globe2,
  ImageIcon,
  LayoutTemplate,
  Megaphone,
  Palette,
  PenLine,
  SearchCheck,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { ProductDefinition, ProductId } from "@/lib/products/types";

export const PRODUCT_DEFINITIONS: Record<ProductId, ProductDefinition> = {
  "website-builder": {
    id: "website-builder",
    title: "AI Website Builder",
    eyebrow: "Create",
    description:
      "Describe your idea — AI builds a complete website product with pages, design, content, preview, and natural-language improvements. Export the full project as ZIP when ready.",
    icon: Globe2,
    href: "/dashboard/website-builder",
    kind: "website",
    defaultProjectType: "Business Website",
    promptLabel: "Website brief",
    promptPlaceholder:
      "Describe the business, audience, pages, features, and the premium look you want for the website.",
    generateLabel: "Create Website",
    templates: [
      "Luxury real estate marketplace",
      "Premium SaaS marketing site",
      "Clinic website with booking",
      "Restaurant ordering platform",
      "Executive portfolio website",
    ],
    outputs: ["Pages", "Design", "Content", "Live preview", "AI edits", "Export ZIP"],
    settingsHints: ["Project type", "Design style", "Color theme", "Language", "Features"],
    metrics: [
      { label: "Pages", value: "MVP" },
      { label: "Preview", value: "Visual" },
      { label: "Edit", value: "AI" },
      { label: "Export", value: "ZIP" },
    ],
  },
  "landing-page-builder": {
    id: "landing-page-builder",
    title: "AI Landing Page Builder",
    eyebrow: "Create",
    description:
      "Build high-converting landing pages with hero, offer, social proof, and CTA structures tuned for launches.",
    icon: LayoutTemplate,
    href: "/dashboard/landing-page-builder",
    kind: "website",
    defaultProjectType: "Landing Page",
    promptLabel: "Landing page brief",
    promptPlaceholder:
      "Describe the offer, audience, conversion goal, proof points, and the CTA you want to drive.",
    generateLabel: "Generate Landing Page",
    templates: [
      "Premium SaaS landing page",
      "Product waitlist launch page",
      "Service consultation funnel",
      "Event registration landing page",
      "Black-gold brand campaign page",
    ],
    outputs: ["Hero copy", "Sections", "CTA system", "File blueprint", "Export ZIP"],
    settingsHints: ["Offer focus", "Design style", "Color theme", "Language", "Features"],
    metrics: [
      { label: "Sections", value: "6" },
      { label: "Focus", value: "CVR" },
      { label: "Export", value: "ZIP" },
      { label: "Speed", value: "Fast" },
    ],
  },
  "app-builder": {
    id: "app-builder",
    title: "AI App Builder",
    eyebrow: "Create",
    description:
      "Design web and mobile app concepts with dashboards, auth flows, and feature-ready blueprints.",
    icon: Smartphone,
    href: "/dashboard/app-builder",
    kind: "website",
    defaultProjectType: "Web Application",
    promptLabel: "App brief",
    promptPlaceholder:
      "Describe the app idea, users, core workflows, screens, and the features that must ship first.",
    generateLabel: "Generate App",
    templates: [
      "AI SaaS dashboard app",
      "CRM web application",
      "Booking and scheduling app",
      "Marketplace platform concept",
      "Mobile-first operations app",
    ],
    outputs: ["Screen map", "Feature set", "Auth plan", "File blueprint", "Export ZIP"],
    settingsHints: ["App type", "Design style", "Color theme", "Language", "Features"],
    metrics: [
      { label: "Screens", value: "12+" },
      { label: "Stack", value: "Next" },
      { label: "Export", value: "ZIP" },
      { label: "Mode", value: "App" },
    ],
  },
  "logo-designer": {
    id: "logo-designer",
    title: "AI Logo Designer",
    eyebrow: "Design",
    description:
      "Produce logo directions, mark concepts, wordmark systems, and usage rules for a credible brand launch.",
    icon: Wand2,
    href: "/dashboard/logo-maker",
    kind: "workspace",
    workspaceType: "brand",
    promptLabel: "Logo brief",
    promptPlaceholder:
      "Describe the company name, industry, personality, competitors, and the logo style you want.",
    generateLabel: "Generate Logo System",
    templates: [
      "Luxury wordmark system",
      "Minimal geometric mark",
      "Startup emblem kit",
      "Premium monogram logo",
      "Arabic-English bilingual mark",
    ],
    outputs: ["Logo directions", "Mark concepts", "Wordmark options", "Usage rules", "Export notes"],
    settingsHints: ["Language", "Theme", "Style depth", "Focus outputs"],
    metrics: [
      { label: "Concepts", value: "5+" },
      { label: "Styles", value: "Pro" },
      { label: "Export", value: "MD" },
      { label: "Focus", value: "Logo" },
    ],
  },
  "brand-studio": {
    id: "brand-studio",
    title: "AI Brand Studio",
    eyebrow: "Design",
    description:
      "Build complete brand kits with positioning, color systems, typography, voice, and launch assets.",
    icon: Palette,
    href: "/dashboard/brand-studio",
    kind: "workspace",
    workspaceType: "brand",
    promptLabel: "Brand brief",
    promptPlaceholder:
      "Describe the company, audience, visual style, competitors, personality, and where the brand will live.",
    generateLabel: "Generate Brand Kit",
    templates: [
      "Luxury logo system",
      "Startup brand identity",
      "Premium product launch",
      "Executive consulting identity",
      "Gold-label ecommerce brand",
    ],
    outputs: ["Logo direction", "Color palette", "Typography", "Brand voice", "Launch assets"],
    settingsHints: ["Language", "Theme", "Style depth", "Focus outputs"],
    metrics: [
      { label: "Assets", value: "24" },
      { label: "Templates", value: "12" },
      { label: "Exports", value: "MD" },
      { label: "Quality", value: "Pro" },
    ],
  },
  "image-generator": {
    id: "image-generator",
    title: "AI Image Generator",
    eyebrow: "Design",
    description:
      "Create production-ready image concepts, scene prompts, and visual directions for campaigns and product shoots.",
    icon: ImageIcon,
    href: "/dashboard/image-generator",
    kind: "workspace",
    workspaceType: "creative",
    promptLabel: "Image brief",
    promptPlaceholder:
      "Describe the subject, scene, mood, lighting, platform, aspect ratio, and campaign objective.",
    generateLabel: "Generate Image Concepts",
    templates: [
      "Product hero still life",
      "Luxury lifestyle campaign",
      "Founder portrait concept",
      "Black-gold SaaS hero visual",
      "Social carousel image set",
    ],
    outputs: ["Image prompts", "Scene setups", "Lighting notes", "Style guides", "Production notes"],
    settingsHints: ["Language", "Theme", "Creative depth", "Focus outputs"],
    metrics: [
      { label: "Concepts", value: "8+" },
      { label: "Formats", value: "1:1" },
      { label: "Export", value: "Brief" },
      { label: "Style", value: "3D" },
    ],
  },
  "video-studio": {
    id: "video-studio",
    title: "AI Video Studio",
    eyebrow: "Content",
    description:
      "Storyboard short-form and cinematic video concepts with shot lists, hooks, and production-ready directions.",
    icon: Clapperboard,
    href: "/dashboard/video-studio",
    kind: "workspace",
    workspaceType: "creative",
    promptLabel: "Video brief",
    promptPlaceholder:
      "Describe the product, story, platform, duration, audience, and the emotion the video should create.",
    generateLabel: "Generate Video Plan",
    templates: [
      "Short-form product reel",
      "Founder announcement video",
      "Launch teaser storyboard",
      "Service explainer sequence",
      "Cinematic brand film outline",
    ],
    outputs: ["Storyboard", "Shot list", "Hook lines", "Music cues", "Production notes"],
    settingsHints: ["Language", "Theme", "Creative depth", "Focus outputs"],
    metrics: [
      { label: "Shots", value: "12+" },
      { label: "Format", value: "9:16" },
      { label: "Export", value: "Brief" },
      { label: "Mode", value: "Video" },
    ],
  },
  "content-studio": {
    id: "content-studio",
    title: "AI Content Studio",
    eyebrow: "Content",
    description:
      "Generate captions, hooks, articles, calendars, and editorial systems aligned to premium business strategy.",
    icon: PenLine,
    href: "/dashboard/content-studio",
    kind: "workspace",
    workspaceType: "content",
    promptLabel: "Content brief",
    promptPlaceholder:
      "Describe your audience, offer, channel, tone, content goal, and the exact format you want to create.",
    generateLabel: "Generate Content",
    templates: [
      "30-day content calendar",
      "Executive thought leadership",
      "Launch caption suite",
      "LinkedIn founder posts",
      "Premium launch email sequence",
    ],
    outputs: ["Hooks", "Captions", "Calendar", "Report outline", "Channel plan"],
    settingsHints: ["Language", "Theme", "Editorial depth", "Focus outputs"],
    metrics: [
      { label: "Drafts", value: "58" },
      { label: "Channels", value: "7" },
      { label: "Exports", value: "MD" },
      { label: "Tone", value: "Pro" },
    ],
  },
  "social-media-manager": {
    id: "social-media-manager",
    title: "AI Social Media Manager",
    eyebrow: "Content",
    description:
      "Create, schedule, and manage AI-powered social posts across Facebook, Instagram, LinkedIn, X, and TikTok.",
    icon: Sparkles,
    href: "/dashboard/social-media",
    kind: "workspace",
    workspaceType: "social",
    promptLabel: "Social brief",
    promptPlaceholder:
      "Describe your brand, platforms, audience, posting cadence, and the growth outcome you need.",
    generateLabel: "Generate Social Plan",
    templates: [
      "Instagram growth system",
      "LinkedIn authority calendar",
      "Multi-platform launch week",
      "Community engagement playbook",
      "Creator-led brand social plan",
    ],
    outputs: ["Channel plan", "Post ideas", "Hooks", "Cadence", "Growth plays"],
    settingsHints: ["Language", "Theme", "Strategy depth", "Focus outputs"],
    metrics: [
      { label: "Platforms", value: "5+" },
      { label: "Posts", value: "30" },
      { label: "Export", value: "MD" },
      { label: "Mode", value: "Social" },
    ],
  },
  "marketing-strategy": {
    id: "marketing-strategy",
    title: "AI Marketing Strategy",
    eyebrow: "Business",
    description:
      "Build campaign strategy, offers, funnels, messaging angles, and go-to-market plans ready for execution.",
    icon: Megaphone,
    href: "/dashboard/marketing",
    kind: "workspace",
    workspaceType: "marketing",
    promptLabel: "Marketing brief",
    promptPlaceholder:
      "Describe the product, audience, budget context, channels, and the conversion goal for this campaign.",
    generateLabel: "Generate Strategy",
    templates: [
      "Product launch campaign",
      "Offer and funnel system",
      "Paid acquisition angles",
      "Brand positioning campaign",
      "Retention and upsell plan",
    ],
    outputs: ["Strategy", "Offers", "Angles", "Funnel map", "Channel mix"],
    settingsHints: ["Language", "Theme", "Strategy depth", "Focus outputs"],
    metrics: [
      { label: "Angles", value: "12" },
      { label: "Funnels", value: "3" },
      { label: "Export", value: "MD" },
      { label: "Depth", value: "GTM" },
    ],
  },
  "business-intelligence": {
    id: "business-intelligence",
    title: "AI Business Intelligence",
    eyebrow: "Business",
    description:
      "Turn market context into competitor maps, demand signals, risk analysis, and decision-ready insights.",
    icon: BarChart3,
    href: "/dashboard/business-intelligence",
    kind: "workspace",
    workspaceType: "business",
    promptLabel: "Analysis brief",
    promptPlaceholder:
      "Describe the market, geography, business model, customer segment, competitors, and the decision you need.",
    generateLabel: "Generate Intelligence",
    templates: [
      "Market opportunity scan",
      "Competitor intelligence",
      "Demand signal briefing",
      "GCC ecommerce analysis",
      "AI agency competitor map",
    ],
    outputs: ["Market signals", "Competitor map", "Risk matrix", "Revenue assumptions", "Executive summary"],
    settingsHints: ["Language", "Theme", "Analysis depth", "Focus outputs"],
    metrics: [
      { label: "Reports", value: "18" },
      { label: "Signals", value: "142" },
      { label: "Exports", value: "MD" },
      { label: "Depth", value: "Deep" },
    ],
  },
  "feasibility-study": {
    id: "feasibility-study",
    title: "AI Feasibility Study",
    eyebrow: "Business",
    description:
      "Assess opportunity readiness with financial assumptions, risk scoring, go/no-go guidance, and execution gaps.",
    icon: SearchCheck,
    href: "/dashboard/feasibility-study",
    kind: "workspace",
    workspaceType: "audit",
    promptLabel: "Feasibility brief",
    promptPlaceholder:
      "Describe the venture, market, investment range, constraints, and the decision you need to validate.",
    generateLabel: "Generate Feasibility Study",
    templates: [
      "Business feasibility study",
      "Market entry readiness audit",
      "Capital raise feasibility brief",
      "Franchise expansion study",
      "SaaS launch readiness check",
    ],
    outputs: ["Executive verdict", "Assumptions", "Risks", "Financial sketch", "Go / no-go"],
    settingsHints: ["Language", "Theme", "Audit depth", "Focus outputs"],
    metrics: [
      { label: "Verdict", value: "Go/No" },
      { label: "Risks", value: "Scored" },
      { label: "Export", value: "MD" },
      { label: "Depth", value: "Board" },
    ],
  },
};

export const PRODUCT_IDS = Object.keys(PRODUCT_DEFINITIONS) as ProductId[];

export function getProductDefinition(id: ProductId): ProductDefinition {
  return PRODUCT_DEFINITIONS[id];
}

export function isProductId(value: string): value is ProductId {
  return value in PRODUCT_DEFINITIONS;
}

export const PRODUCT_NAV_ITEMS = PRODUCT_IDS.map((id) => {
  const product = PRODUCT_DEFINITIONS[id];
  return {
    label: product.title.replace(/^AI /, ""),
    href: product.href,
    icon: product.icon,
    description: product.description,
  };
});
