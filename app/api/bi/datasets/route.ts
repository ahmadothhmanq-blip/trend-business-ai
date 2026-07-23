import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listDatasets, createDataset } from "@/lib/bi/datasets";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({ name: z.string().min(1), description: z.string().optional(), dataSourceId: z.string().uuid().optional() });

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listDatasets(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ datasets: [] });
    return databaseErrorResponse("bi.datasets.list", error);
  }
  return NextResponse.json({ datasets: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createDataset(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    description: parsed.data.description,
    data_source_id: parsed.data.dataSourceId ?? null,
  });
  if (error) return databaseErrorResponse("bi.datasets.create", error);
  return NextResponse.json({ dataset: data });
}
