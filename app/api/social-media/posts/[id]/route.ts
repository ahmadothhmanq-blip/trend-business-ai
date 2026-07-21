import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { SocialPost } from "@/types/social-media";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  postText: z.string().optional(),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  cta: z.string().optional(),
  contentAngle: z.string().optional(),
  tone: z.string().optional(),
  status: z.enum(["draft", "scheduled", "published", "failed", "archived"]).optional(),
  is_favorite: z.boolean().optional(),
  campaignId: z.string().uuid().nullable().optional(),
  mediaUrl: z.string().nullable().optional(),
  mediaWidth: z.number().int().nullable().optional(),
  mediaHeight: z.number().int().nullable().optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("social_posts")
    .select("*")
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json({ post: data as SocialPost });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) patch.title = input.title;
  if (input.postText !== undefined) patch.post_text = input.postText;
  if (input.caption !== undefined) patch.caption = input.caption;
  if (input.hashtags !== undefined) patch.hashtags = input.hashtags;
  if (input.cta !== undefined) patch.cta = input.cta;
  if (input.contentAngle !== undefined) patch.content_angle = input.contentAngle;
  if (input.tone !== undefined) patch.tone = input.tone;
  if (input.status !== undefined) patch.status = input.status;
  if (input.is_favorite !== undefined) patch.is_favorite = input.is_favorite;
  if (input.campaignId !== undefined) patch.campaign_id = input.campaignId;
  if (input.mediaUrl !== undefined) patch.media_url = input.mediaUrl;
  if (input.mediaWidth !== undefined) patch.media_width = input.mediaWidth;
  if (input.mediaHeight !== undefined) patch.media_height = input.mediaHeight;

  const { data, error } = await auth.supabase
    .from("social_posts")
    .update(patch)
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error || !data) return databaseErrorResponse("social-media.posts.update", error);
  return NextResponse.json({ post: data as SocialPost });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: existing } = await auth.supabase
    .from("social_posts")
    .select("*")
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const { error } = await auth.supabase
    .from("social_posts")
    .delete()
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id);

  if (error) return databaseErrorResponse("social-media.posts.delete", error);
  return NextResponse.json({ message: "Post deleted." });
}

/** POST duplicate via query ?action=duplicate on PATCH body */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: source } = await auth.supabase
    .from("social_posts")
    .select("*")
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .single();

  if (!source) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const { id: _id, created_at: _c, updated_at: _u, ...rest } = source as SocialPost & { id: string };
  const { data, error } = await auth.supabase
    .from("social_posts")
    .insert({
      ...rest,
      user_id: auth.user!.id,
      title: `${source.title} (copy)`,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) return databaseErrorResponse("social-media.posts.duplicate", error);
  return NextResponse.json({ post: data as SocialPost });
}
