export type {
  DomainKind,
  DomainStatus,
  SslCertificateStatus,
  DnsRecordInstruction,
  WebsiteDomain,
  AddDomainInput,
} from "@/lib/ai-core/domains/types";

export {
  normalizeHostname,
  validateCustomHostname,
} from "@/lib/ai-core/domains/validate";

export { buildDnsInstructions } from "@/lib/ai-core/domains/dns";

export {
  getSitesHost,
  getCnameTarget,
  getARecordTarget,
  normalizeSubdomainHandle,
  buildSubdomainHostname,
  buildSubdomainUrl,
  listPlatformHosts,
  isPlatformHost,
} from "@/lib/ai-core/domains/subdomain";

export {
  listDomainsForGeneration,
  listDomainsForUser,
  getDomainById,
  findActiveDomainByHostname,
  findDomainByHostnameAny,
  addCustomDomain,
  ensurePlatformSubdomain,
  removeDomain,
  updateDomainCheck,
} from "@/lib/ai-core/domains/store";

export { verifyWebsiteDomain } from "@/lib/ai-core/domains/verify";

export {
  resolveHostToSlug,
  type HostResolution,
} from "@/lib/ai-core/domains/resolve";
