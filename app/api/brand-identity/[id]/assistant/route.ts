import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { databaseErrorResponse } from "@/lib/api/errors";
import {
  blueprintToModel,
  modelToBlueprint,
  runBrandAssistant,
} from "@/lib/ai-core/brand-studio";
import type { BrandIdentityGeneration } from "@/types/brand-identity";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "brand-identity");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const { data: gen, error } = await auth.supabase
    .from("brand_identity_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !gen?.blueprint) {
    return NextResponse.json({ error: "Brand identity not found" }, { status: 404 });
  }

  const generation = gen as BrandIdentityGeneration;
  const model = blueprintToModel(generation.blueprint!, generation);
  const result = runBrandAssistant({ message: parsed.data.message, model });

  const blueprint = modelToBlueprint(result.model, generation.prompt);
  const { data: updated, error: updateError } = await auth.supabase
    .from("brand_identity_generations")
    .update({
      blueprint: blueprint as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (updateError) return databaseErrorResponse("brand-identity.assistant", updateError);

  const { data: session } = await auth.supabase
    .from("brand_assistant_sessions")
    .select("*")
    .eq("generation_id", id)
    .eq("user_id", auth.user!.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const messages = [
    ...((session?.messages as Array<{ role: string; content: string }>) ?? []),
    { role: "user", content: parsed.data.message, at: new Date().toISOString() },
    { role: "assistant", content: result.message, actions: result.actions, at: new Date().toISOString() },
  ];

  if (session?.id) {
    await auth.supabase
      .from("brand_assistant_sessions")
      .update({
        messages,
        credits_used: (session.credits_used ?? 0) + (result.creditsUsed ?? 0),
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id);
  } else {
    await auth.supabase.from("brand_assistant_sessions").insert({
      user_id: auth.user!.id,
      generation_id: id,
      messages,
      credits_used: result.creditsUsed ?? 0,
    });
  }

  return NextResponse.json({
    result,
    generation: updated as BrandIdentityGeneration,
    message: result.message,
  });
}
