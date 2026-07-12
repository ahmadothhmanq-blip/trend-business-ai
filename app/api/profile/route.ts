import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { NextResponse } from "next/server";

const AVATAR_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const ALLOWED_METADATA_KEYS = ["full_name", "avatar_url"] as const;

function pickUserMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(
    ALLOWED_METADATA_KEYS.filter((key) => key in metadata).map((key) => [key, metadata[key]]),
  );
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user!.id)
    .single();

  const { data: preferences } = await auth.supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", auth.user!.id)
    .single();

  return NextResponse.json({
    profile,
    preferences,
    email: auth.user!.email,
    metadata: pickUserMetadata(auth.user!.user_metadata ?? {}),
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const formData = await request.formData();
  const file = formData.get("avatar") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = AVATAR_TYPES[file.type as keyof typeof AVATAR_TYPES];
  if (!ext) {
    return NextResponse.json({ error: "File must be a JPG, PNG or WebP image" }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });
  }

  const path = `${auth.user!.id}/avatar.${ext}`;

  const { error: uploadError } = await auth.supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return databaseErrorResponse("profile.upload", uploadError);
  }

  const {
    data: { publicUrl },
  } = auth.supabase.storage.from("avatars").getPublicUrl(path);

  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error } = await auth.supabase.from("profiles").upsert({
    id: auth.user!.id,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return databaseErrorResponse("profile.update", error);
  }

  return NextResponse.json({ avatarUrl, message: "Avatar updated." });
}
