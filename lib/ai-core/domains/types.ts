/**
 * Custom Domain System — verification, DNS, SSL readiness.
 */

export type DomainKind = "subdomain" | "custom";

export type DomainStatus =
  | "pending_dns"
  | "verifying"
  | "active"
  | "failed"
  | "removed";

export type SslCertificateStatus =
  | "not_started"
  | "pending"
  | "provisioning"
  | "active"
  | "error";

export type DnsRecordInstruction = {
  type: "CNAME" | "A" | "TXT";
  host: string;
  value: string;
  ttl: string;
  purpose: string;
};

export type WebsiteDomain = {
  id: string;
  userId: string;
  generationId: string;
  publicationId?: string | null;
  /** Public /w/{slug} path segment for host rewrites. */
  slug?: string | null;
  hostname: string;
  kind: DomainKind;
  status: DomainStatus;
  verificationToken: string;
  verifiedAt?: string | null;
  sslStatus: SslCertificateStatus;
  dnsInstructions: DnsRecordInstruction[];
  lastCheckedAt?: string | null;
  lastCheckMessage?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AddDomainInput = {
  userId: string;
  generationId: string;
  hostname: string;
  publicationId?: string | null;
  slug?: string | null;
};
