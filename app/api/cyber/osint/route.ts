import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { runOsintQuery, listOsintResults } from "@/lib/cyber/osint";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listOsintResults(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.osint.list", error);
  return NextResponse.json({ results: data ?? [] });
}

const schema = z.object({ query: z.string().min(1), resultType: z.string().default("domain") });

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await runOsintQuery(auth.supabase, auth.user!.id, parsed.data.query, parsed.data.resultType);
  if (error) return databaseErrorResponse("cyber.osint.run", error);
  return NextResponse.json({ result: data });
}
