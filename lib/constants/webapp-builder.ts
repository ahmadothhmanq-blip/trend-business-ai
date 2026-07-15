import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Package,
  Rocket,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";

export type WebAppTypeDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultFeatures: string[];
};

export const WEBAPP_TYPES: WebAppTypeDefinition[] = [
  {
    id: "crm",
    label: "CRM",
    description: "Customer relationship management with contacts, deals, and pipelines",
    icon: Users,
    defaultFeatures: ["auth", "dashboard", "contacts", "deals", "pipeline", "search"],
  },
  {
    id: "erp",
    label: "ERP",
    description: "Enterprise resource planning with modules for finance, HR, and operations",
    icon: Building2,
    defaultFeatures: ["auth", "dashboard", "modules", "reports", "roles", "audit-log"],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Analytics dashboard with charts, KPIs, and real-time data visualization",
    icon: LayoutDashboard,
    defaultFeatures: ["auth", "charts", "kpi-cards", "filters", "export", "dark-mode"],
  },
  {
    id: "saas",
    label: "SaaS",
    description: "Software-as-a-Service with billing, teams, and subscription management",
    icon: Rocket,
    defaultFeatures: ["auth", "dashboard", "billing", "teams", "settings", "api"],
  },
  {
    id: "booking",
    label: "Booking System",
    description: "Appointment and reservation management with calendar and availability",
    icon: CalendarCheck,
    defaultFeatures: ["auth", "calendar", "bookings", "availability", "notifications", "payments"],
  },
  {
    id: "pos",
    label: "POS",
    description: "Point-of-sale system with inventory, transactions, and receipts",
    icon: CreditCard,
    defaultFeatures: ["auth", "products", "cart", "transactions", "receipts", "reports"],
  },
  {
    id: "lms",
    label: "LMS",
    description: "Learning management system with courses, quizzes, and progress tracking",
    icon: GraduationCap,
    defaultFeatures: ["auth", "courses", "lessons", "quizzes", "progress", "certificates"],
  },
  {
    id: "hr",
    label: "HR",
    description: "Human resources management with employees, leave, and payroll",
    icon: ClipboardList,
    defaultFeatures: ["auth", "employees", "leave", "payroll", "attendance", "reports"],
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Stock and warehouse management with tracking and alerts",
    icon: Package,
    defaultFeatures: ["auth", "products", "stock", "suppliers", "orders", "alerts"],
  },
  {
    id: "ecommerce-admin",
    label: "E-commerce Admin",
    description: "Admin panel for managing products, orders, customers, and analytics",
    icon: ShoppingCart,
    defaultFeatures: ["auth", "products", "orders", "customers", "analytics", "settings"],
  },
  {
    id: "custom",
    label: "Custom Web App",
    description: "Build any custom web application with your own requirements",
    icon: Wrench,
    defaultFeatures: ["auth", "dashboard"],
  },
];

export const WEBAPP_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Arabic",
  "Chinese",
  "Japanese",
] as const;

export const WEBAPP_DESIGN_STYLES = [
  "Modern",
  "Minimal",
  "Corporate",
  "Bold",
  "Soft",
] as const;

export const WEBAPP_COLOR_STYLES = [
  "Dark Minimal",
  "Light Professional",
  "Black & Gold (Premium)",
  "Bold Contrast",
  "Soft Neutral",
  "Ocean Blue",
] as const;

export const WEBAPP_FEATURE_OPTIONS = [
  { id: "auth", label: "Authentication" },
  { id: "dashboard", label: "Dashboard" },
  { id: "roles", label: "User Roles & Permissions" },
  { id: "search", label: "Search & Filters" },
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Settings Page" },
  { id: "dark-mode", label: "Dark Mode" },
  { id: "export", label: "Data Export (CSV/PDF)" },
  { id: "api", label: "REST API" },
  { id: "billing", label: "Billing & Payments" },
  { id: "reports", label: "Reports & Analytics" },
  { id: "file-upload", label: "File Uploads" },
  { id: "real-time", label: "Real-time Updates" },
  { id: "audit-log", label: "Audit Log" },
  { id: "i18n", label: "Multi-language (i18n)" },
  { id: "teams", label: "Team Management" },
] as const;

export function getWebAppType(id: string): WebAppTypeDefinition | undefined {
  return WEBAPP_TYPES.find((t) => t.id === id);
}

export function getWebAppTypeLabel(id: string): string {
  return WEBAPP_TYPES.find((t) => t.id === id)?.label ?? id;
}

export type WebAppLanguage = (typeof WEBAPP_LANGUAGES)[number];
export type WebAppDesignStyle = (typeof WEBAPP_DESIGN_STYLES)[number];
export type WebAppColorStyle = (typeof WEBAPP_COLOR_STYLES)[number];
