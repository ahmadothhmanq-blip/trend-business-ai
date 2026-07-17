import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/website/build-static-preview";
import { resolveLivePreviewHtml } from "@/lib/website/live-preview";
import type { WebsiteGeneration } from "@/types/database";

export type WebsitePublication = {
  id: string;
  user_id: string;
  generation_id: string;
  project_id: string | null;
  slug: string;
  status: "prepared" | "published" | "unpublished";
  public_path: string;
  planned_public_url: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export function isWebsitePublishEnabled() {
  return process.env.WEBSITE_PUBLISH_ENABLED === "true";
}

export function buildPlannedPublicUrl(slug: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const path = `/w/${slug}`;
  return {
    publicPath: path,
    plannedPublicUrl: siteUrl ? `${siteUrl}${path}` : path,
  };
}

export async function prepareWebsitePublication(args: {
  supabase: SupabaseClient;
  userId: string;
  generation: WebsiteGeneration;
}): Promise<
  | { ok: true; publication: WebsitePublication; htmlBytes: number; publishEnabled: boolean }
  | { ok: false; error: string; status: number }
> {
  const title = args.generation.project_name || "website";
  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${args.generation.id.slice(0, 8)}`;
  const { publicPath, plannedPublicUrl } = buildPlannedPublicUrl(slug);
  const html = resolveLivePreviewHtml(args.generation);
  const publishEnabled = isWebsitePublishEnabled();

  const row = {
    user_id: args.userId,
    generation_id: args.generation.id,
    project_id: args.generation.project_id ?? null,
    slug,
    status: "prepared" as const,
    public_path: publicPath,
    planned_public_url: plannedPublicUrl,
    title,
    preview_html: html,
    published_at: null,
  };

  const { data, error } = await args.supabase
    .from("website_publications")
    .upsert(row, { onConflict: "generation_id" })
    .select("*")
    .single();

  if (error) {
    // Table may not be migrated yet — still return architecture payload.
    if (
      error.code === "42P01" ||
      error.message?.toLowerCase().includes("relation") ||
      error.message?.toLowerCase().includes("does not exist")
    ) {
      return {
        ok: true,
        publishEnabled,
        htmlBytes: html.length,
        publication: {
          id: crypto.randomUUID(),
          user_id: args.userId,
          generation_id: args.generation.id,
          project_id: args.generation.project_id ?? null,
          slug,
          status: "prepared",
          public_path: publicPath,
          planned_public_url: plannedPublicUrl,
          title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at: null,
        },
      };
    }
    return { ok: false, error: error.message, status: 500 };
  }

  return {
    ok: true,
    publishEnabled,
    htmlBytes: html.length,
    publication: data as WebsitePublication,
  };
}
