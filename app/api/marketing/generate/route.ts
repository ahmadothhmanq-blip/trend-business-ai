import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { generateCampaign, generatePersona, generatedPersonaToRow, createPersona } from "@/lib/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["campaign", "persona"]),
  brief: z.string().trim().min(3),
  objective: z.string().optional(),
  budget: z.number().optional(),
  channels: z.array(z.string()).optional(),
  tone: z.string().optional(),
  industry: z.string().optional(),
  product: z.string().optional(),
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.type === "persona") {
    const generated = await generatePersona({
      brief: parsed.data.brief,
      industry: parsed.data.industry,
      product: parsed.data.product,
    });
    if (parsed.data.save) {
      const { data, error } = await createPersona(
        auth.supabase,
        generatedPersonaToRow(auth.user!.id, generated, parsed.data.campaignId),
      );
      if (error) return databaseErrorResponse("marketing.personas.insert", error);
      return NextResponse.json({ persona: data, generated });
    }
    return NextResponse.json({ generated });
  }

  const generated = await generateCampaign({
    brief: parsed.data.brief,
    objective: parsed.data.objective,
    budget: parsed.data.budget,
    channels: parsed.data.channels,
    tone: parsed.data.tone,
  });

  return NextResponse.json({ generated });
}
