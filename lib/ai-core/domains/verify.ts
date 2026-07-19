/**
 * Domain verification — DNS readiness checks + SSL status progression.
 */

import { promises as dns } from "node:dns";
import {
  getDomainById,
  updateDomainCheck,
} from "@/lib/ai-core/domains/store";
import { getCnameTarget } from "@/lib/ai-core/domains/subdomain";
import type { WebsiteDomain } from "@/lib/ai-core/domains/types";

async function lookupTxt(hostname: string): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(hostname);
    return records.map((parts) => parts.join(""));
  } catch {
    return [];
  }
}

async function lookupCname(hostname: string): Promise<string[]> {
  try {
    return await dns.resolveCname(hostname);
  } catch {
    return [];
  }
}

/**
 * Verify domain ownership / DNS. Uses live DNS when available;
 * falls back to controlled simulation for local/dev readiness.
 */
export async function verifyWebsiteDomain(params: {
  domainId: string;
  userId: string;
  /** Force success after user confirms DNS (dev / staging). */
  forceSimulate?: boolean;
}): Promise<WebsiteDomain> {
  const domain = getDomainById(params.domainId);
  if (!domain || domain.userId !== params.userId) {
    throw new Error("Domain not found.");
  }
  if (domain.kind === "subdomain") {
    return updateDomainCheck({
      domainId: domain.id,
      status: "active",
      sslStatus: "active",
      message: "Platform subdomain is active.",
      verified: true,
    });
  }

  updateDomainCheck({
    domainId: domain.id,
    status: "verifying",
    sslStatus: "pending",
    message: "Checking DNS records…",
  });

  const labels = domain.hostname.split(".");
  const apex = labels.slice(-2).join(".");
  const txtHostLabel =
    domain.dnsInstructions.find((r) => r.type === "TXT")?.host || "_tba-verify";
  const txtFqdn =
    txtHostLabel === "_tba-verify"
      ? `_tba-verify.${apex}`
      : txtHostLabel.includes(".")
        ? `${txtHostLabel}.${apex}`
        : `${txtHostLabel}.${apex}`;

  const txtValues = await lookupTxt(txtFqdn);
  const tokenFound = txtValues.some((v) =>
    v.includes(domain.verificationToken),
  );

  const cnameHost = domain.dnsInstructions.find((r) => r.type === "CNAME");
  let cnameOk = false;
  if (cnameHost) {
    const cnameFqdn =
      cnameHost.host === "www"
        ? `www.${apex}`
        : cnameHost.host.includes(".")
          ? cnameHost.host
          : `${cnameHost.host}.${apex}`;
    const cnames = await lookupCname(cnameFqdn);
    const target = getCnameTarget().toLowerCase();
    cnameOk = cnames.some(
      (c) => c.replace(/\.$/, "").toLowerCase() === target,
    );
  }

  if (tokenFound || (params.forceSimulate && process.env.NODE_ENV !== "production")) {
    return updateDomainCheck({
      domainId: domain.id,
      status: "active",
      sslStatus: "active",
      message: tokenFound
        ? `Verified TXT record${cnameOk ? " and CNAME" : ""}. SSL certificate ready.`
        : "Simulated verification (non-production). SSL marked ready — confirm DNS before go-live.",
      verified: true,
    });
  }

  if (cnameOk && !tokenFound) {
    return updateDomainCheck({
      domainId: domain.id,
      status: "pending_dns",
      sslStatus: "pending",
      message: `CNAME looks good. Still waiting for TXT verification at ${txtFqdn}.`,
    });
  }

  return updateDomainCheck({
    domainId: domain.id,
    status: "failed",
    sslStatus: "pending",
    message: `DNS not detected yet. Ensure TXT ${domain.verificationToken} is published, then retry.`,
  });
}
