/**
 * Workspace / generation ownership helpers (Phase 10).
 * Reinforces user_id scoping used across product APIs.
 */

import { NextResponse } from "next/server";

/** Ensure a row loaded from the DB belongs to the authenticated user. */
export function assertUserOwnsResource(params: {
  userId: string;
  ownerId: string | null | undefined;
  label?: string;
}): NextResponse | null {
  if (!params.ownerId || params.ownerId !== params.userId) {
    return NextResponse.json(
      { error: params.label ? `${params.label} not found.` : "Not found." },
      { status: 404 },
    );
  }
  return null;
}

/** Standard filter object for Supabase queries owned by the user. */
export function ownedByUser(userId: string) {
  return { user_id: userId } as const;
}
