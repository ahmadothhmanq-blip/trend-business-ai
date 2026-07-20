/**
 * Resolve custom / subdomain hosts to publication slugs for edge rewrites.
 */

import { findActiveDomainByHostname } from "@/lib/ai-core/domains/store";
import { isPlatformHost } from "@/lib/ai-core/domains/subdomain";

export type HostResolution = {
  hostname: string;
  generationId: string;
  slug: string;
  domainId: string;
};

/**
 * Map an incoming Host header to a published site slug when configured.
 */
export async function resolveHostToSlug(
  hostnameRaw: string,
): Promise<HostResolution | null> {
  const hostname = hostnameRaw.toLowerCase().split(":")[0] || "";
  if (!hostname) return null;

  const domain = await findActiveDomainByHostname(hostname);
  if (domain?.slug) {
    return {
      hostname,
      generationId: domain.generationId,
      slug: domain.slug,
      domainId: domain.id,
    };
  }

  if (isPlatformHost(hostname)) return null;
  return null;
}
