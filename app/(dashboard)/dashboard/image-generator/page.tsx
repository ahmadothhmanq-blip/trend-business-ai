import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { ImageGeneratorTool } from "@/components/dashboard/image-generator/image-generator-tool";
import type { ImageGeneration } from "@/types/image-generation";

export const metadata: Metadata = { title: "AI Design Studio" };

export default async function ImageGeneratorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};

  let initialGenerations: ImageGeneration[] = [];
  try {
    const { data } = await supabase
      .from("image_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 11);
    initialGenerations = (data ?? []) as ImageGeneration[];
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
        title="AI Design Studio"
        description="Generate production images, concepts, and design assets with AI"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <ImageGeneratorTool initialGenerations={initialGenerations} />
      </main>
    </>
  );
}
