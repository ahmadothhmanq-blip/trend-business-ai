import { buildPublicVideoEmbedHtml } from "@/lib/ai-core/video-production-platform/publish/html";

export type VideoPublishApiPayload = {
  publicUrl?: string | null;
  publicPath?: string | null;
  publication?: {
    status?: string | null;
    slug?: string | null;
    title?: string | null;
  } | null;
};

export type VideoPublishUiState = {
  published: boolean;
  publicUrl: string | null;
  publicPath: string | null;
  embedHtml: string | null;
};

function absolutePublicUrl(origin: string | undefined, path: string | null, explicit?: string | null): string | null {
  const given = explicit?.trim();
  if (given) return given;
  if (!path) return null;
  if (!origin) return path;
  return `${origin.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function videoPublishUiFromApi(
  payload: VideoPublishApiPayload,
  origin?: string,
): VideoPublishUiState {
  const status = payload.publication?.status || "";
  const published = status === "published";
  const publicPath =
    payload.publicPath?.trim() ||
    (payload.publication?.slug ? `/w/video/${payload.publication.slug}` : null);
  const publicUrl = published
    ? absolutePublicUrl(origin, publicPath, payload.publicUrl)
    : null;
  return {
    published,
    publicUrl,
    publicPath: published ? publicPath : null,
    embedHtml:
      published && publicUrl
        ? buildPublicVideoEmbedHtml(publicUrl, payload.publication?.title || undefined)
        : null,
  };
}
