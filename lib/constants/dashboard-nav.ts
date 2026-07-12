import {
  BarChart3,
  Clapperboard,
  CreditCard,
  FileStack,
  FolderKanban,
  Globe2,
  History,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  Palette,
  PenLine,
  SearchCheck,
  Settings,
  Sparkles,
  Smartphone,
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
    label: "App Builder",
    href: "/dashboard/app-builder",
    icon: Smartphone,
    description: "Web and app concepts",
  },
  {
    label: "Logo Designer",
    href: "/dashboard/logo-maker",
    icon: Sparkles,
    description: "Logo marks and systems",
  },
  {
    label: "Brand Studio",
    href: "/dashboard/brand-studio",
    icon: Palette,
    description: "Brand kits and identity",
  },
  {
    label: "Image Generator",
    href: "/dashboard/image-generator",
    icon: Clapperboard,
    description: "Campaign image concepts",
  },
  {
    label: "Video Studio",
    href: "/dashboard/video-studio",
    icon: Clapperboard,
    description: "Storyboards and shot lists",
  },
  {
    label: "Content Studio",
    href: "/dashboard/content-studio",
    icon: PenLine,
    description: "Captions and calendars",
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
    label: "Business Intelligence",
    href: "/dashboard/business-intelligence",
    icon: BarChart3,
    description: "Markets and demand",
  },
  {
    label: "Feasibility Study",
    href: "/dashboard/feasibility-study",
    icon: SearchCheck,
    description: "Go / no-go assessments",
  },
];

export const DASHBOARD_SECONDARY_NAV: DashboardNavItem[] = [
  {
    label: "Templates",
    href: "/dashboard/templates",
    icon: LayoutTemplate,
    description: "Starter kits and presets",
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
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    description: "Plan and invoices",
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
    title: "App Builder",
    description: "Design app and dashboard concepts",
    href: "/dashboard/app-builder",
    icon: Smartphone,
  },
  {
    title: "Logo Designer",
    description: "Create brand marks and identity",
    href: "/dashboard/logo-maker",
    icon: Palette,
  },
  {
    title: "Image Generator",
    description: "Produce luxury visual concepts",
    href: "/dashboard/image-generator",
    icon: Clapperboard,
  },
  {
    title: "Video Studio",
    description: "Storyboard cinematic concepts",
    href: "/dashboard/video-studio",
    icon: Clapperboard,
  },
  {
    title: "Content Studio",
    description: "Captions, calendars and copy",
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
    title: "Business Intelligence",
    description: "Markets, competitors and demand",
    href: "/dashboard/business-intelligence",
    icon: BarChart3,
  },
  {
    title: "Feasibility Study",
    description: "Go / no-go opportunity audits",
    href: "/dashboard/feasibility-study",
    icon: SearchCheck,
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
  { id: "team", name: "Team Workspace", plan: "Coming Soon" },
] as const;
