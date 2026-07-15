import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { AdminPanel } from "@/components/dashboard/platform/admin-panel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const appMetadata = user?.app_metadata ?? {};
  const isAdmin = appMetadata.role === "admin" || appMetadata.is_admin === true;

  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <DashboardHeader title="Admin Dashboard" description="System overview, feature flags, and monitoring" />
      <AdminPanel />
    </div>
  );
}
