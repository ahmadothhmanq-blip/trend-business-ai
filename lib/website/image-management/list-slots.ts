import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import { IMAGE_SLOT_KINDS } from "@/lib/ai-core/image-engine/slots";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { ManagedSiteImage } from "@/lib/website/image-management/operations";

const SITE_IMAGES_PATH = "lib/site-images.ts";

const SLOT_EXPORT_MAP: Array<{
  kind: ImageSlotKind;
  exportName: string;
  array?: boolean;
}> = [
  { kind: "hero", exportName: "HERO_IMAGE" },
  { kind: "products", exportName: "PRODUCT_IMAGE" },
  { kind: "features", exportName: "SERVICE_IMAGE" },
  { kind: "backgrounds", exportName: "BACKGROUND_IMAGE" },
  { kind: "about", exportName: "ABOUT_IMAGE" },
  { kind: "about", exportName: "SECTION_IMAGES", array: true },
  { kind: "features", exportName: "FEATURE_IMAGES", array: true },
  { kind: "team", exportName: "TEAM_IMAGES", array: true },
  { kind: "gallery", exportName: "GALLERY_IMAGES", array: true },
  { kind: "testimonials", exportName: "TESTIMONIAL_IMAGES", array: true },
];

function findSiteImagesSource(files: GeneratedProjectFile[]): string | null {
  const file = files.find(
    (f) => f.path === SITE_IMAGES_PATH || f.path === "lib/site-images.js",
  );
  return file?.content ?? null;
}

function parseStringExport(source: string, name: string): string | null {
  const match = source.match(
    new RegExp(`export const ${name}(?::[^=]+)?\\s*=\\s*("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')`),
  );
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]) as string;
  } catch {
    return null;
  }
}

function parseArrayExport(source: string, name: string): string[] {
  const match = source.match(
    new RegExp(`export const ${name}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*as const`),
  );
  if (!match?.[1]) return [];
  try {
    const parsed = JSON.parse(match[1]) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function parseSiteImagesMeta(source: string): ManagedSiteImage[] {
  const match = source.match(/export const SITE_IMAGES[^=]*=\s*(\[[\s\S]*?\]);/);
  if (!match?.[1]) return [];
  try {
    const parsed = JSON.parse(match[1]) as ManagedSiteImage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Build a complete slot inventory from lib/site-images.ts exports.
 */
export function buildSiteImageSlotInventory(
  files: GeneratedProjectFile[],
): ManagedSiteImage[] {
  const source = findSiteImagesSource(files);
  if (!source) return [];

  const metaById = new Map(
    parseSiteImagesMeta(source).map((img) => [img.id, img]),
  );
  const inventory: ManagedSiteImage[] = [];
  const seen = new Set<string>();

  for (const entry of SLOT_EXPORT_MAP) {
    const urls = entry.array
      ? parseArrayExport(source, entry.exportName)
      : [parseStringExport(source, entry.exportName)].filter(
          (u): u is string => Boolean(u),
        );

    urls.forEach((url, index) => {
      if (!url || seen.has(`${entry.kind}:${url}`)) return;
      seen.add(`${entry.kind}:${url}`);
      const id = `${entry.kind}-${index + 1}`;
      const existing = metaById.get(id);
      inventory.push({
        id,
        slot: entry.kind,
        url,
        alt: existing?.alt ?? `${entry.kind} photography`,
        objectPosition: existing?.objectPosition,
        crop: existing?.crop,
        isUserOverride: existing?.isUserOverride,
        provider: existing?.provider ?? "image-engine",
        status: existing?.status ?? "generated",
      });
    });
  }

  for (const meta of metaById.values()) {
    if (!inventory.some((img) => img.id === meta.id)) {
      inventory.push(meta);
    }
  }

  return inventory.sort((a, b) => {
    const ai = IMAGE_SLOT_KINDS.indexOf(a.slot);
    const bi = IMAGE_SLOT_KINDS.indexOf(b.slot);
    return ai - bi || a.id.localeCompare(b.id);
  });
}

export function findSiteImagesFile(
  files: GeneratedProjectFile[],
): GeneratedProjectFile | undefined {
  return files.find(
    (f) => f.path === SITE_IMAGES_PATH || f.path === "lib/site-images.js",
  );
}
