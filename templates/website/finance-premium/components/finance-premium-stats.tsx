"use client";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function FinancePremiumStats({
  eyebrow = "Track record",
  title = "Measured by enduring outcomes",
  subtitle = "Representative metrics from our private wealth and institutional advisory practice.",
  stats = [
    { value: "$24B", label: "Assets under management", detail: "Global platform" },
    { value: "140+", label: "Years of stewardship", detail: "Since 1884" },
    { value: "98%", label: "Client retention", detail: "Ten-year average" },
    { value: "42", label: "Global offices", detail: "Worldwide presence" },
  ],
}: Props) {
  return (
    <section
      id="stats"
      data-v2-component="finance-premium-stats"
      aria-labelledby="stats-title"
      className="fn-section fn-section-glow relative overflow-hidden bg-[var(--color-ink)]"
    >
      <div className="fn-glow-orb -start-24 top-0 h-64 w-64 bg-[var(--color-signal)]" aria-hidden />
      <div className="fn-glow-orb end-0 bottom-0 h-48 w-48 bg-[var(--color-primary)]" aria-hidden />
      <div className="fn-gold-rule absolute inset-x-0 top-0 opacity-25" aria-hidden />

      <div className="relative mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 text-center">
          <p className="fn-eyebrow mb-3">{eyebrow}</p>
          <h2 id="stats-title" className="fn-headline-sm text-[var(--color-background)]">
            {title}
          </h2>
          <div className="fn-accent-line mx-auto mt-4" aria-hidden />
          {subtitle ? (
            <p className="fn-font-body mx-auto mt-5 max-w-lg text-[color-mix(in_srgb,var(--color-background)_70%,transparent)]">
              {subtitle}
            </p>
          ) : null}
        </header>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-signal)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-background)_6%,transparent)] p-6 text-center sm:p-7"
            >
              <dt className="fn-font-body text-sm font-medium text-[color-mix(in_srgb,var(--color-background)_65%,transparent)]">
                {stat.label}
              </dt>
              <dd className="fn-metric mt-3 block text-[var(--color-signal)]">{stat.value}</dd>
              {stat.detail ? (
                <dd className="fn-font-body mt-2 text-xs text-[color-mix(in_srgb,var(--color-background)_55%,transparent)]">
                  {stat.detail}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
