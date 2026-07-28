/**
 * Website Builder API route access — unified ACL for generation-scoped routes.
 */

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse } from "@/lib/i18n/api-errors";
import type { WebsiteGeneration } from "@/types/database";
import { loadWebsiteGenerationForUser } from "@/lib/website/platform/load-generation";
import {
  assertBuilderAccess,
  resolveBuilderAccess,
  type BuilderAccessLevel,
} from "@/lib/website/builder/access";

export type BuilderRouteAction =
  | "view"
  | "edit"
  | "publish"
  | "manage"
  | "invite"
  | "owner";

export type WebsiteGenerationAccess = {
  generation: WebsiteGeneration;
  access: BuilderAccessLevel;
};

function forbiddenResponse(): NextResponse {
  return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403);
}

function notFoundResponse(): NextResponse {
  return apiErrorResponse(API_ERROR_CODES.GENERATION_NOT_FOUND, 404);
}

/**
 * Resolve generation access for Website Builder API routes.
 * Returns a NextResponse on failure, or { generation, access } on success.
 */
export async function requireWebsiteGenerationAccess(
  supabase: SupabaseClient,
  userId: string,
  generationId: string,
  action: BuilderRouteAction,
): Promise<WebsiteGenerationAccess | NextResponse> {
  if (action === "owner") {
    const access = await resolveBuilderAccess(supabase, userId, generationId);
    if (access !== "owner") {
      return access ? forbiddenResponse() : notFoundResponse();
    }
  } else if (action === "view") {
    const access = await resolveBuilderAccess(supabase, userId, generationId);
    if (!access) return notFoundResponse();
  } else {
    const access = await assertBuilderAccess(
      supabase,
      userId,
      generationId,
      action,
    );
    if (!access) return notFoundResponse();
  }

  const generation = await loadWebsiteGenerationForUser(
    supabase,
    userId,
    generationId,
  );
  if (!generation) return notFoundResponse();

  const access = await resolveBuilderAccess(supabase, userId, generationId);
  if (!access) return notFoundResponse();

  return { generation, access };
}
