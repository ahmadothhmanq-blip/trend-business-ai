"use client";

const DEFAULT_STATS = [
  { value: "15K+", label: "Rituals delivered", detail: "annual volume" },
  { value: "4.9", label: "Guest rating", detail: "verified reviews" },
  { value: "28", label: "Modalities", detail: "integrated care" },
  { value: "92%", label: "Return visits", detail: "member average" },
];

type LuminaWellnessStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function LuminaWellnessStats({
  eyebrow = "Quiet measures",
  title = "Numbers that rest lightly",
  subtitle = "Signals of care, arranged with space.",
  stats = DEFAULT_STATS,
}: LuminaWellnessStatsProps) {
  return (
    <section
      id="stats"
      data-v2-component="lumina-wellness-stats"
      aria-labelledby="lu-stats-title"
      className="lu-section lu-reveal"
    >
      <div className="mx-auto max-w-xl px-5 text-center sm:px-8">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h2 id="lu-stats-title" className="lu-headline-sm mt-4">
          {title}
        </h2>
        <p className="lu-body mx-auto mt-4 max-w-md">{subtitle}</p>
      </div>
      <dl className="lu-reveal-stagger mx-auto mt-10 max-w-md space-y-8 px-5 text-center sm:px-8">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dd className="lu-metric">{stat.value}</dd>
            <dt className="lu-font-body mt-2 text-sm text-[var(--color-muted)]">{stat.label}</dt>
            {stat.detail ? <p className="mt-1 text-xs text-[var(--color-muted)] opacity-70">{stat.detail}</p> : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
