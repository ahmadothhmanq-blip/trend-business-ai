/**
 * Publishing Engine facade — wraps lib/website/publish without replacing it.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { WebsiteGeneration } from "@/types/database";
import {
  buildPlannedPublicUrl,
  isWebsitePublishEnabled,
  prepareWebsitePublication,
  publishWebsitePublication,
  unpublishWebsitePublication,
  type WebsitePublication,
} from "@/lib/website/publish";
import type {
  PublicationBackendStatus,
  PublishingLifecycleStatus,
  PublishingSummary,
} from "@/lib/ai-core/publishing/types";
import { buildSubdomainUrl } from "@/lib/ai-core/domains/subdomain";

export function mapLifecycleStatus(
  backend: PublicationBackendStatus,
  opts?: { updating?: boolean },
): PublishingLifecycleStatus {
  if (opts?.updating) return "updating";
  if (backend === "published") return "published";
  if (backend === "unpublished") return "archived";
  if (backend === "prepared") return "draft";
  return "draft";
}

export function buildPublishingSummary(params: {
  generationId: string;
  publication?: WebsitePublication | null;
  userHandle?: string | null;
  updating?: boolean;
}): PublishingSummary {
  const pub = params.publication;
  const backend: PublicationBackendStatus = pub?.status || "none";
  const lifecycleStatus = mapLifecycleStatus(backend, {
    updating: params.updating,
  });

  const publicUrl =
    pub?.planned_public_url ||
    (pub?.slug ? buildPlannedPublicUrl(pub.slug).plannedPublicUrl : null);

  return {
    generationId: params.generationId,
    lifecycleStatus,
    backendStatus: backend,
    slug: pub?.slug ?? null,
    publicPath: pub?.public_path ?? null,
    publicUrl,
    subdomainUrl: buildSubdomainUrl(params.userHandle || null),
    title: pub?.title ?? null,
    publishedAt: pub?.published_at ?? null,
    updatedAt: pub?.updated_at ?? null,
    publishEnabled: isWebsitePublishEnabled(),
    sslStatus:
      backend === "published"
        ? "active"
        : backend === "prepared"
          ? "pending"
          : "na",
  };
}

export async function getPublicationForGeneration(args: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
}): Promise<WebsitePublication | null> {
  const { data, error } = await args.supabase
    .from("website_publications")
    .select("*")
    .eq("generation_id", args.generationId)
    .eq("user_id", args.userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as WebsitePublication;
}

export async function runPublishingAction(args: {
  supabase: SupabaseClient;
  userId: string;
  generation: WebsiteGeneration;
  action: "prepare" | "publish" | "unpublish" | "archive" | "republish";
  userHandle?: string | null;
}) {
  const action =
    args.action === "archive"
      ? "unpublish"
      : args.action === "republish"
        ? "publish"
        : args.action;

  if (action === "prepare") {
    const result = await prepareWebsitePublication({
      supabase: args.supabase,
      userId: args.userId,
      generation: args.generation,
    });
    if (!result.ok) return result;
    return {
      ok: true as const,
      publication: result.publication,
      htmlBytes: result.htmlBytes,
      publishEnabled: result.publishEnabled,
      summary: buildPublishingSummary({
        generationId: args.generation.id,
        publication: result.publication,
        userHandle: args.userHandle,
      }),
    };
  }

  if (action === "publish") {
    const result = await publishWebsitePublication({
      supabase: args.supabase,
      userId: args.userId,
      generation: args.generation,
    });
    if (!result.ok) return result;
    return {
      ok: true as const,
      publication: result.publication,
      htmlBytes: result.htmlBytes,
      publishEnabled: result.publishEnabled,
      publicUrl: result.publicUrl,
      summary: buildPublishingSummary({
        generationId: args.generation.id,
        publication: result.publication,
        userHandle: args.userHandle,
      }),
    };
  }

  const result = await unpublishWebsitePublication({
    supabase: args.supabase,
    userId: args.userId,
    generationId: args.generation.id,
  });
  if (!result.ok) return result;
  return {
    ok: true as const,
    publication: result.publication,
    summary: buildPublishingSummary({
      generationId: args.generation.id,
      publication: result.publication,
      userHandle: args.userHandle,
    }),
  };
}

export { isWebsitePublishEnabled, buildPlannedPublicUrl };
