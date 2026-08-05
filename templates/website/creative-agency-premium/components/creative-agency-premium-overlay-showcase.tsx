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

type CreativeAgencyPremiumOverlayShowcaseProps = {
  headline?: string;
  subline?: string;
};

export function CreativeAgencyPremiumOverlayShowcase({
  headline = "Culture in motion",
  subline = "Post-scroll kinetic showcase — disciplines in perpetual drift",
}: CreativeAgencyPremiumOverlayShowcaseProps) {
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
      data-v2-component="creative-agency-premium-overlay-showcase"
      aria-label="Studio showcase"
      className={[
        "relative min-h-[55vh] overflow-hidden border-t-2 border-[var(--color-volt)] bg-[var(--color-background)] py-20 lg:min-h-[65vh] lg:py-28",
        visible ? "sv-overlay-active" : "",
      ].join(" ")}
    >
      <div className="absolute inset-0 opacity-25" aria-hidden>
        <div className="sv-marquee-track flex whitespace-nowrap">
          {[...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="sv-font-display mx-10 text-[clamp(3rem,14vw,9rem)] font-bold uppercase tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--color-surface)]"
            >
              {item}
              <span className="mx-10 text-[var(--color-volt)] [-webkit-text-stroke:0]">/</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="sv-font-mono text-xs uppercase tracking-[0.32em] text-[var(--color-volt)]">
            {subline}
          </p>
          <h2 className="sv-font-display mt-8 text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl">
            {headline}
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {SHOWCASE_ITEMS.slice(0, 4).map((item) => (
              <span
                key={item}
                className="border border-[var(--border-default)] px-5 py-2.5 sv-font-mono text-[0.6875rem] uppercase tracking-widest text-[var(--color-muted)] opacity-70 transition hover:border-[var(--border-volt)] hover:text-[var(--color-volt)]"
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
