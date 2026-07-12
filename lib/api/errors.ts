import { NextResponse } from "next/server";

export function logApiError(context: string, error: unknown) {
  const detail =
    error instanceof Error
      ? (error.stack ?? error.message)
      : JSON.stringify(error, null, 2);
  console.error(`[api:${context}]`, detail);
}

export function databaseErrorResponse(context: string, error: unknown) {
  logApiError(context, error);
  return NextResponse.json({ error: "A database error occurred." }, { status: 500 });
}

export function notFoundResponse(message = "Resource not found.") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverErrorResponse(context: string, error: unknown, message = "An unexpected error occurred.") {
  logApiError(context, error);
  return NextResponse.json({ error: message }, { status: 500 });
}
