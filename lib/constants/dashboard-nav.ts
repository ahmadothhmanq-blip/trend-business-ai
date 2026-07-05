import {
  LayoutDashboard,
  Lightbulb,
  LineChart,
  FileText,
  Globe,
  History,
  Star,
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
    label: "Business Ideas",
    href: "/dashboard/ideas",
    icon: Lightbulb,
    description: "AI-powered idea generator",
  },
  {
    label: "Market Analysis",
    href: "/dashboard/market-analysis",
    icon: LineChart,
    description: "Industry and market insights",
  },
  {
    label: "AI Reports",
    href: "/dashboard/reports",
    icon: FileText,
    description: "Generate strategic reports",
  },
  {
    label: "Website Builder",
    href: "/dashboard/website-builder",
    icon: Globe,
    description: "AI-powered website generator",
  },
  {
    label: "History",
    href: "/dashboard/history",
    icon: History,
    description: "All generated assets",
  },
  {
    label: "Favorites",
    href: "/dashboard/favorites",
    icon: Star,
    description: "Saved favorite assets",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    description: "Account settings",
  },
];

export const DASHBOARD_STATS = [
  { label: "Ideas Generated", key: "ideas" as const },
  { label: "Market Analyses", key: "analyses" as const },
  { label: "AI Reports", key: "reports" as const },
  { label: "Website Blueprints", key: "websites" as const },
  { label: "Saved Items", key: "saved" as const },
];
