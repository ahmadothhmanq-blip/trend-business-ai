/**
 * Phase 7 — AI Website Assistant for management dashboard.
 */

import type {
  CatalogItem,
  WebsiteAssistantResult,
} from "@/lib/ai-core/website-management/types";
import {
  upsertCatalogItem,
  deleteCatalogItem,
} from "@/lib/ai-core/website-management/catalog/engine";

export function runWebsiteAssistant(params: {
  message: string;
  catalog?: CatalogItem[];
}): WebsiteAssistantResult & {
  catalog?: CatalogItem[];
  editCommand?: string;
} {
  const message = params.message.trim();
  const notes: string[] = [];
  const actions: string[] = [];
  let catalog = params.catalog ? [...params.catalog] : undefined;
  let editCommand: string | undefined;
  let applied = false;

  const priceMatch = message.match(
    /(?:change|update|set)\s+(?:the\s+)?(?:price\s+(?:of|for)\s+)?(.+?)\s+(?:price\s+)?(?:to|=)\s*(\$?[\d,.]+)/i,
  );
  if (priceMatch && catalog) {
    const titleHint = priceMatch[1]!.trim();
    const price = priceMatch[2]!.startsWith("$")
      ? priceMatch[2]!
      : `$${priceMatch[2]}`;
    const idx = catalog.findIndex((i) =>
      i.title.toLowerCase().includes(titleHint.toLowerCase()),
    );
    if (idx >= 0) {
      catalog[idx] = {
        ...catalog[idx]!,
        price,
        updatedAt: new Date().toISOString(),
      };
      actions.push(`Updated price for “${catalog[idx]!.title}” → ${price}`);
      applied = true;
      notes.push("Catalog price updated — publish to push live.");
    } else {
      notes.push(`Could not find catalog item matching “${titleHint}”.`);
    }
  }

  const addMatch = message.match(
    /add\s+(?:a\s+)?(?:new\s+)?(service|menu item|product|vehicle|property|offer)\s*(?:called|named|:)?\s*["']?([^"'\n]+)?/i,
  );
  if (addMatch && catalog) {
    const kind = addMatch[1]!.toLowerCase();
    const title = (addMatch[2] || "New item").trim();
    const typeMap: Record<string, CatalogItem["type"]> = {
      service: "service",
      "menu item": "menu-item",
      product: "product",
      vehicle: "vehicle",
      property: "property",
      offer: "offer",
    };
    catalog = upsertCatalogItem(catalog, {
      type: typeMap[kind] || "service",
      title,
      description: "Added via AI assistant",
      price: "Custom",
    });
    actions.push(`Added ${kind}: ${title}`);
    applied = true;
    editCommand = `Add a ${kind} section highlighting ${title}`;
    notes.push("Catalog item created. Optional section update queued.");
  }

  const delMatch = message.match(/(?:remove|delete)\s+(?:the\s+)?(.+)$/i);
  if (delMatch && catalog && !applied) {
    const hint = delMatch[1]!.trim();
    const found = catalog.find((i) =>
      i.title.toLowerCase().includes(hint.toLowerCase()),
    );
    if (found) {
      catalog = deleteCatalogItem(catalog, found.id);
      actions.push(`Removed “${found.title}”`);
      applied = true;
    }
  }

  if (!applied) {
    editCommand = message;
    actions.push("ai-continue");
    notes.push("Will apply via AI website editor.");
    applied = true;
  }

  return {
    understood: message,
    actions,
    applied,
    notes,
    command: editCommand,
    catalog,
    editCommand,
  };
}
