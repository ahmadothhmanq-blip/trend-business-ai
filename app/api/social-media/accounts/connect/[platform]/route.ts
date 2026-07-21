import { requireUser } from "@/lib/api/helpers";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import {
  CONNECTABLE_PLATFORMS,
  generateOAuthState,
  generatePkce,
  getOAuthCredentials,
  getOAuthProvider,
  getRedirectUri,
  PKCE_COOKIE,
} from "@/lib/social-media/oauth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = { params: Promise<{ platform: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceMutationRateLimitAsync(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { platform } = await context.params;
  if (!CONNECTABLE_PLATFORMS.includes(platform as (typeof CONNECTABLE_PLATFORMS)[number])) {
    return NextResponse.json({ error: "Unsupported platform." }, { status: 400 });
  }

  const provider = getOAuthProvider(platform);
  if (!provider) return NextResponse.json({ error: "Unknown platform." }, { status: 400 });

  const { clientId } = getOAuthCredentials(provider);
  if (!clientId) {
    return NextResponse.json(
      { error: `${provider.label} OAuth is not configured. Set ${provider.clientIdEnv}.` },
      { status: 503 },
    );
  }

  const state = generateOAuthState(auth.user!.id, platform);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(platform),
    response_type: "code",
    state,
    scope: provider.scopes.join(" "),
  });

  if (provider.usesPkce) {
    const pkce = generatePkce();
    params.set("code_challenge", pkce.challenge);
    params.set("code_challenge_method", "S256");
    const jar = await cookies();
    jar.set(PKCE_COOKIE, pkce.verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
  }

  const authUrl = `${provider.authUrl}?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
