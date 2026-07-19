import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/helpers";
import { versionCreatorTemplate } from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const versionSchema = z.object({
  version: z.string().trim().min(1).max(32),
  changelog: z.string().trim().min(1).max(1000),
  premiumTemplateId: z.string().trim().max(80).optional(),
  marketplaceTemplateId: z.string().trim().max(120).optional(),
});

/**
 * POST — Add a new version to a creator-owned listing.
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = versionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid version payload" },
      { status: 400 },
    );
  }

  try {
    const listing = versionCreatorTemplate({
      listingId: id,
      userId: auth.user!.id,
      ...parsed.data,
    });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Version failed";
    const status = message.includes("Not allowed") ? 403 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}
