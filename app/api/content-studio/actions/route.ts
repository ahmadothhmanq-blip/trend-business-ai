import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { runContentAction } from "@/lib/content-studio/actions";
import { fetchBrandVoiceContext } from "@/lib/content-studio/brand-voice";
import { createDocumentVersion } from "@/lib/content-studio/versions";
import { documentCounts } from "@/lib/content-studio/documents";
import { CONTENT_PLATFORM_STYLES, CONTENT_PLATFORM_TONES } from "@/lib/constants/content-studio";
import { NextResponse } from "next/server";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum([
    "rewrite",
    "improve",
    "expand",
    "shorten",
    "summarize",
    "translate",
    "change_tone",
    "change_style",
  ]),
  text: z.string().trim().min(1, "Text is required").max(50000),
  tone: z.enum(CONTENT_PLATFORM_TONES).optional(),
  style: z.enum(CONTENT_PLATFORM_STYLES).optional(),
  targetLanguage: z.string().trim().max(60).optional(),
  instruction: z.string().trim().max(2000).optional(),
  brandIdentityId: z.string().uuid().optional(),
  documentId: z.string().uuid().optional(),
  saveToDocument: z.boolean().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "content-studio");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;

  try {
    let brandVoice = null;
    if (input.brandIdentityId) {
      brandVoice = await fetchBrandVoiceContext(
        auth.supabase,
        auth.user!.id,
        input.brandIdentityId,
      );
    }

    const result = await runContentAction({
      action: input.action,
      text: input.text,
      tone: input.tone,
      style: input.style,
      targetLanguage: input.targetLanguage,
      instruction: input.instruction,
      brandVoice,
    });

    let document = null;
    if (input.saveToDocument && input.documentId) {
      const counts = documentCounts(result.text);
      const { data } = await auth.supabase
        .from("content_documents")
        .update({
          body: result.text,
          ...counts,
          last_edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.documentId)
        .eq("user_id", auth.user!.id)
        .select("*")
        .single();

      if (data) {
        document = data;
        await createDocumentVersion(auth.supabase, {
          userId: auth.user!.id,
          documentId: input.documentId,
          title: data.title as string,
          body: result.text,
          changeSummary: `AI ${input.action}`,
          source: "ai_action",
          metadata: { action: input.action },
        });
      }
    }

    return NextResponse.json({
      result: result.text,
      action: result.action,
      provider: result.provider,
      document,
    });
  } catch (error) {
    return serverErrorResponse("content-studio.actions", error, "Unable to run content action.");
  }
}
