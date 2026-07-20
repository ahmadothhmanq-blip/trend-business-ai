import { NextResponse } from "next/server";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET — list stored media for a video generation (from video_media table).
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  try {
    const { data, error } = await auth.supabase
      .from("video_media")
      .select("*")
      .eq("user_id", auth.user!.id)
      .eq("generation_id", parsedId.id)
      .order("created_at", { ascending: false });

    if (error) {
      // Table may not exist yet
      if (
        error.code === "42P01" ||
        (typeof error.message === "string" && error.message.includes("relation"))
      ) {
        return NextResponse.json({
          media: [],
          message: "Apply migration 044_video_studio_media.sql to enable media library.",
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ media: data ?? [] });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.media",
      error,
      "Unable to list media.",
    );
  }
}
