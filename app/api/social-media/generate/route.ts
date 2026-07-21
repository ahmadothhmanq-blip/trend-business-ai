import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateSocialPost, generatedPostToRow } from "@/lib/social-media/engine";
import { fetchSocialBrandContext } from "@/lib/social-media/brand-integration";
import { applyTemplateVariables, getSocialTemplate } from "@/lib/social-media/templates";
import { SOCIAL_TONES } from "@/lib/social-media/prompts";
import { POST_PLATFORMS } from "@/lib/social-media/platforms";
import type { SocialPost, SocialTone } from "@/types/social-media";
import { NextResponse } from "next/server";
import { z } from "zod";

const generateSchema = z.object({
  platform: z.enum(POST_PLATFORMS as [string, ...string[]]),
  topic: z.string().trim().min(3).max(4000),
  tone: z.enum(SOCIAL_TONES as unknown as [string, ...string[]]).default("Professional"),
  language: z.string().trim().default("English"),
  audience: z.string().trim().optional(),
  brandIdentityId: z.string().uuid().optional(),
  templateId: z.string().optional(),
  templateValues: z.record(z.string(), z.string()).optional(),
  campaignId: z.string().uuid().optional(),
  save: z.boolean().default(true),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "workspace");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  let templateStructure: string | undefined;
  if (input.templateId) {
    const tpl = getSocialTemplate(input.templateId);
    if (tpl) {
      templateStructure = applyTemplateVariables(
        tpl.structure,
        input.templateValues ?? {},
        tpl.variables,
      );
    }
  }

  let brandContext = null;
  if (input.brandIdentityId) {
    brandContext = await fetchSocialBrandContext(auth.supabase, auth.user!.id, input.brandIdentityId);
  }

  try {
    const generated = await generateSocialPost({
      platform: input.platform as SocialPost["platform"],
      topic: input.topic,
      tone: input.tone as SocialTone,
      language: input.language,
      audience: input.audience,
      brandContext,
      templateStructure,
    });

    if (!input.save) {
      return NextResponse.json({ generated, provider: generated.provider });
    }

    const row = {
      user_id: auth.user!.id,
      ...generatedPostToRow(generated, {
        platform: input.platform as SocialPost["platform"],
        tone: input.tone,
        language: input.language,
        campaignId: input.campaignId,
        templateId: input.templateId,
        brandIdentityId: input.brandIdentityId,
      }),
    };

    const { data, error } = await auth.supabase.from("social_posts").insert(row).select("*").single();
    if (error) {
      if (/relation/i.test(error.message ?? "")) {
        return NextResponse.json({ error: "Apply migration 062." }, { status: 503 });
      }
      return databaseErrorResponse("social-media.generate", error);
    }

    return NextResponse.json({ post: data as SocialPost, generated, provider: generated.provider });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
