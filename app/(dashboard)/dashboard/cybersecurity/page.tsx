import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { CyberWorkspace } from "@/components/dashboard/cybersecurity/cyber-workspace";
import { getCyberAnalytics } from "@/lib/cyber/analytics";

export const metadata: Metadata = { title: "Cybersecurity Platform" };

export default async function CybersecurityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let analyticsSummary = {
    riskScore: 0, activeThreats: 0, openVulnerabilities: 0, openIncidents: 0,
    openAlerts: 0, alertVolume24h: 0, avgResponseTimeMs: 0, assetCount: 0, criticalFindings: 0,
  };

  try {
    const { summary } = await getCyberAnalytics(supabase, user.id);
    analyticsSummary = summary;
  } catch { /* migration may not be applied */ }

  const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single();
  const userMeta = user.user_metadata ?? {};

  return (
    <>
      <DashboardHeader
        title="Cybersecurity"
        description="Threat intelligence, monitoring, incident response, and security analytics"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <CyberWorkspace analyticsSummary={analyticsSummary} />
      </main>
    </>
  );
}
