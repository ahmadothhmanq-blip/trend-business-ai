import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { BrandManagementDashboard } from "@/components/dashboard/brand-identity/brand-management-dashboard";
import type { BrandIdentityGeneration } from "@/types/brand-identity";

export const metadata: Metadata = { title: "Brand Workspace" };

type Props = { params: Promise<{ id: string }> };

export default async function BrandStudioWorkspacePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: generation, error } = await supabase
    .from("brand_identity_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !generation) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const userMeta = user.user_metadata ?? {};
  const gen = generation as BrandIdentityGeneration;

  return (
    <>
      <DashboardHeader
        title={gen.brand_name}
        description="Brand management workspace"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <BrandManagementDashboard generation={gen} />
      </main>
    </>
  );
}
