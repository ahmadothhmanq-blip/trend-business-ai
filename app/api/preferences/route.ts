import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { preferencesSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";

function isMissingPreferencesTable(error: {
  code?: string;
  message?: string;
} | null) {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

function defaultPreferences(userId: string) {
  return {
    user_id: userId,
    theme: "dark" as const,
    email_notifications: true,
  };
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", auth.user!.id)
    .single();

  if (error && error.code !== "PGRST116") {
    if (isMissingPreferencesTable(error)) {
      return NextResponse.json({
        preferences: defaultPreferences(auth.user!.id),
        skipped: true,
      });
    }
    return databaseErrorResponse("preferences.get", error);
  }

  return NextResponse.json({
    preferences: data ?? defaultPreferences(auth.user!.id),
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
    if (isMissingPreferencesTable(error)) {
      return NextResponse.json({
        message: "Preferences accepted (persistence table unavailable).",
        skipped: true,
        preferences: {
          user_id: auth.user!.id,
          theme: parsed.data.theme ?? "dark",
          email_notifications: parsed.data.emailNotifications ?? true,
        },
      });
    }
    return databaseErrorResponse("preferences.update", error);
  }

  return NextResponse.json({ message: "Preferences saved." });
}
