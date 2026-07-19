/**
 * DNS instruction builders for custom domain connection.
 */

import {
  getARecordTarget,
  getCnameTarget,
} from "@/lib/ai-core/domains/subdomain";
import type { DnsRecordInstruction } from "@/lib/ai-core/domains/types";

export function buildDnsInstructions(params: {
  hostname: string;
  verificationToken: string;
}): DnsRecordInstruction[] {
  const { hostname, verificationToken } = params;
  const labels = hostname.split(".");
  const isApex = labels.length === 2;
  const cnameHost = isApex ? "www" : labels[0] || "@";
  const txtHost = isApex ? "_tba-verify" : `_tba-verify.${labels[0]}`;

  const records: DnsRecordInstruction[] = [
    {
      type: "TXT",
      host: txtHost,
      value: verificationToken,
      ttl: "300",
      purpose: "Domain ownership verification",
    },
  ];

  if (isApex) {
    records.push({
      type: "A",
      host: "@",
      value: getARecordTarget(),
      ttl: "300",
      purpose: "Point apex domain to Trend Business AI hosting",
    });
    records.push({
      type: "CNAME",
      host: "www",
      value: getCnameTarget(),
      ttl: "300",
      purpose: "Point www subdomain to the hosting edge",
    });
  } else {
    records.push({
      type: "CNAME",
      host: cnameHost,
      value: getCnameTarget(),
      ttl: "300",
      purpose: "Point this hostname to Trend Business AI hosting",
    });
  }

  return records;
}
