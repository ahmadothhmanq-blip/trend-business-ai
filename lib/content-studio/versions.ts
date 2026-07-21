/**
 * Document version management.
 */

import type { ContentVersionSource } from "@/types/content";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

export async function getNextVersionNumber(
  supabase: AnySupabase,
  documentId: string,
): Promise<number> {
  const { data } = await supabase
    .from("content_versions")
    .select("version_number")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.version_number ?? 0) + 1;
}

export async function createDocumentVersion(
  supabase: AnySupabase,
  args: {
    userId: string;
    documentId: string;
    title: string;
    body: string;
    changeSummary: string;
    source: ContentVersionSource;
    metadata?: Record<string, unknown>;
  },
) {
  const versionNumber = await getNextVersionNumber(supabase, args.documentId);

  const { data, error } = await supabase
    .from("content_versions")
    .insert({
      user_id: args.userId,
      document_id: args.documentId,
      version_number: versionNumber,
      title: args.title,
      body: args.body,
      change_summary: args.changeSummary,
      source: args.source,
      metadata: args.metadata ?? {},
    })
    .select("*")
    .single();

  return { data, error, versionNumber };
}

export async function restoreDocumentVersion(
  supabase: AnySupabase,
  userId: string,
  documentId: string,
  versionId: string,
) {
  const { data: version, error: vErr } = await supabase
    .from("content_versions")
    .select("*")
    .eq("id", versionId)
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .single();

  if (vErr || !version) {
    return { ok: false as const, error: "Version not found", status: 404 };
  }

  const { data: doc, error: dErr } = await supabase
    .from("content_documents")
    .update({
      title: version.title,
      body: version.body,
      last_edited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (dErr || !doc) {
    return { ok: false as const, error: "Document not found", status: 404 };
  }

  await createDocumentVersion(supabase, {
    userId,
    documentId,
    title: version.title as string,
    body: version.body as string,
    changeSummary: `Restored from version ${version.version_number}`,
    source: "restore",
    metadata: { restoredFrom: versionId },
  });

  return { ok: true as const, document: doc, restoredFrom: version };
}
