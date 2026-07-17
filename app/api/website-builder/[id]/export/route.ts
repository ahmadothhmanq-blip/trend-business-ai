import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { buildProjectZip } from "@/lib/ai/zipper";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function extractFiles(generation: WebsiteGeneration): GeneratedProjectFile[] {
  const blueprint = generation.blueprint as unknown as {
    files?: GeneratedProjectFile[];
  } | null;
  const files = Array.isArray(blueprint?.files) ? blueprint.files : [];
  return files.filter(
    (file) =>
      file &&
      typeof file.path === "string" &&
      typeof file.content === "string" &&
      file.path.trim().length > 0,
  );
}

function safeFilename(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "website-project"}.zip`;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const generation = data as WebsiteGeneration;
  const files = extractFiles(generation);

  if (files.length === 0) {
    return NextResponse.json(
      {
        error:
          "This project has no downloadable source files yet. Open it in Website Builder and regenerate if needed.",
      },
      { status: 409 },
    );
  }

  const zipBytes = await buildProjectZip(files);
  const filename = safeFilename(generation.project_name || "website-project");

  return new Response(Buffer.from(zipBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
