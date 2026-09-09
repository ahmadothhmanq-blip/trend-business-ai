import type { LucideIcon } from "lucide-react";
import { getGlsGenerationLanguageValues } from "@/lib/language-platform/generation/options";
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

  labelKey?: string;

  descriptionKey?: string;
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
    id: "real-estate",
    label: "Real Estate",
    description: "Property listings, inquiries, and agent workflows",
    icon: Building2,
    defaultFeatures: ["auth", "listings", "search", "maps", "inquiries", "profiles"],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description: "Patients, appointments, clinical records, and staff roles",
    icon: ClipboardList,
    defaultFeatures: ["auth", "patients", "appointments", "records", "roles", "notifications"],
  },
  {
    id: "finance",
    label: "Finance",
    description: "Accounts, transactions, budgets, and financial reports",
    icon: CreditCard,
    defaultFeatures: ["auth", "accounts", "transactions", "budgets", "reports", "roles"],
  },
  {
    id: "automotive",
    label: "Automotive",
    description: "Vehicle inventory, sales leads, and service bookings",
    icon: Wrench,
    defaultFeatures: ["auth", "inventory", "leads", "bookings", "search", "filters"],
  },
  {
    id: "custom",
    label: "Custom Web App",
    description: "Build any custom web application with your own requirements",
    icon: Wrench,
    defaultFeatures: ["auth", "dashboard"],
  },
];

export const WEBAPP_LANGUAGES = getGlsGenerationLanguageValues(
  "app-builder",
) as readonly string[];

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
  { id: "auth", labelKey: "constants.webappBuilder.options.auth", label: "Authentication" },
  { id: "dashboard", labelKey: "constants.webappBuilder.options.dashboard", label: "Dashboard" },
  { id: "roles", labelKey: "constants.webappBuilder.options.roles", label: "User Roles & Permissions" },
  { id: "search", labelKey: "constants.webappBuilder.options.search", label: "Search & Filters" },
  { id: "notifications", labelKey: "constants.webappBuilder.options.notifications", label: "Notifications" },
  { id: "settings", labelKey: "constants.webappBuilder.options.settings", label: "Settings Page" },
  { id: "dark-mode", labelKey: "constants.webappBuilder.options.dark_mode", label: "Dark Mode" },
  { id: "export", labelKey: "constants.webappBuilder.options.export", label: "Data Export (CSV/PDF)" },
  { id: "api", labelKey: "constants.webappBuilder.options.api", label: "REST API" },
  { id: "billing", labelKey: "constants.webappBuilder.options.billing", label: "Billing & Payments" },
  { id: "reports", labelKey: "constants.webappBuilder.options.reports", label: "Reports & Analytics" },
  { id: "file-upload", labelKey: "constants.webappBuilder.options.file_upload", label: "File Uploads" },
  { id: "real-time", labelKey: "constants.webappBuilder.options.real_time", label: "Real-time Updates" },
  { id: "audit-log", labelKey: "constants.webappBuilder.options.audit_log", label: "Audit Log" },
  { id: "i18n", labelKey: "constants.webappBuilder.options.i18n", label: "Multi-language (i18n)" },
  { id: "teams", labelKey: "constants.webappBuilder.options.teams", label: "Team Management" },
] as const;

export function getWebAppType(id: string): WebAppTypeDefinition | undefined {
  return WEBAPP_TYPES.find((t) => t.id === id);
}

export function getWebAppTypeLabel(id: string): string {
  return WEBAPP_TYPES.find((t) => t.id === id)?.label ?? id;
}

/** Maps App Design Platform template ids to builder app-type presets. */
export const APP_TEMPLATE_TO_WEBAPP_TYPE: Record<string, string> = {
  restaurant: "pos",
  ecommerce: "ecommerce-admin",
  booking: "booking",
  crm: "crm",
  erp: "erp",
  inventory: "inventory",
  "saas-dashboard": "saas",
  education: "lms",
  "real-estate": "real-estate",
  automotive: "automotive",
  healthcare: "healthcare",
  finance: "finance",
};

export function getWebappTypeForTemplate(templateId: string): string {
  return APP_TEMPLATE_TO_WEBAPP_TYPE[templateId] ?? "custom";
}

export type WebAppLanguage = string;
export type WebAppDesignStyle = (typeof WEBAPP_DESIGN_STYLES)[number];
export type WebAppColorStyle = (typeof WEBAPP_COLOR_STYLES)[number];
