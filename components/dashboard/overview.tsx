import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Coins,
  FolderKanban,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { DASHBOARD_QUICK_ACTIONS } from "@/lib/constants/dashboard-nav";
import {
  PublishReadinessBadge,
  publishStatusFromQuality,
} from "@/components/dashboard/one-prompt";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";
import { Button } from "@/components/ui/button";
import type { DashboardActivityItem, DashboardHomeData } from "@/types/database";

const ACTIVITY_ICONS: Record<DashboardActivityItem["type"], LucideIcon> = {
  idea: Sparkles,
  analysis: Sparkles,
  report: Sparkles,
  website: FolderKanban,
  workspace: Sparkles,
};

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

type DashboardOverviewProps = {
  data: DashboardHomeData;
  userName?: string;
};

function QuickActionsGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      {DASHBOARD_QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.title}
            href={action.href}
            className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all hover:border-premium-gold/30 hover:bg-premium-gold/[0.06]"
          >
            <DashboardIconBox icon={Icon} />
            <p className="mt-3 text-[13px] font-semibold text-white group-hover:text-premium-gold-light">
              {action.title}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/40">
              {action.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

export function DashboardOverview({ data, userName }: DashboardOverviewProps) {
  const {
    stats,
    recentActivity,
    recentAiRuns = [],
    generatedProducts = [],
    billing = null,
  } = data;
  const totalProjects =
    stats.ideas + stats.analyses + stats.reports + stats.websites + stats.workspaces;
  const aiCreditsRemaining = billing?.creditBalance ?? 0;
  const aiCreditsUsed = billing?.lifetimeUsed ?? 0;
  const creditPool =
    aiCreditsRemaining + aiCreditsUsed > 0
      ? aiCreditsRemaining + aiCreditsUsed
      : 50;
  const usagePct = Math.min(
    100,
    Math.round((aiCreditsUsed / Math.max(creditPool, 1)) * 100),
  );
  const planLabel =
    billing?.planId === "pro"
      ? "Pro"
      : billing?.planId === "business"
        ? "Business"
        : "Free";
  const recentProjects = recentActivity.filter(
    (item) => item.type === "website" || item.type === "workspace",
  );
  const latestGenerations = recentActivity.slice(0, 5);
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome */}
      <DashboardPanel className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18),transparent_70%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-premium-gold uppercase">
              Welcome back
            </p>
            <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-white">
              Good to see you, {firstName}.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/50">
              Your private AI workspace for websites, brands, content, marketing and
              business intelligence — ready when you are.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-xl bg-[linear-gradient(180deg,#FFD700,#D4AF37)] text-[#111] hover:brightness-110">
              <Link href="/dashboard/website-builder">
                New Project <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/15 bg-transparent text-white hover:border-premium-gold/40 hover:bg-premium-gold/10"
            >
              <Link href="/dashboard/projects">View projects</Link>
            </Button>
          </div>
        </div>
      </DashboardPanel>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Projects",
            value: totalProjects,
            hint: "All generated assets",
            icon: FolderKanban,
          },
          {
            label: "AI Credits",
            value: aiCreditsRemaining,
            hint: billing
              ? `${aiCreditsUsed} used · ${planLabel} plan`
              : "Sign in to load balance",
            icon: Coins,
          },
          {
            label: "Activity",
            value: recentActivity.length,
            hint: "Recent generations",
            icon: Clock3,
          },
          {
            label: "Saved",
            value: stats.saved,
            hint: "Pinned favorites",
            icon: Star,
          },
        ].map((item) => (
          <DashboardPanel key={item.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium text-white/40">{item.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-[12px] text-white/35">{item.hint}</p>
              </div>
              <DashboardIconBox icon={item.icon} />
            </div>
          </DashboardPanel>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Quick Actions</h3>
            <p className="mt-1 text-[13px] text-white/40">
              Jump into the most-used AI products.
            </p>
          </div>
        </div>
        <QuickActionsGrid />
      </section>

      {/* AI Runs + Generated products (Phase 9) */}
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardPanel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">AI Runs</h3>
              <p className="mt-1 text-[13px] text-white/40">
                Core Engine pipeline activity across products.
              </p>
            </div>
          </div>
          {recentAiRuns.length === 0 ? (
            <DashboardEmptyState
              icon={Sparkles}
              title="No AI runs yet"
              description="Start with one business idea — AI guides Idea through Ready Product."
              action={{ label: "Website Builder", href: "/dashboard/website-builder" }}
            />
          ) : (
            <ul className="space-y-3">
              {recentAiRuns.slice(0, 6).map((run) => {
                const publish =
                  run.status === "running" || run.status === "pending"
                    ? { status: "generating" as const, score: run.qualityScore ?? undefined }
                    : run.status === "failed"
                      ? { status: "failed" as const, score: run.qualityScore ?? undefined }
                      : publishStatusFromQuality({
                          publishReady: run.publishReady ?? undefined,
                          score: run.qualityScore ?? undefined,
                        });
                return (
                  <li key={run.id}>
                    <Link
                      href={run.href}
                      className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:border-premium-gold/25 hover:bg-premium-gold/[0.05]"
                    >
                      <DashboardIconBox icon={Sparkles} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[14px] font-semibold text-white">
                            {run.productLabel}
                          </p>
                          <PublishReadinessBadge
                            status={publish.status}
                            score={publish.score}
                          />
                        </div>
                        <p className="mt-1 truncate text-[12px] text-white/40">
                          {run.title}
                        </p>
                        <p className="mt-1 text-[11px] text-white/30">
                          {run.layersExecuted.length
                            ? run.layersExecuted.slice(-4).join(" · ")
                            : run.status}
                          {" · "}
                          {formatActivityDate(run.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardPanel>

        <DashboardPanel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Generated products</h3>
              <p className="mt-1 text-[13px] text-white/40">
                Quality reports and publish readiness.
              </p>
            </div>
          </div>
          {generatedProducts.length === 0 ? (
            <DashboardEmptyState
              icon={FolderKanban}
              title="No products yet"
              description="Completed Core runs with quality scores will appear here."
              action={{ label: "Start creating", href: "/dashboard/website-builder" }}
            />
          ) : (
            <ul className="space-y-3">
              {generatedProducts.slice(0, 6).map((run) => {
                const publish = publishStatusFromQuality({
                  publishReady: run.publishReady ?? undefined,
                  score: run.qualityScore ?? undefined,
                });
                return (
                  <li key={`product-${run.id}`}>
                    <Link
                      href={run.href}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-4 py-3 hover:border-premium-gold/25"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-white">
                          {run.productLabel}
                        </p>
                        <p className="truncate text-[12px] text-white/40">{run.title}</p>
                      </div>
                      <PublishReadinessBadge
                        status={
                          run.publishReady === true
                            ? "ready"
                            : run.publishReady === false
                              ? "needs_review"
                              : publish.status
                        }
                        score={run.qualityScore}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Recent Projects */}
        <DashboardPanel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Projects</h3>
              <p className="mt-1 text-[13px] text-white/40">
                Latest website and workspace generations.
              </p>
            </div>
            <Link
              href="/dashboard/projects"
              className="text-[13px] font-semibold text-premium-gold hover:text-premium-gold-light"
            >
              View all
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <DashboardEmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create your first website, brand or campaign project to see it here."
              action={{ label: "Create project", href: "/dashboard/website-builder" }}
            />
          ) : (
            <ul className="space-y-3">
              {recentProjects.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:border-premium-gold/25 hover:bg-premium-gold/[0.05]"
                  >
                    <DashboardIconBox icon={ACTIVITY_ICONS[item.type]} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="truncate text-[12px] text-white/40">
                        {item.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-white/30">
                      {formatActivityDate(item.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>

        {/* Credits / Plan — live billing balance (Phase 10) */}
        <DashboardPanel className="p-5 sm:p-6">
          <h3 className="text-lg font-bold text-white">Credits / Plan</h3>
          <p className="mt-1 text-[13px] text-white/40">
            {planLabel} plan
            {billing?.billingConfigured
              ? " · PayPal & card checkout ready"
              : " · Paid checkout when PayPal is configured"}
          </p>
          <div className="mt-6">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-premium-gold">{aiCreditsRemaining}</p>
              <p className="text-[13px] text-white/40">credits left</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#D4AF37,#FFD700)]"
                style={{ width: `${Math.max(4, 100 - usagePct)}%` }}
              />
            </div>
            <p className="mt-3 text-[12px] text-white/35">
              {aiCreditsUsed} lifetime used
              {billing?.lifetimePurchased
                ? ` · ${billing.lifetimePurchased} purchased`
                : ""}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="mt-6 w-full rounded-xl border-premium-gold/25 bg-premium-gold/10 text-premium-gold-light hover:bg-premium-gold/15"
          >
            <Link href="/dashboard/billing">Manage billing</Link>
          </Button>
        </DashboardPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Activity timeline */}
        <DashboardPanel className="p-5 sm:p-6">
          <h3 className="text-lg font-bold text-white">Activity timeline</h3>
          <p className="mt-1 text-[13px] text-white/40">Recent workspace events</p>
          {recentActivity.length === 0 ? (
            <DashboardEmptyState
              icon={Clock3}
              className="mt-6 py-12"
              description="Your generations and project updates will appear here."
            />
          ) : (
            <ol className="relative mt-6 space-y-4 border-l border-white/[0.08] pl-5">
              {recentActivity.map((item) => (
                <li key={`timeline-${item.type}-${item.id}`} className="relative">
                  <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-premium-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                  <Link href={item.href} className="block hover:opacity-90">
                    <p className="text-[14px] font-semibold text-white">{item.title}</p>
                    <p className="text-[12px] text-white/40">{item.description}</p>
                    <p className="mt-1 text-[11px] text-white/30">
                      {formatActivityDate(item.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </DashboardPanel>

        {/* Latest AI generations */}
        <DashboardPanel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Latest AI generations</h3>
              <p className="mt-1 text-[13px] text-white/40">Fresh outputs across products</p>
            </div>
            <Link
              href="/dashboard/history"
              className="text-[13px] font-semibold text-premium-gold hover:text-premium-gold-light"
            >
              History
            </Link>
          </div>
          {latestGenerations.length === 0 ? (
            <DashboardEmptyState
              icon={Sparkles}
              className="py-12"
              description="Generate a website, logo, campaign or report to populate this feed."
              action={{ label: "Start generating", href: "/dashboard/website-builder" }}
            />
          ) : (
            <ul className="space-y-3">
              {latestGenerations.map((item) => (
                <li key={`gen-${item.type}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-4 py-3 hover:border-premium-gold/25"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-white">
                        {item.title}
                      </p>
                      <p className="truncate text-[12px] text-white/40">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-premium-gold/70" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}
