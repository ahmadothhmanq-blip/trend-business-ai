import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: assets, error } = await auth.supabase
    .from("design_assets")
    .select("*")
    .eq("generation_id", id)
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ assets: [], message: "Apply migration 054." });
    }
    return databaseErrorResponse("image-generator.assets", error);
  }

  const { data: versions } = await auth.supabase
    .from("design_generations")
    .select("id, version, status, provider, created_at")
    .eq("image_generation_id", id)
    .eq("user_id", auth.user!.id)
    .order("version", { ascending: false });

  return NextResponse.json({ assets: assets ?? [], versions: versions ?? [] });
}
