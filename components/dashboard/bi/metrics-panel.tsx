"use client";

import { useEffect, useState } from "react";
import type { BiMetric } from "@/types/bi";
import type { BiMetricsSnapshot } from "@/lib/bi/metrics";
import { DataTableWidget } from "@/components/dashboard/bi/chart-widgets";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

type Props = {
  initialMetrics?: BiMetric[];
  computed?: BiMetricsSnapshot;
};

export function MetricsPanel({ initialMetrics = [], computed }: Props) {
  const wt = useWorkspaceT("bi");
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
    [wt("metrics.revenue"), `$${c.revenue.toLocaleString()}`],
    [wt("metrics.expenses"), `$${c.expenses.toLocaleString()}`],
    [wt("metrics.profit"), `$${c.profit.toLocaleString()}`],
    [wt("metrics.conversionRate"), `${c.conversionRate.toFixed(1)}%`],
    [wt("metrics.salesPipeline"), `$${c.pipelineValue.toLocaleString()}`],
    [wt("metrics.customerGrowth"), String(c.customerGrowth)],
    [wt("metrics.inventoryValue"), `$${c.inventoryValue.toLocaleString()}`],
    [wt("metrics.marketingRoi"), `${c.marketingRoi}%`],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DataTableWidget
        title={wt("panels.metrics.calculatedMetrics")}
        columns={[wt("panels.metrics.metricColumn"), wt("panels.metrics.currentValue")]}
        rows={computedRows}
      />
      <DataTableWidget
        title={wt("panels.metrics.metricDefinitions")}
        columns={[wt("panels.metrics.keyColumn"), wt("panels.metrics.formulaColumn"), wt("panels.metrics.aggregationColumn")]}
        rows={metrics.map((m) => [m.key, m.formula, m.aggregation])}
      />
    </div>
  );
}
