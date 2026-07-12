import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell relative flex min-h-screen bg-[#080808]">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(212_175_55_/_0.06),transparent)]"
        aria-hidden="true"
      />
      <DashboardSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
