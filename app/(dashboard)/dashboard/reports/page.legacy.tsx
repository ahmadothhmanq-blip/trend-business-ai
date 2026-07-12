import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { ReportsGenerator } from "@/components/dashboard/reports-generator";
import type { AIReport } from "@/types/database";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = user?.user_metadata ?? {};

  const { data, count } = await supabase
    .from("reports")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(0, 9);

  return (
    <>
      <DashboardHeader
        title="AI Reports"
        description="Generate strategic business intelligence reports"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <ReportsGenerator
          initialReports={(data ?? []) as AIReport[]}
          initialTotal={count ?? 0}
        />
      </main>
    </>
  );
}
