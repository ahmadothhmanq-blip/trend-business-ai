import {
  Globe,
  Lightbulb,
  FileText,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export const LP_FEATURES = [
  {
    icon: Lightbulb,
    title: "Business Ideas",
    description:
      "Generate focused startup concepts based on your interests, skills, budget, and industry.",
    href: "#services",
  },
  {
    icon: BarChart3,
    title: "Market Analysis",
    description:
      "Explore opportunities, risks, competitors, growth signals, and audience positioning.",
    href: "#services",
  },
  {
    icon: FileText,
    title: "AI Reports",
    description:
      "Create strategic business reports and export them as Markdown or PDF.",
    href: "#services",
  },
  {
    icon: Globe,
    title: "Website Blueprints",
    description:
      "Plan site structure, components, colors, typography, and SEO before you build.",
    href: "#services",
  },
] as const satisfies ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}>;

export const LP_HERO_STATS = [
  { value: 4, suffix: "", label: "AI Planning Tools", decimals: 0, text: null },
  { value: 0, suffix: "", label: "Private Dashboard", decimals: 0, text: "Private" },
  { value: 0, suffix: "", label: "Report Exports", decimals: 0, text: "PDF + MD" },
  { value: 0, suffix: "", label: "Beta Access", decimals: 0, text: "Free" },
] as const;

export const LP_GROWTH_STATS = [
  { label: "Business Ideas", value: "Ready", change: "MVP", trend: "up" as const },
  { label: "Market Analysis", value: "Ready", change: "MVP", trend: "up" as const },
  { label: "AI Reports", value: "Ready", change: "MVP", trend: "up" as const },
  { label: "Website Blueprints", value: "Beta", change: "MVP", trend: "up" as const },
] as const;

export const LP_TESTIMONIALS = [
  {
    quote:
      "The MVP is designed to move from idea to structured plan without starting from a blank page.",
    name: "Trend Business AI",
    role: "Product Team",
    company: "Beta",
    initials: "TB",
  },
  {
    quote:
      "Use the dashboard to save ideas, research markets, export reports, and organize next steps.",
    name: "Trend Business AI",
    role: "Product Team",
    company: "Beta",
    initials: "TB",
  },
  {
    quote:
      "Website planning focuses on blueprints: pages, components, color, typography, and SEO guidance.",
    name: "Trend Business AI",
    role: "Product Team",
    company: "Beta",
    initials: "TB",
  },
] as const;

export const LP_COMPANY_LOGOS = [
  "Ideas",
  "Markets",
  "Reports",
  "Blueprints",
  "Exports",
  "Dashboard",
] as const;

export const LP_PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "beta",
    description: "Perfect for exploring the MVP business planning workflow",
    features: [
      "Business idea generation",
      "Market analysis",
      "AI reports",
      "Website blueprints",
    ],
    cta: "Get Started Free",
    highlighted: false,
    href: "/signup",
  },
  {
    name: "Pro",
    price: "Soon",
    period: "",
    description: "For higher limits and advanced workflows after beta",
    features: [
      "Higher AI usage limits",
      "Advanced exports",
      "Team workspaces",
      "Priority support",
    ],
    cta: "Join Beta First",
    highlighted: true,
    href: "/signup",
  },
  {
    name: "Team",
    price: "Later",
    period: "",
    description: "For collaboration features after the MVP is validated",
    features: [
      "Team collaboration",
      "Shared workspaces",
      "Role-based access",
      "Admin controls",
    ],
    cta: "Start Free",
    highlighted: false,
    href: "#contact",
  },
] as const;

export const LP_FAQ = [
  {
    question: "What is Trend Business AI?",
    answer:
      "Trend Business AI is an MVP workspace for generating business ideas, market analyses, strategic reports, and website blueprints.",
  },
  {
    question: "Can I start for free?",
    answer:
      "Yes. The MVP beta offers free access while the core business planning workflow is being validated.",
  },
  {
    question: "Is my data secure?",
    answer:
      "The app uses Supabase authentication and user-scoped data access patterns so dashboard records are tied to your account.",
  },
  {
    question: "Do you offer paid plans?",
    answer:
      "Paid plans are planned after the MVP beta, starting with higher limits and advanced export or team features.",
  },
  {
    question: "Can I export my work?",
    answer:
      "AI reports can currently be exported as PDF or Markdown. Other export options can be added after launch.",
  },
] as const;
