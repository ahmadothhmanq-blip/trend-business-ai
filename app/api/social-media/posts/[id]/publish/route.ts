import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import { publishPost } from "@/lib/social-media/publishing";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const publishSchema = z.object({
  accountId: z.string().uuid(),
  scheduledAt: z.string().optional(),
});

export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceMutationRateLimitAsync(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = publishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const output = await publishPost(auth.supabase, {
      userId: auth.user!.id,
      postId: idParsed.id,
      accountId: parsed.data.accountId,
      scheduledAt: parsed.data.scheduledAt ?? null,
    });

    return NextResponse.json({
      job: output.job,
      result: {
        ok: output.result.ok,
        platformPostId: output.result.platformPostId,
        error: output.result.error,
      },
    });
  } catch (error) {
    return serverErrorResponse("social-media.posts.publish", error, "Publishing failed.");
  }
}
