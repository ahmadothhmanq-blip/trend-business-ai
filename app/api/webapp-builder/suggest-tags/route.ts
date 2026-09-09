import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/helpers";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import {
  getRequestClientIp,
  enforceWebsitePublicRateLimit,
} from "@/lib/website/public-endpoints";
import {
  analyzeAppDescription,
  emptyAppDescriptionInsight,
  heuristicAppDescriptionInsight,
  isDescriptionReadyForTags,
} from "@/lib/webapp/suggest-app-tags";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  description: z.string().trim().max(4000),
  language: z.string().trim().max(64).optional(),
});

export async function POST(request: Request) {
  const json = (await request.json().catch(() => null)) as unknown;
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid description." }, { status: 400 });
  }

  const options = { language: parsed.data.language };

  if (!isDescriptionReadyForTags(parsed.data.description)) {
    return NextResponse.json({
      ...emptyAppDescriptionInsight(),
      cached: false,
      source: "heuristic",
    });
  }

  const auth = await requireUser();
  if (auth.response) {
    // Public marketing pages: rate-limit by IP and use heuristics (no paid AI).
    const ip = getRequestClientIp(request);
    const rateLimited = await enforceWebsitePublicRateLimit("design-platform", ip);
    if (rateLimited) return rateLimited;
    const insight = heuristicAppDescriptionInsight(parsed.data.description, options);
    return NextResponse.json({
      ...insight,
      cached: false,
      source: "heuristic",
    });
  }

  const rateLimited = await enforceMutationRateLimitAsync(auth.user!.id);
  if (rateLimited) return rateLimited;

  const result = await analyzeAppDescription(parsed.data.description, options);
  return NextResponse.json(result);
}
