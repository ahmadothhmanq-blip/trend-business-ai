import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadUserHistoryItems } from "@/lib/db/history-items";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";
import { Button } from "@/components/ui/button";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export async function DashboardProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};

  const items = user ? await loadUserHistoryItems(supabase, user.id) : [];
  const projects = items.filter(
    (item) => item.type === "website" || item.type === "workspace",
  );

  return (
    <>
      <DashboardHeader
        title="Projects"
        description="Real generations from your authenticated Supabase workspace"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] text-white/45">
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button
            asChild
            className="rounded-xl bg-[linear-gradient(180deg,#FFD700,#D4AF37)] text-[#111] hover:brightness-110"
          >
            <Link href="/dashboard/website-builder">
              New Project <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <DashboardEmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Generate a website, brand, campaign or business workspace to populate your project library."
            action={{ label: "Create your first project", href: "/dashboard/website-builder" }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link key={`${project.type}-${project.id}`} href={project.href}>
                <DashboardPanel className="h-full p-5 transition-all hover:border-premium-gold/35 hover:shadow-[0_20px_60px_rgba(212,175,55,0.08)]">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-premium-gold uppercase">
                    {project.type}
                  </p>
                  <h3 className="mt-3 text-lg font-bold text-white">{project.title}</h3>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/45">
                    {project.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className="text-[12px] text-white/35">
                      {formatDate(project.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-premium-gold">
                      Open <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </DashboardPanel>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
