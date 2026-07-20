/**
 * Reusable application component library for App Builder templates.
 */

export type AppComponentDefinition = {
  id: string;
  label: string;
  category:
    | "auth"
    | "profile"
    | "commerce"
    | "data"
    | "communication"
    | "visualization"
    | "layout"
    | "booking"
    | "system";
  description: string;
  defaultProps: Record<string, unknown>;
  slots?: string[];
  usedByTemplates: string[];
};

export const APP_COMPONENT_LIBRARY: AppComponentDefinition[] = [
  {
    id: "auth-form",
    label: "Authentication",
    category: "auth",
    description: "Sign-in / sign-up form with email and password",
    defaultProps: { mode: "login", showSocial: false },
    usedByTemplates: ["*"],
  },
  {
    id: "user-profiles",
    label: "User Profiles",
    category: "profile",
    description: "Profile card and editable user details",
    defaultProps: { editable: true },
    usedByTemplates: ["*"],
  },
  {
    id: "products",
    label: "Products",
    category: "commerce",
    description: "Product grid / list for catalogs",
    defaultProps: { layout: "grid", showPrice: true },
    usedByTemplates: ["ecommerce", "restaurant", "inventory", "automotive", "education"],
  },
  {
    id: "product-grid",
    label: "Product Grid",
    category: "commerce",
    description: "Responsive product cards",
    defaultProps: { columns: 3 },
    usedByTemplates: ["ecommerce", "real-estate", "automotive", "education"],
  },
  {
    id: "product-detail",
    label: "Product Detail",
    category: "commerce",
    description: "Detail view with gallery and CTA",
    defaultProps: { showReviews: true },
    usedByTemplates: ["ecommerce", "real-estate", "automotive", "education"],
  },
  {
    id: "orders-list",
    label: "Orders",
    category: "commerce",
    description: "Order list with status badges",
    defaultProps: { live: true },
    usedByTemplates: ["restaurant", "ecommerce"],
  },
  {
    id: "cart",
    label: "Cart",
    category: "commerce",
    description: "Shopping cart line items",
    defaultProps: { editableQty: true },
    usedByTemplates: ["ecommerce"],
  },
  {
    id: "checkout-form",
    label: "Checkout",
    category: "commerce",
    description: "Shipping and payment checkout form",
    defaultProps: { requireAddress: true },
    usedByTemplates: ["ecommerce"],
  },
  {
    id: "payments",
    label: "Payments",
    category: "commerce",
    description: "Payment method capture UI",
    defaultProps: { providers: ["card"] },
    usedByTemplates: ["ecommerce", "booking", "restaurant", "saas-dashboard"],
  },
  {
    id: "form",
    label: "Forms",
    category: "data",
    description: "Generic create/edit form",
    defaultProps: { layout: "stacked" },
    usedByTemplates: ["*"],
  },
  {
    id: "table",
    label: "Tables",
    category: "data",
    description: "Data table with sort and row actions",
    defaultProps: { pageSize: 20 },
    usedByTemplates: ["*"],
  },
  {
    id: "search",
    label: "Search",
    category: "data",
    description: "Full-text search input",
    defaultProps: { debounceMs: 250 },
    usedByTemplates: ["*"],
  },
  {
    id: "filters",
    label: "Filters",
    category: "data",
    description: "Faceted filter bar",
    defaultProps: { layout: "horizontal" },
    usedByTemplates: ["*"],
  },
  {
    id: "chart",
    label: "Charts",
    category: "visualization",
    description: "Analytics charts (line/bar/pie)",
    defaultProps: { type: "line" },
    usedByTemplates: ["*"],
  },
  {
    id: "kpi-cards",
    label: "KPI Cards",
    category: "visualization",
    description: "Metric summary cards",
    defaultProps: { columns: 4 },
    usedByTemplates: ["*"],
  },
  {
    id: "map",
    label: "Maps",
    category: "visualization",
    description: "Map pin / region visualization",
    defaultProps: { zoom: 12 },
    usedByTemplates: ["real-estate", "inventory", "restaurant"],
  },
  {
    id: "notifications",
    label: "Notifications",
    category: "communication",
    description: "In-app notification center",
    defaultProps: { maxItems: 20 },
    usedByTemplates: ["*"],
  },
  {
    id: "reviews",
    label: "Reviews",
    category: "communication",
    description: "Star ratings and comments",
    defaultProps: { maxStars: 5 },
    usedByTemplates: ["ecommerce"],
  },
  {
    id: "chat",
    label: "Chat",
    category: "communication",
    description: "Threaded messaging panel",
    defaultProps: { realtime: false },
    usedByTemplates: ["real-estate", "automotive", "crm"],
  },
  {
    id: "dashboards",
    label: "Dashboards",
    category: "layout",
    description: "Composable dashboard shell",
    defaultProps: { denseness: "comfortable" },
    usedByTemplates: ["*"],
  },
  {
    id: "booking-form",
    label: "Booking Form",
    category: "booking",
    description: "Service booking capture",
    defaultProps: { requireDeposit: false },
    usedByTemplates: ["booking", "healthcare", "automotive"],
  },
  {
    id: "booking-slot",
    label: "Booking Slots",
    category: "booking",
    description: "Availability slot picker",
    defaultProps: { slotMinutes: 30 },
    usedByTemplates: ["booking", "healthcare"],
  },
  {
    id: "calendar",
    label: "Calendar",
    category: "booking",
    description: "Month/week calendar view",
    defaultProps: { view: "week" },
    usedByTemplates: ["booking", "healthcare", "automotive"],
  },
  {
    id: "status-badge",
    label: "Status Badge",
    category: "system",
    description: "Colored status pill",
    defaultProps: {},
    usedByTemplates: ["*"],
  },
  {
    id: "roles-panel",
    label: "Roles Panel",
    category: "system",
    description: "Role and permission editor",
    defaultProps: {},
    usedByTemplates: ["crm", "erp", "saas-dashboard", "healthcare"],
  },
  {
    id: "brand-panel",
    label: "Brand Panel",
    category: "system",
    description: "Logo and brand token editor",
    defaultProps: {},
    usedByTemplates: ["*"],
  },
  {
    id: "pipeline",
    label: "Pipeline",
    category: "data",
    description: "Kanban pipeline board",
    defaultProps: { stages: [] },
    usedByTemplates: ["crm"],
  },
  {
    id: "kanban",
    label: "Kanban",
    category: "layout",
    description: "Drag-ready kanban columns (foundation)",
    defaultProps: { columns: [] },
    usedByTemplates: ["crm"],
  },
  {
    id: "progress",
    label: "Progress",
    category: "visualization",
    description: "Progress bars and completion",
    defaultProps: {},
    usedByTemplates: ["education"],
  },
  {
    id: "lesson-player",
    label: "Lesson Player",
    category: "layout",
    description: "Course lesson content player",
    defaultProps: {},
    usedByTemplates: ["education"],
  },
  {
    id: "quiz",
    label: "Quiz",
    category: "data",
    description: "Quiz questions and scoring",
    defaultProps: {},
    usedByTemplates: ["education"],
  },
  {
    id: "pricing-table",
    label: "Pricing Table",
    category: "commerce",
    description: "SaaS plan comparison table",
    defaultProps: {},
    usedByTemplates: ["saas-dashboard"],
  },
  {
    id: "audit-log",
    label: "Audit Log",
    category: "system",
    description: "Immutable activity log table",
    defaultProps: {},
    usedByTemplates: ["erp"],
  },
  {
    id: "export",
    label: "Export",
    category: "system",
    description: "CSV/PDF export actions",
    defaultProps: { formats: ["csv", "pdf"] },
    usedByTemplates: ["erp", "finance"],
  },
];

export function getAppComponent(id: string): AppComponentDefinition | undefined {
  return APP_COMPONENT_LIBRARY.find((c) => c.id === id);
}

export function listComponentsForTemplate(templateId: string): AppComponentDefinition[] {
  return APP_COMPONENT_LIBRARY.filter(
    (c) => c.usedByTemplates.includes("*") || c.usedByTemplates.includes(templateId),
  );
}
