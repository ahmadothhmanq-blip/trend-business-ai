"use client";

const DEFAULT_STATS = [
  { value: "$2.4B", label: "Transactions closed", detail: "last 24 months" },
  { value: "180+", label: "Premier listings", detail: "active portfolio" },
  { value: "14", label: "Global markets", detail: "advisory desks" },
  { value: "96%", label: "Client satisfaction", detail: "verified reviews" },
];

type RealEstatePremiumStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function RealEstatePremiumStats({
  eyebrow = "Market figures",
  title = "Performance sheet",
  subtitle = "Key figures from the active advisory book.",
  stats = DEFAULT_STATS,
}: RealEstatePremiumStatsProps) {
  return (
    <section id="stats" data-v2-component="real-estate-premium-stats" className="rep-section-plain rep-reveal">
      <div className="rep-section-plain-inner">
        <p className="rep-eyebrow">{eyebrow}</p>
        <h2 className="rep-amenities-title">{title}</h2>
        <p className="rep-body text-[var(--color-muted)]">{subtitle}</p>
        <dl className="rep-stats-sheet">
          {stats.map((s) => (
            <div key={s.label}>
              <dt>
                {s.label}
                {s.detail ? <span className="mt-1 block text-xs text-[var(--color-muted)]">{s.detail}</span> : null}
              </dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
