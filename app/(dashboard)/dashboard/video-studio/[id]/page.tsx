import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { VideoManagementDashboard } from "@/components/dashboard/video-studio/video-management-dashboard";
import { VideoEditorWorkspace } from "@/components/dashboard/video-studio/editor/editor-shell";
import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata() {
  return dashboardPageMetadata("videoStudioManage");
}

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ view?: string }> };

export default async function VideoStudioManagePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const { t } = await getServerTranslator();
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
        title={data.video_name || t("pages.videoStudioManage.headerFallback")}
        description={t("pages.videoStudioManage.headerDescription")}
        userEmail={user.email}
        userName={
          (profile?.full_name as string | undefined) ??
          (metadataUser.full_name as string | undefined)
        }
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        {query.view === "manage" ? (
          <VideoManagementDashboard generationId={id} />
        ) : (
          <VideoEditorWorkspace generationId={id} />
        )}
      </main>
    </>
  );
}
