import type { SupabaseClient } from "@supabase/supabase-js";
import { listCmsEntries } from "@/lib/ai-core/website-management/cms/store";
import { slugify } from "@/lib/website/preview-shared";
import { resolveProductionPublishHtml } from "@/lib/website/public-site.server";
import {
  buildPlannedPublicUrl,
  isWebsitePublishEnabled,
} from "@/lib/website/publish-config";
import type { WebsiteGeneration, WebsitePublication } from "@/types/database";

export type { WebsitePublication };

export type PublishAction = "prepare" | "publish" | "unpublish";

export { buildPlannedPublicUrl, isWebsitePublishEnabled };

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

async function allocationFor(
  generation: WebsiteGeneration,
  supabase?: SupabaseClient,
) {
  const title = generation.project_name || "website";
  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${generation.id.slice(0, 8)}`;
  const { publicPath, plannedPublicUrl } = buildPlannedPublicUrl(slug);
  const absoluteUrl = plannedPublicUrl.startsWith("http")
    ? plannedPublicUrl
    : plannedPublicUrl;
  const cms = supabase
    ? await listCmsEntries(generation.id, supabase)
    : [];
  const produced = resolveProductionPublishHtml(
    generation,
    absoluteUrl,
    cms,
  );
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
  } = await allocationFor(args.generation, args.supabase);
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
