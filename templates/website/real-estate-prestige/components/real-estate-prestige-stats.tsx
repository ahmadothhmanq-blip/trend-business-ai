"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_STATS = [
  { value: "10+", label: "Years experience", detail: "in the market" },
  { value: "500+", label: "Clients served", detail: "and growing" },
  { value: "98%", label: "Satisfaction", detail: "client feedback" },
  { value: "24h", label: "Response time", detail: "business days" },
];

type Stat = { value: string; label: string; detail?: string };

type RealEstatePrestigeStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Stat[];
};

function parseStatValue(raw: string): { prefix: string; number: number; suffix: string; decimals: number } | null {
  const match = raw.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix = "", numberText = "0", suffix = ""] = match;
  const number = Number(numberText);
  if (!Number.isFinite(number)) return null;
  const decimals = numberText.includes(".") ? numberText.split(".")[1]!.length : 0;
  return { prefix, number, suffix, decimals };
}

function StatValue({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(value);
  const parsed = parseStatValue(value);

  useEffect(() => {
    if (!parsed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          const current = parsed.number * eased;
          setDisplay(
            `${parsed.prefix}${current.toFixed(parsed.decimals)}${parsed.suffix}`,
          );
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [parsed, value]);

  return (
    <dd ref={ref} className="rep-metric">
      {display}
    </dd>
  );
}

export function RealEstatePrestigeStats({
  stats = DEFAULT_STATS,
}: RealEstatePrestigeStatsProps) {
  if (!stats.length) return null;

  return (
    <section
      id="stats"
      data-v2-component="real-estate-prestige-stats"
      aria-labelledby="rep-stats-title"
      className="rep-reveal rep-section-band flex min-h-[50vh] items-center"
    >
      <div className="rep-container">
        <h2 id="rep-stats-title" className="sr-only">
          Key metrics
        </h2>
        <dl className="rep-reveal-stagger grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[var(--border-subtle)]">
          {stats.map((stat) => (
            <div key={`${stat.label}-${stat.value}`} className="px-4 text-center lg:px-8">
              <StatValue value={stat.value} />
              <dt className="rep-stat-label mt-3">{stat.label}</dt>
              {stat.detail ? <p className="rep-caption mt-1">{stat.detail}</p> : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
