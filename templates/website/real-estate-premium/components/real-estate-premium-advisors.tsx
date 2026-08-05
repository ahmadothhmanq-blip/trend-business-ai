"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const ADVISORS = [
  { name: "Eleanor Whitmore", role: "Managing Director", market: "Manhattan", imageIndex: 7 },
  { name: "James Calder", role: "Senior Advisor", market: "Hamptons", imageIndex: 8 },
  { name: "Sofia Marchetti", role: "Private Client Lead", market: "Aspen", imageIndex: 9 },
];

type RealEstatePremiumAdvisorsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RealEstatePremiumAdvisors({
  eyebrow = "Advisors",
  title = "Your private advisory team",
  subtitle = "Decades of market intelligence, discreet representation, and an unwavering commitment to your interests.",
}: RealEstatePremiumAdvisorsProps) {
  return (
    <section
      id="advisors"
      data-v2-component="real-estate-premium-advisors"
      aria-labelledby="rep-advisors-title"
      className="rep-section"
    >
      <div className="px-5 sm:px-8 lg:px-12">
        <header className="mb-16 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="rep-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rep-advisors-title" className="rep-headline-sm">
              {title}
            </h2>
          </div>
          <div>
            <div className="rep-brass-rule mb-6" />
            <p className="rep-body max-w-md">{subtitle}</p>
          </div>
        </header>

        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {ADVISORS.map((advisor, i) => (
            <article key={advisor.name} className="group">
              <figure className="relative overflow-hidden border border-[var(--border-subtle)]">
                <SlotImage
                  slot="team"
                  index={advisor.imageIndex}
                  alt={advisor.name}
                  className="aspect-[3/4] w-full object-cover grayscale transition duration-700 group-hover:grayscale-0 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-primary)]/80 to-transparent p-5 opacity-0 transition duration-500 group-hover:opacity-100">
                  <p className="rep-font-body text-[0.625rem] uppercase tracking-[0.22em] text-[var(--color-linen)]/70">
                    {advisor.market}
                  </p>
                </div>
                <span
                  className="rep-font-display absolute end-4 top-4 text-4xl text-[var(--color-linen)]/30"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </figure>
              <div className="mt-6 border-s-2 border-[var(--color-brass)] ps-5">
                <h3 className="rep-font-display text-2xl text-[var(--color-foreground)]">
                  {advisor.name}
                </h3>
                <p className="rep-font-body mt-1 text-sm font-medium text-[var(--color-brass)]">
                  {advisor.role}
                </p>
                <p className="rep-font-body mt-2 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  {advisor.market}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
