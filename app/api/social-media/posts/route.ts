import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import type { SocialPost } from "@/types/social-media";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  platform: z.enum(["facebook", "instagram", "linkedin", "x", "tiktok"]),
  title: z.string().trim().default("Untitled Post"),
  postText: z.string().default(""),
  caption: z.string().default(""),
  hashtags: z.array(z.string()).default([]),
  cta: z.string().default(""),
  contentAngle: z.string().default(""),
  tone: z.string().default("Professional"),
  language: z.string().default("English"),
  recommendedPostTime: z.string().default(""),
  campaignId: z.string().uuid().optional(),
  brandIdentityId: z.string().uuid().optional(),
  templateId: z.string().optional(),
  status: z.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
  mediaUrl: z.string().optional(),
  mediaWidth: z.number().int().optional(),
  mediaHeight: z.number().int().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const campaignId = searchParams.get("campaignId");

  let query = auth.supabase
    .from("social_posts")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("updated_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(["title", "post_text", "caption"], search);
  if (orFilter) query = query.or(orFilter);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (status) query = query.eq("status", status);
  if (platform) query = query.eq("platform", platform);
  if (campaignId) query = query.eq("campaign_id", campaignId);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    if (/relation/i.test(error.message ?? "")) {
      return NextResponse.json({ posts: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("social-media.posts.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({
    posts: data as SocialPost[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const { data, error } = await auth.supabase
    .from("social_posts")
    .insert({
      user_id: auth.user!.id,
      platform: input.platform,
      title: input.title,
      post_text: input.postText,
      caption: input.caption,
      hashtags: input.hashtags,
      cta: input.cta,
      content_angle: input.contentAngle,
      tone: input.tone,
      language: input.language,
      recommended_post_time: input.recommendedPostTime,
      campaign_id: input.campaignId ?? null,
      brand_identity_id: input.brandIdentityId ?? null,
      template_id: input.templateId ?? null,
      status: input.status,
      media_url: input.mediaUrl ?? null,
      media_width: input.mediaWidth ?? null,
      media_height: input.mediaHeight ?? null,
    })
    .select("*")
    .single();

  if (error) return databaseErrorResponse("social-media.posts.insert", error);
  return NextResponse.json({ post: data as SocialPost });
}
