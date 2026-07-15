import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { BrandIdentityTool } from "@/components/dashboard/brand-identity/brand-identity-tool";
import type { BrandIdentityGeneration } from "@/types/brand-identity";

export const metadata: Metadata = { title: "AI Brand Identity Builder" };

export default async function BrandStudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};

  let initialGenerations: BrandIdentityGeneration[] = [];
  try {
    const { data } = await supabase
      .from("brand_identity_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 11);
    initialGenerations = (data ?? []) as BrandIdentityGeneration[];
  } catch {
    // Table may not exist yet
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <>
      <DashboardHeader
        title="AI Brand Identity Builder"
        description="Build complete brand identity systems with AI"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <BrandIdentityTool initialGenerations={initialGenerations} />
      </main>
    </>
  );
}
