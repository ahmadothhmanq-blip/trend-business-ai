import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";

/** User-facing image management operations for Website Builder projects. */
export type ImageManagementAction =
  | "replace"
  | "upload"
  | "generate"
  | "delete"
  | "crop"
  | "reposition"
  | "restore-default"
  | "edit-alt";

export type ManagedSiteImage = {
  id: string;
  slot: ImageSlotKind;
  url: string | null;
  alt: string;
  objectPosition?: string;
  crop?: { x: number; y: number; width: number; height: number };
  isUserOverride?: boolean;
  provider?: string;
  status?: string;
};

export type ImageManagementRequest = {
  action: ImageManagementAction;
  imageId: string;
  slot?: ImageSlotKind;
  url?: string;
  alt?: string;
  objectPosition?: string;
  crop?: ManagedSiteImage["crop"];
  generatePrompt?: string;
};

export type ImageManagementResult = {
  ok: boolean;
  files: GeneratedProjectFile[];
  image?: ManagedSiteImage;
  error?: string;
};

const SITE_IMAGES_PATH = "lib/site-images.ts";

function findSiteImagesFile(
  files: GeneratedProjectFile[],
): GeneratedProjectFile | undefined {
  return files.find(
    (f) => f.path === SITE_IMAGES_PATH || f.path === "lib/site-images.js",
  );
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

function serializeSiteImagesMeta(images: ManagedSiteImage[]): string {
  return JSON.stringify(images, null, 2);
}

function patchExportConst(
  source: string,
  name: string,
  value: string,
): string {
  const re = new RegExp(
    `export const ${name}(?::[^=]+)?\\s*=\\s*(?:"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\\[[\\s\\S]*?\\])`,
  );
  if (re.test(source)) {
    return source.replace(re, `export const ${name} = ${JSON.stringify(value)}`);
  }
  return source;
}

function patchExportArray(
  source: string,
  name: string,
  values: string[],
): string {
  const re = new RegExp(
    `export const ${name}\\s*=\\s*\\[[\\s\\S]*?\\] as const`,
  );
  const replacement = `export const ${name} = ${JSON.stringify(values)} as const`;
  if (re.test(source)) {
    return source.replace(re, replacement);
  }
  return source;
}

function syncPrimaryExports(
  source: string,
  slot: ImageSlotKind,
  url: string,
  index = 0,
): string {
  switch (slot) {
    case "hero":
      return patchExportConst(source, "HERO_IMAGE", url);
    case "products":
      return patchExportConst(source, "PRODUCT_IMAGE", url);
    case "features":
      return patchExportConst(source, "SERVICE_IMAGE", url);
    case "backgrounds":
      return patchExportConst(source, "BACKGROUND_IMAGE", url);
    case "about":
      source = patchExportConst(source, "ABOUT_IMAGE", url);
      return patchExportArray(source, "SECTION_IMAGES", [url]);
    case "gallery": {
      const galleryMatch = source.match(
        /export const GALLERY_IMAGES = (\[[\s\S]*?\]) as const/,
      );
      const gallery = galleryMatch
        ? (JSON.parse(galleryMatch[1]!) as string[])
        : [];
      gallery[index] = url;
      return patchExportArray(source, "GALLERY_IMAGES", gallery);
    }
    case "team":
      return patchExportArray(source, "TEAM_IMAGES", [url]);
    case "testimonials":
      return patchExportArray(source, "TESTIMONIAL_IMAGES", [url]);
    default:
      return source;
  }
}

/**
 * Apply a user image management operation to project files.
 * Updates lib/site-images.ts and preserves backward-compatible exports.
 */
export function applyImageManagementOperation(
  files: GeneratedProjectFile[],
  request: ImageManagementRequest,
): ImageManagementResult {
  const siteFile = findSiteImagesFile(files);
  if (!siteFile?.content) {
    return { ok: false, files, error: "lib/site-images.ts not found" };
  }

  let images = parseSiteImagesMeta(siteFile.content);
  const existing = images.find((img) => img.id === request.imageId);
  const slot = request.slot ?? existing?.slot ?? "hero";

  switch (request.action) {
    case "delete": {
      images = images.map((img) =>
        img.id === request.imageId
          ? { ...img, url: null, status: "deleted", isUserOverride: true }
          : img,
      );
      break;
    }
    case "restore-default": {
      images = images.map((img) =>
        img.id === request.imageId
          ? {
              ...img,
              isUserOverride: false,
              status: "generated",
              objectPosition: undefined,
              crop: undefined,
            }
          : img,
      );
      break;
    }
    case "edit-alt": {
      if (!request.alt?.trim()) {
        return { ok: false, files, error: "Alt text is required" };
      }
      images = images.map((img) =>
        img.id === request.imageId ? { ...img, alt: request.alt!.trim() } : img,
      );
      break;
    }
    case "reposition": {
      images = images.map((img) =>
        img.id === request.imageId
          ? { ...img, objectPosition: request.objectPosition, isUserOverride: true }
          : img,
      );
      break;
    }
    case "crop": {
      images = images.map((img) =>
        img.id === request.imageId
          ? { ...img, crop: request.crop, isUserOverride: true }
          : img,
      );
      break;
    }
    case "replace":
    case "upload":
    case "generate": {
      if (!request.url?.trim()) {
        return { ok: false, files, error: "Image URL is required" };
      }
      const url = request.url.trim();
      const alt =
        request.alt?.trim() ||
        existing?.alt ||
        `${slot} photography`;
      const next: ManagedSiteImage = {
        id: request.imageId,
        slot,
        url,
        alt,
        isUserOverride: true,
        provider:
          request.action === "generate"
            ? "ai-generated"
            : request.action === "upload"
              ? "user-upload"
              : existing?.provider,
        status: "ready",
        objectPosition: request.objectPosition ?? existing?.objectPosition,
        crop: request.crop ?? existing?.crop,
      };
      if (existing) {
        images = images.map((img) => (img.id === request.imageId ? next : img));
      } else {
        images.push(next);
      }
      siteFile.content = syncPrimaryExports(siteFile.content, slot, url);
      break;
    }
    default:
      return { ok: false, files, error: `Unknown action: ${request.action}` };
  }

  const metaBlock = `export const SITE_IMAGES: SiteImageMeta[] = ${serializeSiteImagesMeta(images)};`;
  siteFile.content = siteFile.content.replace(
    /export const SITE_IMAGES[^=]*=\s*\[[\s\S]*?\];/,
    metaBlock,
  );

  const updatedImage = images.find((img) => img.id === request.imageId);
  const out = files.map((f) =>
    f.path === siteFile.path ? { ...siteFile, content: siteFile.content } : f,
  );

  return { ok: true, files: out, image: updatedImage };
}

/** List all managed images from project files. */
export function listManagedSiteImages(
  files: GeneratedProjectFile[],
): ManagedSiteImage[] {
  const siteFile = findSiteImagesFile(files);
  if (!siteFile?.content) return [];
  return parseSiteImagesMeta(siteFile.content);
}
