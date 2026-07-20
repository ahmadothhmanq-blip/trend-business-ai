/**
 * Domain registry — Supabase persistence with in-memory fallback.
 */

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildDnsInstructions } from "@/lib/ai-core/domains/dns";
import {
  findDomainByHostnameDb,
  isDomainsTableMissing,
  listDomainsForGenerationDb,
  getDomainByIdDb,
  upsertDomainDb,
} from "@/lib/ai-core/domains/repository";
import {
  buildSubdomainHostname,
  isPlatformHost,
} from "@/lib/ai-core/domains/subdomain";
import { validateCustomHostname } from "@/lib/ai-core/domains/validate";
import type {
  AddDomainInput,
  DomainStatus,
  SslCertificateStatus,
  WebsiteDomain,
} from "@/lib/ai-core/domains/types";

type StoreState = {
  domains: WebsiteDomain[];
};

const globalStore = globalThis as typeof globalThis & {
  __tbaWebsiteDomains?: StoreState;
};

function getState(): StoreState {
  if (!globalStore.__tbaWebsiteDomains) {
    globalStore.__tbaWebsiteDomains = { domains: [] };
  }
  return globalStore.__tbaWebsiteDomains;
}

function nowIso() {
  return new Date().toISOString();
}

function token() {
  return `tba-verify-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function newDomainId() {
  return randomUUID();
}

export async function listDomainsForGeneration(
  generationId: string,
  client?: SupabaseClient | null,
): Promise<WebsiteDomain[]> {
  if (client) {
    const rows = await listDomainsForGenerationDb(client, generationId);
    const { error } = await client
      .from("website_domains")
      .select("id")
      .eq("generation_id", generationId)
      .limit(1);
    if (!isDomainsTableMissing(error)) return rows;
  }
  return getState()
    .domains.filter(
      (d) => d.generationId === generationId && d.status !== "removed",
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listDomainsForUser(
  userId: string,
  client?: SupabaseClient | null,
): Promise<WebsiteDomain[]> {
  if (client) {
    const { data, error } = await client
      .from("website_domains")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "removed");
    if (!error && data) {
      const { rowToDomain } = await import("@/lib/ai-core/domains/repository");
      return data.map((row) => rowToDomain(row as never));
    }
  }
  return getState().domains.filter(
    (d) => d.userId === userId && d.status !== "removed",
  );
}

export async function getDomainById(
  domainId: string,
  client?: SupabaseClient | null,
): Promise<WebsiteDomain | null> {
  if (client) {
    const row = await getDomainByIdDb(client, domainId);
    if (row) return row;
  }
  return getState().domains.find((d) => d.id === domainId) ?? null;
}

export async function findActiveDomainByHostname(
  hostname: string,
  client?: SupabaseClient | null,
): Promise<WebsiteDomain | null> {
  if (client) {
    const row = await findDomainByHostnameDb(client, hostname, true);
    if (row) return row;
  }
  const h = hostname.toLowerCase();
  return (
    getState().domains.find(
      (d) => d.hostname === h && d.status === "active",
    ) ?? null
  );
}

export async function findDomainByHostnameAny(
  hostname: string,
  client?: SupabaseClient | null,
): Promise<WebsiteDomain | null> {
  if (client) {
    const row = await findDomainByHostnameDb(client, hostname, false);
    if (row) return row;
  }
  const h = hostname.toLowerCase();
  return (
    getState().domains.find(
      (d) => d.hostname === h && d.status !== "removed",
    ) ?? null
  );
}

export async function addCustomDomain(
  input: AddDomainInput,
  client?: SupabaseClient | null,
): Promise<WebsiteDomain> {
  const validated = validateCustomHostname(input.hostname);
  if (!validated.ok) {
    throw new Error(validated.error);
  }
  if (isPlatformHost(validated.hostname)) {
    throw new Error("Cannot connect a platform hostname as a custom domain.");
  }

  const existing = await findDomainByHostnameAny(validated.hostname, client);
  if (existing && existing.userId !== input.userId) {
    throw new Error("This domain is already connected to another account.");
  }
  if (existing && existing.generationId !== input.generationId) {
    throw new Error(
      "This domain is already connected to another website in your account.",
    );
  }
  if (existing && existing.generationId === input.generationId) {
    return existing;
  }

  const verificationToken = token();
  const domain: WebsiteDomain = {
    id: newDomainId(),
    userId: input.userId,
    generationId: input.generationId,
    publicationId: input.publicationId ?? null,
    slug: input.slug ?? null,
    hostname: validated.hostname,
    kind: "custom",
    status: "pending_dns",
    verificationToken,
    verifiedAt: null,
    sslStatus: "not_started",
    dnsInstructions: buildDnsInstructions({
      hostname: validated.hostname,
      verificationToken,
    }),
    lastCheckedAt: null,
    lastCheckMessage: "Add the DNS records below, then click Verify.",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  if (client) {
    const persisted = await upsertDomainDb(client, domain);
    if (persisted) return persisted;
  }

  getState().domains.unshift(domain);
  return domain;
}

export async function ensurePlatformSubdomain(
  params: {
    userId: string;
    generationId: string;
    handle: string;
    publicationId?: string | null;
    slug?: string | null;
  },
  client?: SupabaseClient | null,
): Promise<WebsiteDomain | null> {
  const hostname = buildSubdomainHostname(params.handle);
  if (!hostname) return null;

  const existingList = await listDomainsForGeneration(params.generationId, client);
  const existing = existingList.find(
    (d) => d.kind === "subdomain" && d.status !== "removed",
  );
  if (existing) {
    if (params.slug) existing.slug = params.slug;
    if (params.publicationId) existing.publicationId = params.publicationId;
    if (client) await upsertDomainDb(client, existing);
    return existing;
  }

  const domain: WebsiteDomain = {
    id: newDomainId(),
    userId: params.userId,
    generationId: params.generationId,
    publicationId: params.publicationId ?? null,
    slug: params.slug ?? null,
    hostname,
    kind: "subdomain",
    status: "active",
    verificationToken: "platform-subdomain",
    verifiedAt: nowIso(),
    sslStatus: "active",
    dnsInstructions: [],
    lastCheckedAt: nowIso(),
    lastCheckMessage: "Platform subdomain is ready when the site is published.",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  if (client) {
    const persisted = await upsertDomainDb(client, domain);
    if (persisted) return persisted;
  }

  getState().domains.unshift(domain);
  return domain;
}

export async function removeDomain(
  params: { domainId: string; userId: string },
  client?: SupabaseClient | null,
): Promise<WebsiteDomain> {
  const domain = await getDomainById(params.domainId, client);
  if (!domain || domain.userId !== params.userId) {
    throw new Error("Domain not found.");
  }
  domain.status = "removed";
  domain.updatedAt = nowIso();

  if (client) {
    const persisted = await upsertDomainDb(client, domain);
    if (persisted) return persisted;
  }

  return domain;
}

export async function updateDomainCheck(
  params: {
    domainId: string;
    status: DomainStatus;
    sslStatus?: SslCertificateStatus;
    message: string;
    verified?: boolean;
  },
  client?: SupabaseClient | null,
): Promise<WebsiteDomain> {
  const domain = await getDomainById(params.domainId, client);
  if (!domain) throw new Error("Domain not found.");
  domain.status = params.status;
  if (params.sslStatus) domain.sslStatus = params.sslStatus;
  domain.lastCheckedAt = nowIso();
  domain.lastCheckMessage = params.message;
  if (params.verified) domain.verifiedAt = nowIso();
  domain.updatedAt = nowIso();

  if (client) {
    const persisted = await upsertDomainDb(client, domain);
    if (persisted) return persisted;
  }

  return domain;
}
