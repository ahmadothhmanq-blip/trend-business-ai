import { NextResponse } from "next/server";

/**
 * Safe fallback — auth signup is implemented via `/signup` (server actions),
 * not a dedicated JSON API. Keep this route for probes and mistaken clients.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      implemented: false,
      message: "Use the /signup page to register.",
      redirect: "/signup",
    },
    { status: 200 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      implemented: false,
      error: "JSON signup API is not implemented. Use /signup.",
      redirect: "/signup",
    },
    { status: 501 },
  );
}
