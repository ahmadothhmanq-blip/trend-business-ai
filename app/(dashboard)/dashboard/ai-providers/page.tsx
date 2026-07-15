import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { AIProvidersSettings } from "@/components/dashboard/ai-providers-settings";

export const metadata: Metadata = { title: "AI Providers" };

export default async function AIProvidersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <>
      <DashboardHeader
        title="AI Providers"
        description="Configure AI provider API keys, models, and generation settings"
        userEmail={user.email}
        userName={profile?.full_name as string | undefined}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <AIProvidersSettings />
      </main>
    </>
  );
}
