/**
 * Phase 3 — Business Features Engine: structured catalogs per industry.
 */

import type { CatalogItem, CatalogItemType } from "@/lib/ai-core/website-management/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

function item(
  partial: Omit<CatalogItem, "updatedAt" | "status"> & { status?: CatalogItem["status"] },
): CatalogItem {
  return {
    ...partial,
    status: partial.status || "published",
    updatedAt: new Date().toISOString(),
  };
}

export function seedCatalogForIndustry(
  industryId: string,
  brandName: string,
): CatalogItem[] {
  const brand = brandName || "Brand";
  switch (industryId) {
    case "restaurant":
      return [
        item({
          id: "menu-1",
          type: "menu-item",
          title: "Signature tasting",
          description: "Seasonal chef selection with wine pairing.",
          price: "$84",
          category: "Tasting",
          imageUrl: "/images/menu-tasting.jpg",
        }),
        item({
          id: "menu-2",
          type: "menu-item",
          title: "Coastal catch",
          description: "Market fish, citrus butter, garden herbs.",
          price: "$42",
          category: "Mains",
          imageUrl: "/images/menu-fish.jpg",
        }),
        item({
          id: "menu-3",
          type: "menu-item",
          title: "House dessert",
          description: "Dark chocolate, olive oil, sea salt.",
          price: "$16",
          category: "Dessert",
        }),
        item({
          id: "offer-1",
          type: "offer",
          title: "Weeknight prix fixe",
          description: "Three courses · Tue–Thu",
          price: "$58",
          category: "Offers",
        }),
      ];
    case "automotive":
      return [
        item({
          id: "veh-1",
          type: "vehicle",
          title: `${brand} GT Coupe`,
          description: "Flagship grand tourer with dual-motor performance.",
          price: "$128,000",
          category: "Coupe",
          imageUrl: "/images/vehicle-gt.jpg",
          specs: { power: "620 hp", range: "410 mi", drivetrain: "AWD" },
        }),
        item({
          id: "veh-2",
          type: "vehicle",
          title: `${brand} SUV Reserve`,
          description: "Executive SUV with panoramic cabin.",
          price: "$96,500",
          category: "SUV",
          specs: { power: "480 hp", seats: "7", drivetrain: "AWD" },
        }),
      ];
    case "real-estate":
      return [
        item({
          id: "prop-1",
          type: "property",
          title: "Harbor Residence",
          description: "Waterfront living with private terrace.",
          price: "$2,450,000",
          category: "Residence",
          specs: { beds: "4", baths: "3.5", sqft: "3,200" },
        }),
        item({
          id: "prop-2",
          type: "property",
          title: "Garden Villa",
          description: "Quiet street, landscaped courtyard.",
          price: "$1,180,000",
          category: "Villa",
          specs: { beds: "3", baths: "2", sqft: "2,100" },
        }),
      ];
    case "ecommerce":
      return [
        item({
          id: "prod-1",
          type: "product",
          title: "Essential tote",
          description: "Full-grain leather daily carry.",
          price: "$240",
          category: "Accessories",
        }),
        item({
          id: "prod-2",
          type: "product",
          title: "Studio jacket",
          description: "Lightweight layer for city evenings.",
          price: "$320",
          category: "Apparel",
        }),
      ];
    default:
      return [
        item({
          id: "svc-1",
          type: "service",
          title: "Strategy engagement",
          description: `Advisory package from ${brand}.`,
          price: "Custom",
          category: "Services",
        }),
        item({
          id: "svc-2",
          type: "service",
          title: "Implementation",
          description: "Hands-on delivery with clear milestones.",
          price: "Custom",
          category: "Services",
        }),
      ];
  }
}

export function catalogToSiteDataFile(
  items: CatalogItem[],
  industryId: string,
): GeneratedProjectFile {
  return {
    path: "lib/site-catalog.ts",
    language: "typescript",
    content: `/**
 * Business Features catalog — editable via Website Management dashboard.
 * Industry: ${industryId}
 */
export type SiteCatalogItem = {
  id: string;
  type: string;
  title: string;
  description?: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  specs?: Record<string, string>;
  status?: string;
  updatedAt?: string;
};

export const SITE_CATALOG: SiteCatalogItem[] = ${JSON.stringify(items, null, 2)};

export function listCatalogByType(type: string) {
  return SITE_CATALOG.filter((i) => i.type === type && i.status !== "archived");
}

export function getCatalogItem(id: string) {
  return SITE_CATALOG.find((i) => i.id === id) || null;
}
`,
  };
}

export function parseCatalogFromFiles(
  files: GeneratedProjectFile[],
): CatalogItem[] {
  const file = files.find((f) => f.path === "lib/site-catalog.ts");
  if (!file) return [];
  const match = file.content.match(
    /export const SITE_CATALOG[^=]*=\s*(\[[\s\S]*?\]);/,
  );
  if (!match?.[1]) return [];
  try {
    return JSON.parse(match[1]) as CatalogItem[];
  } catch {
    return [];
  }
}

export function writeCatalogToFiles(
  files: GeneratedProjectFile[],
  items: CatalogItem[],
  industryId: string,
): GeneratedProjectFile[] {
  const next = catalogToSiteDataFile(items, industryId);
  const others = files.filter((f) => f.path !== next.path);
  return [...others, next];
}

export function upsertCatalogItem(
  items: CatalogItem[],
  patch: Partial<CatalogItem> & { id?: string; type: CatalogItemType; title: string },
): CatalogItem[] {
  const id =
    patch.id ||
    `${patch.type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const existing = items.findIndex((i) => i.id === id);
  const row: CatalogItem = {
    id,
    type: patch.type,
    title: patch.title,
    description: patch.description,
    price: patch.price,
    category: patch.category,
    imageUrl: patch.imageUrl,
    specs: patch.specs,
    status: patch.status || "published",
    updatedAt: new Date().toISOString(),
  };
  if (existing >= 0) {
    const copy = [...items];
    copy[existing] = { ...copy[existing]!, ...row, id };
    return copy;
  }
  return [row, ...items];
}

export function deleteCatalogItem(
  items: CatalogItem[],
  id: string,
): CatalogItem[] {
  return items.filter((i) => i.id !== id);
}
