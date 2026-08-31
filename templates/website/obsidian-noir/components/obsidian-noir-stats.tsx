"use client";

const DEFAULT_STATS = [
  { value: "1846", label: "Heritage year", detail: "Continuity" },
  { value: "12", label: "Ateliers", detail: "Active houses" },
  { value: "40+", label: "Countries", detail: "Private clients" },
  { value: "1", label: "Standard", detail: "Permanence" },
];

type ObsidianNoirStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function ObsidianNoirStats({
  eyebrow = "Measures",
  title = "Few numbers. Chosen carefully.",
  stats = DEFAULT_STATS,
}: ObsidianNoirStatsProps) {
  return (
    <section id="stats" data-v2-component="obsidian-noir-stats" className="ob-reveal ob-section px-5 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <p className="ob-eyebrow">{eyebrow}</p>
        <h2 className="ob-headline-sm mt-4 max-w-[14ch]">{title}</h2>
        <hr className="ob-rule mt-12" />
        <dl className="ob-reveal-stagger">
          {stats.map((s) => (
            <div key={s.label} className="grid gap-4 border-b border-[var(--border-default)] py-10 md:grid-cols-[10rem_1fr]">
              <dt className="ob-metric">{s.value}</dt>
              <dd>
                <p className="text-[var(--color-foreground)]">{s.label}</p>
                {s.detail ? <p className="ob-attribution mt-2">{s.detail}</p> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
