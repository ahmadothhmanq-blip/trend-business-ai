"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

const NEIGHBORHOODS = [
  { name: "Upper East Side", properties: 4, description: "Classic pre-war elegance meets museum-district refinement." },
  { name: "Tribeca", properties: 3, description: "Loft-scale living with cast-iron character and gallery proximity." },
  { name: "East Hampton", properties: 5, description: "Oceanfront estates and hedgerow privacy on Long Island's gold coast." },
];

type RealEstatePrestigeNeighborhoodsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RealEstatePrestigeNeighborhoods({
  eyebrow = "Neighborhoods",
  title = "Places of provenance",
  subtitle = "We represent only the most architecturally significant addresses in each market we serve.",
}: RealEstatePrestigeNeighborhoodsProps) {
  const hero = resolveSlotImage("about", 4);

  return (
    <section
      id="neighborhoods"
      data-v2-component="real-estate-prestige-neighborhoods"
      aria-labelledby="rep-neighborhoods-title"
      className="rep-section bg-[var(--color-surface)]"
    >
      <div className="px-5 sm:px-8 lg:px-10">
        <header className="mb-12 max-w-xl">
          <p className="rep-eyebrow mb-5">{eyebrow}</p>
          <h2 id="rep-neighborhoods-title" className="rep-headline-sm">
            {title}
          </h2>
          <div className="rep-brass-rule my-6" />
          <p className="rep-body">{subtitle}</p>
        </header>

        <figure className="rep-card mb-12 overflow-hidden">
          {hero ? (
            <img src={hero} alt="Aerial neighborhood view" className="aspect-[21/9] w-full object-cover" />
          ) : (
            <div className="aspect-[21/9] w-full bg-[var(--color-stone)]" />
          )}
        </figure>

        <div className="grid gap-px border border-[var(--border-subtle)] bg-[var(--border-subtle)] md:grid-cols-3">
          {NEIGHBORHOODS.map((n) => (
            <article key={n.name} className="bg-[var(--color-surface)] p-8 lg:p-10">
              <p className="rep-font-body text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-brass)]">
                {n.properties} residences
              </p>
              <h3 className="rep-font-display mt-3 text-2xl text-[var(--color-foreground)]">{n.name}</h3>
              <p className="rep-font-body mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                {n.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
