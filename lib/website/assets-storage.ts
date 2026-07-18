import { createAdminClient } from "@/lib/supabase/admin";

export const WEBSITE_ASSETS_BUCKET = "website-assets";

function extensionForMime(mime: string) {
  if (mime.includes("svg")) return "svg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  return "bin";
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
    const storagePath = `${params.userId}/${params.generationKey}/${params.assetId}.${ext}`;

    const { error } = await admin.storage
      .from(WEBSITE_ASSETS_BUCKET)
      .upload(storagePath, params.bytes, {
        contentType: params.contentType,
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
