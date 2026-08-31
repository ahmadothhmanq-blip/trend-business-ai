"use client";

const DEFAULT_STATS = [
  { value: "25+", label: "Years of practice" },
  { value: "40+", label: "Markets served" },
  { value: "98%", label: "Client retention" },
  { value: "24h", label: "Response standard" },
];

type RestaurantPremiumStatsProps = {
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function RestaurantPremiumStats({ stats = DEFAULT_STATS }: RestaurantPremiumStatsProps) {
  if (!stats.length) return null;

  return (
    <section id="stats" data-v2-component="restaurant-premium-stats" aria-label="Key metrics" className="rp-reveal rp-metrics">
      <div className="rp-shell">
        <dl className="rp-metrics-grid rp-reveal-stagger">
          {stats.map((stat) => (
            <div key={stat.label} className="rp-metrics-item">
              <dd className="rp-metric">{stat.value}</dd>
              <dt>{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
