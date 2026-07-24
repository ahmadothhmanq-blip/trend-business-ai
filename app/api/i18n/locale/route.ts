import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";
import { NextResponse } from "next/server";
import { z } from "zod";

const localeSchema = z.object({
  locale: z.string().trim().min(2).max(10),
});

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = localeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const locale = normalizeLocale(parsed.data.locale);
  const response = NextResponse.json({ locale, saved: true });

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const auth = await requireUser();
  if (auth.response) {
    return response;
  }

  const { error } = await auth.supabase.from("user_preferences").upsert({
    user_id: auth.user!.id,
    locale,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    const msg = (error.message ?? "").toLowerCase();
    if (
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      msg.includes("does not exist") ||
      msg.includes("schema cache") ||
      msg.includes("column") && msg.includes("locale")
    ) {
      return NextResponse.json({
        locale,
        saved: true,
        skipped: true,
        message: "Locale stored in browser; profile sync pending migration.",
      });
    }
    return databaseErrorResponse("i18n.locale", error);
  }

  return response;
}
