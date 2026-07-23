"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BiDashboard, BiWidget } from "@/types/bi";
import type { BiMetricsSnapshot } from "@/lib/bi/metrics";
import { BarChartWidget, KpiCard, LineChartWidget, TrendIndicator } from "@/components/dashboard/bi/chart-widgets";

type Props = {
  initialDashboards?: BiDashboard[];
  initialWidgets?: BiWidget[];
  metrics?: BiMetricsSnapshot;
};

const METRIC_LABELS: Record<string, (m: BiMetricsSnapshot) => string> = {
  revenue: (m) => `$${m.revenue.toLocaleString()}`,
  expenses: (m) => `$${m.expenses.toLocaleString()}`,
  profit: (m) => `$${m.profit.toLocaleString()}`,
  pipeline_value: (m) => `$${m.pipelineValue.toLocaleString()}`,
  conversion_rate: (m) => `${m.conversionRate.toFixed(1)}%`,
  customer_growth: (m) => String(m.customerGrowth),
  inventory_value: (m) => `$${m.inventoryValue.toLocaleString()}`,
  marketing_roi: (m) => `${m.marketingRoi}%`,
};

export function DashboardBuilder({ initialDashboards = [], initialWidgets = [], metrics }: Props) {
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

  useEffect(() => {
    if (!selectedId) return;
    void fetch(`/api/bi/dashboards?dashboardId=${selectedId}`)
      .then((r) => r.json())
      .then((d) => setWidgets(d.widgets ?? []))
      .catch(() => undefined);
  }, [selectedId]);

  const createDashboard = async () => {
    if (!name.trim()) return toast.error("Enter a dashboard name");
    setLoading(true);
    try {
      const res = await fetch("/api/bi/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setDashboards((prev) => [data.dashboard, ...prev]);
      setSelectedId(data.dashboard.id);
      setName("");
      toast.success("Dashboard created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
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
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const list = await fetch("/api/bi/dashboards").then((r) => r.json());
      setDashboards(list.dashboards ?? []);
      setSelectedId(data.dashboardId);
      toast.success("Default dashboard ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const addWidget = async (widgetType: BiWidget["widget_type"], metricKey: string) => {
    if (!selectedId) return toast.error("Select or create a dashboard first");
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
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setWidgets((prev) => [...prev, data.widget]);
      toast.success("Widget added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const renderWidget = (w: BiWidget) => {
    const fn = METRIC_LABELS[w.metric_key];
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
              { label: "Rev", value: m.revenue },
              { label: "Exp", value: m.expenses },
              { label: "Pipe", value: m.pipelineValue },
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
          placeholder="New dashboard name"
          className="max-w-xs border-white/10 bg-white/5 text-white"
        />
        <Button onClick={() => void createDashboard()} disabled={loading}>
          Create dashboard
        </Button>
        <Button variant="outline" onClick={() => void ensureDefault()} disabled={loading}>
          Ensure default
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
        {dashboards.length === 0 && <p className="text-sm text-white/30">No dashboards yet.</p>}
      </div>

      {selectedId ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void addWidget("kpi", "revenue")} disabled={loading}>
              + KPI
            </Button>
            <Button size="sm" variant="outline" onClick={() => void addWidget("bar", "pipeline_value")} disabled={loading}>
              + Bar chart
            </Button>
            <Button size="sm" variant="outline" onClick={() => void addWidget("line", "revenue")} disabled={loading}>
              + Line chart
            </Button>
            <Button size="sm" variant="outline" onClick={() => void addWidget("trend", "conversion_rate")} disabled={loading}>
              + Trend
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{widgets.map(renderWidget)}</div>
        </>
      ) : null}
    </div>
  );
}
