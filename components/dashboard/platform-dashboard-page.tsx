import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileStack,
  type LucideIcon,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { DashboardPlatformPageConfig } from "@/lib/constants/dashboard-platform-pages";

type PlatformDashboardPageProps = {
  config: DashboardPlatformPageConfig;
  searchQuery?: string;
};

async function getCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "business_ideas" | "market_analyses" | "reports" | "website_generations",
  userId: string,
) {
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  return count ?? 0;
}

function resolveActionHref(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("website") || normalized.includes("project")) return "/dashboard/website-builder";
  if (normalized.includes("history")) return "/dashboard/history";
  if (normalized.includes("billing")) return "/dashboard/billing";
  if (normalized.includes("subscription") || normalized.includes("plan")) return "/dashboard/billing";
  if (normalized.includes("analytics")) return "/dashboard/analytics";
  if (normalized.includes("usage")) return "/dashboard/usage";
  if (normalized.includes("notification")) return "/dashboard/notifications";
  if (normalized.includes("profile")) return "/dashboard/profile";
  if (normalized.includes("docs")) return "/docs";
  if (normalized.includes("sales")) return "/contact";
  return "/dashboard";
}

export async function PlatformDashboardPage({
  config,
  searchQuery,
}: PlatformDashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};

  const [ideas, analyses, reports, projects] = user
    ? await Promise.all([
        getCount(supabase, "business_ideas", user.id),
        getCount(supabase, "market_analyses", user.id),
        getCount(supabase, "reports", user.id),
        getCount(supabase, "website_generations", user.id),
      ])
    : [0, 0, 0, 0];

  const totalAssets = ideas + analyses + reports + projects;
  const statCards: { label: string; value: number; icon: LucideIcon }[] = [
    { label: "Total Assets", value: totalAssets, icon: Database },
    { label: "Ideas", value: ideas, icon: BarChart3 },
    { label: "Reports", value: reports, icon: FileStack },
    { label: "Projects", value: projects, icon: CheckCircle2 },
  ];

  return (
    <>
      <DashboardHeader
        title={config.title}
        description={config.description}
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <DashboardPanel gold>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-premium-gold/20 bg-premium-gold/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-premium-gold-light uppercase">
                {config.badge}
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
                {config.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/50 sm:text-base">
                {config.description}
              </p>
              {searchQuery && (
                <p className="mt-3 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white/60">
                  Showing workspace search context for:{" "}
                  <span className="font-semibold text-premium-gold-light">{searchQuery}</span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="btn-gold rounded-xl font-bold text-luxury-black">
                <Link href={resolveActionHref(config.primaryAction)}>
                  {config.primaryAction}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              {config.secondaryAction && (
                <Button asChild variant="outline" className="btn-ghost-gold rounded-xl">
                  <Link href={resolveActionHref(config.secondaryAction)}>
                    {config.secondaryAction}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </DashboardPanel>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon }) => (
            <DashboardPanel key={label}>
              <Icon className="size-5 text-premium-gold" />
              <p className="mt-4 text-[11px] font-semibold tracking-wide text-white/35 uppercase">
                {label}
              </p>
              <p className="mt-2 text-3xl font-black text-white">{value}</p>
            </DashboardPanel>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {config.sections.map((section) => (
            <DashboardPanel key={section.title}>
              <h3 className="text-lg font-bold text-white">{section.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/45">{section.description}</p>
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-white/60">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-premium-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </DashboardPanel>
          ))}
        </div>

        {totalAssets === 0 && (
          <DashboardPanel className="mt-6 border-dashed">
            <div className="mx-auto max-w-xl text-center">
              <FileStack className="mx-auto size-10 text-premium-gold" />
              <h3 className="mt-4 text-lg font-bold text-white">No workspace assets yet</h3>
              <p className="mt-2 text-sm leading-7 text-white/45">
                Generate your first idea, report, analysis or website project to populate
                dashboards, analytics and usage views.
              </p>
              <Button asChild className="btn-gold mt-5 rounded-xl font-bold text-luxury-black">
                <Link href="/dashboard/website-builder">Create First Project</Link>
              </Button>
            </div>
          </DashboardPanel>
        )}
      </main>
    </>
  );
}

