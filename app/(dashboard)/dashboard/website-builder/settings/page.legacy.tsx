import Link from "next/link";
import { ArrowLeft, Download, FileStack, Settings, Star } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { WebsiteGeneration } from "@/types/database";

function formatGenerationDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getGeneratedFileCount(generation: WebsiteGeneration) {
  const blueprint = generation.blueprint as { files?: unknown[] } | null;
  return Array.isArray(blueprint?.files) ? blueprint.files.length : 0;
}

export default async function WebsiteBuilderSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};
  const { data } = user
    ? await supabase
        .from("website_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(0, 49)
    : { data: [] };

  const generations = (data ?? []) as WebsiteGeneration[];
  const favoriteCount = generations.filter((project) => project.is_favorite).length;
  const fileCount = generations.reduce(
    (total, project) => total + getGeneratedFileCount(project),
    0,
  );

  return (
    <>
      <DashboardHeader
        title="AI Project Settings"
        description="Manage generated project defaults, saved history and workspace metadata."
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="mb-6">
          <Button asChild variant="outline" className="btn-ghost-gold rounded-xl">
            <Link href="/dashboard/website-builder">
              <ArrowLeft className="size-4" />
              Back to Project Workspace
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <DashboardPanel>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-premium-gold/20 bg-premium-gold/10 p-3 text-premium-gold">
                <Settings className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Workspace Defaults</h2>
                <p className="mt-1 text-sm leading-relaxed text-white/45">
                  Generated projects are saved to Supabase with the prompt, files,
                  framework metadata and favorite state. Live Preview remains frozen
                  while ZIP export and source review stay production-ready.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {[
                ["Framework", "Next.js App Router"],
                ["Styling", "Tailwind CSS"],
                ["Package manager", "npm"],
                ["Export format", "Downloadable ZIP"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                >
                  <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
                    {label}
                  </p>
                  <p className="mt-2 font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </DashboardPanel>

          <div className="grid gap-6 sm:grid-cols-3 xl:grid-cols-1">
            <DashboardPanel>
              <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
                Saved Projects
              </p>
              <p className="mt-2 text-3xl font-black text-white">{generations.length}</p>
            </DashboardPanel>
            <DashboardPanel>
              <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
                Generated Files
              </p>
              <p className="mt-2 text-3xl font-black text-white">{fileCount}</p>
            </DashboardPanel>
            <DashboardPanel>
              <p className="text-[11px] font-semibold tracking-wide text-white/35 uppercase">
                Favorites
              </p>
              <p className="mt-2 text-3xl font-black text-white">{favoriteCount}</p>
            </DashboardPanel>
          </div>
        </div>

        <DashboardPanel className="mt-6">
          <div className="mb-5 flex items-center gap-3">
            <FileStack className="size-5 text-premium-gold" />
            <div>
              <h2 className="text-xl font-bold text-white">Generation History</h2>
              <p className="text-sm text-white/45">
                Reopen previous projects from the main workspace and continue with
                ZIP export, source review, rename, delete and favorite actions.
              </p>
            </div>
          </div>

          {generations.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {generations.map((project) => (
                <article
                  key={project.id}
                  className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white">{project.project_name}</h3>
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/45">
                        {project.business_description}
                      </p>
                    </div>
                    {project.is_favorite && (
                      <Star className="size-4 shrink-0 fill-premium-gold text-premium-gold" />
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-white/40">
                    <span>{project.website_type}</span>
                    <span>•</span>
                    <span>{getGeneratedFileCount(project)} files</span>
                    <span>•</span>
                    <span>{formatGenerationDate(project.created_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/[0.1] p-8 text-center">
              <Download className="mx-auto size-10 text-premium-gold" />
              <p className="mt-4 font-bold text-white">No generated projects yet</p>
              <p className="mt-2 text-sm text-white/40">
                Generate a project to populate workspace settings and history.
              </p>
            </div>
          )}
        </DashboardPanel>
      </main>
    </>
  );
}
