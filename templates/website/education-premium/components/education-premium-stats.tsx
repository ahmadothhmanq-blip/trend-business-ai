"use client";

const DEFAULT_STATS = [
  { value: "12K+", label: "Students enrolled", detail: "global community" },
  { value: "94%", label: "Graduate placement", detail: "within 6 months" },
  { value: "180", label: "Years of heritage", detail: "established 1846" },
  { value: "40+", label: "Partner universities", detail: "worldwide" },
];

type EducationPremiumStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function EducationPremiumStats({
  eyebrow = "Almanac",
  title = "By the numbers",
  subtitle = "Figures drawn from the registrar and the research office.",
  stats = DEFAULT_STATS,
}: EducationPremiumStatsProps) {
  return (
    <section
      id="stats"
      data-v2-component="education-premium-stats"
      aria-labelledby="ed-stats-title"
      className="ed-by-numbers ed-paper ed-reveal"
    >
      <div className="ed-by-numbers-inner">
        <header className="ed-section-head ed-section-head-inline">
          <div>
            <p className="ed-eyebrow">{eyebrow}</p>
            <h2 id="ed-stats-title" className="ed-headline-sm ed-font-display">
              {title}
            </h2>
          </div>
          <p className="ed-body ed-by-numbers-sub">{subtitle}</p>
        </header>

        <div className="ed-rule" aria-hidden />

        <dl className="ed-by-numbers-row ed-reveal-stagger">
          {stats.map((s) => (
            <div key={s.label} className="ed-by-numbers-item">
              <dd className="ed-metric ed-font-display">{s.value}</dd>
              <dt className="ed-by-numbers-label">{s.label}</dt>
              {s.detail ? <p className="ed-by-numbers-detail">{s.detail}</p> : null}
            </div>
          ))}
        </dl>

        <div className="ed-rule" aria-hidden />
      </div>
    </section>
  );
}
