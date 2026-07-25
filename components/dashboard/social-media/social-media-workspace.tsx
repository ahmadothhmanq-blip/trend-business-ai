"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CalendarDays, LayoutDashboard, Link2, PenSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { PostComposer } from "@/components/dashboard/social-media/post-composer";
import { ContentLibrary } from "@/components/dashboard/social-media/content-library";
import { SocialDashboard } from "@/components/dashboard/social-media/social-dashboard";
import { SocialCalendar } from "@/components/dashboard/social-media/social-calendar";
import { ConnectedAccountsPanel } from "@/components/dashboard/social-media/connected-accounts";
import type { SocialPost } from "@/types/social-media";
import type { WorkspaceGeneration } from "@/types/database";

function StrategyWorkspaceLoading() {
  const wt = useWorkspaceT("socialMedia");
  return <div className="text-sm text-white/40">{wt("workspace.loadingStrategy")}</div>;
}

const WorkspaceStrategy = dynamic(
  () =>
    import("@/components/dashboard/social-media/strategy-workspace").then((m) => m.StrategyWorkspace),
  { loading: () => <StrategyWorkspaceLoading /> },
);

type Brand = { id: string; brand_name: string };

type Tab = "dashboard" | "compose" | "calendar" | "accounts" | "strategy";

type Props = {
  initialPosts?: SocialPost[];
  initialGenerations?: WorkspaceGeneration[];
  brands?: Brand[];
  analyticsSummary?: import("@/components/dashboard/social-media/social-dashboard").SocialDashboardSummary;
};

export function SocialMediaWorkspace({
  initialPosts = [],
  initialGenerations = [],
  brands = [],
  analyticsSummary,
}: Props) {
  const wt = useWorkspaceT("socialMedia");
  const [tab, setTab] = useState<Tab>("compose");
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [activePost, setActivePost] = useState<Partial<SocialPost> | null>(null);
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");

  const summary = analyticsSummary ?? {
    totalImpressions: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalClicks: 0,
    avgEngagementRate: 0,
    recordCount: 0,
  };

  const tabs = [
    { key: "dashboard" as const, label: wt("workspace.tabs.dashboard"), icon: LayoutDashboard },
    { key: "compose" as const, label: wt("workspace.tabs.compose"), icon: PenSquare },
    { key: "calendar" as const, label: wt("workspace.tabs.calendar"), icon: CalendarDays },
    { key: "accounts" as const, label: wt("workspace.tabs.accounts"), icon: Link2 },
    { key: "strategy" as const, label: wt("workspace.tabs.strategy"), icon: Sparkles },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium min-w-[120px]",
              tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <SocialDashboard posts={posts} summary={summary} />}

      {tab === "compose" && (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">{wt("workspace.contentLibrary")}</p>
            <ContentLibrary
              selectedId={activePost?.id}
              onSelect={(p) => {
                setActivePost(p);
                setPosts((prev) => {
                  const idx = prev.findIndex((x) => x.id === p.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = p;
                    return next;
                  }
                  return [p, ...prev];
                });
              }}
            />
          </div>
          <PostComposer
            post={activePost}
            brands={brands}
            onChange={(patch) => setActivePost((prev) => ({ ...prev, ...patch }))}
            onSaved={(p) => {
              setActivePost(p);
              setPosts((prev) => {
                const idx = prev.findIndex((x) => x.id === p.id);
                if (idx >= 0) {
                  const next = [...prev];
                  next[idx] = p;
                  return next;
                }
                return [p, ...prev];
              });
            }}
          />
        </div>
      )}

      {tab === "calendar" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCalendarView(v)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs capitalize",
                  calendarView === v ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40",
                )}
              >
                {wt(`workspace.views.${v}`)}
              </button>
            ))}
          </div>
          <SocialCalendar view={calendarView} />
        </div>
      )}

      {tab === "accounts" && <ConnectedAccountsPanel />}

      {tab === "strategy" && (
        <WorkspaceStrategy initialGenerations={initialGenerations} />
      )}
    </div>
  );
}
