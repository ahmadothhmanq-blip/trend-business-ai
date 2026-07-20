/**
 * Build / mutate StructuredAppModel from templates and user settings.
 */

import { getAppTemplate } from "@/lib/ai-core/app-design-platform/templates";
import { listComponentsForTemplate } from "@/lib/ai-core/app-design-platform/components";
import type {
  AppCatalogItem,
  AppDesignTokens,
  AppTemplateId,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import { slugId } from "@/lib/ai-core/app-design-platform/ids";

const COLOR_STYLE_MAP: Record<string, Partial<AppDesignTokens>> = {
  "Dark Minimal": {
    background: "#0B1220",
    foreground: "#F8FAFC",
    surface: "#111827",
    primary: "#38BDF8",
    secondary: "#1E293B",
    accent: "#A78BFA",
  },
  "Light Professional": {
    background: "#F8FAFC",
    foreground: "#0F172A",
    surface: "#FFFFFF",
    primary: "#2563EB",
    secondary: "#1E293B",
    accent: "#0EA5E9",
  },
  "Black & Gold (Premium)": {
    background: "#0A0A0A",
    foreground: "#FAFAF9",
    surface: "#171717",
    primary: "#D4AF37",
    secondary: "#292524",
    accent: "#F5D76E",
  },
  "Bold Contrast": {
    background: "#FFFFFF",
    foreground: "#111827",
    surface: "#F3F4F6",
    primary: "#EF4444",
    secondary: "#111827",
    accent: "#F59E0B",
  },
  "Soft Neutral": {
    background: "#FAFAF9",
    foreground: "#1C1917",
    surface: "#FFFFFF",
    primary: "#78716C",
    secondary: "#44403C",
    accent: "#0D9488",
  },
  "Ocean Blue": {
    background: "#F0F9FF",
    foreground: "#0C4A6E",
    surface: "#FFFFFF",
    primary: "#0284C7",
    secondary: "#075985",
    accent: "#06B6D4",
  },
};

export function buildStructuredAppModel(params: {
  templateId: AppTemplateId | string;
  prompt: string;
  language: string;
  designStyle?: string;
  colorStyle?: string;
  features?: string[];
  appName: string;
  existing?: StructuredAppModel | null;
}): StructuredAppModel {
  const template = getAppTemplate(params.templateId) ?? getAppTemplate("saas-dashboard")!;
  const now = new Date().toISOString();
  const colorOverrides = params.colorStyle
    ? COLOR_STYLE_MAP[params.colorStyle] || {}
    : {};

  const screens = template.screens.map((s, i) => ({
    ...s,
    id: slugId("screen", s.path || s.name, i),
  }));

  const navigation = template.navigation.map((n, i) => ({
    ...n,
    id: slugId("nav", n.href || n.label, i),
  }));

  const dataModels = template.dataModels.map((m, i) => ({
    ...m,
    id: slugId("model", m.name, i),
  }));

  const roles = template.roles.map((r, i) => ({
    ...r,
    id: slugId("role", r.name, i),
  }));

  const workflows = template.workflows.map((w, i) => ({
    ...w,
    id: slugId("flow", w.name, i),
  }));

  const library = listComponentsForTemplate(template.id);
  const components = screens.flatMap((screen) =>
    screen.components.map((type, idx) => ({
      id: slugId("comp", `${screen.id}-${type}`, idx),
      type,
      screenId: screen.id,
      props: { ...(library.find((c) => c.id === type)?.defaultProps || {}) },
      children: [] as string[],
    })),
  );

  const catalog: AppCatalogItem[] = params.existing?.catalog ?? seedCatalog(template.id);

  return {
    version: (params.existing?.version ?? 0) + 1,
    templateId: template.id,
    architecture: template.architecture,
    industry: template.industry,
    appType: template.id,
    settings: {
      appName: params.appName,
      tagline: params.prompt.slice(0, 120),
      language: params.language,
      currency: "USD",
      features: params.features || template.defaultFeatures,
      darkModeDefault: (params.colorStyle || "").toLowerCase().includes("dark"),
    },
    brand: {
      businessName: params.appName,
      logoUrl: params.existing?.brand.logoUrl ?? null,
      brandIdentityId: params.existing?.brand.brandIdentityId ?? null,
      tokens: {
        ...template.designSystem,
        ...colorOverrides,
      },
    },
    screens,
    navigation,
    components,
    dataModels,
    roles,
    workflows,
    catalog,
    featureFlags: params.features || template.defaultFeatures,
    createdAt: params.existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function seedCatalog(templateId: string): AppCatalogItem[] {
  const now = new Date().toISOString();
  const seeds: Record<string, AppCatalogItem[]> = {
    restaurant: [
      {
        id: slugId("item", "margherita", 0),
        type: "menu-item",
        title: "Margherita Pizza",
        description: "Tomato, mozzarella, basil",
        price: "$12",
        category: "Mains",
        status: "published",
        updatedAt: now,
      },
      {
        id: slugId("item", "caesar", 1),
        type: "menu-item",
        title: "Caesar Salad",
        price: "$9",
        category: "Starters",
        status: "published",
        updatedAt: now,
      },
    ],
    ecommerce: [
      {
        id: slugId("item", "product-1", 0),
        type: "product",
        title: "Starter Product",
        price: "$49",
        category: "General",
        status: "published",
        updatedAt: now,
      },
    ],
    booking: [
      {
        id: slugId("item", "service-1", 0),
        type: "service",
        title: "Standard Appointment",
        price: "$60",
        category: "Services",
        status: "published",
        updatedAt: now,
      },
    ],
  };
  return seeds[templateId] ?? [];
}

export function updateAppSettings(
  model: StructuredAppModel,
  patch: Partial<StructuredAppModel["settings"]> & { logoUrl?: string | null },
): StructuredAppModel {
  const { logoUrl, ...settingsPatch } = patch;
  return {
    ...model,
    settings: { ...model.settings, ...settingsPatch },
    brand: {
      ...model.brand,
      businessName: settingsPatch.appName || model.brand.businessName,
      ...(logoUrl !== undefined ? { logoUrl } : {}),
    },
    updatedAt: new Date().toISOString(),
  };
}

export function upsertCatalogItem(
  model: StructuredAppModel,
  item: Omit<AppCatalogItem, "id" | "updatedAt"> & { id?: string },
): StructuredAppModel {
  const now = new Date().toISOString();
  const id = item.id || slugId("item", item.title, model.catalog.length);
  const next: AppCatalogItem = {
    id,
    type: item.type,
    title: item.title,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.imageUrl,
    status: item.status || "published",
    meta: item.meta,
    updatedAt: now,
  };
  const exists = model.catalog.findIndex((c) => c.id === id);
  const catalog =
    exists >= 0
      ? model.catalog.map((c, i) => (i === exists ? next : c))
      : [...model.catalog, next];
  return { ...model, catalog, updatedAt: now, version: model.version + 1 };
}

export function deleteCatalogItem(
  model: StructuredAppModel,
  itemId: string,
): StructuredAppModel {
  return {
    ...model,
    catalog: model.catalog.filter((c) => c.id !== itemId),
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

export function removeScreen(
  model: StructuredAppModel,
  screenId: string,
): StructuredAppModel {
  return {
    ...model,
    screens: model.screens.filter((s) => s.id !== screenId),
    components: model.components.filter((c) => c.screenId !== screenId),
    navigation: model.navigation.filter((n) => {
      const screen = model.screens.find((s) => s.id === screenId);
      return !screen || n.href !== screen.path;
    }),
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

export function addScreen(
  model: StructuredAppModel,
  screen: { name: string; path: string; purpose?: string; roles?: string[] },
): StructuredAppModel {
  const id = slugId("screen", screen.path || screen.name, model.screens.length);
  return {
    ...model,
    screens: [
      ...model.screens,
      {
        id,
        name: screen.name,
        path: screen.path,
        purpose: screen.purpose || screen.name,
        layout: "sidebar",
        components: ["table", "form"],
        dataBindings: [],
        roles: screen.roles || ["admin"],
        order: model.screens.length + 1,
      },
    ],
    navigation: [
      ...model.navigation,
      {
        id: slugId("nav", screen.path, model.navigation.length),
        label: screen.name,
        href: screen.path,
        icon: "Square",
      },
    ],
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}
