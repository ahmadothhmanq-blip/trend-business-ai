import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  Clapperboard,
  Contact,
  CreditCard,
  FileStack,
  FolderKanban,
  Globe2,
  History,
  Image,
  Key,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  Palette,
  PenLine,
  Radar,
  SearchCheck,
  Settings,
  Sparkles,
  Smartphone,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

/** Primary Phase-3 sidebar sections */
export const DASHBOARD_PRIMARY_NAV: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick actions",
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    description: "All generated projects",
  },
  {
    label: "CRM",
    href: "/dashboard/crm",
    icon: Contact,
    description: "Sales pipeline, contacts, and deals",
  },
];

/** AI Products group — expandable in sidebar */
export const DASHBOARD_AI_PRODUCTS_NAV: DashboardNavItem[] = [
  {
    label: "Website Builder",
    href: "/dashboard/website-builder",
    icon: Globe2,
    description: "Full website blueprints",
  },
  {
    label: "Landing Pages",
    href: "/dashboard/landing-page-builder",
    icon: LayoutTemplate,
    description: "High-converting landing pages",
  },
  {
    label: "Web App Builder",
    href: "/dashboard/app-builder",
    icon: Smartphone,
    description: "Full-stack web applications",
  },
  {
    label: "Logo Designer",
    href: "/dashboard/logo-maker",
    icon: Sparkles,
    description: "Professional logo marks and brand symbols",
  },
  {
    label: "Brand Identity",
    href: "/dashboard/brand-studio",
    icon: Palette,
    description: "Complete brand identity systems",
  },
  {
    label: "Image Generator",
    href: "/dashboard/image-generator",
    icon: Image,
    description: "Visual concepts and image assets",
  },
  {
    label: "Video Studio",
    href: "/dashboard/video-studio",
    icon: Clapperboard,
    description: "AI video production and storyboards",
  },
  {
    label: "Content Studio",
    href: "/dashboard/content-studio",
    icon: PenLine,
    description: "AI content creation and calendar",
  },
  {
    label: "Social Media",
    href: "/dashboard/social-media",
    icon: Smartphone,
    description: "Channel planning",
  },
  {
    label: "Marketing Strategy",
    href: "/dashboard/marketing",
    icon: Megaphone,
    description: "Campaigns and funnels",
  },
  {
    label: "Business Suite",
    href: "/dashboard/business-intelligence",
    icon: BarChart3,
    description: "AI business intelligence and strategy",
  },
  {
    label: "Feasibility Study",
    href: "/dashboard/feasibility-study",
    icon: SearchCheck,
    description: "Go / no-go assessments",
  },
  {
    label: "AI Agents",
    href: "/dashboard/ai-agents",
    icon: Bot,
    description: "Intelligent agents and automation workflows",
  },
];

export const DASHBOARD_SECONDARY_NAV: DashboardNavItem[] = [
  {
    label: "Templates",
    href: "/dashboard/templates",
    icon: LayoutTemplate,
    description: "Creator template marketplace",
  },
  {
    label: "History",
    href: "/dashboard/history",
    icon: History,
    description: "All generations",
  },
  {
    label: "Files",
    href: "/dashboard/files",
    icon: FileStack,
    description: "Exports and assets",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Usage and insights",
  },
  {
    label: "SEO Engine",
    href: "/dashboard/seo",
    icon: SearchCheck,
    description: "SEO health and analyzer",
  },
  {
    label: "AI Search Center",
    href: "/dashboard/ai-search",
    icon: Radar,
    description: "AEO, GEO and AI search domination",
  },
  {
    label: "Growth Engine",
    href: "/dashboard/growth",
    icon: Megaphone,
    description: "Affiliates, CRM and campaigns",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    description: "Plan and invoices",
  },
  {
    label: "AI Providers",
    href: "/dashboard/ai-providers",
    icon: BrainCircuit,
    description: "Manage AI provider keys and models",
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: Users,
    description: "Team members and invitations",
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    description: "Alerts and updates",
  },
  {
    label: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
    description: "Manage API access keys",
  },
  {
    label: "Usage",
    href: "/dashboard/usage",
    icon: Activity,
    description: "Track AI usage and tokens",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Workspace preferences",
  },
];

/** Flat list for search / overview grids (backward compatible) */
export const DASHBOARD_NAV: DashboardNavItem[] = [
  ...DASHBOARD_PRIMARY_NAV,
  ...DASHBOARD_AI_PRODUCTS_NAV.map((item) => ({
    ...item,
    label: item.label.startsWith("AI ") ? item.label : `AI ${item.label}`,
  })),
  ...DASHBOARD_SECONDARY_NAV,
];

export const DASHBOARD_QUICK_ACTIONS = [
  {
    title: "Website Builder",
    description: "Build pages and site blueprints",
    href: "/dashboard/website-builder",
    icon: Globe2,
  },
  {
    title: "Landing Page",
    description: "Generate conversion-focused pages",
    href: "/dashboard/landing-page-builder",
    icon: LayoutTemplate,
  },
  {
    title: "Web App Builder",
    description: "Generate full-stack web applications",
    href: "/dashboard/app-builder",
    icon: Smartphone,
  },
  {
    title: "Logo Designer",
    description: "Professional logo marks and symbols",
    href: "/dashboard/logo-maker",
    icon: Sparkles,
  },
  {
    title: "Brand Identity",
    description: "Complete brand identity systems",
    href: "/dashboard/brand-studio",
    icon: Palette,
  },
  {
    title: "Image Generator",
    description: "Visual concepts and image assets",
    href: "/dashboard/image-generator",
    icon: Image,
  },
  {
    title: "Video Studio",
    description: "Produce AI video storyboards and scripts",
    href: "/dashboard/video-studio",
    icon: Clapperboard,
  },
  {
    title: "Content Studio",
    description: "Create and schedule AI content",
    href: "/dashboard/content-studio",
    icon: PenLine,
  },
  {
    title: "Marketing Strategy",
    description: "Campaign angles and offers",
    href: "/dashboard/marketing",
    icon: Megaphone,
  },
  {
    title: "Business Suite",
    description: "AI planning, analysis and strategy",
    href: "/dashboard/business-intelligence",
    icon: BarChart3,
  },
  {
    title: "Feasibility Study",
    description: "Go / no-go opportunity audits",
    href: "/dashboard/feasibility-study",
    icon: SearchCheck,
  },
  {
    title: "AI Agents",
    description: "Create and run AI agents and workflows",
    href: "/dashboard/ai-agents",
    icon: Bot,
  },
] as const;

export const DASHBOARD_STATS = [
  { label: "Ideas Generated", key: "ideas" as const },
  { label: "Market Analyses", key: "analyses" as const },
  { label: "AI Reports", key: "reports" as const },
  { label: "Website Blueprints", key: "websites" as const },
  { label: "AI Workspaces", key: "workspaces" as const },
  { label: "Saved Items", key: "saved" as const },
];

export const DASHBOARD_WORKSPACES = [
  { id: "personal", name: "Personal", plan: "Free Beta" },
  { id: "team", name: "Team Workspace", plan: "Free Beta" },
] as const;
