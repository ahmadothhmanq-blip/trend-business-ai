"use client";

const DEFAULT_STATS = [
  { value: "12ms", label: "Inference latency", detail: "p99 edge" },
  { value: "99.99%", label: "Platform uptime", detail: "global SLA" },
  { value: "140+", label: "API endpoints", detail: "production" },
  { value: "48", label: "Regions live", detail: "multi-cloud" },
];

type PrismAuroraStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function PrismAuroraStats({
  eyebrow = "Impact",
  title = "Numbers that matter",
  subtitle = "Measured across our global client base.",
  stats = DEFAULT_STATS,
}: PrismAuroraStatsProps) {
  return (
    <section id="stats" data-v2-component="prism-aurora-stats" className="pr-reveal pr-section bg-[var(--color-background)] px-4 sm:px-6">
      <div className="mx-auto max-w-[88rem]">
        <p className="pr-eyebrow">{eyebrow}</p>
        <h2 className="pr-headline-sm mt-2">{title}</h2>
        <p className="pr-body mt-2 max-w-md">{subtitle}</p>
        <div className="pr-mosaic pr-reveal-stagger mt-8">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`pr-tile ${
                i === 0
                  ? "pr-span-5 pr-row-2 pr-tile-cta"
                  : i === 1
                    ? "pr-span-7 pr-tile-field-a"
                    : i === 2
                      ? "pr-span-4 pr-tile-field-b"
                      : "pr-span-8 pr-tile-field-c"
              }`}
            >
              <p className={`pr-metric ${i === 0 ? "!text-white" : ""}`}>{s.value}</p>
              <p className={`mt-2 font-semibold ${i === 0 ? "text-white" : ""}`}>{s.label}</p>
              {s.detail ? <p className={`pr-body mt-1 text-xs ${i === 0 ? "!text-white/70" : ""}`}>{s.detail}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
