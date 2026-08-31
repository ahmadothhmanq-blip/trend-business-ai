import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { serverErrorResponse } from "@/lib/api/errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { runContentAction } from "@/lib/content-studio/actions";
import { fetchBrandVoiceContext } from "@/lib/content-studio/brand-voice";
import { createDocumentVersion } from "@/lib/content-studio/versions";
import { documentCounts } from "@/lib/content-studio/documents";
import { CONTENT_PLATFORM_STYLES, CONTENT_PLATFORM_TONES } from "@/lib/constants/content-studio";
import { getRequestAiLanguage } from "@/lib/i18n/api";
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
  country: z.string().trim().optional(),
  instruction: z.string().trim().max(2000).optional(),
  brandIdentityId: z.string().uuid().optional(),
  documentId: z.string().uuid().optional(),
  saveToDocument: z.boolean().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "content-studio");
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const input = parsed.data;
  getRequestAiLanguage(request, input.targetLanguage, input.country);

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

    await creditLease.settle(auth.supabase);
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
