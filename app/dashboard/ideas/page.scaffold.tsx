import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { IdeasGenerator } from "@/components/dashboard/ideas-generator";
import type { BusinessIdea } from "@/types/database";

export default async function IdeasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = user?.user_metadata ?? {};

  const { data, count } = await supabase
    .from("business_ideas")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(0, 9);

  return (
    <>
      <DashboardHeader
        title="Business Ideas"
        description="Generate AI-powered business ideas tailored to you"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <IdeasGenerator
          initialIdeas={(data ?? []) as BusinessIdea[]}
          initialTotal={count ?? 0}
        />
      </main>
    </>
  );
}
