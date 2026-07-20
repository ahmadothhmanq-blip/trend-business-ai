import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { VideoStudioTool } from "@/components/dashboard/video-studio/video-studio-tool";
import type { VideoGeneration } from "@/types/video";

export const metadata: Metadata = { title: "AI Video Production Platform" };

export default async function VideoStudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};

  let initialGenerations: VideoGeneration[] = [];
  try {
    const { data } = await supabase
      .from("video_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 11);
    initialGenerations = (data ?? []) as VideoGeneration[];
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
        title="AI Video Production Platform"
        description="Design, generate, render, edit, and manage professional AI videos"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <VideoStudioTool initialGenerations={initialGenerations} />
      </main>
    </>
  );
}
