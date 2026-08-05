"use client";

import { useEffect, useRef, useState } from "react";

const SHOWCASE_ITEMS = [
  "Brand Systems",
  "Spatial Design",
  "Motion & Film",
  "Digital Products",
  "Cultural Strategy",
  "Art Direction",
];

type CreativePortfolioOverlayShowcaseProps = {
  headline?: string;
  subline?: string;
};

export function CreativePortfolioOverlayShowcase({
  headline = "Culture in motion",
  subline = "Post-scroll kinetic showcase — our disciplines in perpetual drift",
}: CreativePortfolioOverlayShowcaseProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      data-v2-component="creative-portfolio-overlay-showcase"
      aria-label="Studio showcase"
      className={[
        "relative min-h-[50vh] overflow-hidden border-t border-[var(--border-volt)] bg-[var(--color-background)] py-16 lg:min-h-[60vh] lg:py-24",
        visible ? "cp-overlay-active" : "",
      ].join(" ")}
    >
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <div className="cp-marquee-track flex whitespace-nowrap">
          {[...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="cp-font-display mx-8 text-[clamp(3rem,12vw,8rem)] font-bold uppercase tracking-tighter text-[var(--color-surface)]"
            >
              {item}
              <span className="mx-8 text-[var(--color-volt)]">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="cp-font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-volt)]">
            {subline}
          </p>
          <h2 className="cp-font-display mt-6 text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl">
            {headline}
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {SHOWCASE_ITEMS.slice(0, 4).map((item) => (
              <span
                key={item}
                className="border border-[var(--border-default)] px-4 py-2 cp-font-mono text-[0.6875rem] uppercase tracking-widest text-[var(--color-muted)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
