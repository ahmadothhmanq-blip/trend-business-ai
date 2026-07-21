"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CalendarDays, LayoutDashboard, Link2, PenSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostComposer } from "@/components/dashboard/social-media/post-composer";
import { ContentLibrary } from "@/components/dashboard/social-media/content-library";
import { SocialDashboard } from "@/components/dashboard/social-media/social-dashboard";
import { SocialCalendar } from "@/components/dashboard/social-media/social-calendar";
import { ConnectedAccountsPanel } from "@/components/dashboard/social-media/connected-accounts";
import type { SocialPost } from "@/types/social-media";
import type { WorkspaceGeneration } from "@/types/database";

const WorkspaceStrategy = dynamic(
  () =>
    import("@/components/dashboard/social-media/strategy-workspace").then((m) => m.StrategyWorkspace),
  { loading: () => <div className="text-sm text-white/40">Loading AI strategy…</div> },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {(
          [
            { key: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
            { key: "compose" as const, label: "Composer", icon: PenSquare },
            { key: "calendar" as const, label: "Calendar", icon: CalendarDays },
            { key: "accounts" as const, label: "Accounts", icon: Link2 },
            { key: "strategy" as const, label: "AI Strategy", icon: Sparkles },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
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
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">Content Library</p>
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
                {v}
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
