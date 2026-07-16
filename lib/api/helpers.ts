import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { supabase, user, response: null };
}

export async function parseJsonBody<T>(request: Request): Promise<T | NextResponse> {
  try {
    return (await request.json()) as T;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export function safeRedirectPath(path: string | null | undefined, fallback = "/dashboard"): string {
  if (!path) return fallback;

  // Decode once to catch encoded bypasses, then reject absolute/protocol-relative URLs.
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return fallback;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    decoded.includes("@") ||
    decoded.includes("\0") ||
    decoded.includes("\r") ||
    decoded.includes("\n") ||
    /^\/[a-z][a-z0-9+.-]*:/i.test(decoded)
  ) {
    return fallback;
  }

  // Allow only relative app paths with safe characters.
  if (!/^\/[A-Za-z0-9._~/?#&=+\-[\]%]*$/.test(decoded)) {
    return fallback;
  }

  return decoded;
}

export function parseUuidParam(
  id: string,
  label = "id",
): { id: string } | NextResponse {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: `Invalid ${label}.` }, { status: 400 });
  }
  return { id: parsed.data };
}

export function paginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10) || 10));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}
