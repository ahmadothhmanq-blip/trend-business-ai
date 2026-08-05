/**
 * TBDP Phase 2 — Enterprise UI Component Catalog
 * 75 production-ready components across 11 categories.
 */

export type TbdpComponentCatalogEntry = {
  id: string;
  name: string;
  category: TbdpComponentCategory;
  path: string;
  wcag: "AA";
  client: boolean;
};

export type TbdpComponentCategory =
  | "navigation"
  | "buttons"
  | "forms"
  | "feedback"
  | "cards"
  | "marketing"
  | "commerce"
  | "dashboard"
  | "dialogs"
  | "media"
  | "layout";

const CLIENT_COMPONENTS = new Set([
  "tabs",
  "split-button",
  "multi-select",
  "switch",
  "slider",
  "date-picker",
  "otp",
  "file-upload",
  "toast",
  "modal",
  "drawer",
  "popover",
  "tooltip",
  "context-menu",
  "carousel",
]);

function entry(category: TbdpComponentCategory, id: string, name: string): TbdpComponentCatalogEntry {
  return {
    id,
    name,
    category,
    path: `@/lib/design-platform/components/${category}/${id}`,
    wcag: "AA",
    client: CLIENT_COMPONENTS.has(id),
  };
}

export const TBDP_COMPONENT_CATALOG: TbdpComponentCatalogEntry[] = [
  // Navigation (6)
  entry("navigation", "navbar", "Navbar"),
  entry("navigation", "mega-menu", "MegaMenu"),
  entry("navigation", "sidebar", "Sidebar"),
  entry("navigation", "breadcrumb", "Breadcrumb"),
  entry("navigation", "tabs", "Tabs"),
  entry("navigation", "pagination", "Pagination"),
  // Buttons (7)
  entry("buttons", "primary", "PrimaryButton"),
  entry("buttons", "secondary", "SecondaryButton"),
  entry("buttons", "ghost", "GhostButton"),
  entry("buttons", "outline", "OutlineButton"),
  entry("buttons", "icon", "IconButton"),
  entry("buttons", "floating", "FloatingButton"),
  entry("buttons", "split-button", "SplitButton"),
  // Forms (12)
  entry("forms", "input", "Input"),
  entry("forms", "textarea", "Textarea"),
  entry("forms", "select", "Select"),
  entry("forms", "multi-select", "MultiSelect"),
  entry("forms", "checkbox", "Checkbox"),
  entry("forms", "radio", "Radio"),
  entry("forms", "switch", "Switch"),
  entry("forms", "slider", "Slider"),
  entry("forms", "date-picker", "DatePicker"),
  entry("forms", "otp", "OtpInput"),
  entry("forms", "search", "SearchInput"),
  entry("forms", "file-upload", "FileUpload"),
  // Feedback (9)
  entry("feedback", "alert", "Alert"),
  entry("feedback", "toast", "Toast"),
  entry("feedback", "notification", "Notification"),
  entry("feedback", "banner", "Banner"),
  entry("feedback", "empty-state", "EmptyState"),
  entry("feedback", "error-state", "ErrorState"),
  entry("feedback", "success-state", "SuccessState"),
  entry("feedback", "loading-state", "LoadingState"),
  entry("feedback", "skeleton", "Skeleton"),
  // Cards (7)
  entry("cards", "feature-card", "FeatureCard"),
  entry("cards", "product-card", "ProductCard"),
  entry("cards", "pricing-card", "PricingCard"),
  entry("cards", "team-card", "TeamCard"),
  entry("cards", "testimonial-card", "TestimonialCard"),
  entry("cards", "dashboard-card", "DashboardCard"),
  entry("cards", "media-card", "MediaCard"),
  // Marketing (9)
  entry("marketing", "hero", "Hero"),
  entry("marketing", "cta", "Cta"),
  entry("marketing", "faq", "Faq"),
  entry("marketing", "logo-cloud", "LogoCloud"),
  entry("marketing", "stats", "Stats"),
  entry("marketing", "timeline", "Timeline"),
  entry("marketing", "feature-grid", "FeatureGrid"),
  entry("marketing", "pricing-table", "PricingTable"),
  entry("marketing", "comparison-table", "ComparisonTable"),
  // Commerce (4)
  entry("commerce", "product-grid", "ProductGrid"),
  entry("commerce", "product-details", "ProductDetails"),
  entry("commerce", "checkout-summary", "CheckoutSummary"),
  entry("commerce", "order-status", "OrderStatus"),
  // Dashboard (5)
  entry("dashboard", "kpi-cards", "KpiCards"),
  entry("dashboard", "tables", "Tables"),
  entry("dashboard", "charts-wrapper", "ChartsWrapper"),
  entry("dashboard", "activity-feed", "ActivityFeed"),
  entry("dashboard", "metric-blocks", "MetricBlocks"),
  // Dialogs (5)
  entry("dialogs", "modal", "Modal"),
  entry("dialogs", "drawer", "Drawer"),
  entry("dialogs", "popover", "Popover"),
  entry("dialogs", "tooltip", "Tooltip"),
  entry("dialogs", "context-menu", "ContextMenu"),
  // Media (5)
  entry("media", "avatar", "Avatar"),
  entry("media", "image", "Image"),
  entry("media", "gallery", "Gallery"),
  entry("media", "carousel", "Carousel"),
  entry("media", "video-player", "VideoPlayer"),
  // Layout (6)
  entry("layout", "section", "Section"),
  entry("layout", "container", "Container"),
  entry("layout", "stack", "Stack"),
  entry("layout", "grid", "Grid"),
  entry("layout", "divider", "Divider"),
  entry("layout", "spacer", "Spacer"),
];

export const TBDP_COMPONENT_COUNT = TBDP_COMPONENT_CATALOG.length;

export function getTbdpComponentsByCategory(
  category: TbdpComponentCategory,
): TbdpComponentCatalogEntry[] {
  return TBDP_COMPONENT_CATALOG.filter((c) => c.category === category);
}
