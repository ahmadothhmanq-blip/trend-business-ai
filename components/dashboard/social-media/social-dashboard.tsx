"use client";

import { useEffect, useState } from "react";
import type { SocialPost } from "@/types/social-media";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

type Summary = {
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks?: number;
  avgEngagementRate: number;
  recordCount: number;
};

type Props = {
  posts: SocialPost[];
  summary: Summary;
};

export function SocialDashboard({ posts, summary }: Props) {
  const wt = useWorkspaceT("socialMedia");
  const [live, setLive] = useState<Summary | null>(null);
  const drafts = posts.filter((p) => p.status === "draft").length;
  const scheduled = posts.filter((p) => p.status === "scheduled").length;
  const published = posts.filter((p) => p.status === "published").length;
  const failed = posts.filter((p) => p.status === "failed").length;

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/social-media/analytics/live");
        const data = await res.json();
        if (res.ok && data.live) setLive(data.live);
      } catch {
        // optional
      }
    })();
  }, []);

  const metrics = live ?? summary;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: wt("dashboard.drafts"), value: drafts },
          { label: wt("dashboard.scheduled"), value: scheduled },
          { label: wt("dashboard.published"), value: published },
          { label: wt("dashboard.failed"), value: failed },
          { label: wt("dashboard.totalPosts"), value: posts.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-white/40">{wt("dashboard.liveAnalytics")}</p>
          {live && <span className="text-xs text-premium-gold-light">{wt("dashboard.live")}</span>}
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: wt("dashboard.impressions"), value: metrics.totalImpressions },
            { label: wt("dashboard.likes"), value: metrics.totalLikes },
            { label: wt("dashboard.comments"), value: metrics.totalComments },
            { label: wt("dashboard.shares"), value: metrics.totalShares },
            { label: wt("dashboard.clicks"), value: metrics.totalClicks ?? 0 },
            { label: wt("dashboard.avgEngagement"), value: `${metrics.avgEngagementRate}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-white/40">{label}</p>
              <p className="text-lg font-medium text-white">{value}</p>
            </div>
          ))}
        </div>
        {metrics.recordCount === 0 && (
          <p className="mt-2 text-xs text-white/30">{wt("dashboard.metricsSyncHint")}</p>
        )}
      </div>
    </div>
  );
}

export type { Summary as SocialDashboardSummary };
