"use client";

const DEFAULT_STATS = [
  { value: "1,200+", label: "Lawyers worldwide", detail: "Across 42 jurisdictions" },
  { value: "140+", label: "Years of counsel", detail: "Institutional heritage" },
  { value: "98%", label: "Client retention", detail: "Multi-decade relationships" },
  { value: "Tier 1", label: "Rankings", detail: "Chambers & Legal 500" },
];

type CitadelTrustStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function CitadelTrustStats({
  eyebrow = "Credentials",
  title = "Institutional scale",
  subtitle = "Figures presented as credential seals within the dossier.",
  stats = DEFAULT_STATS,
}: CitadelTrustStatsProps) {
  return (
    <section
      id="stats"
      data-v2-component="citadel-trust-stats"
      aria-labelledby="ct-stats-title"
      className="ct-dossier ct-section ct-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="ct-doc">
          <p className="ct-doc-ribbon">
            <span className="ct-doc-seal-mark" aria-hidden />
            {eyebrow}
          </p>
          <h2 id="ct-stats-title" className="ct-headline-sm">
            {title}
          </h2>
          <p className="ct-body mt-4">{subtitle}</p>
          <dl className="ct-reveal-stagger mt-8 grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="ct-attestation text-center">
                <div className="ct-attestation-seal mx-auto" aria-hidden>
                  ◆
                </div>
                <dd className="ct-font-display text-3xl font-semibold text-[var(--color-accent)]">{stat.value}</dd>
                <dt className="mt-2 font-semibold">{stat.label}</dt>
                {stat.detail ? <p className="mt-1 text-xs text-[var(--color-muted)]">{stat.detail}</p> : null}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
