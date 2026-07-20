/**
 * Backend builder — CRUD APIs, auth, Supabase integration sketches.
 */

import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { toPrismaSchemaSketch } from "@/lib/ai-core/app-design-platform/data";

export type BackendProvisionResult = {
  files: GeneratedProjectFile[];
  apiRoutes: string[];
  notes: string[];
};

function upsert(files: GeneratedProjectFile[], path: string, content: string, language = "typescript") {
  const norm = path.replaceAll("\\", "/");
  const idx = files.findIndex((f) => f.path.replaceAll("\\", "/") === norm);
  const entry = { path: norm, content, language };
  if (idx >= 0) return files.map((f, i) => (i === idx ? entry : f));
  return [...files, entry];
}

export function generateSupabaseClientFile(): string {
  return `import { createClient } from "@supabase/supabase-js";

export function createAppSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}
`;
}

export function generateAuthMiddleware(): string {
  return `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("app_session")?.value;
  if (!token && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };
`;
}

export function generateCrudApiRoute(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `import { NextResponse } from "next/server";
import { createAppSupabaseClient } from "@/lib/supabase-client";

export async function GET() {
  const supabase = createAppSupabaseClient();
  const { data, error } = await supabase.from("${lower}s").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createAppSupabaseClient();
  const { data, error } = await supabase.from("${lower}s").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
`;
}

export function provisionAppBackend(
  model: StructuredAppModel,
  files: GeneratedProjectFile[] = [],
): BackendProvisionResult {
  let next = [...files];
  const apiRoutes: string[] = [];
  const notes: string[] = [];

  next = upsert(next, "lib/supabase-client.ts", generateSupabaseClientFile());
  next = upsert(next, "middleware.ts", generateAuthMiddleware());
  next = upsert(next, "prisma/schema.prisma", toPrismaSchemaSketch(model), "prisma");

  for (const dm of model.dataModels) {
    const route = `app/api/${dm.name.toLowerCase()}s/route.ts`;
    next = upsert(next, route, generateCrudApiRoute(dm.name));
    apiRoutes.push(route);
  }

  const rolesFile = `export const APP_ROLES = ${JSON.stringify(model.roles, null, 2)} as const;\n`;
  next = upsert(next, "lib/roles.ts", rolesFile);

  notes.push(`Provisioned ${apiRoutes.length} CRUD routes, auth middleware, Supabase client.`);

  return { files: next, apiRoutes, notes };
}
