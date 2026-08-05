"use client";

type Stat = { value: string; label: string; detail?: string };

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Stat[];
};

export function CorporateBusinessStats({
  eyebrow = "Track record",
  title = "Outcomes our clients measure",
  subtitle = "Representative results from recent advisory and transformation engagements.",
  stats = [
    { value: "40yr", label: "Combined partner tenure", detail: "Senior leadership" },
    { value: "28", label: "Countries served", detail: "Global delivery" },
    { value: "97%", label: "Client retention", detail: "Three-year average" },
    { value: "14wk", label: "Discovery to roadmap", detail: "Typical engagement" },
  ],
}: Props) {
  return (
    <section
      id="stats"
      data-v2-component="corporate-business-stats"
      aria-labelledby="cb-stats-title"
      className="cb-section-tight cb-section-ink relative overflow-hidden"
    >
      <div className="cb-grid-bg pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-signal)]/25 to-transparent"
        aria-hidden
      />

      <div className="cb-container relative">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="cb-eyebrow text-[var(--color-signal)]/80">{eyebrow}</p>
            <h2 id="cb-stats-title" className="cb-headline-sm mt-4 max-w-[14ch] text-white">
              {title}
            </h2>
          </div>
          <p className="cb-font-body max-w-sm text-sm leading-relaxed text-white/50 lg:text-end">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-[var(--radius-xl,20px)] border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-[color-mix(in_srgb,var(--color-ink)_92%,var(--color-primary))] px-8 py-10 sm:px-10 sm:py-12"
            >
              <p className="cb-font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-[var(--color-signal)]/70">
                0{index + 1}
              </p>
              <p className="cb-font-display mt-4 text-[clamp(2.25rem,4vw,3rem)] font-medium leading-none text-white">
                {stat.value}
              </p>
              <p className="cb-font-body mt-3 text-sm text-white/70">{stat.label}</p>
              {stat.detail ? (
                <p className="cb-font-mono mt-2 text-[0.625rem] uppercase tracking-[0.1em] text-white/35">
                  {stat.detail}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
