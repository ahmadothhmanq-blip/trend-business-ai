/**
 * Publishing Engine — lifecycle & public URL contracts.
 */

export type PublishingLifecycleStatus =
  | "draft"
  | "published"
  | "updating"
  | "archived";

/** Maps underlying website_publications.status → lifecycle. */
export type PublicationBackendStatus =
  | "none"
  | "prepared"
  | "published"
  | "unpublished";

export type PublishingSummary = {
  generationId: string;
  lifecycleStatus: PublishingLifecycleStatus;
  backendStatus: PublicationBackendStatus;
  slug: string | null;
  publicPath: string | null;
  /** Platform hosted URL e.g. /w/{slug} or absolute. */
  publicUrl: string | null;
  /** username.trendbusiness.ai style URL when available. */
  subdomainUrl: string | null;
  title: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  publishEnabled: boolean;
  sslStatus: "active" | "pending" | "na";
};

export type PublishEngineAction =
  | "prepare"
  | "publish"
  | "unpublish"
  | "archive"
  | "republish";
