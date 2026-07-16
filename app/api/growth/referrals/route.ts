import { NextResponse } from "next/server";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { referralInviteSchema } from "@/lib/growth/schemas";
import { ensureReferralProfile } from "@/lib/growth/engine";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = referralInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid invite" },
      { status: 400 },
    );
  }

  const referral = await ensureReferralProfile(auth.supabase, auth.user!.id);
  if (!referral) {
    return NextResponse.json(
      { error: "Growth engine migration required." },
      { status: 503 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const { data, error } = await auth.supabase
    .from("growth_referral_invites")
    .insert({
      referrer_user_id: auth.user!.id,
      code: referral.code,
      invitee_email: email,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await auth.supabase
    .from("growth_referral_codes")
    .update({
      total_invites: (referral.total_invites ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", referral.id);

  return NextResponse.json({ invite: data, code: referral.code });
}
