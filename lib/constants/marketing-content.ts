export const REF_HERO = {
  badge: "Premium AI Business Platform",
  headlineLine1: "Build, Brand & Grow",
  headlineLine2: "With Trend Business AI.",
  sub: "Create websites and apps, logos, images, videos, social content, feasibility studies, project plans, advertising campaigns and social media analysis from one luxury AI platform.",
} as const;

export const REF_STATS = [
  { value: "4", label: "AI planning tools" },
  { value: "Private", label: "User dashboard" },
  { value: "Export", label: "Markdown and PDF reports" },
  { value: "Beta", label: "Free MVP access" },
] as const;

export const REF_FOOTER_TAGLINE =
  "A premium AI company helping founders and teams build brands, launch campaigns, manage projects and grow with intelligent automation.";

export const REF_FOOTER_SERVICES = [
  { label: "Features", href: "/features" },
  { label: "AI Website & App Builder", href: "/dashboard/website-builder" },
  { label: "AI Brand Designer", href: "/dashboard/brand-designer" },
  { label: "AI Social Media Analyzer", href: "/dashboard/social-media" },
] as const;

export const REF_FOOTER_COMPANY = [
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Changelog", href: "/changelog" },
] as const;

export const REF_FOOTER_RESOURCES = [
  { label: "Documentation", href: "/docs" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
] as const;

export const REF_LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
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
    title: "Describe your business context",
    description: "Start with your idea, market, audience, report topic, or website project brief.",
  },
  {
    step: "02",
    title: "Generate structured AI output",
    description: "Receive practical ideas, market insights, reports, or website blueprints in seconds.",
  },
  {
    step: "03",
    title: "Save and manage results",
    description: "Keep generated assets in your private dashboard, mark favorites, and remove what you no longer need.",
  },
  {
    step: "04",
    title: "Export and act",
    description: "Download reports, reuse insights, and turn the best opportunities into next-step plans.",
  },
] as const;

export const REF_PRICING = [
  {
    name: "Free Beta",
    price: "$0",
    description: "For early users validating ideas and planning business moves.",
    features: [
      "Business idea generation",
      "Market analysis",
      "AI report generation",
      "Website blueprint planning",
      "Private dashboard",
    ],
    cta: "Start Free",
    href: "/signup",
    featured: true,
  },
  {
    name: "Pro",
    price: "Coming Soon",
    description: "For teams and operators who need higher limits and advanced workflows.",
    features: [
      "Higher AI usage limits",
      "Advanced exports",
      "Team workspaces",
      "Priority support",
      "Saved templates",
    ],
    cta: "Join Beta First",
    href: "/signup",
    featured: false,
  },
] as const;

export const REF_TRUST = [
  "Supabase authentication protects dashboard access.",
  "Your generated assets are scoped to your user account.",
  "Reports can be exported without locking your work inside the app.",
  "The MVP is intentionally focused on business planning workflows.",
] as const;
