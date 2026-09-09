/**
 * Serializable preview manifest derived from StructuredAppModel.
 * Consumed by the in-iframe interactive runtime (no backend).
 */

import type {
  AppDataField,
  AppDataModel,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import {
  localizeAppTemplateLabel,
  localizeAppTemplateRole,
  resolveLocaleForAppModel,
} from "@/lib/ai/webapp-i18n/localize-template";
import {
  translateWebAppEntity,
  translateWebAppMessage,
  type ResolvedWebAppLocale,
} from "@/lib/ai/webapp-i18n/resolve-locale";
import type { WebAppI18nKey } from "@/lib/ai/webapp-i18n/keys";

export const APP_PREVIEW_RUNTIME_VERSION = "interactive-v7";

export type PreviewField = {
  name: string;
  type: AppDataField["type"];
  required: boolean;
  enumValues?: string[];
  label: string;
};

export type PreviewEntity = {
  name: string;
  label: string;
  fields: PreviewField[];
  crud: Array<"create" | "read" | "update" | "delete" | "list">;
  seed: Record<string, unknown>[];
};

export type PreviewScreen = {
  id: string;
  name: string;
  path: string;
  layout: string;
  title: string;
  purpose: string;
  dataBindings: string[];
  roles: string[];
  componentTypes: string[];
  isAuth: boolean;
  isDashboard: boolean;
};

export type PreviewNavItem = {
  label: string;
  href: string;
  roles?: string[];
};

export type PreviewManifest = {
  runtime: typeof APP_PREVIEW_RUNTIME_VERSION;
  appName: string;
  language: string;
  htmlLang: string;
  dir: "ltr" | "rtl";
  initialPath: string;
  loginPath: string | null;
  dashboardPath: string;
  homePath: string;
  brand: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    surface: string;
    radius: string;
    headingFont: string;
    bodyFont: string;
  };
  screens: PreviewScreen[];
  navigation: PreviewNavItem[];
  entities: PreviewEntity[];
  roles: Array<{ id: string; name: string; label: string; screens: string[] }>;
  catalog: Array<{
    id: string;
    title: string;
    description?: string;
    price?: string;
    category?: string;
    status?: string;
  }>;
  i18n: Record<string, string>;
};

const I18N_KEYS: WebAppI18nKey[] = [
  "common.continue",
  "common.create",
  "common.delete",
  "common.refresh",
  "common.loading",
  "common.saving",
  "common.actions",
  "common.name",
  "common.notes",
  "common.email",
  "common.password",
  "common.records",
  "common.emptyValue",
  "auth.signIn",
  "auth.signInSubtitle",
  "auth.signingIn",
  "auth.invalidCredentials",
  "auth.unableSignIn",
  "auth.noAccount",
  "auth.createOne",
  "auth.createAccount",
  "auth.createAccountSubtitle",
  "auth.creating",
  "auth.alreadyRegistered",
  "auth.accountExists",
  "auth.unableCreateAccount",
  "auth.invalidSignup",
  "nav.overview",
  "nav.dashboard",
  "dashboard.overviewSubtitle",
  "dashboard.emptyHint",
  "home.getStarted",
  "home.openDashboard",
  "crud.recordsTitle",
  "crud.recordsSubtitle",
  "crud.newRecord",
  "crud.unableLoad",
  "crud.unableCreate",
  "crud.unableDelete",
  "crud.empty",
  "role.admin",
  "role.manager",
  "role.employee",
  "role.user",
];

function normalizePath(path: string): string {
  const trimmed = (path || "/").trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function isAuthScreen(screen: { path: string; name: string; layout: string }): boolean {
  const path = normalizePath(screen.path).toLowerCase();
  const name = screen.name.toLowerCase();
  return (
    screen.layout === "auth" ||
    path === "/login" ||
    path === "/signin" ||
    name === "login" ||
    name === "sign in"
  );
}

function isDashboardScreen(screen: { path: string; name: string }): boolean {
  const path = normalizePath(screen.path).toLowerCase();
  const name = screen.name.toLowerCase();
  return (
    path === "/dashboard" ||
    path === "/" ||
    name === "dashboard" ||
    name === "overview" ||
    name === "home"
  );
}

function fieldLabel(locale: ResolvedWebAppLocale, name: string): string {
  const known: Record<string, WebAppI18nKey> = {
    name: "common.name",
    email: "common.email",
    password: "common.password",
    notes: "common.notes",
  };
  const key = known[name.toLowerCase()];
  if (key) return translateWebAppMessage(locale, key);
  return localizeAppTemplateLabel(locale, name);
}

function seedValueForField(field: AppDataField, index: number): unknown {
  switch (field.type) {
    case "number":
    case "money":
      return (index + 1) * 25;
    case "boolean":
      return index % 2 === 0;
    case "date":
      return new Date(Date.UTC(2026, 0, (index % 27) + 1)).toISOString().slice(0, 10);
    case "enum":
      return field.enumValues?.[index % (field.enumValues.length || 1)] ?? "open";
    case "relation":
      return `rel-${(index % 3) + 1}`;
    case "json":
      return { note: `item-${index + 1}` };
    case "image":
      return "";
    default:
      return `${field.name} ${index + 1}`;
  }
}

function seedCrmPack(
  model: AppDataModel,
): Record<string, unknown>[] | null {
  const key = model.name.trim().toLowerCase();
  if (key === "company") {
    return [
      { id: "company-1", name: "Northwind Labs", industry: "SaaS", website: "https://northwind.example", size: "51-200" },
      { id: "company-2", name: "Cedar Retail", industry: "Retail", website: "https://cedar.example", size: "11-50" },
      { id: "company-3", name: "Atlas Clinics", industry: "Healthcare", website: "https://atlas.example", size: "201-500" },
    ];
  }
  if (key === "contact") {
    return [
      { id: "contact-1", name: "Sara Alami", email: "sara@northwind.example", phone: "+1-555-0101", companyId: "company-1" },
      { id: "contact-2", name: "Omar Haddad", email: "omar@cedar.example", phone: "+1-555-0102", companyId: "company-2" },
      { id: "contact-3", name: "Lina Faris", email: "lina@atlas.example", phone: "+1-555-0103", companyId: "company-3" },
    ];
  }
  if (key === "deal") {
    return [
      { id: "deal-1", title: "Enterprise seats", value: 48000, stage: "qualified", contactId: "contact-1" },
      { id: "deal-2", title: "POS rollout", value: 22000, stage: "proposal", contactId: "contact-2" },
      { id: "deal-3", title: "Clinic CRM", value: 61000, stage: "lead", contactId: "contact-3" },
      { id: "deal-4", title: "Renewal — Northwind", value: 18000, stage: "won", contactId: "contact-1" },
      { id: "deal-5", title: "Seasonal campaign", value: 9500, stage: "lost", contactId: "contact-2" },
      { id: "deal-6", title: "Support expansion", value: 12000, stage: "qualified", contactId: "contact-3" },
    ];
  }
  if (key === "activity") {
    return [
      { id: "activity-1", type: "call", subject: "Discovery with Sara", dueAt: "2026-04-02", done: false },
      { id: "activity-2", type: "meeting", subject: "Proposal walkthrough", dueAt: "2026-04-05", done: false },
      { id: "activity-3", type: "email", subject: "Send case study", dueAt: "2026-04-01", done: true },
      { id: "activity-4", type: "task", subject: "Prepare pricing sheet", dueAt: "2026-04-08", done: false },
    ];
  }
  return null;
}

function seedVerticalPack(
  templateId: string | undefined,
  model: AppDataModel,
): Record<string, unknown>[] | null {
  const tid = (templateId || "").toLowerCase();
  const key = model.name.trim().toLowerCase();

  if (tid === "crm") return seedCrmPack(model);

  if (tid === "booking") {
    if (key === "service") {
      return [
        { id: "service-1", name: "Haircut", durationMin: 45, price: 40, description: "Classic cut", active: true },
        { id: "service-2", name: "Consultation", durationMin: 30, price: 25, description: "Intro call", active: true },
      ];
    }
    if (key === "customer") {
      return [
        { id: "customer-1", name: "Maya Nasser", email: "maya@example.com", phone: "+1-555-0201", notes: "Prefers mornings", preferredLanguage: "en" },
        { id: "customer-2", name: "Karim Saleh", email: "karim@example.com", phone: "+1-555-0202", notes: "", preferredLanguage: "ar" },
      ];
    }
    if (key === "booking") {
      return [
        { id: "booking-1", serviceId: "service-1", customerId: "customer-1", startsAt: "2026-04-10T09:00:00.000Z", status: "confirmed", notes: "Front desk" },
        { id: "booking-2", serviceId: "service-2", customerId: "customer-2", startsAt: "2026-04-10T11:30:00.000Z", status: "pending", notes: "" },
        { id: "booking-3", serviceId: "service-1", customerId: "customer-2", startsAt: "2026-04-11T15:00:00.000Z", status: "completed", notes: "Follow-up" },
      ];
    }
    if (key === "availability") {
      return [
        { id: "availability-1", weekday: 1, startTime: "09:00", endTime: "17:00", capacity: 4, staffName: "Alex" },
        { id: "availability-2", weekday: 3, startTime: "10:00", endTime: "18:00", capacity: 3, staffName: "Sam" },
      ];
    }
  }

  if (tid === "ecommerce") {
    if (key === "product") {
      return [
        { id: "product-1", title: "Studio Desk Lamp", description: "Adjustable LED lamp", price: 79, stock: 42, imageUrl: "", category: "Home" },
        { id: "product-2", title: "Canvas Tote", description: "Everyday tote", price: 28, stock: 120, imageUrl: "", category: "Accessories" },
        { id: "product-3", title: "Noise-cancel buds", description: "Wireless earbuds", price: 149, stock: 18, imageUrl: "", category: "Audio" },
      ];
    }
    if (key === "order") {
      return [
        { id: "order-1", customerEmail: "buyer@example.com", status: "paid", total: 107, shippingAddress: "12 Market St", placedAt: "2026-04-01" },
        { id: "order-2", customerEmail: "ops@example.com", status: "shipped", total: 149, shippingAddress: "88 Harbor Rd", placedAt: "2026-04-02" },
        { id: "order-3", customerEmail: "vip@example.com", status: "pending", total: 28, shippingAddress: "5 Grove Ave", placedAt: "2026-04-03" },
        { id: "order-4", customerEmail: "buyer@example.com", status: "delivered", total: 79, shippingAddress: "12 Market St", placedAt: "2026-03-28" },
      ];
    }
    if (key === "review") {
      return [
        { id: "review-1", productId: "product-1", rating: 5, comment: "Bright and sturdy", authorName: "Leila", published: true },
        { id: "review-2", productId: "product-3", rating: 4, comment: "Great battery", authorName: "Noah", published: true },
      ];
    }
    if (key === "cartitem") {
      return [
        { id: "cartitem-1", productId: "product-1", quantity: 1, unitPrice: 79, notes: "", addedAt: "2026-04-03" },
        { id: "cartitem-2", productId: "product-2", quantity: 2, unitPrice: 28, notes: "Gift wrap", addedAt: "2026-04-03" },
      ];
    }
  }

  if (tid === "healthcare") {
    if (key === "patient") {
      return [
        { id: "patient-1", name: "Hana Youssef", email: "hana@example.com", dob: "1992-05-12", phone: "+1-555-0301", bloodType: "O+" },
        { id: "patient-2", name: "Rami Khouri", email: "rami@example.com", dob: "1986-11-03", phone: "+1-555-0302", bloodType: "A-" },
      ];
    }
    if (key === "appointment") {
      return [
        { id: "appointment-1", patientId: "patient-1", startsAt: "2026-04-10T08:30:00.000Z", reason: "Annual checkup", status: "scheduled", providerName: "Dr. Adams" },
        { id: "appointment-2", patientId: "patient-2", startsAt: "2026-04-10T09:15:00.000Z", reason: "Follow-up", status: "checked-in", providerName: "Dr. Adams" },
        { id: "appointment-3", patientId: "patient-1", startsAt: "2026-04-09T14:00:00.000Z", reason: "Labs review", status: "completed", providerName: "Dr. Chen" },
      ];
    }
    if (key === "record") {
      return [
        { id: "record-1", patientId: "patient-1", title: "Intake notes", notes: "No known allergies", createdAt: "2026-04-01", confidential: true },
        { id: "record-2", patientId: "patient-2", title: "Vitals", notes: "BP normal", createdAt: "2026-04-09", confidential: true },
      ];
    }
  }

  if (tid === "finance") {
    if (key === "ledgeraccount" || key === "account") {
      return [
        { id: "account-1", name: "Operating Cash", code: "1000", type: "asset", balance: 42000, currency: "USD" },
        { id: "account-2", name: "Accounts Receivable", code: "1100", type: "asset", balance: 12500, currency: "USD" },
        { id: "account-3", name: "Software Expense", code: "5100", type: "expense", balance: 3200, currency: "USD" },
      ];
    }
    if (key === "transaction") {
      return [
        { id: "transaction-1", accountId: "account-1", amount: 2500, date: "2026-04-01", memo: "Client payment", reference: "INV-204" },
        { id: "transaction-2", accountId: "account-3", amount: -480, date: "2026-04-02", memo: "SaaS tools", reference: "EXP-88" },
        { id: "transaction-3", accountId: "account-2", amount: 1800, date: "2026-04-03", memo: "Milestone invoice", reference: "INV-205" },
      ];
    }
    if (key === "budget") {
      return [
        { id: "budget-1", name: "Q2 Marketing", category: "Growth", limit: 8000, spent: 2450, period: "2026-Q2" },
        { id: "budget-2", name: "Ops", category: "Operations", limit: 12000, spent: 6100, period: "2026-Q2" },
      ];
    }
    if (key === "report") {
      return [
        { id: "report-1", name: "P&L April", period: "2026-04", status: "ready", summary: "Healthy cash position", generatedAt: "2026-04-05" },
      ];
    }
  }

  return null;
}

function seedEntity(
  model: AppDataModel,
  catalog: StructuredAppModel["catalog"],
  count = 8,
  templateId?: string,
): Record<string, unknown>[] {
  const pack = seedVerticalPack(templateId, model);
  if (pack) return pack;
  const rows: Record<string, unknown>[] = [];
  const relatedCatalog = catalog.filter((item) =>
    item.title.toLowerCase().includes(model.name.toLowerCase().slice(0, 4)),
  );

  for (let i = 0; i < count; i += 1) {
    const row: Record<string, unknown> = {
      id: `${model.name.toLowerCase()}-${i + 1}`,
    };
    const catalogItem = relatedCatalog[i] ?? catalog[i];
    for (const field of model.fields) {
      if (field.name === "id") continue;
      if (catalogItem && (field.name === "name" || field.name === "title")) {
        row[field.name] = catalogItem.title;
        continue;
      }
      if (catalogItem && field.name === "description" && catalogItem.description) {
        row[field.name] = catalogItem.description;
        continue;
      }
      if (catalogItem && field.name === "price" && catalogItem.price) {
        row[field.name] = catalogItem.price;
        continue;
      }
      if (catalogItem && field.name === "status" && catalogItem.status) {
        row[field.name] = catalogItem.status;
        continue;
      }
      if (field.defaultValue !== undefined && field.defaultValue !== null && i === 0) {
        row[field.name] = field.defaultValue;
        continue;
      }
      row[field.name] = seedValueForField(field, i);
    }
    rows.push(row);
  }
  return rows;
}

function pickDashboardPath(screens: PreviewScreen[], loginPath: string | null): string {
  const dash = screens.find((s) => s.isDashboard && !s.isAuth);
  if (dash) return dash.path;
  const firstApp = screens.find((s) => !s.isAuth);
  if (firstApp) return firstApp.path;
  return loginPath ?? screens[0]?.path ?? "/";
}

function pickLoginPath(screens: PreviewScreen[]): string | null {
  return screens.find((s) => s.isAuth)?.path ?? null;
}

function buildI18nBundle(locale: ResolvedWebAppLocale): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of I18N_KEYS) {
    out[key] = translateWebAppMessage(locale, key);
  }
  // Preview-only chrome strings (English keys, localized values when AR pack exists)
  out["preview.search"] =
    locale.language === "Arabic" ? "بحث" : "Search";
  out["preview.filter"] =
    locale.language === "Arabic" ? "تصفية" : "Filter";
  out["preview.all"] = locale.language === "Arabic" ? "الكل" : "All";
  out["preview.edit"] = locale.language === "Arabic" ? "تعديل" : "Edit";
  out["preview.save"] = locale.language === "Arabic" ? "حفظ" : "Save";
  out["preview.cancel"] = locale.language === "Arabic" ? "إلغاء" : "Cancel";
  out["preview.prev"] = locale.language === "Arabic" ? "السابق" : "Previous";
  out["preview.next"] = locale.language === "Arabic" ? "التالي" : "Next";
  out["preview.page"] = locale.language === "Arabic" ? "صفحة" : "Page";
  out["preview.logout"] = locale.language === "Arabic" ? "تسجيل الخروج" : "Sign out";
  out["preview.role"] = locale.language === "Arabic" ? "الدور" : "Role";
  out["preview.session"] =
    locale.language === "Arabic" ? "جلسة معاينة" : "Preview session";
  out["preview.required"] =
    locale.language === "Arabic" ? "هذا الحقل مطلوب." : "This field is required.";
  out["preview.saved"] =
    locale.language === "Arabic" ? "تم الحفظ بنجاح." : "Saved successfully.";
  out["preview.deleted"] =
    locale.language === "Arabic" ? "تم الحذف." : "Deleted.";
  out["preview.loginOk"] =
    locale.language === "Arabic"
      ? "تم تسجيل الدخول."
      : "Signed in.";
  out["preview.demoHint"] =
    locale.language === "Arabic"
      ? "معاينة تفاعلية — أي بريد وكلمة مرور (8+)، أو أنشئ حساباً. يُحفظ في هذه الجلسة فقط."
      : "Interactive preview — any email and password (8+), or create an account. Stored in this session only.";
  out["preview.zipHonesty"] =
    locale.language === "Arabic"
      ? "هذه معاينة داخل المنصة — التطبيق الإنتاجي الكامل يُصدَّر كـ ZIP وتستضيفه بنفسك."
      : "In-platform interactive preview — the full production app is exported as a ZIP for self-hosting.";
  out["preview.pipeline"] =
    locale.language === "Arabic" ? "لوحة الصفقات" : "Pipeline board";
  out["preview.resetDemo"] =
    locale.language === "Arabic" ? "إعادة ضبط بيانات العرض" : "Reset demo data";
  out["preview.signupOk"] =
    locale.language === "Arabic"
      ? "تم إنشاء الحساب."
      : "Account created.";
  out["preview.noAccess"] =
    locale.language === "Arabic"
      ? "لا تملك صلاحية لهذه الصفحة."
      : "You do not have access to this page.";
  out["preview.open"] = locale.language === "Arabic" ? "فتح" : "Open";
  out["preview.emptyTitle"] =
    locale.language === "Arabic" ? "لا توجد بيانات بعد" : "Nothing here yet";
  out["preview.addFirst"] =
    locale.language === "Arabic" ? "أضف أول سجل" : "Add first record";
  return out;
}

/** Build the interactive preview manifest from a structured app model. */
export function buildAppPreviewManifest(
  model: StructuredAppModel,
  options?: { activeScreenPath?: string | null },
): PreviewManifest {
  const locale = resolveLocaleForAppModel(model.settings.language);
  const screens: PreviewScreen[] = [...model.screens]
    .sort((a, b) => a.order - b.order)
    .map((screen) => {
      const path = normalizePath(screen.path);
      const auth = isAuthScreen(screen);
      const dashboard = isDashboardScreen(screen);
      return {
        id: screen.id,
        name: screen.name,
        path,
        layout: screen.layout,
        title: localizeAppTemplateLabel(locale, screen.name),
        purpose:
          dashboard && !auth
            ? translateWebAppMessage(locale, "dashboard.overviewSubtitle")
            : "",
        dataBindings: screen.dataBindings,
        roles: screen.roles,
        componentTypes: screen.components,
        isAuth: auth,
        isDashboard: dashboard,
      };
    });

  const loginPath = pickLoginPath(screens);
  const dashboardPath = pickDashboardPath(screens, loginPath);
  const homePath = loginPath ?? dashboardPath;

  const navigation: PreviewNavItem[] = model.navigation.map((item) => ({
    label: localizeAppTemplateLabel(locale, item.label),
    href: normalizePath(item.href),
    roles: item.roles,
  }));

  // Staff assignment is scaffolded for authenticated apps — surface it in preview chrome.
  const hasStaffRole = model.roles.some((role) =>
    ["admin", "manager", "employee"].includes(role.name.toLowerCase()),
  );
  if (
    hasStaffRole &&
    !navigation.some((item) => item.href.includes("/admin/staff") || item.href === "/staff")
  ) {
    navigation.push({
      label: translateWebAppMessage(locale, "admin.staff.nav"),
      href: "/dashboard/admin/staff",
      roles: ["admin", "manager", "employee"],
    });
  }

  const entities: PreviewEntity[] = model.dataModels.map((dm) => ({
    name: dm.name,
    label: translateWebAppEntity(locale, dm.name),
    fields: dm.fields
      .filter((f) => f.name !== "id")
      .map((f) => ({
        name: f.name,
        type: f.type,
        required: Boolean(f.required),
        enumValues: f.enumValues,
        label: fieldLabel(locale, f.name),
      })),
    crud: dm.crud.length
      ? dm.crud
      : (["create", "read", "update", "delete", "list"] as PreviewEntity["crud"]),
    seed: seedEntity(dm, model.catalog, 8, model.templateId),
  }));

  if (hasStaffRole && !entities.some((entity) => entity.name === "Staff")) {
    entities.push({
      name: "Staff",
      label: translateWebAppEntity(locale, "Staff"),
      fields: [
        { name: "name", type: "string", required: true, label: fieldLabel(locale, "name") },
        { name: "email", type: "string", required: true, label: fieldLabel(locale, "email") },
        {
          name: "role",
          type: "enum",
          required: true,
          enumValues: ["admin", "manager", "employee", "user"],
          label: fieldLabel(locale, "role"),
        },
        {
          name: "active",
          type: "boolean",
          required: false,
          label: fieldLabel(locale, "active"),
        },
      ],
      crud: ["create", "read", "update", "delete", "list"],
      seed: [
        {
          id: "staff-1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          active: true,
        },
        {
          id: "staff-2",
          name: "Team Member",
          email: "member@example.com",
          role: "employee",
          active: true,
        },
      ],
    });
  }

  if (
    hasStaffRole &&
    !screens.some(
      (screen) =>
        screen.path.includes("/admin/staff") || screen.path === "/staff",
    )
  ) {
    screens.push({
      id: "preview-staff",
      name: "Staff",
      path: "/dashboard/admin/staff",
      layout: "sidebar",
      title: translateWebAppMessage(locale, "admin.staff.title"),
      purpose: translateWebAppMessage(locale, "admin.staff.subtitle"),
      dataBindings: ["Staff"],
      roles: ["admin", "manager", "employee"],
      componentTypes: ["table", "form", "roles-panel"],
      isAuth: false,
      isDashboard: false,
    });
  }

  const roles = model.roles.map((role) => ({
    id: role.id,
    name: role.name,
    label: localizeAppTemplateRole(locale, role.name),
    screens: role.permissions.screens ?? [],
  }));

  const initialRaw = options?.activeScreenPath
    ? normalizePath(options.activeScreenPath)
    : homePath;
  const initialPath = screens.some((s) => s.path === initialRaw)
    ? initialRaw
    : homePath;

  return {
    runtime: APP_PREVIEW_RUNTIME_VERSION,
    appName: model.settings.appName || model.brand.businessName || "App",
    language: locale.language,
    htmlLang: locale.htmlLang,
    dir: locale.dir,
    initialPath,
    loginPath,
    dashboardPath,
    homePath,
    brand: {
      primary: model.brand.tokens.primary,
      secondary: model.brand.tokens.secondary,
      accent: model.brand.tokens.accent,
      background: model.brand.tokens.background,
      foreground: model.brand.tokens.foreground,
      surface: model.brand.tokens.surface,
      radius: model.brand.tokens.radius,
      headingFont: model.brand.tokens.headingFont,
      bodyFont: model.brand.tokens.bodyFont,
    },
    screens,
    navigation,
    entities,
    roles,
    catalog: model.catalog.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      status: item.status,
    })),
    i18n: buildI18nBundle(locale),
  };
}

export function normalizePreviewPath(path: string): string {
  return normalizePath(path);
}
