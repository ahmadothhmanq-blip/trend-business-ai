"use client";

/** Stats live as the hero ticker; this section stays a slim secondary strip when included. */
const DEFAULT_STATS = [
  { value: "12", label: "Cities stocked", detail: "flagship" },
  { value: "48h", label: "White-glove window", detail: "metro" },
  { value: "1/yr", label: "Archive drop", detail: "numbered" },
  { value: "100%", label: "Traceable makers", detail: "atelier" },
];

type EcommercePremiumStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function EcommercePremiumStats({
  eyebrow = "Signals",
  title = "Collection pulse",
  subtitle,
  stats = DEFAULT_STATS,
}: EcommercePremiumStatsProps) {
  return (
    <section
      id="stats"
      data-v2-component="ecommerce-premium-stats"
      aria-label={title}
      className="ec-slim-ticker ec-reveal"
    >
      <p className="sr-only">
        {eyebrow}. {title}
        {subtitle ? ` ${subtitle}` : ""}
      </p>
      <dl className="ec-slim-ticker-row">
        {stats.map((s) => (
          <div key={s.label} className="ec-slim-ticker-item">
            <dd>{s.value}</dd>
            <dt>
              {s.label}
              {s.detail ? <span> · {s.detail}</span> : null}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
