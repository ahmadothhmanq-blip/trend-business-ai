import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Clapperboard,
  CreditCard,
  Gauge,
  LayoutDashboard,
  Globe2,
  History,
  KeyRound,
  Megaphone,
  Palette,
  PenLine,
  Search,
  SearchCheck,
  Settings,
  Smartphone,
  Star,
  Users,
  User,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick actions",
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: Gauge,
    description: "Project dashboard and exports",
  },
  {
    label: "AI Website & App Builder",
    href: "/dashboard/website-builder",
    icon: Globe2,
    description: "Build websites, apps and dashboard concepts",
  },
  {
    label: "AI Brand Designer",
    href: "/dashboard/brand-designer",
    icon: Palette,
    description: "Create logos and luxury brand systems",
  },
  {
    label: "AI Creative Studio",
    href: "/dashboard/creative-studio",
    icon: Clapperboard,
    description: "Generate images, videos and campaign visuals",
  },
  {
    label: "AI Content Studio",
    href: "/dashboard/content-studio",
    icon: PenLine,
    description: "Write captions, reports and content calendars",
  },
  {
    label: "AI Business Intelligence",
    href: "/dashboard/business-intelligence",
    icon: BarChart3,
    description: "Analyze markets, competitors and opportunity data",
  },
  {
    label: "AI Business Manager",
    href: "/dashboard/business-manager",
    icon: BriefcaseBusiness,
    description: "Plan projects, tasks, milestones and operations",
  },
  {
    label: "AI Marketing",
    href: "/dashboard/marketing",
    icon: Megaphone,
    description: "Create ads, funnels and campaign strategy",
  },
  {
    label: "AI Social Media",
    href: "/dashboard/social-media",
    icon: Smartphone,
    description: "Plan, analyze and optimize social channels",
  },
  {
    label: "AI Business Audit",
    href: "/dashboard/business-audit",
    icon: SearchCheck,
    description: "Audit business readiness, gaps and risks",
  },
  {
    label: "Saved Projects",
    href: "/dashboard/favorites",
    icon: Star,
    description: "Pinned and favorite workspace assets",
  },
  {
    label: "History",
    href: "/dashboard/history",
    icon: History,
    description: "All generated assets",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Workspace and generation insights",
  },
  {
    label: "Usage",
    href: "/dashboard/usage",
    icon: Gauge,
    description: "Credits, storage and limits",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    description: "Invoices and payment controls",
  },
  {
    label: "Subscription",
    href: "/dashboard/subscription",
    icon: Star,
    description: "Plan and upgrade management",
  },
  {
    label: "API Keys",
    href: "/dashboard/api-keys",
    icon: KeyRound,
    description: "Developer access and integrations",
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    description: "Alerts and communication settings",
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: Users,
    description: "Workspace members and roles",
  },
  {
    label: "Search",
    href: "/dashboard/search",
    icon: Search,
    description: "Search across workspace assets",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    description: "User profile and preferences",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Workspace preferences",
  },
];

export const DASHBOARD_STATS = [
  { label: "Ideas Generated", key: "ideas" as const },
  { label: "Market Analyses", key: "analyses" as const },
  { label: "AI Reports", key: "reports" as const },
  { label: "Website Blueprints", key: "websites" as const },
  { label: "AI Workspaces", key: "workspaces" as const },
  { label: "Saved Items", key: "saved" as const },
];
