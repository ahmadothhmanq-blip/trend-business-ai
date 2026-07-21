import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { queuePostSchedule } from "@/lib/social-media/publishing";
import type { SocialSchedule } from "@/types/social-media";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  postId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  timezone: z.string().default("UTC"),
  accountId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");

  let query = auth.supabase
    .from("social_schedules")
    .select("*, social_posts(platform, title, caption, status)")
    .eq("user_id", auth.user!.id)
    .order("scheduled_at", { ascending: true });

  if (from) query = query.gte("scheduled_at", from);
  if (to) query = query.lte("scheduled_at", to);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ schedules: [] });
    return databaseErrorResponse("social-media.schedules.list", error);
  }

  return NextResponse.json({ schedules: data as SocialSchedule[] });
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

  const { data: post } = await auth.supabase
    .from("social_posts")
    .select("id")
    .eq("id", parsed.data.postId)
    .eq("user_id", auth.user!.id)
    .single();

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const { data, error } = await queuePostSchedule(auth.supabase, {
    userId: auth.user!.id,
    postId: parsed.data.postId,
    scheduledAt: parsed.data.scheduledAt,
    timezone: parsed.data.timezone,
    accountId: parsed.data.accountId,
  });

  if (error) return databaseErrorResponse("social-media.schedules.insert", error);
  return NextResponse.json({ schedule: data as SocialSchedule });
}
