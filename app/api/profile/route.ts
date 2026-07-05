import { requireUser } from "@/lib/api/helpers";
import { NextResponse } from "next/server";

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
    metadata: auth.user!.user_metadata,
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

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${auth.user!.id}/avatar.${ext}`;

  const { error: uploadError } = await auth.supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ avatarUrl, message: "Avatar updated." });
}
