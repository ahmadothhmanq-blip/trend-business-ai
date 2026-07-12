import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/api/helpers";
import { logApiError } from "@/lib/api/errors";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"), "/dashboard");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } catch (error) {
    logApiError("auth.callback", error);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
