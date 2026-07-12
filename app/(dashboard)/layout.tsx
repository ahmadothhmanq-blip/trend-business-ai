import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardShellProvider } from "@/components/dashboard/shell-context";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <DashboardShellProvider>
      <div className="dashboard-shell relative flex min-h-screen bg-[#050505]">
        <div
          className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(212_175_55_/_0.07),transparent)]"
          aria-hidden="true"
        />
        <DashboardSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </DashboardShellProvider>
  );
}
