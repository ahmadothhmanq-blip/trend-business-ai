/**
 * In-process domain registry (seed-ready for Supabase migration 042).
 */

import { buildDnsInstructions } from "@/lib/ai-core/domains/dns";
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

function id() {
  return `dom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listDomainsForGeneration(generationId: string): WebsiteDomain[] {
  return getState()
    .domains.filter(
      (d) => d.generationId === generationId && d.status !== "removed",
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listDomainsForUser(userId: string): WebsiteDomain[] {
  return getState().domains.filter(
    (d) => d.userId === userId && d.status !== "removed",
  );
}

export function getDomainById(domainId: string): WebsiteDomain | null {
  return getState().domains.find((d) => d.id === domainId) ?? null;
}

export function findActiveDomainByHostname(
  hostname: string,
): WebsiteDomain | null {
  const h = hostname.toLowerCase();
  return (
    getState().domains.find(
      (d) => d.hostname === h && d.status === "active",
    ) ?? null
  );
}

export function findDomainByHostnameAny(hostname: string): WebsiteDomain | null {
  const h = hostname.toLowerCase();
  return (
    getState().domains.find(
      (d) => d.hostname === h && d.status !== "removed",
    ) ?? null
  );
}

export function addCustomDomain(input: AddDomainInput): WebsiteDomain {
  const validated = validateCustomHostname(input.hostname);
  if (!validated.ok) {
    throw new Error(validated.error);
  }
  if (isPlatformHost(validated.hostname)) {
    throw new Error("Cannot connect a platform hostname as a custom domain.");
  }

  const existing = findDomainByHostnameAny(validated.hostname);
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
    id: id(),
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

  getState().domains.unshift(domain);
  return domain;
}

export function ensurePlatformSubdomain(params: {
  userId: string;
  generationId: string;
  handle: string;
  publicationId?: string | null;
  slug?: string | null;
}): WebsiteDomain | null {
  const hostname = buildSubdomainHostname(params.handle);
  if (!hostname) return null;

  const existing = getState().domains.find(
    (d) =>
      d.generationId === params.generationId &&
      d.kind === "subdomain" &&
      d.status !== "removed",
  );
  if (existing) {
    if (params.slug) existing.slug = params.slug;
    if (params.publicationId) existing.publicationId = params.publicationId;
    return existing;
  }

  const domain: WebsiteDomain = {
    id: id(),
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
  getState().domains.unshift(domain);
  return domain;
}

export function removeDomain(params: {
  domainId: string;
  userId: string;
}): WebsiteDomain {
  const domain = getDomainById(params.domainId);
  if (!domain || domain.userId !== params.userId) {
    throw new Error("Domain not found.");
  }
  domain.status = "removed";
  domain.updatedAt = nowIso();
  return domain;
}

export function updateDomainCheck(params: {
  domainId: string;
  status: DomainStatus;
  sslStatus?: SslCertificateStatus;
  message: string;
  verified?: boolean;
}): WebsiteDomain {
  const domain = getDomainById(params.domainId);
  if (!domain) throw new Error("Domain not found.");
  domain.status = params.status;
  if (params.sslStatus) domain.sslStatus = params.sslStatus;
  domain.lastCheckedAt = nowIso();
  domain.lastCheckMessage = params.message;
  if (params.verified) domain.verifiedAt = nowIso();
  domain.updatedAt = nowIso();
  return domain;
}
