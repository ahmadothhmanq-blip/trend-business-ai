"use client";

import { useEffect, useState } from "react";
import type { SocialPost } from "@/types/social-media";

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
          { label: "Drafts", value: drafts },
          { label: "Scheduled", value: scheduled },
          { label: "Published", value: published },
          { label: "Failed", value: failed },
          { label: "Total Posts", value: posts.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-white/40">Live analytics</p>
          {live && <span className="text-xs text-premium-gold-light">Live</span>}
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Impressions", value: metrics.totalImpressions },
            { label: "Likes", value: metrics.totalLikes },
            { label: "Comments", value: metrics.totalComments },
            { label: "Shares", value: metrics.totalShares },
            { label: "Clicks", value: metrics.totalClicks ?? 0 },
            { label: "Avg engagement", value: `${metrics.avgEngagementRate}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-white/40">{label}</p>
              <p className="text-lg font-medium text-white">{value}</p>
            </div>
          ))}
        </div>
        {metrics.recordCount === 0 && (
          <p className="mt-2 text-xs text-white/30">Metrics sync after publishing and platform webhooks.</p>
        )}
      </div>
    </div>
  );
}

export type { Summary as SocialDashboardSummary };
