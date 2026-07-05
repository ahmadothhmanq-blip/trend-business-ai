export const REF_HERO = {
  badge: "AI Business Planning Workspace",
  headlineLine1: "Validate Ideas Faster.",
  headlineLine2: "Plan Smarter With AI.",
  sub: "Generate startup ideas, analyze markets, create strategic reports, and plan website blueprints from one focused AI dashboard.",
} as const;

export const REF_STATS = [
  { value: "4", label: "AI planning tools" },
  { value: "Private", label: "User dashboard" },
  { value: "Export", label: "Markdown and PDF reports" },
  { value: "Beta", label: "Free MVP access" },
] as const;

export const REF_FOOTER_TAGLINE =
  "A focused AI workspace for business ideas, market research, strategic reports, and website planning.";

export const REF_FOOTER_SERVICES = [
  { label: "Business Ideas", href: "#services" },
  { label: "Market Analysis", href: "#services" },
  { label: "AI Reports", href: "#services" },
  { label: "Website Blueprints", href: "#services" },
] as const;

export const REF_FOOTER_COMPANY = [
  { label: "Trust", href: "#trust" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
] as const;

export const REF_FOOTER_RESOURCES = [
  { label: "How It Works", href: "#workflow" },
  { label: "Sign In", href: "/login" },
  { label: "Create Account", href: "/signup" },
] as const;

export const REF_LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

export const REF_SERVICES = [
  {
    title: "Business Ideas",
    description: "Generate focused startup concepts based on your skills, interests, budget, and target industry.",
    eyebrow: "Ideation",
  },
  {
    title: "Market Analysis",
    description: "Explore market size, growth signals, competitors, opportunities, risks, and positioning angles.",
    eyebrow: "Research",
  },
  {
    title: "AI Reports",
    description: "Create strategic business reports with key insights and export them as Markdown or PDF.",
    eyebrow: "Strategy",
  },
  {
    title: "Website Blueprints",
    description: "Plan page structure, components, colors, typography, and SEO before building your site.",
    eyebrow: "Planning",
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
