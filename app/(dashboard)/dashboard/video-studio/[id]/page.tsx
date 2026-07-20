import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { VideoManagementDashboard } from "@/components/dashboard/video-studio/video-management-dashboard";

export const metadata: Metadata = { title: "Manage Video · Video Studio" };

type PageProps = { params: Promise<{ id: string }> };

export default async function VideoStudioManagePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("video_generations")
    .select("id, video_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) notFound();

  const metadataUser = user.user_metadata ?? {};
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <>
      <DashboardHeader
        title={data.video_name || "Manage Video"}
        description="Produce, preview, edit, and manage your AI video project"
        userEmail={user.email}
        userName={
          (profile?.full_name as string | undefined) ??
          (metadataUser.full_name as string | undefined)
        }
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <VideoManagementDashboard generationId={id} />
      </main>
    </>
  );
}
