import { NextResponse } from "next/server";

/**
 * Safe fallback — login is implemented via `/login` (server actions),
 * not a dedicated JSON API. Keep this route for probes and mistaken clients.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      implemented: false,
      message: "Use the /login page to sign in.",
      redirect: "/login",
    },
    { status: 200 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      implemented: false,
      error: "JSON login API is not implemented. Use /login.",
      redirect: "/login",
    },
    { status: 501 },
  );
}
