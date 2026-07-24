"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BiDashboard, BiWidget } from "@/types/bi";
import type { BiMetricsSnapshot } from "@/lib/bi/metrics";
import { BarChartWidget, KpiCard, LineChartWidget, TrendIndicator } from "@/components/dashboard/bi/chart-widgets";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

type Props = {
  initialDashboards?: BiDashboard[];
  initialWidgets?: BiWidget[];
  metrics?: BiMetricsSnapshot;
};

export function DashboardBuilder({ initialDashboards = [], initialWidgets = [], metrics }: Props) {
  const wt = useWorkspaceT("bi");
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [widgets, setWidgets] = useState(initialWidgets);
  const [selectedId, setSelectedId] = useState(initialDashboards[0]?.id ?? "");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const m = metrics ?? {
    revenue: 0,
    expenses: 0,
    profit: 0,
    conversionRate: 0,
    pipelineValue: 0,
    customerGrowth: 0,
    inventoryValue: 0,
    marketingRoi: 0,
    byPeriod: {},
  };

  const metricLabels: Record<string, (snapshot: BiMetricsSnapshot) => string> = {
    revenue: (snapshot) => `$${snapshot.revenue.toLocaleString()}`,
    expenses: (snapshot) => `$${snapshot.expenses.toLocaleString()}`,
    profit: (snapshot) => `$${snapshot.profit.toLocaleString()}`,
    pipeline_value: (snapshot) => `$${snapshot.pipelineValue.toLocaleString()}`,
    conversion_rate: (snapshot) => `${snapshot.conversionRate.toFixed(1)}%`,
    customer_growth: (snapshot) => String(snapshot.customerGrowth),
    inventory_value: (snapshot) => `$${snapshot.inventoryValue.toLocaleString()}`,
    marketing_roi: (snapshot) => `${snapshot.marketingRoi}%`,
  };

  useEffect(() => {
    if (!selectedId) return;
    void fetch(`/api/bi/dashboards?dashboardId=${selectedId}`)
      .then((r) => r.json())
      .then((d) => setWidgets(d.widgets ?? []))
      .catch(() => undefined);
  }, [selectedId]);

  const createDashboard = async () => {
    if (!name.trim()) return toast.error(wt("panels.dashboards.dashboardNameRequired"));
    setLoading(true);
    try {
      const res = await fetch("/api/bi/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("toasts.failed"));
      setDashboards((prev) => [data.dashboard, ...prev]);
      setSelectedId(data.dashboard.id);
      setName("");
      toast.success(wt("toasts.dashboardCreated"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.failed"));
    } finally {
      setLoading(false);
    }
  };

  const ensureDefault = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bi/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ensure-default" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("toasts.failed"));
      const list = await fetch("/api/bi/dashboards").then((r) => r.json());
      setDashboards(list.dashboards ?? []);
      setSelectedId(data.dashboardId);
      toast.success(wt("toasts.defaultDashboardReady"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.failed"));
    } finally {
      setLoading(false);
    }
  };

  const addWidget = async (widgetType: BiWidget["widget_type"], metricKey: string) => {
    if (!selectedId) return toast.error(wt("panels.dashboards.selectDashboardFirst"));
    setLoading(true);
    try {
      const res = await fetch("/api/bi/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dashboardId: selectedId,
          title: metricKey.replace(/_/g, " "),
          widgetType,
          metricKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("toasts.failed"));
      setWidgets((prev) => [...prev, data.widget]);
      toast.success(wt("toasts.widgetAdded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.failed"));
    } finally {
      setLoading(false);
    }
  };

  const renderWidget = (w: BiWidget) => {
    const fn = metricLabels[w.metric_key];
    const value = fn ? fn(m) : "—";
    switch (w.widget_type) {
      case "kpi":
        return <KpiCard key={w.id} label={w.title} value={value} />;
      case "bar":
        return (
          <BarChartWidget
            key={w.id}
            title={w.title}
            data={[
              { label: wt("metrics.rev"), value: m.revenue },
              { label: wt("metrics.exp"), value: m.expenses },
              { label: wt("metrics.pipe"), value: m.pipelineValue },
            ]}
          />
        );
      case "line":
        return (
          <LineChartWidget
            key={w.id}
            title={w.title}
            data={[m.revenue * 0.7, m.revenue * 0.85, m.revenue, m.revenue * 1.05, m.revenue * 0.95]}
          />
        );
      case "trend":
        return (
          <TrendIndicator
            key={w.id}
            label={w.title}
            value={value}
            direction={m.profit >= 0 ? "up" : "down"}
          />
        );
      default:
        return (
          <div key={w.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase text-white/40">{w.title}</p>
            <p className="mt-1 text-lg text-white">{value}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={wt("forms.dashboardName")}
          className="max-w-xs border-white/10 bg-white/5 text-white"
        />
        <Button onClick={() => void createDashboard()} disabled={loading}>
          {wt("panels.dashboards.createDashboard")}
        </Button>
        <Button variant="outline" onClick={() => void ensureDefault()} disabled={loading}>
          {wt("panels.dashboards.ensureDefault")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {dashboards.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedId(d.id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${selectedId === d.id ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5"}`}
          >
            {d.name}
          </button>
        ))}
        {dashboards.length === 0 && <p className="text-sm text-white/30">{wt("panels.dashboards.noDashboards")}</p>}
      </div>

      {selectedId ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void addWidget("kpi", "revenue")} disabled={loading}>
              {wt("panels.dashboards.addKpi")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => void addWidget("bar", "pipeline_value")} disabled={loading}>
              {wt("panels.dashboards.addBarChart")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => void addWidget("line", "revenue")} disabled={loading}>
              {wt("panels.dashboards.addLineChart")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => void addWidget("trend", "conversion_rate")} disabled={loading}>
              {wt("panels.dashboards.addTrend")}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{widgets.map(renderWidget)}</div>
        </>
      ) : null}
    </div>
  );
}
