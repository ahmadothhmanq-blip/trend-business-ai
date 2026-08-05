"use client";

type CreativePortfolioHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  scrollLabel?: string;
  discipline?: string;
};

export function CreativePortfolioHero({
  eyebrow = "Elite creative studio",
  title = "We craft worlds that refuse to be ignored",
  subtitle = "Architecture, identity, motion, and digital experiences for studios who demand the extraordinary — not the expected.",
  scrollLabel = "Scroll to explore",
  discipline = "Design · Motion · Brand · Digital",
}: CreativePortfolioHeroProps) {
  const words = title.split(" ");

  return (
    <section
      id="top"
      data-v2-component="creative-portfolio-hero"
      aria-labelledby="cp-hero-title"
      className="relative min-h-[92vh] overflow-hidden border-b border-[var(--border-subtle)]"
    >
      <div
        className="pointer-events-none absolute -end-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[var(--color-magenta)]/10 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -start-16 bottom-0 h-64 w-64 bg-[var(--color-volt)]/8 blur-[80px]"
        aria-hidden
      />

      <div className="relative flex min-h-[92vh] flex-col justify-between px-5 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="cp-eyebrow motion-safe:cp-animate-slam">{eyebrow}</p>
          <p className="cp-font-mono hidden text-[0.6875rem] uppercase tracking-[0.25em] text-[var(--color-zinc)] sm:block">
            {discipline}
          </p>
        </div>

        <div className="my-auto py-12 lg:py-20">
          <h1
            id="cp-hero-title"
            className="cp-display max-w-[14ch] leading-[0.92] motion-safe:cp-animate-slam"
          >
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={[
                  "inline-block",
                  i % 4 === 2 ? "text-[var(--color-volt)]" : "",
                  i % 5 === 4 ? "italic text-[var(--color-magenta)]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {word}{" "}
              </span>
            ))}
          </h1>
          <p className="cp-body mt-8 max-w-xl motion-safe:cp-animate-rise">{subtitle}</p>
        </div>

        <div className="flex items-end justify-between gap-6 border-t border-[var(--border-subtle)] pt-8">
          <a
            href="#work"
            className="cp-font-mono cp-focus-ring group flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]"
          >
            <span
              className="inline-block h-8 w-px bg-[var(--color-volt)] motion-safe:animate-[cp-scroll-pulse_2s_ease-in-out_infinite]"
              aria-hidden
            />
            {scrollLabel}
          </a>
          <span className="cp-font-mono text-[4rem] font-bold leading-none text-[var(--color-surface)] sm:text-[6rem]" aria-hidden>
            ✦
          </span>
        </div>
      </div>
    </section>
  );
}
