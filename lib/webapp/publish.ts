/**
 * App Builder public HTML publish helpers.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildPublicAppPath,
  slugifyAppName,
} from "@/lib/ai-core/app-design-platform/deploy";
import {
  sanitizeAppPreviewHtml,
  sanitizeTrustedInteractivePreviewHtml,
} from "@/lib/webapp/sanitize-app-preview-html";

export type WebAppPublicationRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  public_path: string;
  planned_public_url: string | null;
  preview_html: string | null;
};

export async function upsertWebAppPublication(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  appName: string;
  previewHtml: string;
  baseUrl: string;
}): Promise<WebAppPublicationRow> {
  const slug = slugifyAppName(params.appName, params.generationId);
  const publicPath = buildPublicAppPath(slug);
  const plannedPublicUrl = `${params.baseUrl.replace(/\/$/, "")}${publicPath}`;
  const now = new Date().toISOString();
  const previewHtml =
    params.previewHtml.includes('data-preview-trusted="1"') &&
    params.previewHtml.includes("__PREVIEW_RUNTIME__")
      ? sanitizeTrustedInteractivePreviewHtml(params.previewHtml)
      : sanitizeAppPreviewHtml(params.previewHtml);

  const { data: existing } = await params.supabase
    .from("webapp_publications")
    .select("id, slug")
    .eq("generation_id", params.generationId)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await params.supabase
      .from("webapp_publications")
      .update({
        title: params.appName,
        status: "published",
        public_path: publicPath,
        planned_public_url: plannedPublicUrl,
        preview_html: previewHtml,
        published_at: now,
        updated_at: now,
      })
      .eq("id", existing.id)
      .select("id, slug, title, status, public_path, planned_public_url, preview_html")
      .single();
    if (error || !data) {
      throw new Error(error?.message || "Unable to update webapp publication.");
    }
    return data as WebAppPublicationRow;
  }

  const { data, error } = await params.supabase
    .from("webapp_publications")
    .insert({
      user_id: params.userId,
      generation_id: params.generationId,
      slug,
      title: params.appName,
      status: "published",
      public_path: publicPath,
      planned_public_url: plannedPublicUrl,
      preview_html: previewHtml,
      published_at: now,
      updated_at: now,
    })
    .select("id, slug, title, status, public_path, planned_public_url, preview_html")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to create webapp publication.");
  }
  return data as WebAppPublicationRow;
}

export async function getWebAppPublicationByGeneration(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
}): Promise<WebAppPublicationRow | null> {
  const { data, error } = await params.supabase
    .from("webapp_publications")
    .select("id, slug, title, status, public_path, planned_public_url, preview_html")
    .eq("generation_id", params.generationId)
    .eq("user_id", params.userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as WebAppPublicationRow;
}
