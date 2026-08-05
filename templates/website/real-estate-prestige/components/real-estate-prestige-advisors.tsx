"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

const ADVISORS = [
  { name: "Eleanor Whitmore", role: "Managing Director", market: "Manhattan", imageIndex: 7 },
  { name: "James Calder", role: "Senior Advisor", market: "Hamptons", imageIndex: 8 },
  { name: "Sofia Marchetti", role: "Private Client Lead", market: "Aspen", imageIndex: 9 },
];

type RealEstatePrestigeAdvisorsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RealEstatePrestigeAdvisors({
  eyebrow = "Advisors",
  title = "Your private advisory team",
  subtitle = "Decades of market intelligence, discreet representation, and an unwavering commitment to your interests.",
}: RealEstatePrestigeAdvisorsProps) {
  return (
    <section
      id="advisors"
      data-v2-component="real-estate-prestige-advisors"
      aria-labelledby="rep-advisors-title"
      className="rep-section bg-[var(--color-surface)]"
    >
      <div className="px-5 sm:px-8 lg:px-10">
        <header className="mb-14 max-w-xl">
          <p className="rep-eyebrow mb-5">{eyebrow}</p>
          <h2 id="rep-advisors-title" className="rep-headline-sm">
            {title}
          </h2>
          <div className="rep-brass-rule my-6" />
          <p className="rep-body">{subtitle}</p>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          {ADVISORS.map((advisor) => {
            const src = resolveSlotImage("about", advisor.imageIndex);
            return (
              <article key={advisor.name} className="group">
                <figure className="rep-card overflow-hidden">
                  {src ? (
                    <img
                      src={src}
                      alt={advisor.name}
                      className="aspect-[3/4] w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
                    />
                  ) : (
                    <div
                      className="aspect-[3/4] w-full"
                      style={{ background: "var(--color-stone)" }}
                    />
                  )}
                </figure>
                <div className="mt-5">
                  <h3 className="rep-font-display text-xl text-[var(--color-foreground)]">
                    {advisor.name}
                  </h3>
                  <p className="rep-font-body mt-1 text-sm text-[var(--color-brass)]">{advisor.role}</p>
                  <p className="rep-font-body mt-2 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {advisor.market}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
