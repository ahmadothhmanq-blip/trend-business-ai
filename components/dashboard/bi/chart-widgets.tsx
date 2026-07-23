"use client";

type KpiCardProps = { label: string; value: string; trend?: number; unit?: string };

export function KpiCard({ label, value, trend, unit }: KpiCardProps) {
  const trendLabel = trend === undefined ? null : trend >= 0 ? `+${trend}%` : `${trend}%`;
  const trendColor = trend === undefined ? "" : trend >= 0 ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-xs uppercase text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">
        {value}
        {unit ? <span className="ml-1 text-sm font-normal text-white/40">{unit}</span> : null}
      </p>
      {trendLabel ? <p className={`mt-1 text-xs ${trendColor}`}>{trendLabel} vs prior period</p> : null}
    </div>
  );
}

export function BarChartWidget({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="mb-3 text-xs uppercase text-white/40">{title}</p>
      <div className="flex h-40 items-end gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-premium-gold/40"
              style={{ height: `${Math.max(8, (d.value / max) * 100)}%` }}
            />
            <span className="text-[10px] text-white/40">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChartWidget({ title, data }: { title: string; data: number[] }) {
  const max = Math.max(...data, 1);
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (v / max) * 80;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="mb-3 text-xs uppercase text-white/40">{title}</p>
      <svg viewBox="0 0 100 100" className="h-32 w-full" preserveAspectRatio="none">
        <polyline fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="2" points={points} />
      </svg>
    </div>
  );
}

export function TrendIndicator({ label, value, direction }: { label: string; value: string; direction: "up" | "down" | "flat" }) {
  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  const color = direction === "up" ? "text-emerald-400" : direction === "down" ? "text-rose-400" : "text-white/40";
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-xs uppercase text-white/40">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      <p className={`mt-1 text-sm ${color}`}>{arrow} trend</p>
    </div>
  );
}

export function DataTableWidget({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 overflow-x-auto">
      <p className="mb-3 text-xs uppercase text-white/40">{title}</p>
      <table className="w-full text-sm text-white/70">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase text-white/40">
            {columns.map((c) => (
              <th key={c} className="pb-2 pr-4">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-4 text-white/30">
                No data
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                {row.map((cell, j) => (
                  <td key={j} className="py-2 pr-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
