import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { runSocialPostAction } from "@/lib/social-media/engine";
import { POST_PLATFORMS } from "@/lib/social-media/platforms";
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
  instruction: z.string().max(2000).optional(),
  postId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "workspace");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const result = await runSocialPostAction({
      action: parsed.data.action,
      text: parsed.data.text,
      platform: parsed.data.platform as import("@/types/social-media").SocialPostPlatform,
      tone: parsed.data.tone,
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

    return NextResponse.json({ result, provider: result.provider });
  } catch (error) {
    return serverErrorResponse("social-media.actions", error, "Action failed.");
  }
}
