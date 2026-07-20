/**
 * Natural-language AI App Assistant — mutates structured app model safely.
 */

import type {
  AppAssistantResult,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import {
  addScreen,
  deleteCatalogItem,
  removeScreen,
  updateAppSettings,
  upsertCatalogItem,
} from "@/lib/ai-core/app-design-platform/model-builder";
import { applyBrandKitToModel } from "@/lib/ai-core/app-design-platform/brand";
import { upsertRole } from "@/lib/ai-core/app-design-platform/roles";

export function runAppAssistant(params: {
  message: string;
  model: StructuredAppModel;
}): AppAssistantResult {
  const message = params.message.trim();
  let model = params.model;
  const actions: string[] = [];
  const notes: string[] = [];
  let applied = false;
  let command: string | undefined;

  // Change colors
  const colorMatch = message.match(
    /(?:change|set|update)\s+(?:app\s+|application\s+)?(?:colors?|theme|primary)\s+(?:to\s+)?(#?[0-9a-fA-F]{3,8}|\w+)/i,
  );
  if (colorMatch) {
    const color = colorMatch[1]!.startsWith("#")
      ? colorMatch[1]!
      : colorNameToHex(colorMatch[1]!);
    model = applyBrandKitToModel(model, {
      name: model.brand.businessName,
      primary: color,
      accent: color,
    });
    actions.push(`Updated primary/accent color → ${color}`);
    applied = true;
  }

  // Add product / menu item
  const addProduct = message.match(
    /add\s+(?:a\s+)?(?:new\s+)?(product|menu item|service|course|property|vehicle)\s*(?:called|named|:)?\s*["']?([^"'$\n]+?)["']?(?:\s+at\s+(\$?[\d,.]+))?/i,
  );
  if (addProduct) {
    const kind = addProduct[1]!.toLowerCase();
    const title = (addProduct[2] || "New item").trim();
    const price = addProduct[3];
    const typeMap: Record<string, StructuredAppModel["catalog"][0]["type"]> = {
      product: "product",
      "menu item": "menu-item",
      service: "service",
      course: "course",
      property: "property",
      vehicle: "vehicle",
    };
    model = upsertCatalogItem(model, {
      type: typeMap[kind] || "custom",
      title,
      price: price ? (price.startsWith("$") ? price : `$${price}`) : undefined,
      status: "published",
    });
    actions.push(`Added ${kind}: ${title}`);
    applied = true;
  }

  // Change price
  const priceMatch = message.match(
    /(?:change|update|set)\s+(?:the\s+)?(?:price\s+(?:of|for)\s+)?(.+?)\s+(?:price\s+)?(?:to|=)\s*(\$?[\d,.]+)/i,
  );
  if (priceMatch && !applied) {
    const hint = priceMatch[1]!.trim();
    const price = priceMatch[2]!.startsWith("$")
      ? priceMatch[2]!
      : `$${priceMatch[2]}`;
    const item = model.catalog.find((c) =>
      c.title.toLowerCase().includes(hint.toLowerCase()),
    );
    if (item) {
      model = upsertCatalogItem(model, { ...item, price });
      actions.push(`Updated price for “${item.title}” → ${price}`);
      applied = true;
    } else {
      notes.push(`Could not find catalog item matching “${hint}”.`);
    }
  }

  // Remove screen
  const removeScreenMatch = message.match(
    /(?:remove|delete)\s+(?:the\s+)?(?:screen|page)\s+["']?([^"'\n]+)["']?/i,
  );
  if (removeScreenMatch) {
    const hint = removeScreenMatch[1]!.trim().toLowerCase();
    const screen = model.screens.find(
      (s) =>
        s.name.toLowerCase().includes(hint) ||
        s.path.toLowerCase().includes(hint),
    );
    if (screen) {
      model = removeScreen(model, screen.id);
      actions.push(`Removed screen “${screen.name}”`);
      applied = true;
    } else {
      notes.push(`Screen “${hint}” not found.`);
    }
  }

  // Add screen / dashboard
  const addScreenMatch = message.match(
    /(?:add|create)\s+(?:a\s+)?(?:new\s+)?(?:screen|page|dashboard)\s*(?:called|named|:)?\s*["']?([^"'\n]+)?/i,
  );
  if (addScreenMatch && !/booking feature/i.test(message)) {
    const name = (addScreenMatch[1] || "New Screen").trim();
    const path = `/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    model = addScreen(model, { name, path, purpose: name, roles: ["admin", "manager"] });
    actions.push(`Added screen “${name}” at ${path}`);
    applied = true;
    command = `Implement screen ${name} at ${path}`;
  }

  // Add booking feature
  if (/add\s+booking\s+feature/i.test(message)) {
    if (!model.featureFlags.includes("bookings")) {
      model = {
        ...model,
        featureFlags: [...model.featureFlags, "bookings", "calendar"],
        settings: {
          ...model.settings,
          features: Array.from(
            new Set([...model.settings.features, "bookings", "calendar"]),
          ),
        },
        updatedAt: new Date().toISOString(),
        version: model.version + 1,
      };
    }
    if (!model.screens.some((s) => /book/i.test(s.name) || s.path.includes("book"))) {
      model = addScreen(model, {
        name: "Bookings",
        path: "/bookings",
        purpose: "Manage bookings",
        roles: ["admin", "manager", "customer"],
      });
    }
    actions.push("Enabled booking feature and ensured Bookings screen exists");
    applied = true;
    command = "Add booking calendar, availability, and booking forms";
  }

  // Remove catalog item
  const delItem = message.match(
    /(?:remove|delete)\s+(?:the\s+)?(?:product|item|menu item)\s+["']?([^"'\n]+)["']?/i,
  );
  if (delItem && !removeScreenMatch) {
    const hint = delItem[1]!.trim().toLowerCase();
    const item = model.catalog.find((c) => c.title.toLowerCase().includes(hint));
    if (item) {
      model = deleteCatalogItem(model, item.id);
      actions.push(`Removed “${item.title}”`);
      applied = true;
    }
  }

  // Rename app
  const rename = message.match(
    /(?:rename|set)\s+(?:the\s+)?(?:app|application)\s+(?:name\s+)?(?:to\s+)?["']?([^"'\n]+)["']?/i,
  );
  if (rename) {
    const name = rename[1]!.trim();
    model = updateAppSettings(model, { appName: name });
    actions.push(`Renamed app → ${name}`);
    applied = true;
  }

  // Add role
  const addRole = message.match(
    /add\s+(?:a\s+)?(?:new\s+)?role\s+(?:called|named|:)?\s*["']?([^"'\n]+)["']?/i,
  );
  if (addRole) {
    const name = addRole[1]!.trim();
    model = upsertRole(model, {
      name,
      description: `${name} role`,
      permissions: {
        screens: ["/dashboard"],
        actions: ["view"],
        dataAccess: "own",
      },
    });
    actions.push(`Added role “${name}”`);
    applied = true;
  }

  if (!applied) {
    notes.push(
      "No structured edit matched. Try: “Add a new product”, “Change application colors to blue”, “Remove this screen”, “Add booking feature”.",
    );
    command = message;
  }

  return {
    understood: message,
    actions,
    applied,
    notes,
    model: applied ? model : undefined,
    command,
  };
}

function colorNameToHex(name: string): string {
  const map: Record<string, string> = {
    blue: "#2563EB",
    red: "#EF4444",
    green: "#16A34A",
    gold: "#D4AF37",
    purple: "#7C3AED",
    teal: "#0D9488",
    orange: "#EA580C",
    black: "#111827",
    white: "#FFFFFF",
  };
  return map[name.toLowerCase()] || "#2563EB";
}
