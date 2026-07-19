import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/website/build-static-preview";
import { resolveProductionPublishHtml } from "@/lib/website/public-site";
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
  seo_json?: unknown;
  robots_txt?: string | null;
  sitemap_xml?: string | null;
};

export type PublishAction = "prepare" | "publish" | "unpublish";

/** Public hosting ON unless explicitly disabled with WEBSITE_PUBLISH_ENABLED=false. */
export function isWebsitePublishEnabled() {
  return process.env.WEBSITE_PUBLISH_ENABLED !== "false";
}

export function buildPlannedPublicUrl(slug: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const path = `/w/${slug}`;
  return {
    publicPath: path,
    plannedPublicUrl: siteUrl ? `${siteUrl}${path}` : path,
  };
}

function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("relation") ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42703" ||
    msg.includes("seo_json") ||
    msg.includes("robots_txt") ||
    msg.includes("sitemap_xml") ||
    (msg.includes("column") && msg.includes("does not exist"))
  );
}

function allocationFor(generation: WebsiteGeneration) {
  const title = generation.project_name || "website";
  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${generation.id.slice(0, 8)}`;
  const { publicPath, plannedPublicUrl } = buildPlannedPublicUrl(slug);
  // Prefer absolute public URL when NEXT_PUBLIC_SITE_URL is set; else path-based.
  const absoluteUrl = plannedPublicUrl.startsWith("http")
    ? plannedPublicUrl
    : plannedPublicUrl;
  const produced = resolveProductionPublishHtml(generation, absoluteUrl);
  return {
    title,
    slug,
    publicPath,
    plannedPublicUrl,
    html: produced.html,
    robotsTxt: produced.robotsTxt,
    sitemapXml: produced.sitemapXml,
    seoJson: produced.seoPackage,
  };
}

async function upsertPublication(args: {
  supabase: SupabaseClient;
  userId: string;
  generation: WebsiteGeneration;
  status: WebsitePublication["status"];
}): Promise<
  | { ok: true; publication: WebsitePublication; htmlBytes: number }
  | { ok: false; error: string; status: number }
> {
  const {
    title,
    slug,
    publicPath,
    plannedPublicUrl,
    html,
    robotsTxt,
    sitemapXml,
    seoJson,
  } = allocationFor(args.generation);
  const now = new Date().toISOString();

  const baseRow = {
    user_id: args.userId,
    generation_id: args.generation.id,
    project_id: args.generation.project_id ?? null,
    slug,
    status: args.status,
    public_path: publicPath,
    planned_public_url: plannedPublicUrl,
    title,
    preview_html: html,
    published_at: args.status === "published" ? now : null,
    updated_at: now,
  };

  const withSeoRow = {
    ...baseRow,
    seo_json: seoJson,
    robots_txt: robotsTxt,
    sitemap_xml: sitemapXml,
  };

  let { data, error } = await args.supabase
    .from("website_publications")
    .upsert(withSeoRow, { onConflict: "generation_id" })
    .select("*")
    .single();

  // Graceful fallback before migration 039 is applied.
  if (error && isMissingColumnError(error)) {
    const retry = await args.supabase
      .from("website_publications")
      .upsert(baseRow, { onConflict: "generation_id" })
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    if (isMissingTableError(error)) {
      return {
        ok: false,
        error:
          "website_publications table missing. Apply migration 031: npm run db:apply -- --only 031",
        status: 503,
      };
    }
    return { ok: false, error: error.message, status: 500 };
  }

  return {
    ok: true,
    htmlBytes: html.length,
    publication: data as WebsitePublication,
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
  const result = await upsertPublication({
    ...args,
    status: "prepared",
  });
  if (!result.ok) return result;
  return { ...result, publishEnabled: isWebsitePublishEnabled() };
}

export async function publishWebsitePublication(args: {
  supabase: SupabaseClient;
  userId: string;
  generation: WebsiteGeneration;
}): Promise<
  | {
      ok: true;
      publication: WebsitePublication;
      htmlBytes: number;
      publishEnabled: boolean;
      publicUrl: string;
    }
  | { ok: false; error: string; status: number }
> {
  if (!isWebsitePublishEnabled()) {
    return {
      ok: false,
      error:
        "Public publishing is disabled. Unset WEBSITE_PUBLISH_ENABLED or set it to true.",
      status: 503,
    };
  }

  const result = await upsertPublication({
    ...args,
    status: "published",
  });
  if (!result.ok) return result;

  return {
    ok: true,
    publication: result.publication,
    htmlBytes: result.htmlBytes,
    publishEnabled: true,
    publicUrl:
      result.publication.planned_public_url || result.publication.public_path,
  };
}

export async function unpublishWebsitePublication(args: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
}): Promise<
  | { ok: true; publication: WebsitePublication }
  | { ok: false; error: string; status: number }
> {
  const now = new Date().toISOString();
  const { data, error } = await args.supabase
    .from("website_publications")
    .update({
      status: "unpublished",
      published_at: null,
      updated_at: now,
    })
    .eq("generation_id", args.generationId)
    .eq("user_id", args.userId)
    .select("*")
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      return {
        ok: false,
        error:
          "website_publications table missing. Apply migration 031: npm run db:apply -- --only 031",
        status: 503,
      };
    }
    return { ok: false, error: error.message, status: 500 };
  }

  if (!data) {
    return { ok: false, error: "No publication found for this website.", status: 404 };
  }

  return { ok: true, publication: data as WebsitePublication };
}
