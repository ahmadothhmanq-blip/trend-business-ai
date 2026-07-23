import type { SupabaseClient } from "@supabase/supabase-js";
import type { CyberVulnerability, CyberScan, CyberFinding } from "@/types/cyber";

export async function listVulnerabilities(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_vulnerabilities").select("*").eq("user_id", userId).order("cvss_score", { ascending: false });
}

export async function createVulnerability(supabase: SupabaseClient, row: Partial<CyberVulnerability> & { user_id: string; title: string }) {
  return supabase.from("cyber_vulnerabilities").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    asset_id: row.asset_id ?? null,
    cve_id: row.cve_id ?? "",
    title: row.title,
    severity: row.severity ?? "medium",
    cvss_score: row.cvss_score ?? 0,
    status: row.status ?? "open",
    remediation: row.remediation ?? "",
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function listScans(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_scans").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function createScan(supabase: SupabaseClient, row: Partial<CyberScan> & { user_id: string; name: string; target: string }) {
  const { data: scan } = await supabase.from("cyber_scans").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    name: row.name,
    scan_type: row.scan_type ?? "vulnerability",
    status: "running",
    target: row.target,
    started_at: new Date().toISOString(),
    metadata: row.metadata ?? {},
  }).select("*").single();

  if (!scan) return { data: null, error: new Error("Scan failed") };

  const findings = [
    { title: "Open port detected", severity: "medium" as const, description: "Port 22 exposed", remediation: "Restrict SSH access" },
    { title: "Outdated TLS", severity: "low" as const, description: "TLS 1.0 enabled", remediation: "Disable TLS 1.0/1.1" },
  ];

  for (const f of findings) {
    await supabase.from("cyber_findings").insert({
      user_id: row.user_id,
      scan_id: scan.id,
      title: f.title,
      severity: f.severity,
      description: f.description,
      remediation: f.remediation,
    });
  }

  await supabase.from("cyber_scans").update({
    status: "completed",
    findings_count: findings.length,
    completed_at: new Date().toISOString(),
  }).eq("id", scan.id);

  return { data: { ...scan, status: "completed", findings_count: findings.length }, error: null };
}

export async function listFindings(supabase: SupabaseClient, userId: string, scanId?: string) {
  let q = supabase.from("cyber_findings").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (scanId) q = q.eq("scan_id", scanId);
  return q;
}
