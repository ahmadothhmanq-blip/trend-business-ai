/**
 * Aggregate website analytics into dashboard summaries.
 */

import {
  isAnalyticsSeeded,
  listAnalyticsEvents,
} from "@/lib/ai-core/analytics/store";
import type {
  AnalyticsBreakdownItem,
  AnalyticsTimePoint,
  WebsiteAnalyticsSummary,
} from "@/lib/ai-core/analytics/types";

function shareItems(
  counts: Map<string, number>,
  total: number,
  labelFn?: (key: string) => string,
): AnalyticsBreakdownItem[] {
  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      label: labelFn ? labelFn(key) : key,
      count,
      share: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Build analytics dashboard summary for a website generation.
 */
export function buildWebsiteAnalyticsSummary(
  generationId: string,
  rangeDays = 14,
): WebsiteAnalyticsSummary {
  const since = new Date(
    Date.now() - rangeDays * 86_400_000,
  ).toISOString();
  const events = listAnalyticsEvents(generationId, since);

  const pageViews = events.filter((e) => e.eventName === "page_view");
  const clicks = events.filter(
    (e) => e.eventName === "button_click" || e.eventName === "cta_click",
  );
  const conversions = events.filter((e) => e.eventName === "conversion");

  const visitors = new Set(events.map((e) => e.visitorId));
  const sessions = new Set(events.map((e) => e.sessionId));

  const sessionPages = new Map<string, number>();
  for (const e of pageViews) {
    sessionPages.set(e.sessionId, (sessionPages.get(e.sessionId) || 0) + 1);
  }
  const singlePageSessions = [...sessionPages.values()].filter(
    (n) => n <= 1,
  ).length;
  const bounceRate =
    sessions.size > 0
      ? Math.round((singlePageSessions / sessions.size) * 1000) / 10
      : 0;
  const avgSessionPages =
    sessions.size > 0
      ? Math.round((pageViews.length / sessions.size) * 10) / 10
      : 0;

  const conversionRate =
    visitors.size > 0
      ? Math.round((conversions.length / visitors.size) * 1000) / 10
      : 0;

  const sourceCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const pageCounts = new Map<string, number>();
  const buttonCounts = new Map<string, number>();

  for (const e of pageViews) {
    sourceCounts.set(e.source, (sourceCounts.get(e.source) || 0) + 1);
    deviceCounts.set(e.device, (deviceCounts.get(e.device) || 0) + 1);
    pageCounts.set(e.pagePath, (pageCounts.get(e.pagePath) || 0) + 1);
  }
  for (const e of clicks) {
    const key = e.target || "unknown";
    buttonCounts.set(key, (buttonCounts.get(key) || 0) + 1);
  }

  const seriesMap = new Map<string, AnalyticsTimePoint>();
  for (let i = rangeDays - 1; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    seriesMap.set(d, {
      date: d,
      pageViews: 0,
      uniqueVisitors: 0,
      sessions: 0,
      conversions: 0,
      clicks: 0,
    });
  }

  const dayVisitors = new Map<string, Set<string>>();
  const daySessions = new Map<string, Set<string>>();

  for (const e of events) {
    const d = dayKey(e.createdAt);
    const point = seriesMap.get(d);
    if (!point) continue;
    if (e.eventName === "page_view") point.pageViews += 1;
    if (e.eventName === "button_click" || e.eventName === "cta_click") {
      point.clicks += 1;
    }
    if (e.eventName === "conversion") point.conversions += 1;
    if (!dayVisitors.has(d)) dayVisitors.set(d, new Set());
    if (!daySessions.has(d)) daySessions.set(d, new Set());
    dayVisitors.get(d)!.add(e.visitorId);
    daySessions.get(d)!.add(e.sessionId);
  }

  for (const [d, point] of seriesMap) {
    point.uniqueVisitors = dayVisitors.get(d)?.size || 0;
    point.sessions = daySessions.get(d)?.size || 0;
  }

  const conversionScore = Math.min(
    100,
    Math.round(
      conversionRate * 6 +
        Math.min(40, pageViews.length / 20) +
        Math.min(20, clicks.length / 10) +
        (100 - Math.min(bounceRate, 80)) * 0.15,
    ),
  );

  return {
    generationId,
    rangeDays,
    pageViews: pageViews.length,
    uniqueVisitors: visitors.size,
    sessions: sessions.size,
    buttonClicks: clicks.length,
    conversions: conversions.length,
    conversionRate,
    bounceRate,
    avgSessionPages,
    trafficSources: shareItems(sourceCounts, pageViews.length),
    devices: shareItems(deviceCounts, pageViews.length),
    topPages: shareItems(pageCounts, pageViews.length).slice(0, 8),
    topButtons: shareItems(buttonCounts, clicks.length || 1).slice(0, 8),
    series: [...seriesMap.values()],
    conversionScore,
    seeded: isAnalyticsSeeded(generationId),
    updatedAt: new Date().toISOString(),
  };
}
