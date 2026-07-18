/**
 * Phase 9 — One Prompt Experience config for Core products.
 * UX-only; generators and product APIs stay unchanged.
 */

export type OnePromptProductId =
  | "website-builder"
  | "app-builder"
  | "landing-page-builder"
  | "video-studio"
  | "brand-designer"
  | "content-studio"
  | "marketing-ai";

export type OnePromptExample = {
  label: string;
  prompt: string;
};

export type OnePromptProductConfig = {
  id: OnePromptProductId;
  /** Marketing slug when different from id */
  marketingSlug?: string;
  title: string;
  valueProposition: string;
  dashboardHref: string;
  ctaLabel: string;
  placeholder: string;
  examples: OnePromptExample[];
};

export const ONE_PROMPT_PRODUCTS: Record<
  OnePromptProductId,
  OnePromptProductConfig
> = {
  "website-builder": {
    id: "website-builder",
    title: "Website Builder",
    valueProposition:
      "Describe your business once — AI builds strategy, design, assets, and a ready website.",
    dashboardHref: "/dashboard/website-builder",
    ctaLabel: "Generate website",
    placeholder:
      "e.g. A luxury spa in Dubai for professionals who want weekend recovery packages…",
    examples: [
      {
        label: "Restaurant",
        prompt:
          "An upscale Mediterranean restaurant in London with online reservations, tasting menus, and private dining.",
      },
      {
        label: "SaaS",
        prompt:
          "A B2B analytics SaaS for e-commerce brands that need weekly growth insights and competitor tracking.",
      },
      {
        label: "Agency",
        prompt:
          "A creative branding agency specializing in luxury hospitality and high-end retail launches.",
      },
    ],
  },
  "app-builder": {
    id: "app-builder",
    title: "App Builder",
    valueProposition:
      "Turn a product idea into a structured web app package — screens, flows, and generation in one path.",
    dashboardHref: "/dashboard/app-builder",
    ctaLabel: "Generate app",
    placeholder:
      "e.g. A client portal for freelancers to share invoices, files, and project updates…",
    examples: [
      {
        label: "Marketplace",
        prompt:
          "A two-sided marketplace connecting local chefs with customers for private dining experiences.",
      },
      {
        label: "Dashboard",
        prompt:
          "An operations dashboard for a logistics company to track shipments, drivers, and delivery SLAs.",
      },
      {
        label: "Booking",
        prompt:
          "A booking app for boutique fitness studios with class schedules, memberships, and waitlists.",
      },
    ],
  },
  "landing-page-builder": {
    id: "landing-page-builder",
    title: "Landing Page Builder",
    valueProposition:
      "One idea → conversion-focused landing page with hero, proof, offer, and CTA structure.",
    dashboardHref: "/dashboard/landing-page-builder",
    ctaLabel: "Generate landing page",
    placeholder:
      "e.g. Launch page for a new AI writing tool targeting indie founders…",
    examples: [
      {
        label: "Product launch",
        prompt:
          "A product launch page for a smart water bottle with hydration tracking and a 14-day free trial.",
      },
      {
        label: "Lead magnet",
        prompt:
          "A lead-gen landing page offering a free restaurant menu redesign guide for independent cafes.",
      },
      {
        label: "Webinar",
        prompt:
          "A webinar registration page for a masterclass on luxury brand positioning for DTC founders.",
      },
    ],
  },
  "video-studio": {
    id: "video-studio",
    title: "Video Studio",
    valueProposition:
      "Describe the story — AI delivers storyboard, script, scenes, and production direction.",
    dashboardHref: "/dashboard/video-studio",
    ctaLabel: "Generate video concept",
    placeholder:
      "e.g. A 30-second brand film for a sustainable sneaker launch…",
    examples: [
      {
        label: "Ad",
        prompt:
          "A 20-second social ad for a meal-kit brand targeting busy parents who want healthy dinners fast.",
      },
      {
        label: "Explainer",
        prompt:
          "An explainer video for a fintech app that helps freelancers automate tax savings.",
      },
      {
        label: "Launch",
        prompt:
          "A launch teaser for a luxury watch drop with cinematic product shots and scarce inventory messaging.",
      },
    ],
  },
  "brand-designer": {
    id: "brand-designer",
    marketingSlug: "brand-studio",
    title: "Brand Designer",
    valueProposition:
      "One brand idea → identity system with voice, colors, typography, and guidelines.",
    dashboardHref: "/dashboard/brand-studio",
    ctaLabel: "Generate brand system",
    placeholder:
      "e.g. A modern wellness brand for urban professionals who value calm and clarity…",
    examples: [
      {
        label: "Luxury",
        prompt:
          "A luxury fragrance brand inspired by Mediterranean coastlines, targeting 25–40 professionals.",
      },
      {
        label: "Tech",
        prompt:
          "A clean, trustworthy brand for an AI legal assistant used by small law firms.",
      },
      {
        label: "Food",
        prompt:
          "A playful but premium brand for an artisan coffee subscription with monthly origin stories.",
      },
    ],
  },
  "content-studio": {
    id: "content-studio",
    title: "Content Studio",
    valueProposition:
      "Share your topic — AI builds channel-ready copy, hooks, and content structure.",
    dashboardHref: "/dashboard/content-studio",
    ctaLabel: "Generate content",
    placeholder:
      "e.g. A LinkedIn content series for a B2B cybersecurity startup…",
    examples: [
      {
        label: "Social series",
        prompt:
          "A 2-week Instagram content plan for a boutique pilates studio launching morning classes.",
      },
      {
        label: "Blog pack",
        prompt:
          "SEO blog outlines and social captions for a sustainable fashion brand entering the US market.",
      },
      {
        label: "Launch copy",
        prompt:
          "Launch week copy for an AI meeting notes product: homepage snippets, email, and Twitter threads.",
      },
    ],
  },
  "marketing-ai": {
    id: "marketing-ai",
    title: "Marketing AI",
    valueProposition:
      "One business brief → campaign angles, offers, audiences, and conversion concepts.",
    dashboardHref: "/dashboard/marketing",
    ctaLabel: "Generate campaign",
    placeholder:
      "e.g. Launch paid ads for a premium meal-prep service in NYC…",
    examples: [
      {
        label: "Paid ads",
        prompt:
          "A Meta + Google ads plan for a remote-team HR platform targeting Series A startups.",
      },
      {
        label: "Offer",
        prompt:
          "Campaign angles and offers for a dental clinic promoting Invisalign with a free consultation.",
      },
      {
        label: "Funnel",
        prompt:
          "A webinar funnel strategy for a coaching brand selling a high-ticket leadership program.",
      },
    ],
  },
};

/** Map marketing page slug → One Prompt product id */
export const MARKETING_SLUG_TO_ONE_PROMPT: Partial<
  Record<string, OnePromptProductId>
> = {
  "website-builder": "website-builder",
  "app-builder": "app-builder",
  "landing-page-builder": "landing-page-builder",
  "video-studio": "video-studio",
  "brand-studio": "brand-designer",
  "content-studio": "content-studio",
  "marketing-ai": "marketing-ai",
};

export function getOnePromptProduct(
  id: OnePromptProductId,
): OnePromptProductConfig {
  return ONE_PROMPT_PRODUCTS[id];
}
