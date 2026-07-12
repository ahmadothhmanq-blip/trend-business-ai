import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = { title: "User Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = user?.user_metadata ?? {};

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <>
      <DashboardHeader
        title="User Profile"
        description="Manage your personal profile, company details and workspace preferences"
        userEmail={user?.email}
        userName={
          (profile?.full_name as string) ||
          (metadata.full_name as string | undefined)
        }
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <ProfileForm
          email={user.email ?? ""}
          fullName={
            (profile?.full_name as string) ||
            (metadata.full_name as string) ||
            ""
          }
          company={
            (profile?.company as string) ||
            (metadata.company as string) ||
            ""
          }
          role={
            (profile?.role as string) || (metadata.role as string) || ""
          }
          avatarUrl={(profile?.avatar_url as string) || ""}
          theme={(preferences?.theme as "light" | "dark" | "system") || "dark"}
          emailNotifications={preferences?.email_notifications ?? true}
        />
      </main>
    </>
  );
}
