import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  Coins,
  FileText,
  FolderKanban,
  Globe2,
  Lightbulb,
  LineChart,
  Megaphone,
  Palette,
  Rocket,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DASHBOARD_NAV } from "@/lib/constants/dashboard-nav";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import { DashboardEmptyState } from "@/components/dashboard/ui/dashboard-empty-state";
import type { DashboardActivityItem, DashboardHomeData } from "@/types/database";

const QUICK_ACTIONS = [
  {
    title: "Build a website",
    description: "Plan pages, components, copy direction and visual structure.",
    href: "/dashboard/website-builder",
    icon: Globe2,
    cta: "Open builder",
  },
  {
    title: "Design a brand",
    description: "Create logo direction, palette, typography and identity rules.",
    href: "/dashboard/brand-designer",
    icon: Palette,
    cta: "Create brand",
  },
  {
    title: "Launch marketing",
    description: "Generate ad angles, offers, audiences and campaign structure.",
    href: "/dashboard/marketing",
    icon: Megaphone,
    cta: "Build campaign",
  },
  {
    title: "Audit a business",
    description: "Find gaps, risks, quick wins and the next best actions.",
    href: "/dashboard/business-audit",
    icon: BarChart3,
    cta: "Run audit",
  },
] as const;

type DashboardOverviewProps = {
  data: DashboardHomeData;
};

const ACTIVITY_ICONS: Record<DashboardActivityItem["type"], LucideIcon> = {
  idea: Lightbulb,
  analysis: LineChart,
  report: FileText,
  website: Globe2,
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

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const { stats, recentActivity } = data;
  const totalAssets =
    stats.ideas + stats.analyses + stats.reports + stats.websites + stats.workspaces;
  const hasActivity = recentActivity.length > 0;
  const aiCreditsUsed = Math.min(250, 36 + totalAssets * 8);
  const aiCreditsRemaining = 250 - aiCreditsUsed;
  const chartItems = [
    { label: "Ideas", value: stats.ideas, icon: Lightbulb },
    { label: "Markets", value: stats.analyses, icon: LineChart },
    { label: "Reports", value: stats.reports, icon: FileText },
    { label: "Websites", value: stats.websites, icon: Globe2 },
    { label: "Workspaces", value: stats.workspaces, icon: Sparkles },
  ];
  const maxChartValue = Math.max(...chartItems.map((item) => item.value), 1);
  const statItems = [
    {
      label: "Projects",
      value: totalAssets,
      description: "Generated assets in your private workspace.",
      icon: FolderKanban,
      accent: "All time",
    },
    {
      label: "AI Credits",
      value: aiCreditsRemaining,
      description: `${aiCreditsUsed} of 250 monthly credits used.`,
      icon: Coins,
      accent: "Monthly",
    },
    {
      label: "Recent Activity",
      value: recentActivity.length,
      description: "Latest generations ready to revisit.",
      icon: Clock3,
      accent: "Live",
    },
    {
      label: "Saved Projects",
      value: stats.saved,
      description: "Favorites pinned for fast access.",
      icon: Star,
      accent: "Pinned",
    },
  ] as const;

  return (
    <div className="space-y-8 lg:space-y-10">
      <DashboardPanel gold className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgb(255_215_0_/_0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_20%,rgb(212_175_55_/_0.12),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-3 py-1">
              <Sparkles className="size-3.5 text-premium-gold-light" />
              <span className="text-[11px] font-semibold tracking-wide text-premium-gold-light uppercase">
                Welcome back
              </span>
            </div>
            <h2 className="max-w-3xl text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              Your premium AI business workspace.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base">
              Build brands, websites, campaigns, reports, audits and social systems from one luxury command center designed for serious business execution.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="btn-gold h-11 rounded-xl px-6 font-bold text-luxury-black" asChild>
                <Link href="/dashboard/website-builder">
                  Start creating
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button variant="outline" className="btn-ghost-gold h-11 rounded-xl px-6" asChild>
                <Link href="/dashboard/favorites">View saved projects</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/[0.08] bg-black/25 p-4 shadow-[0_28px_90px_rgb(0_0_0/0.35)] backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-premium-gold/15 bg-[linear-gradient(135deg,rgb(212_175_55/0.12),rgb(255_255_255/0.03))] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-premium-gold-light uppercase">
                    Workspace Health
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {totalAssets > 0 ? "Active" : "Ready"}
                  </p>
                </div>
                <DashboardIconBox icon={Rocket} className="size-12 rounded-2xl" />
              </div>
              <div className="mt-6 space-y-3">
                {chartItems.map((item) => (
                  <ChartRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    max={maxChartValue}
                    icon={item.icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((stat) => (
          <MetricCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <DashboardPanel>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <DashboardIconBox icon={Clock3} />
              <div>
                <h3 className="font-bold text-white">Recent Activity</h3>
                <p className="text-[13px] text-white/40">
                  Latest assets saved in your dashboard
                </p>
              </div>
            </div>
            {hasActivity && (
              <span className="rounded-full bg-premium-gold/10 px-2.5 py-1 text-[11px] font-semibold text-premium-gold-light ring-1 ring-premium-gold/20">
                {recentActivity.length} recent
              </span>
            )}
          </div>

          {hasActivity ? (
            <div className="space-y-2.5">
              {recentActivity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type];

                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 transition-all hover:border-premium-gold/25 hover:bg-premium-gold/[0.04]"
                  >
                    <DashboardIconBox icon={Icon} className="size-9" gold={false} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-premium-gold-light">
                        {item.title}
                      </p>
                      <p className="truncate text-[12px] text-white/40">
                        {item.description}
                      </p>
                    </div>
                    <span className="hidden shrink-0 text-[11px] text-white/30 sm:inline">
                      {formatActivityDate(item.createdAt)}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-premium-gold" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <DashboardEmptyState
              icon={Sparkles}
              title="No activity yet"
              description="Generate your first idea, market analysis, report, or website blueprint to start building your workspace history."
              className="py-12 sm:py-14"
            />
          )}
        </DashboardPanel>

        <DashboardPanel>
          <div className="mb-5 flex items-center gap-3">
            <DashboardIconBox icon={BarChart3} />
            <div>
              <h3 className="font-bold text-white">Modern Charts</h3>
              <p className="text-[13px] text-white/40">
                Portfolio mix across AI outputs
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {chartItems.map((item) => (
              <ChartRow
                key={item.label}
                label={item.label}
                value={item.value}
                max={maxChartValue}
                icon={item.icon}
                large
              />
            ))}
            <div className="rounded-2xl border border-premium-gold/15 bg-premium-gold/[0.06] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/45">AI credit capacity</span>
                <span className="font-bold text-premium-gold-light">
                  {aiCreditsRemaining} remaining
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light"
                  style={{ width: `${(aiCreditsUsed / 250) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </DashboardPanel>
      </div>

      <div>
        <h2 className="mb-5 text-lg font-bold text-white sm:text-xl">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.href} {...action} />
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardPanel>
          <div className="mb-5 flex items-center gap-3">
            <DashboardIconBox icon={Sparkles} />
            <div>
              <h2 className="font-bold text-white">Latest AI Generations</h2>
              <p className="text-[13px] text-white/40">
                Recent outputs across the workspace
              </p>
            </div>
          </div>
          {hasActivity ? (
            <div className="grid gap-3 md:grid-cols-2">
              {recentActivity.slice(0, 4).map((item) => {
                const Icon = ACTIVITY_ICONS[item.type];

                return (
                  <Link
                    key={`latest-${item.type}-${item.id}`}
                    href={item.href}
                    className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all hover:border-premium-gold/25 hover:bg-premium-gold/[0.04]"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <DashboardIconBox icon={Icon} className="size-9" gold={false} />
                      <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[11px] text-white/35">
                        {item.type}
                      </span>
                    </div>
                    <p className="truncate font-semibold text-white group-hover:text-premium-gold-light">
                      {item.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/40">
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <DashboardEmptyState
              icon={Sparkles}
              title="No latest generations yet"
              description="Start with a website, brand, campaign or business audit to fill this workspace with AI output."
              className="py-10"
            />
          )}
        </DashboardPanel>

        <DashboardPanel>
          <div className="mb-5 flex items-center gap-3">
            <DashboardIconBox icon={FolderKanban} />
            <div>
              <h2 className="font-bold text-white">Recent Files</h2>
              <p className="text-[13px] text-white/40">Files ready to review or export</p>
            </div>
          </div>
          <div className="space-y-3">
            {(hasActivity ? recentActivity.slice(0, 4) : []).map((item) => (
              <Link
                key={`file-${item.type}-${item.id}`}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-3 transition-all hover:border-premium-gold/25"
              >
                <DashboardIconBox icon={FileText} className="size-9" gold={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-[12px] text-white/35">{formatActivityDate(item.createdAt)}</p>
                </div>
                <ArrowRight className="size-4 text-white/25 group-hover:text-premium-gold" />
              </Link>
            ))}
            {!hasActivity && (
              <div className="rounded-2xl border border-dashed border-white/[0.1] p-5 text-center">
                <p className="text-sm font-semibold text-white">No files yet</p>
                <p className="mt-1 text-[13px] text-white/40">
                  Generated assets will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </DashboardPanel>
      </div>

      <div>
        <h2 className="mb-5 text-lg font-bold text-white sm:text-xl">AI Workspaces</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {DASHBOARD_NAV.filter((item) => item.label.startsWith("AI ")).map((item) => (
            <WorkspaceCard key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.08] glass-panel glass-panel-premium p-5 transition-all duration-300 hover:border-premium-gold/25 hover:shadow-gold-sm">
      <div className="mb-5 flex items-start justify-between">
        <DashboardIconBox icon={icon} />
        <span className="rounded-full border border-premium-gold/15 bg-premium-gold/10 px-2.5 py-1 text-[11px] font-semibold text-premium-gold-light">
          {accent}
        </span>
      </div>
      <p className="text-[13px] font-medium text-white/40">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-white/45">{description}</p>
    </div>
  );
}

function ChartRow({
  label,
  value,
  max,
  icon,
  large,
}: {
  label: string;
  value: number;
  max: number;
  icon: LucideIcon;
  large?: boolean;
}) {
  const width = value === 0 ? 8 : Math.max(16, (value / max) * 100);
  const Icon = icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-white/65">
          <Icon className="size-4 text-premium-gold" />
          {label}
        </span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className={large ? "h-3 rounded-full bg-white/[0.06]" : "h-2 rounded-full bg-white/[0.06]"}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-premium-gold/70 via-premium-gold to-premium-gold-light transition-all duration-700"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  cta: string;
}) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-white/[0.08] glass-panel glass-panel-premium p-5 transition-all duration-300 hover:border-premium-gold/25 hover:shadow-gold-sm sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <DashboardIconBox icon={icon} />
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/40 hover:text-premium-gold-light"
          asChild
        >
          <Link href={href} aria-label={title}>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-white/45">
        {description}
      </p>
      <Button
        variant="outline"
        className="btn-ghost-gold mt-5 w-full rounded-xl"
        asChild
      >
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}

function WorkspaceCard({
  item,
}: {
  item: (typeof DASHBOARD_NAV)[number];
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="group flex min-h-[128px] items-start gap-4 rounded-2xl border border-white/[0.08] glass-panel p-4 transition-all duration-300 hover:-translate-y-1 hover:border-premium-gold/25 hover:shadow-gold-sm sm:p-5"
    >
      <DashboardIconBox icon={Icon} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white transition-colors group-hover:text-premium-gold-light">
          {item.label}
        </p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/40">
          {item.description}
        </p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-premium-gold" />
    </Link>
  );
}
