import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { SocialMediaWorkspace } from "@/components/dashboard/social-media/social-media-workspace";
import { getAnalyticsSummary } from "@/lib/social-media/analytics";
import { listUserBrands } from "@/lib/social-media/brand-integration";
import type { SocialPost } from "@/types/social-media";
import type { WorkspaceGeneration } from "@/types/database";

export const metadata: Metadata = { title: "AI Social Media Manager" };

export default async function SocialMediaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};

  let initialPosts: SocialPost[] = [];
  let initialGenerations: WorkspaceGeneration[] = [];
  let brands: { id: string; brand_name: string }[] = [];
  let analyticsSummary = {
    totalImpressions: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalClicks: 0,
    avgEngagementRate: 0,
    recordCount: 0,
  };

  try {
    const { data } = await supabase
      .from("social_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 49);
    initialPosts = (data ?? []) as SocialPost[];
  } catch {
    // migration may not be applied
  }

  try {
    const { data } = await supabase
      .from("workspace_generations")
      .select("*")
      .eq("user_id", user.id)
      .eq("workspace_type", "social")
      .order("created_at", { ascending: false })
      .range(0, 19);
    initialGenerations = (data ?? []) as WorkspaceGeneration[];
  } catch {
    // legacy table
  }

  try {
    brands = (await listUserBrands(supabase, user.id)).map((b) => ({
      id: b.id as string,
      brand_name: b.brand_name as string,
    }));
  } catch {
    // brand table optional
  }

  try {
    const { summary } = await getAnalyticsSummary(supabase, user.id);
    analyticsSummary = summary;
  } catch {
    // analytics optional
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <>
      <DashboardHeader
        title="AI Social Media Manager"
        description="Create, schedule, and manage social content with AI"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <SocialMediaWorkspace
          initialPosts={initialPosts}
          initialGenerations={initialGenerations}
          brands={brands}
          analyticsSummary={analyticsSummary}
        />
      </main>
    </>
  );
}
