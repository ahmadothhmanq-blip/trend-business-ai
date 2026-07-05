import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { preferencesSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", auth.user!.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    preferences: data ?? {
      user_id: auth.user!.id,
      theme: "dark",
      email_notifications: true,
    },
  });
}

export async function PUT(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });
  }

  const { error } = await auth.supabase.from("user_preferences").upsert({
    user_id: auth.user!.id,
    theme: parsed.data.theme ?? "dark",
    email_notifications: parsed.data.emailNotifications ?? true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Preferences saved." });
}
