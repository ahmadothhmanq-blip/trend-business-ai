import { exchangeCodeForTokens, saveConnectedAccount } from "@/lib/social-media/oauth";
import { verifyOAuthState, PKCE_COOKIE } from "@/lib/social-media/oauth/state";
import { getAppBaseUrl } from "@/lib/social-media/oauth/providers";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = { params: Promise<{ platform: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { platform } = await context.params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const dashboardUrl = `${getAppBaseUrl()}/dashboard/social-media?tab=accounts`;

  if (oauthError) {
    return NextResponse.redirect(`${dashboardUrl}&connect=error&reason=${encodeURIComponent(oauthError)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${dashboardUrl}&connect=error&reason=missing_code`);
  }

  const verified = verifyOAuthState(state);
  if (!verified || verified.platform !== platform) {
    return NextResponse.redirect(`${dashboardUrl}&connect=error&reason=invalid_state`);
  }

  const jar = await cookies();
  const codeVerifier = jar.get(PKCE_COOKIE)?.value;
  jar.delete(PKCE_COOKIE);

  try {
    const tokens = await exchangeCodeForTokens(platform, code, codeVerifier);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== verified.userId) {
      return NextResponse.redirect(`${dashboardUrl}&connect=error&reason=auth_mismatch`);
    }

    const { error } = await saveConnectedAccount(supabase, {
      userId: user.id,
      platform,
      tokens,
    });

    if (error) {
      return NextResponse.redirect(`${dashboardUrl}&connect=error&reason=save_failed`);
    }

    return NextResponse.redirect(`${dashboardUrl}&connect=success&platform=${platform}`);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "callback_failed";
    return NextResponse.redirect(`${dashboardUrl}&connect=error&reason=${encodeURIComponent(reason)}`);
  }
}
