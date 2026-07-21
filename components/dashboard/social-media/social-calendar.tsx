"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SocialCampaign, SocialPost } from "@/types/social-media";

type ScheduleRow = {
  id: string;
  scheduled_at: string;
  status: string;
  social_posts?: { platform: string; title: string; status: string };
};

type Props = {
  view: "month" | "week";
  onSelectPost?: (postId: string) => void;
  campaignId?: string | null;
};

export function SocialCalendar({ view, onSelectPost, campaignId }: Props) {
  const [cursor, setCursor] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([]);

  const load = useCallback(async () => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
    const [schedRes, postsRes, campRes] = await Promise.all([
      fetch(`/api/social-media/schedules?from=${start.toISOString()}&to=${end.toISOString()}`),
      fetch("/api/social-media/posts?limit=100"),
      fetch("/api/social-media/campaigns"),
    ]);
    const schedData = await schedRes.json();
    const postsData = await postsRes.json();
    const campData = await campRes.json();
    setSchedules(schedData.schedules ?? []);
    setPosts(postsData.posts ?? []);
    setCampaigns(campData.campaigns ?? []);
  }, [cursor]);

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const result: Date[] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      result.push(new Date(year, month, d));
    }
    return result;
  }, [cursor]);

  const itemsForDay = (day: Date) => {
    const key = day.toISOString().slice(0, 10);
    const scheduled = schedules.filter((s) => s.scheduled_at.startsWith(key));
    const drafts = posts.filter(
      (p) =>
        p.status === "draft" &&
        p.updated_at.startsWith(key) &&
        (!campaignId || p.campaign_id === campaignId),
    );
    return { scheduled, drafts };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          <ChevronLeft className="size-4" />
        </Button>
        <h3 className="text-sm font-medium text-white">
          {cursor.toLocaleString("default", { month: "long", year: "numeric" })} · {view} view
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {campaigns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {campaigns.map((c) => (
            <span key={c.id} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
              {c.name} ({c.status})
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-medium uppercase text-white/30">{d}</div>
        ))}
        {Array.from({ length: days[0]?.getDay() ?? 0 }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const { scheduled, drafts } = itemsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[88px] rounded-lg border border-white/[0.06] p-1.5",
                isToday && "border-premium-gold/30 bg-premium-gold/5",
              )}
            >
              <p className="text-xs text-white/50">{day.getDate()}</p>
              {scheduled.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="mt-1 block w-full truncate rounded bg-blue-500/15 px-1 py-0.5 text-left text-[10px] text-blue-300"
                  onClick={() => onSelectPost?.(s.id)}
                >
                  {s.social_posts?.title ?? "Scheduled"}
                </button>
              ))}
              {drafts.slice(0, 2).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="mt-1 block w-full truncate rounded bg-white/5 px-1 py-0.5 text-left text-[10px] text-white/50"
                  onClick={() => onSelectPost?.(p.id)}
                >
                  {p.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
