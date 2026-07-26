/**
 * Supabase persistence for website domains (migration 042).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DnsRecordInstruction,
  WebsiteDomain,
} from "@/lib/ai-core/domains/types";

type DomainRow = {
  id: string;
  user_id: string;
  generation_id: string;
  publication_id: string | null;
  hostname: string;
  slug: string | null;
  kind: string;
  status: string;
  verification_token: string;
  verified_at: string | null;
  ssl_status: string;
  dns_instructions: DnsRecordInstruction[] | null;
  last_checked_at: string | null;
  last_check_message: string | null;
  created_at: string;
  updated_at: string;
};

export function isDomainsTableMissing(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("website_domains") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

export function rowToDomain(row: DomainRow): WebsiteDomain {
  return {
    id: row.id,
    userId: row.user_id,
    generationId: row.generation_id,
    publicationId: row.publication_id,
    slug: row.slug,
    hostname: row.hostname,
    kind: row.kind as WebsiteDomain["kind"],
    status: row.status as WebsiteDomain["status"],
    verificationToken: row.verification_token,
    verifiedAt: row.verified_at,
    sslStatus: row.ssl_status as WebsiteDomain["sslStatus"],
    dnsInstructions: row.dns_instructions ?? [],
    lastCheckedAt: row.last_checked_at,
    lastCheckMessage: row.last_check_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function domainToRow(domain: WebsiteDomain): DomainRow {
  return {
    id: domain.id,
    user_id: domain.userId,
    generation_id: domain.generationId,
    publication_id: domain.publicationId ?? null,
    hostname: domain.hostname,
    slug: domain.slug ?? null,
    kind: domain.kind,
    status: domain.status,
    verification_token: domain.verificationToken,
    verified_at: domain.verifiedAt ?? null,
    ssl_status: domain.sslStatus,
    dns_instructions: domain.dnsInstructions,
    last_checked_at: domain.lastCheckedAt ?? null,
    last_check_message: domain.lastCheckMessage ?? null,
    created_at: domain.createdAt,
    updated_at: domain.updatedAt,
  };
}

export async function listDomainsForGenerationDb(
  client: SupabaseClient,
  generationId: string,
): Promise<WebsiteDomain[]> {
  const { data, error } = await client
    .from("website_domains")
    .select("*")
    .eq("generation_id", generationId)
    .neq("status", "removed")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return (data as DomainRow[]).map(rowToDomain);
}

export async function getDomainByIdDb(
  client: SupabaseClient,
  domainId: string,
): Promise<WebsiteDomain | null> {
  const { data, error } = await client
    .from("website_domains")
    .select("*")
    .eq("id", domainId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToDomain(data as DomainRow);
}

type PublicDomainRow = {
  id: string;
  generation_id: string;
  hostname: string;
  kind: string;
  status: string;
  ssl_status: string;
  created_at: string;
  updated_at: string;
};

function publicRowToDomain(row: PublicDomainRow): WebsiteDomain {
  return {
    id: row.id,
    userId: "",
    generationId: row.generation_id,
    publicationId: null,
    slug: null,
    hostname: row.hostname,
    kind: row.kind as WebsiteDomain["kind"],
    status: row.status as WebsiteDomain["status"],
    verificationToken: "",
    verifiedAt: null,
    sslStatus: row.ssl_status as WebsiteDomain["sslStatus"],
    dnsInstructions: [],
    lastCheckedAt: null,
    lastCheckMessage: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findDomainByHostnameDb(
  client: SupabaseClient,
  hostname: string,
  activeOnly = false,
): Promise<WebsiteDomain | null> {
  const normalized = hostname.toLowerCase();

  if (activeOnly) {
    const { data, error } = await client
      .from("website_active_domains_public")
      .select("id, generation_id, hostname, kind, status, ssl_status, created_at, updated_at")
      .eq("hostname", normalized)
      .maybeSingle();
    if (!error && data) return publicRowToDomain(data as PublicDomainRow);

    if (error && !isDomainsTableMissing(error)) {
      const { data: fallback, error: fallbackError } = await client
        .from("website_domains")
        .select("id, generation_id, hostname, kind, status, ssl_status, created_at, updated_at")
        .eq("hostname", normalized)
        .eq("status", "active")
        .maybeSingle();
      if (!fallbackError && fallback) return publicRowToDomain(fallback as PublicDomainRow);
    }
    return null;
  }

  const { data, error } = await client
    .from("website_domains")
    .select("*")
    .eq("hostname", normalized)
    .neq("status", "removed")
    .maybeSingle();
  if (error || !data) return null;
  return rowToDomain(data as DomainRow);
}

export async function upsertDomainDb(
  client: SupabaseClient,
  domain: WebsiteDomain,
): Promise<WebsiteDomain | null> {
  const row = domainToRow(domain);
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      domain.id,
    );

  const query = isUuid
    ? client.from("website_domains").upsert(row, { onConflict: "id" })
    : client.from("website_domains").insert({
        user_id: row.user_id,
        generation_id: row.generation_id,
        publication_id: row.publication_id,
        hostname: row.hostname,
        slug: row.slug,
        kind: row.kind,
        status: row.status,
        verification_token: row.verification_token,
        verified_at: row.verified_at,
        ssl_status: row.ssl_status,
        dns_instructions: row.dns_instructions,
        last_checked_at: row.last_checked_at,
        last_check_message: row.last_check_message,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });

  const { data, error } = await query.select("*").single();
  if (error || !data) return null;
  return rowToDomain(data as DomainRow);
}
