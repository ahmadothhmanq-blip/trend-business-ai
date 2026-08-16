import { createAdminClient } from "@/lib/supabase/admin";

export const WEBSITE_ASSETS_BUCKET = "website-assets";

/** Raster images only — SVG can carry executable scripts. */
export const WEBSITE_ASSET_ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function extensionForMime(mime: string) {
  const normalized = mime.toLowerCase().split(";")[0]?.trim() ?? "";
  if (normalized === "image/png") return "png";
  if (normalized === "image/webp") return "webp";
  if (normalized === "image/jpeg" || normalized === "image/jpg") return "jpg";
  return null;
}

export function assertWebsiteAssetMime(contentType: string): string | null {
  const normalized = contentType.toLowerCase().split(";")[0]?.trim() ?? "";
  if (!WEBSITE_ASSET_ALLOWED_MIME.has(normalized)) {
    return "Only PNG, JPEG, and WebP images are allowed.";
  }
  return null;
}

/**
 * Upload a generation asset. Soft-fails to null when storage/admin is unavailable.
 */
export async function uploadWebsiteAsset(params: {
  userId: string;
  generationKey: string;
  assetId: string;
  bytes: Buffer | Uint8Array;
  contentType: string;
}): Promise<{ storagePath: string; publicUrl: string } | null> {
  try {
    const admin = createAdminClient();
    if (!admin) return null;

    const ext = extensionForMime(params.contentType);
    if (!ext) {
      console.error("website asset upload rejected mime", params.contentType);
      return null;
    }
    const storagePath = `${params.userId}/${params.generationKey}/${params.assetId}.${ext}`;

    const { error } = await admin.storage
      .from(WEBSITE_ASSETS_BUCKET)
      .upload(storagePath, params.bytes, {
        contentType: params.contentType.toLowerCase().split(";")[0]?.trim() || "application/octet-stream",
        upsert: true,
      });

    if (error) {
      console.error("website asset upload failed", error);
      return null;
    }

    const { data } = admin.storage
      .from(WEBSITE_ASSETS_BUCKET)
      .getPublicUrl(storagePath);

    return { storagePath, publicUrl: data.publicUrl };
  } catch (error) {
    console.error("website asset upload threw", error);
    return null;
  }
}
