"use client";

import { useEffect, useState } from "react";
import type { BiMetric } from "@/types/bi";
import type { BiMetricsSnapshot } from "@/lib/bi/metrics";
import { DataTableWidget } from "@/components/dashboard/bi/chart-widgets";

type Props = {
  initialMetrics?: BiMetric[];
  computed?: BiMetricsSnapshot;
};

export function MetricsPanel({ initialMetrics = [], computed }: Props) {
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => {
    void fetch("/api/bi/metrics")
      .then((r) => r.json())
      .then((d) => d.metrics && setMetrics(d.metrics))
      .catch(() => undefined);
  }, []);

  const c = computed ?? {
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

  const computedRows: [string, string][] = [
    ["Revenue", `$${c.revenue.toLocaleString()}`],
    ["Expenses", `$${c.expenses.toLocaleString()}`],
    ["Profit", `$${c.profit.toLocaleString()}`],
    ["Conversion Rate", `${c.conversionRate.toFixed(1)}%`],
    ["Sales Pipeline", `$${c.pipelineValue.toLocaleString()}`],
    ["Customer Growth", String(c.customerGrowth)],
    ["Inventory Value", `$${c.inventoryValue.toLocaleString()}`],
    ["Marketing ROI", `${c.marketingRoi}%`],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DataTableWidget
        title="Calculated metrics"
        columns={["Metric", "Current value"]}
        rows={computedRows}
      />
      <DataTableWidget
        title="Metric definitions"
        columns={["Key", "Formula", "Aggregation"]}
        rows={metrics.map((m) => [m.key, m.formula, m.aggregation])}
      />
    </div>
  );
}
