import type { Metadata } from "next";
import Link from "next/link";
import { FileStack } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadUserHistoryItems } from "@/lib/db/history-items";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";

export const metadata: Metadata = { title: "Files" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function FilesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};
  const items = user ? await loadUserHistoryItems(supabase, user.id) : [];

  return (
    <>
      <DashboardHeader
        title="Files"
        description="Exports and generated assets from your workspace"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        {items.length === 0 ? (
          <DashboardEmptyState
            icon={FileStack}
            title="No files yet"
            description="Generated projects and exports will appear here once you create assets."
            action={{ label: "Generate an asset", href: "/dashboard/website-builder" }}
          />
        ) : (
          <div className="space-y-3">
            {items.slice(0, 40).map((item) => (
              <Link key={`${item.type}-${item.id}`} href={item.href}>
                <DashboardPanel className="flex items-center justify-between gap-4 p-4 transition-all hover:border-premium-gold/30">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="truncate text-[12px] text-white/40">
                      {item.type} · {item.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] text-white/35">
                    {formatDate(item.createdAt)}
                  </span>
                </DashboardPanel>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
