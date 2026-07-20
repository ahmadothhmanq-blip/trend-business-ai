/**
 * Professional application templates for App Builder.
 */

import type {
  AppArchitecture,
  AppDataModel,
  AppRole,
  AppScreen,
  AppTemplateId,
  AppWorkflow,
  AppDesignTokens,
  AppNavigationItem,
} from "@/lib/ai-core/app-design-platform/types";

export type AppTemplateDefinition = {
  id: AppTemplateId;
  label: string;
  description: string;
  industry: string;
  architecture: AppArchitecture;
  defaultFeatures: string[];
  screens: Omit<AppScreen, "id">[];
  navigation: Omit<AppNavigationItem, "id">[];
  dataModels: Omit<AppDataModel, "id">[];
  roles: Omit<AppRole, "id">[];
  workflows: Omit<AppWorkflow, "id">[];
  componentTypes: string[];
  designSystem: AppDesignTokens;
  userFlows: string[];
};

const baseTokens = (
  primary: string,
  secondary: string,
  accent: string,
  bg = "#0B1220",
  fg = "#F8FAFC",
  surface = "#111827",
): AppDesignTokens => ({
  primary,
  secondary,
  accent,
  background: bg,
  foreground: fg,
  surface,
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  headingFont: "Geist",
  bodyFont: "Geist",
  radius: "12px",
  density: "comfortable",
});

function screen(
  name: string,
  path: string,
  purpose: string,
  components: string[],
  dataBindings: string[],
  roles: string[],
  order: number,
  layout: AppScreen["layout"] = "sidebar",
): Omit<AppScreen, "id"> {
  return { name, path, purpose, layout, components, dataBindings, roles, order };
}

function model(
  name: string,
  label: string,
  fields: AppDataModel["fields"],
  relations: AppDataModel["relations"] = [],
  crud: AppDataModel["crud"] = ["create", "read", "update", "delete", "list"],
): Omit<AppDataModel, "id"> {
  return { name, label, fields, relations, crud };
}

function role(
  name: string,
  description: string,
  screens: string[],
  actions: string[],
  dataAccess: AppRole["permissions"]["dataAccess"],
): Omit<AppRole, "id"> {
  return { name, description, permissions: { screens, actions, dataAccess } };
}

export const APP_TEMPLATES: AppTemplateDefinition[] = [
  {
    id: "restaurant",
    label: "Restaurant App",
    description: "Menus, orders, tables, and kitchen workflow for restaurants",
    industry: "Food & Hospitality",
    architecture: "pos-retail",
    defaultFeatures: ["auth", "dashboard", "products", "orders", "payments", "notifications"],
    screens: [
      screen("Login", "/login", "Staff authentication", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Dashboard", "/dashboard", "Today's sales and table status", ["kpi-cards", "chart", "orders-list"], ["Order", "Table"], ["admin", "manager"], 1),
      screen("Menu", "/menu", "Manage menu items and categories", ["table", "form", "filters"], ["MenuItem"], ["admin", "manager"], 2),
      screen("Orders", "/orders", "Live order board", ["orders-list", "filters", "status-badge"], ["Order"], ["admin", "manager", "employee"], 3),
      screen("Tables", "/tables", "Floor and table status", ["map", "status-badge"], ["Table"], ["admin", "manager", "employee"], 4),
      screen("Kitchen", "/kitchen", "Kitchen display system", ["orders-list", "notifications"], ["Order"], ["employee"], 5),
      screen("Settings", "/settings", "Restaurant branding and preferences", ["form", "brand-panel"], ["Settings"], ["admin"], 6),
    ],
    navigation: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Menu", href: "/menu", icon: "Utensils" },
      { label: "Orders", href: "/orders", icon: "ClipboardList" },
      { label: "Tables", href: "/tables", icon: "Grid3x3" },
      { label: "Kitchen", href: "/kitchen", icon: "Flame" },
      { label: "Settings", href: "/settings", icon: "Settings" },
    ],
    dataModels: [
      model("MenuItem", "Menu Item", [
        { name: "name", type: "string", required: true },
        { name: "description", type: "string" },
        { name: "price", type: "money", required: true },
        { name: "category", type: "string" },
        { name: "imageUrl", type: "image" },
        { name: "available", type: "boolean", defaultValue: true },
      ]),
      model("Order", "Order", [
        { name: "tableId", type: "relation", relationTo: "Table" },
        { name: "status", type: "enum", enumValues: ["pending", "preparing", "ready", "served", "paid"] },
        { name: "total", type: "money" },
        { name: "notes", type: "string" },
      ], [{ name: "items", target: "OrderItem", type: "one-to-many" }]),
      model("OrderItem", "Order Item", [
        { name: "menuItemId", type: "relation", relationTo: "MenuItem", required: true },
        { name: "quantity", type: "number", required: true },
        { name: "price", type: "money" },
      ]),
      model("Table", "Table", [
        { name: "number", type: "number", required: true, unique: true },
        { name: "seats", type: "number" },
        { name: "status", type: "enum", enumValues: ["free", "occupied", "reserved"] },
      ]),
    ],
    roles: [
      role("Admin", "Full restaurant control", ["*"], ["*"], "all"),
      role("Manager", "Floor and menu management", ["/dashboard", "/menu", "/orders", "/tables"], ["manage-menu", "manage-orders"], "all"),
      role("Employee", "Orders and kitchen", ["/orders", "/tables", "/kitchen"], ["update-order-status"], "own"),
      role("Customer", "Guest ordering (optional)", ["/menu"], ["place-order"], "own"),
    ],
    workflows: [
      { name: "Order lifecycle", trigger: "new-order", steps: ["create", "send-kitchen", "prepare", "serve", "pay"], roles: ["employee", "manager"] },
      { name: "Menu update", trigger: "menu-edit", steps: ["edit-item", "publish"], roles: ["manager", "admin"] },
    ],
    componentTypes: ["auth", "dashboard", "products", "orders", "payments", "forms", "tables", "charts", "notifications", "filters"],
    designSystem: baseTokens("#C45C26", "#1F2937", "#F59E0B", "#FFF7ED", "#1C1917", "#FFFFFF"),
    userFlows: ["Guest browses menu → places order → kitchen prepares → served → payment"],
  },
  {
    id: "ecommerce",
    label: "Ecommerce App",
    description: "Products, cart, checkout, and order management",
    industry: "Retail & Commerce",
    architecture: "marketplace",
    defaultFeatures: ["auth", "dashboard", "products", "orders", "payments", "search", "reviews"],
    screens: [
      screen("Login", "/login", "Customer and admin auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Storefront", "/", "Product browsing", ["product-grid", "search", "filters"], ["Product"], ["customer", "guest"], 1, "topnav"),
      screen("Product", "/products/[id]", "Product detail", ["product-detail", "reviews", "form"], ["Product", "Review"], ["customer", "guest"], 2, "topnav"),
      screen("Cart", "/cart", "Shopping cart", ["cart", "form"], ["CartItem"], ["customer"], 3, "topnav"),
      screen("Checkout", "/checkout", "Payment and shipping", ["checkout-form", "payments"], ["Order"], ["customer"], 4, "topnav"),
      screen("Admin Products", "/admin/products", "Catalog management", ["table", "form", "filters"], ["Product"], ["admin", "manager"], 5),
      screen("Admin Orders", "/admin/orders", "Order fulfillment", ["table", "filters", "status-badge"], ["Order"], ["admin", "manager"], 6),
      screen("Dashboard", "/admin", "Sales analytics", ["kpi-cards", "chart"], ["Order", "Product"], ["admin", "manager"], 7),
    ],
    navigation: [
      { label: "Store", href: "/", icon: "Store" },
      { label: "Cart", href: "/cart", icon: "ShoppingCart" },
      { label: "Admin", href: "/admin", icon: "LayoutDashboard" },
      { label: "Products", href: "/admin/products", icon: "Package" },
      { label: "Orders", href: "/admin/orders", icon: "ClipboardList" },
    ],
    dataModels: [
      model("Product", "Product", [
        { name: "title", type: "string", required: true },
        { name: "description", type: "string" },
        { name: "price", type: "money", required: true },
        { name: "stock", type: "number" },
        { name: "imageUrl", type: "image" },
        { name: "category", type: "string" },
      ]),
      model("Order", "Order", [
        { name: "customerId", type: "relation", relationTo: "User" },
        { name: "status", type: "enum", enumValues: ["pending", "paid", "shipped", "delivered", "cancelled"] },
        { name: "total", type: "money" },
      ]),
      model("Review", "Review", [
        { name: "productId", type: "relation", relationTo: "Product" },
        { name: "rating", type: "number", required: true },
        { name: "comment", type: "string" },
      ]),
    ],
    roles: [
      role("Admin", "Full store control", ["*"], ["*"], "all"),
      role("Manager", "Catalog and orders", ["/admin", "/admin/products", "/admin/orders"], ["manage-products", "fulfill-orders"], "all"),
      role("Customer", "Shop and checkout", ["/", "/products/[id]", "/cart", "/checkout"], ["place-order", "review"], "own"),
    ],
    workflows: [
      { name: "Checkout", trigger: "checkout", steps: ["validate-cart", "payment", "create-order", "notify"], roles: ["customer"] },
      { name: "Fulfillment", trigger: "order-paid", steps: ["pick", "pack", "ship", "deliver"], roles: ["manager"] },
    ],
    componentTypes: ["auth", "products", "orders", "payments", "forms", "tables", "charts", "search", "filters", "reviews", "dashboards"],
    designSystem: baseTokens("#2563EB", "#0F172A", "#F97316", "#F8FAFC", "#0F172A", "#FFFFFF"),
    userFlows: ["Browse → product → cart → checkout → order tracking"],
  },
  {
    id: "booking",
    label: "Booking App",
    description: "Appointments, availability, and calendar scheduling",
    industry: "Services",
    architecture: "booking-calendar",
    defaultFeatures: ["auth", "calendar", "bookings", "notifications", "payments", "profiles"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Calendar", "/calendar", "Availability calendar", ["calendar", "booking-slot"], ["Booking", "Availability"], ["admin", "manager", "employee"], 1),
      screen("Bookings", "/bookings", "Booking list", ["table", "filters", "status-badge"], ["Booking"], ["admin", "manager", "employee"], 2),
      screen("Services", "/services", "Bookable services", ["table", "form"], ["Service"], ["admin", "manager"], 3),
      screen("Customers", "/customers", "Customer profiles", ["table", "user-profile"], ["Customer"], ["admin", "manager"], 4),
      screen("Book", "/book", "Customer booking flow", ["booking-form", "calendar", "payments"], ["Booking", "Service"], ["customer"], 5, "topnav"),
      screen("Dashboard", "/dashboard", "Booking KPIs", ["kpi-cards", "chart"], ["Booking"], ["admin", "manager"], 6),
    ],
    navigation: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Calendar", href: "/calendar", icon: "Calendar" },
      { label: "Bookings", href: "/bookings", icon: "ClipboardList" },
      { label: "Services", href: "/services", icon: "Sparkles" },
      { label: "Customers", href: "/customers", icon: "Users" },
    ],
    dataModels: [
      model("Service", "Service", [
        { name: "name", type: "string", required: true },
        { name: "durationMin", type: "number", required: true },
        { name: "price", type: "money" },
      ]),
      model("Booking", "Booking", [
        { name: "serviceId", type: "relation", relationTo: "Service" },
        { name: "customerId", type: "relation", relationTo: "Customer" },
        { name: "startsAt", type: "date", required: true },
        { name: "status", type: "enum", enumValues: ["pending", "confirmed", "completed", "cancelled"] },
      ]),
      model("Availability", "Availability", [
        { name: "weekday", type: "number" },
        { name: "startTime", type: "string" },
        { name: "endTime", type: "string" },
      ]),
    ],
    roles: [
      role("Admin", "Full control", ["*"], ["*"], "all"),
      role("Manager", "Schedule and services", ["/dashboard", "/calendar", "/bookings", "/services", "/customers"], ["manage-bookings"], "all"),
      role("Employee", "Own calendar", ["/calendar", "/bookings"], ["update-booking"], "own"),
      role("Customer", "Book services", ["/book"], ["create-booking"], "own"),
    ],
    workflows: [
      { name: "Book appointment", trigger: "book", steps: ["select-service", "pick-slot", "confirm", "pay", "notify"], roles: ["customer"] },
    ],
    componentTypes: ["auth", "booking", "forms", "tables", "calendars", "payments", "notifications", "user-profiles", "dashboards"],
    designSystem: baseTokens("#0D9488", "#134E4A", "#F59E0B", "#F0FDFA", "#042F2E", "#FFFFFF"),
    userFlows: ["Select service → pick slot → confirm → reminder notifications"],
  },
  {
    id: "crm",
    label: "CRM App",
    description: "Contacts, deals, and sales pipelines",
    industry: "Sales",
    architecture: "crm-pipeline",
    defaultFeatures: ["auth", "dashboard", "contacts", "deals", "pipeline", "search", "roles"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Dashboard", "/dashboard", "Pipeline overview", ["kpi-cards", "chart"], ["Deal", "Contact"], ["admin", "manager", "employee"], 1),
      screen("Contacts", "/contacts", "Contact directory", ["table", "search", "filters", "form"], ["Contact"], ["admin", "manager", "employee"], 2),
      screen("Deals", "/deals", "Deal board", ["pipeline", "kanban", "filters"], ["Deal"], ["admin", "manager", "employee"], 3),
      screen("Companies", "/companies", "Accounts", ["table", "form"], ["Company"], ["admin", "manager"], 4),
      screen("Activities", "/activities", "Tasks and calls", ["table", "form", "notifications"], ["Activity"], ["admin", "manager", "employee"], 5),
      screen("Settings", "/settings", "CRM settings", ["form", "roles-panel"], ["Settings"], ["admin"], 6),
    ],
    navigation: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Contacts", href: "/contacts", icon: "Users" },
      { label: "Deals", href: "/deals", icon: "Handshake" },
      { label: "Companies", href: "/companies", icon: "Building2" },
      { label: "Activities", href: "/activities", icon: "ListTodo" },
      { label: "Settings", href: "/settings", icon: "Settings" },
    ],
    dataModels: [
      model("Contact", "Contact", [
        { name: "name", type: "string", required: true },
        { name: "email", type: "string" },
        { name: "phone", type: "string" },
        { name: "companyId", type: "relation", relationTo: "Company" },
      ]),
      model("Deal", "Deal", [
        { name: "title", type: "string", required: true },
        { name: "value", type: "money" },
        { name: "stage", type: "enum", enumValues: ["lead", "qualified", "proposal", "won", "lost"] },
        { name: "contactId", type: "relation", relationTo: "Contact" },
      ]),
      model("Company", "Company", [
        { name: "name", type: "string", required: true },
        { name: "industry", type: "string" },
      ]),
      model("Activity", "Activity", [
        { name: "type", type: "enum", enumValues: ["call", "email", "meeting", "task"] },
        { name: "dueAt", type: "date" },
        { name: "done", type: "boolean", defaultValue: false },
      ]),
    ],
    roles: [
      role("Admin", "Full CRM", ["*"], ["*"], "all"),
      role("Manager", "Team pipeline", ["*"], ["manage-deals", "view-team"], "team"),
      role("Employee", "Own pipeline", ["/dashboard", "/contacts", "/deals", "/activities"], ["manage-own"], "own"),
    ],
    workflows: [
      { name: "Deal progression", trigger: "stage-change", steps: ["update-stage", "log-activity", "notify-manager"], roles: ["employee", "manager"] },
    ],
    componentTypes: ["auth", "dashboards", "tables", "forms", "search", "filters", "charts", "notifications", "user-profiles"],
    designSystem: baseTokens("#4F46E5", "#1E1B4B", "#22D3EE", "#EEF2FF", "#0F172A", "#FFFFFF"),
    userFlows: ["Lead capture → qualify → proposal → close → activity follow-up"],
  },
  {
    id: "erp",
    label: "ERP App",
    description: "Modular finance, HR, and operations planning",
    industry: "Enterprise",
    architecture: "erp-modules",
    defaultFeatures: ["auth", "dashboard", "modules", "reports", "roles", "audit-log"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Dashboard", "/dashboard", "Cross-module KPIs", ["kpi-cards", "chart"], ["Invoice", "Employee"], ["admin", "manager"], 1),
      screen("Finance", "/finance", "Invoices and expenses", ["table", "form", "charts"], ["Invoice", "Expense"], ["admin", "manager"], 2),
      screen("HR", "/hr", "Employees and leave", ["table", "form"], ["Employee", "Leave"], ["admin", "manager"], 3),
      screen("Inventory", "/inventory", "Stock modules", ["table", "filters"], ["StockItem"], ["admin", "manager", "employee"], 4),
      screen("Reports", "/reports", "Operational reports", ["chart", "table", "export"], ["Report"], ["admin", "manager"], 5),
      screen("Admin", "/admin", "Roles and audit", ["roles-panel", "audit-log", "form"], ["User", "AuditLog"], ["admin"], 6),
    ],
    navigation: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Finance", href: "/finance", icon: "Wallet" },
      { label: "HR", href: "/hr", icon: "Users" },
      { label: "Inventory", href: "/inventory", icon: "Package" },
      { label: "Reports", href: "/reports", icon: "BarChart3" },
      { label: "Admin", href: "/admin", icon: "Shield" },
    ],
    dataModels: [
      model("Invoice", "Invoice", [
        { name: "number", type: "string", required: true, unique: true },
        { name: "amount", type: "money", required: true },
        { name: "status", type: "enum", enumValues: ["draft", "sent", "paid", "overdue"] },
      ]),
      model("Employee", "Employee", [
        { name: "name", type: "string", required: true },
        { name: "department", type: "string" },
        { name: "role", type: "string" },
      ]),
      model("StockItem", "Stock Item", [
        { name: "sku", type: "string", required: true, unique: true },
        { name: "quantity", type: "number" },
        { name: "reorderLevel", type: "number" },
      ]),
    ],
    roles: [
      role("Admin", "Full ERP", ["*"], ["*"], "all"),
      role("Manager", "Module management", ["/dashboard", "/finance", "/hr", "/inventory", "/reports"], ["approve", "report"], "team"),
      role("Employee", "Operational entry", ["/inventory", "/hr"], ["create", "update-own"], "own"),
    ],
    workflows: [
      { name: "Invoice approval", trigger: "invoice-submit", steps: ["create", "review", "approve", "send"], roles: ["manager", "admin"] },
    ],
    componentTypes: ["auth", "dashboards", "tables", "forms", "charts", "notifications", "roles", "search", "filters"],
    designSystem: baseTokens("#0F766E", "#134E4A", "#FBBF24", "#F0FDFA", "#042F2E", "#FFFFFF"),
    userFlows: ["Module entry → approval → reporting → audit"],
  },
  {
    id: "inventory",
    label: "Inventory App",
    description: "Stock, warehouses, suppliers, and reorder alerts",
    industry: "Logistics",
    architecture: "dashboard-sidebar",
    defaultFeatures: ["auth", "products", "stock", "suppliers", "orders", "alerts"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Dashboard", "/dashboard", "Stock health", ["kpi-cards", "chart", "notifications"], ["StockItem"], ["admin", "manager"], 1),
      screen("Products", "/products", "SKU catalog", ["table", "form", "search", "filters"], ["StockItem"], ["admin", "manager", "employee"], 2),
      screen("Warehouses", "/warehouses", "Locations", ["table", "form", "map"], ["Warehouse"], ["admin", "manager"], 3),
      screen("Suppliers", "/suppliers", "Vendor directory", ["table", "form"], ["Supplier"], ["admin", "manager"], 4),
      screen("Purchase Orders", "/purchase-orders", "PO management", ["table", "form", "status-badge"], ["PurchaseOrder"], ["admin", "manager"], 5),
      screen("Alerts", "/alerts", "Low stock alerts", ["notifications", "table"], ["Alert"], ["admin", "manager", "employee"], 6),
    ],
    navigation: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Products", href: "/products", icon: "Package" },
      { label: "Warehouses", href: "/warehouses", icon: "Warehouse" },
      { label: "Suppliers", href: "/suppliers", icon: "Truck" },
      { label: "POs", href: "/purchase-orders", icon: "ClipboardList" },
      { label: "Alerts", href: "/alerts", icon: "Bell" },
    ],
    dataModels: [
      model("StockItem", "Stock Item", [
        { name: "sku", type: "string", required: true, unique: true },
        { name: "name", type: "string", required: true },
        { name: "quantity", type: "number" },
        { name: "reorderLevel", type: "number" },
      ]),
      model("Warehouse", "Warehouse", [
        { name: "name", type: "string", required: true },
        { name: "address", type: "string" },
      ]),
      model("Supplier", "Supplier", [
        { name: "name", type: "string", required: true },
        { name: "email", type: "string" },
      ]),
      model("PurchaseOrder", "Purchase Order", [
        { name: "supplierId", type: "relation", relationTo: "Supplier" },
        { name: "status", type: "enum", enumValues: ["draft", "ordered", "received", "cancelled"] },
        { name: "total", type: "money" },
      ]),
    ],
    roles: [
      role("Admin", "Full inventory", ["*"], ["*"], "all"),
      role("Manager", "Stock and POs", ["*"], ["manage-stock", "create-po"], "all"),
      role("Employee", "Stock updates", ["/products", "/alerts"], ["adjust-stock"], "own"),
    ],
    workflows: [
      { name: "Reorder", trigger: "low-stock", steps: ["alert", "create-po", "receive", "restock"], roles: ["manager"] },
    ],
    componentTypes: ["auth", "products", "tables", "forms", "charts", "notifications", "search", "filters", "maps", "dashboards"],
    designSystem: baseTokens("#EA580C", "#7C2D12", "#2563EB", "#FFF7ED", "#1C1917", "#FFFFFF"),
    userFlows: ["Low stock alert → purchase order → receive → update stock"],
  },
  {
    id: "saas-dashboard",
    label: "SaaS Dashboard",
    description: "Multi-tenant SaaS with billing, teams, and settings",
    industry: "Software",
    architecture: "multi-tenant-saas",
    defaultFeatures: ["auth", "dashboard", "billing", "teams", "settings", "api", "roles"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Dashboard", "/dashboard", "Product analytics", ["kpi-cards", "chart"], ["Metric"], ["admin", "manager", "employee"], 1),
      screen("Team", "/team", "Members and invites", ["table", "form", "user-profiles"], ["Member"], ["admin", "manager"], 2),
      screen("Billing", "/billing", "Plans and invoices", ["pricing-table", "payments", "table"], ["Subscription", "Invoice"], ["admin"], 3),
      screen("Settings", "/settings", "Workspace settings", ["form", "brand-panel"], ["Settings"], ["admin"], 4),
      screen("API Keys", "/api-keys", "Developer keys", ["table", "form"], ["ApiKey"], ["admin"], 5),
    ],
    navigation: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Team", href: "/team", icon: "Users" },
      { label: "Billing", href: "/billing", icon: "CreditCard" },
      { label: "API Keys", href: "/api-keys", icon: "Key" },
      { label: "Settings", href: "/settings", icon: "Settings" },
    ],
    dataModels: [
      model("Member", "Member", [
        { name: "email", type: "string", required: true },
        { name: "role", type: "enum", enumValues: ["admin", "manager", "member"] },
      ]),
      model("Subscription", "Subscription", [
        { name: "plan", type: "string", required: true },
        { name: "status", type: "enum", enumValues: ["trialing", "active", "past_due", "cancelled"] },
      ]),
      model("ApiKey", "API Key", [
        { name: "name", type: "string", required: true },
        { name: "prefix", type: "string" },
        { name: "revoked", type: "boolean", defaultValue: false },
      ]),
    ],
    roles: [
      role("Admin", "Workspace owner", ["*"], ["*"], "all"),
      role("Manager", "Team lead", ["/dashboard", "/team"], ["invite", "view-analytics"], "team"),
      role("Employee", "Member", ["/dashboard"], ["view"], "own"),
    ],
    workflows: [
      { name: "Invite member", trigger: "invite", steps: ["send-invite", "accept", "assign-role"], roles: ["admin", "manager"] },
    ],
    componentTypes: ["auth", "dashboards", "tables", "forms", "charts", "payments", "user-profiles", "notifications"],
    designSystem: baseTokens("#7C3AED", "#2E1065", "#06B6D4", "#FAF5FF", "#0F172A", "#FFFFFF"),
    userFlows: ["Sign up → workspace → invite team → subscribe → use product"],
  },
  {
    id: "education",
    label: "Education App",
    description: "Courses, lessons, quizzes, and student progress",
    industry: "Education",
    architecture: "learning-portal",
    defaultFeatures: ["auth", "courses", "lessons", "quizzes", "progress", "certificates"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Catalog", "/courses", "Course catalog", ["product-grid", "search", "filters"], ["Course"], ["student", "guest", "admin"], 1, "topnav"),
      screen("Course", "/courses/[id]", "Course detail", ["product-detail", "progress"], ["Course", "Lesson"], ["student", "admin"], 2, "topnav"),
      screen("Lesson", "/learn/[id]", "Lesson player", ["lesson-player", "quiz"], ["Lesson", "Quiz"], ["student"], 3, "blank"),
      screen("Progress", "/progress", "Student progress", ["chart", "table", "progress"], ["Enrollment"], ["student", "admin"], 4),
      screen("Admin Courses", "/admin/courses", "Manage courses", ["table", "form"], ["Course"], ["admin", "manager"], 5),
      screen("Dashboard", "/admin", "Education KPIs", ["kpi-cards", "chart"], ["Enrollment"], ["admin", "manager"], 6),
    ],
    navigation: [
      { label: "Courses", href: "/courses", icon: "BookOpen" },
      { label: "Progress", href: "/progress", icon: "TrendingUp" },
      { label: "Admin", href: "/admin", icon: "LayoutDashboard" },
    ],
    dataModels: [
      model("Course", "Course", [
        { name: "title", type: "string", required: true },
        { name: "description", type: "string" },
        { name: "price", type: "money" },
      ]),
      model("Lesson", "Lesson", [
        { name: "courseId", type: "relation", relationTo: "Course" },
        { name: "title", type: "string", required: true },
        { name: "content", type: "string" },
        { name: "order", type: "number" },
      ]),
      model("Enrollment", "Enrollment", [
        { name: "courseId", type: "relation", relationTo: "Course" },
        { name: "progress", type: "number" },
        { name: "completed", type: "boolean", defaultValue: false },
      ]),
    ],
    roles: [
      role("Admin", "Platform admin", ["*"], ["*"], "all"),
      role("Manager", "Instructor", ["/admin", "/admin/courses", "/courses"], ["manage-courses"], "all"),
      role("Customer", "Student", ["/courses", "/courses/[id]", "/learn/[id]", "/progress"], ["enroll", "complete-lesson"], "own"),
    ],
    workflows: [
      { name: "Complete course", trigger: "lesson-complete", steps: ["update-progress", "quiz", "certificate"], roles: ["student"] },
    ],
    componentTypes: ["auth", "products", "forms", "tables", "charts", "progress", "search", "filters", "dashboards"],
    designSystem: baseTokens("#1D4ED8", "#1E3A8A", "#F59E0B", "#EFF6FF", "#0F172A", "#FFFFFF"),
    userFlows: ["Browse courses → enroll → learn → quiz → certificate"],
  },
  {
    id: "real-estate",
    label: "Real Estate App",
    description: "Listings, inquiries, agents, and property maps",
    industry: "Real Estate",
    architecture: "content-catalog",
    defaultFeatures: ["auth", "listings", "search", "maps", "inquiries", "profiles"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Listings", "/listings", "Property catalog", ["product-grid", "search", "filters", "map"], ["Property"], ["guest", "customer", "agent", "admin"], 1, "topnav"),
      screen("Property", "/listings/[id]", "Property detail", ["product-detail", "map", "form"], ["Property", "Inquiry"], ["guest", "customer", "agent"], 2, "topnav"),
      screen("Inquiries", "/inquiries", "Lead inbox", ["table", "filters", "chat"], ["Inquiry"], ["agent", "admin", "manager"], 3),
      screen("Agents", "/agents", "Agent directory", ["user-profiles", "table"], ["Agent"], ["admin", "manager"], 4),
      screen("Dashboard", "/dashboard", "Listings KPIs", ["kpi-cards", "chart"], ["Property", "Inquiry"], ["admin", "manager", "agent"], 5),
    ],
    navigation: [
      { label: "Listings", href: "/listings", icon: "Home" },
      { label: "Inquiries", href: "/inquiries", icon: "MessageSquare" },
      { label: "Agents", href: "/agents", icon: "Users" },
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    ],
    dataModels: [
      model("Property", "Property", [
        { name: "title", type: "string", required: true },
        { name: "price", type: "money", required: true },
        { name: "address", type: "string" },
        { name: "bedrooms", type: "number" },
        { name: "imageUrl", type: "image" },
        { name: "status", type: "enum", enumValues: ["available", "pending", "sold"] },
      ]),
      model("Inquiry", "Inquiry", [
        { name: "propertyId", type: "relation", relationTo: "Property" },
        { name: "message", type: "string" },
        { name: "status", type: "enum", enumValues: ["new", "contacted", "closed"] },
      ]),
    ],
    roles: [
      role("Admin", "Brokerage admin", ["*"], ["*"], "all"),
      role("Manager", "Team lead", ["*"], ["assign-leads"], "team"),
      role("Employee", "Agent", ["/listings", "/listings/[id]", "/inquiries", "/dashboard"], ["manage-listings", "reply-inquiry"], "own"),
      role("Customer", "Buyer/renter", ["/listings", "/listings/[id]"], ["inquire"], "own"),
    ],
    workflows: [
      { name: "Inquiry handling", trigger: "new-inquiry", steps: ["notify-agent", "contact", "schedule-viewing", "close"], roles: ["agent"] },
    ],
    componentTypes: ["auth", "products", "maps", "search", "filters", "forms", "tables", "chat", "user-profiles", "dashboards"],
    designSystem: baseTokens("#0E7490", "#164E63", "#D97706", "#ECFEFF", "#083344", "#FFFFFF"),
    userFlows: ["Search listings → view property → inquire → agent follow-up"],
  },
  {
    id: "automotive",
    label: "Automotive App",
    description: "Vehicle inventory, leads, and service bookings",
    industry: "Automotive",
    architecture: "content-catalog",
    defaultFeatures: ["auth", "inventory", "leads", "bookings", "search", "filters"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Inventory", "/vehicles", "Vehicle catalog", ["product-grid", "search", "filters"], ["Vehicle"], ["guest", "customer", "admin", "manager"], 1, "topnav"),
      screen("Vehicle", "/vehicles/[id]", "Vehicle detail", ["product-detail", "form"], ["Vehicle", "Lead"], ["guest", "customer", "admin"], 2, "topnav"),
      screen("Leads", "/leads", "Sales leads", ["table", "filters", "chat"], ["Lead"], ["admin", "manager", "employee"], 3),
      screen("Service", "/service", "Service bookings", ["booking-form", "calendar", "table"], ["ServiceBooking"], ["customer", "admin", "employee"], 4),
      screen("Dashboard", "/dashboard", "Dealership KPIs", ["kpi-cards", "chart"], ["Vehicle", "Lead"], ["admin", "manager"], 5),
    ],
    navigation: [
      { label: "Inventory", href: "/vehicles", icon: "Car" },
      { label: "Leads", href: "/leads", icon: "Users" },
      { label: "Service", href: "/service", icon: "Wrench" },
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    ],
    dataModels: [
      model("Vehicle", "Vehicle", [
        { name: "make", type: "string", required: true },
        { name: "model", type: "string", required: true },
        { name: "year", type: "number" },
        { name: "price", type: "money" },
        { name: "mileage", type: "number" },
        { name: "imageUrl", type: "image" },
      ]),
      model("Lead", "Lead", [
        { name: "vehicleId", type: "relation", relationTo: "Vehicle" },
        { name: "name", type: "string", required: true },
        { name: "status", type: "enum", enumValues: ["new", "contacted", "test-drive", "won", "lost"] },
      ]),
      model("ServiceBooking", "Service Booking", [
        { name: "vehicleInfo", type: "string" },
        { name: "startsAt", type: "date", required: true },
        { name: "status", type: "enum", enumValues: ["scheduled", "in-progress", "done"] },
      ]),
    ],
    roles: [
      role("Admin", "Dealership admin", ["*"], ["*"], "all"),
      role("Manager", "Sales manager", ["*"], ["assign-leads"], "team"),
      role("Employee", "Sales/service", ["/vehicles", "/leads", "/service", "/dashboard"], ["update-lead", "service"], "own"),
      role("Customer", "Shopper", ["/vehicles", "/vehicles/[id]", "/service"], ["inquire", "book-service"], "own"),
    ],
    workflows: [
      { name: "Vehicle lead", trigger: "inquire", steps: ["create-lead", "contact", "test-drive", "close"], roles: ["employee"] },
    ],
    componentTypes: ["auth", "products", "search", "filters", "forms", "tables", "booking", "chat", "dashboards", "charts"],
    designSystem: baseTokens("#DC2626", "#7F1D1D", "#FBBF24", "#FEF2F2", "#1C1917", "#FFFFFF"),
    userFlows: ["Browse vehicles → inquire → test drive → purchase / book service"],
  },
  {
    id: "healthcare",
    label: "Healthcare App",
    description: "Patients, appointments, records, and clinic staff",
    industry: "Healthcare",
    architecture: "booking-calendar",
    defaultFeatures: ["auth", "patients", "appointments", "records", "roles", "notifications"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Dashboard", "/dashboard", "Clinic overview", ["kpi-cards", "chart"], ["Appointment", "Patient"], ["admin", "manager"], 1),
      screen("Patients", "/patients", "Patient directory", ["table", "search", "form", "user-profiles"], ["Patient"], ["admin", "manager", "employee"], 2),
      screen("Appointments", "/appointments", "Schedule", ["calendar", "table", "booking-form"], ["Appointment"], ["admin", "manager", "employee", "customer"], 3),
      screen("Records", "/records", "Medical records", ["table", "form"], ["Record"], ["admin", "employee"], 4),
      screen("Staff", "/staff", "Clinic staff", ["table", "roles-panel"], ["Staff"], ["admin"], 5),
    ],
    navigation: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Patients", href: "/patients", icon: "HeartPulse" },
      { label: "Appointments", href: "/appointments", icon: "Calendar" },
      { label: "Records", href: "/records", icon: "FileText" },
      { label: "Staff", href: "/staff", icon: "Users" },
    ],
    dataModels: [
      model("Patient", "Patient", [
        { name: "name", type: "string", required: true },
        { name: "dob", type: "date" },
        { name: "phone", type: "string" },
      ]),
      model("Appointment", "Appointment", [
        { name: "patientId", type: "relation", relationTo: "Patient" },
        { name: "startsAt", type: "date", required: true },
        { name: "status", type: "enum", enumValues: ["scheduled", "checked-in", "completed", "cancelled"] },
      ]),
      model("Record", "Record", [
        { name: "patientId", type: "relation", relationTo: "Patient" },
        { name: "notes", type: "string" },
        { name: "createdAt", type: "date" },
      ]),
    ],
    roles: [
      role("Admin", "Clinic admin", ["*"], ["*"], "all"),
      role("Manager", "Practice manager", ["/dashboard", "/patients", "/appointments", "/staff"], ["manage-schedule"], "all"),
      role("Employee", "Clinician/staff", ["/patients", "/appointments", "/records"], ["update-records", "check-in"], "own"),
      role("Customer", "Patient", ["/appointments"], ["book-appointment"], "own"),
    ],
    workflows: [
      { name: "Visit", trigger: "appointment", steps: ["book", "check-in", "consult", "record", "follow-up"], roles: ["employee", "customer"] },
    ],
    componentTypes: ["auth", "booking", "tables", "forms", "calendars", "user-profiles", "notifications", "dashboards", "search"],
    designSystem: baseTokens("#059669", "#064E3B", "#0284C7", "#ECFDF5", "#022C22", "#FFFFFF"),
    userFlows: ["Book appointment → check-in → consult → update records"],
  },
  {
    id: "finance",
    label: "Finance App",
    description: "Accounts, transactions, budgets, and reporting",
    industry: "Finance",
    architecture: "dashboard-sidebar",
    defaultFeatures: ["auth", "accounts", "transactions", "budgets", "reports", "roles"],
    screens: [
      screen("Login", "/login", "Auth", ["auth-form"], [], ["guest"], 0, "auth"),
      screen("Dashboard", "/dashboard", "Financial overview", ["kpi-cards", "chart"], ["Account", "Transaction"], ["admin", "manager"], 1),
      screen("Accounts", "/accounts", "Chart of accounts", ["table", "form"], ["Account"], ["admin", "manager"], 2),
      screen("Transactions", "/transactions", "Ledger", ["table", "filters", "form", "search"], ["Transaction"], ["admin", "manager", "employee"], 3),
      screen("Budgets", "/budgets", "Budget planning", ["table", "chart", "form"], ["Budget"], ["admin", "manager"], 4),
      screen("Reports", "/reports", "Financial reports", ["chart", "table", "export"], ["Report"], ["admin", "manager"], 5),
    ],
    navigation: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Accounts", href: "/accounts", icon: "Wallet" },
      { label: "Transactions", href: "/transactions", icon: "ArrowLeftRight" },
      { label: "Budgets", href: "/budgets", icon: "PiggyBank" },
      { label: "Reports", href: "/reports", icon: "BarChart3" },
    ],
    dataModels: [
      model("Account", "Account", [
        { name: "name", type: "string", required: true },
        { name: "type", type: "enum", enumValues: ["asset", "liability", "equity", "income", "expense"] },
        { name: "balance", type: "money" },
      ]),
      model("Transaction", "Transaction", [
        { name: "accountId", type: "relation", relationTo: "Account" },
        { name: "amount", type: "money", required: true },
        { name: "date", type: "date", required: true },
        { name: "memo", type: "string" },
      ]),
      model("Budget", "Budget", [
        { name: "name", type: "string", required: true },
        { name: "limit", type: "money" },
        { name: "spent", type: "money" },
      ]),
    ],
    roles: [
      role("Admin", "Finance admin", ["*"], ["*"], "all"),
      role("Manager", "Controller", ["*"], ["approve", "report"], "all"),
      role("Employee", "Bookkeeper", ["/transactions", "/accounts"], ["create-transaction"], "own"),
    ],
    workflows: [
      { name: "Expense entry", trigger: "expense", steps: ["create-transaction", "categorize", "approve", "report"], roles: ["employee", "manager"] },
    ],
    componentTypes: ["auth", "dashboards", "tables", "forms", "charts", "search", "filters", "notifications"],
    designSystem: baseTokens("#1E40AF", "#1E3A8A", "#10B981", "#EFF6FF", "#0F172A", "#FFFFFF"),
    userFlows: ["Record transaction → categorize → budget check → report"],
  },
];

export function getAppTemplate(id: string): AppTemplateDefinition | undefined {
  return APP_TEMPLATES.find((t) => t.id === id);
}

export function listAppTemplates(): AppTemplateDefinition[] {
  return APP_TEMPLATES;
}

export function matchTemplateFromSignals(params: {
  appType?: string;
  prompt?: string;
  industry?: string;
}): AppTemplateDefinition {
  const hay = `${params.appType || ""} ${params.prompt || ""} ${params.industry || ""}`.toLowerCase();
  const rules: Array<{ id: AppTemplateId; keys: string[] }> = [
    { id: "restaurant", keys: ["restaurant", "cafe", "menu", "kitchen", "food"] },
    { id: "ecommerce", keys: ["ecommerce", "e-commerce", "shop", "store", "cart", "checkout"] },
    { id: "booking", keys: ["booking", "appointment", "reservation", "calendar", "salon"] },
    { id: "crm", keys: ["crm", "pipeline", "deal", "contact", "sales"] },
    { id: "erp", keys: ["erp", "enterprise resource", "modules"] },
    { id: "inventory", keys: ["inventory", "warehouse", "stock", "sku"] },
    { id: "saas-dashboard", keys: ["saas", "subscription", "billing", "multi-tenant"] },
    { id: "education", keys: ["education", "lms", "course", "lesson", "school"] },
    { id: "real-estate", keys: ["real estate", "property", "listing", "realtor"] },
    { id: "automotive", keys: ["auto", "car", "vehicle", "dealership"] },
    { id: "healthcare", keys: ["health", "clinic", "patient", "medical", "hospital"] },
    { id: "finance", keys: ["finance", "accounting", "ledger", "budget", "invoice"] },
  ];

  for (const rule of rules) {
    if (rule.keys.some((k) => hay.includes(k))) {
      return getAppTemplate(rule.id) ?? APP_TEMPLATES[0]!;
    }
  }

  const typeMap: Record<string, AppTemplateId> = {
    crm: "crm",
    erp: "erp",
    dashboard: "saas-dashboard",
    saas: "saas-dashboard",
    booking: "booking",
    pos: "restaurant",
    lms: "education",
    hr: "erp",
    inventory: "inventory",
    "ecommerce-admin": "ecommerce",
  };
  const mapped = params.appType ? typeMap[params.appType] : undefined;
  if (mapped) return getAppTemplate(mapped) ?? APP_TEMPLATES[0]!;
  return getAppTemplate("saas-dashboard") ?? APP_TEMPLATES[0]!;
}
