import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { DesignEditor } from "@/components/dashboard/image-generator/design-editor";
import type { ImageGeneration } from "@/types/image-generation";

export const metadata: Metadata = { title: "Design Editor" };

type Props = { params: Promise<{ id: string }> };

export default async function ImageGeneratorEditorPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: generation, error } = await supabase
    .from("image_generations")
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
  const gen = generation as ImageGeneration;

  return (
    <>
      <DashboardHeader
        title={`Edit: ${gen.image_name}`}
        description="Professional AI design editor"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <DesignEditor generationId={gen.id} generationName={gen.image_name} />
      </main>
    </>
  );
}
