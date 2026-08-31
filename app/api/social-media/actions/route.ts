import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse } from "@/lib/api/errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { runSocialPostAction } from "@/lib/social-media/engine";
import { POST_PLATFORMS } from "@/lib/social-media/platforms";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import { NextResponse } from "next/server";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum([
    "rewrite",
    "improve_engagement",
    "shorten",
    "expand",
    "translate",
    "generate_variations",
  ]),
  text: z.string().trim().min(1).max(10000),
  platform: z.enum(POST_PLATFORMS as [string, ...string[]]),
  tone: z.string().optional(),
  targetLanguage: z.string().optional(),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
  instruction: z.string().max(2000).optional(),
  postId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "workspace");
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  try {
    const language = resolveRequestLanguage(
      request,
      parsed.data.targetLanguage ?? parsed.data.language,
      parsed.data.country,
    );
    const result = await runSocialPostAction({
      action: parsed.data.action,
      text: parsed.data.text,
      platform: parsed.data.platform as import("@/types/social-media").SocialPostPlatform,
      tone: parsed.data.tone,
      language,
      targetLanguage: parsed.data.targetLanguage,
      instruction: parsed.data.instruction,
    });

    if (parsed.data.postId) {
      await auth.supabase
        .from("social_posts")
        .update({
          post_text: result.postText,
          caption: result.caption,
          hashtags: result.hashtags,
          cta: result.cta,
          content_angle: result.contentAngle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.postId)
        .eq("user_id", auth.user!.id);
    }

    await creditLease.settle(auth.supabase);
    return NextResponse.json({ result, provider: result.provider });
  } catch (error) {
    return serverErrorResponse("social-media.actions", error, "Action failed.");
  }
}
