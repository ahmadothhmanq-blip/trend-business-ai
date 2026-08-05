"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const NEIGHBORHOODS = [
  {
    name: "Upper East Side",
    properties: 4,
    description: "Classic pre-war elegance meets museum-district refinement along tree-lined avenues.",
  },
  {
    name: "Tribeca",
    properties: 3,
    description: "Loft-scale living with cast-iron character and gallery proximity in downtown Manhattan.",
  },
  {
    name: "East Hampton",
    properties: 5,
    description: "Oceanfront estates and hedgerow privacy on Long Island's most coveted gold coast.",
  },
];

type RealEstatePremiumNeighborhoodsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RealEstatePremiumNeighborhoods({
  eyebrow = "Neighborhoods",
  title = "Places of provenance",
  subtitle = "We represent only the most architecturally significant addresses in each market we serve.",
}: RealEstatePremiumNeighborhoodsProps) {
  return (
    <section
      id="neighborhoods"
      data-v2-component="real-estate-premium-neighborhoods"
      aria-labelledby="rep-neighborhoods-title"
      className="rep-section bg-[var(--color-primary)] text-[var(--color-linen)]"
    >
      <div className="px-5 sm:px-8 lg:px-12">
        <header className="mb-14 max-w-2xl">
          <p className="rep-eyebrow mb-5 text-[var(--color-brass)]">{eyebrow}</p>
          <h2 id="rep-neighborhoods-title" className="rep-headline-sm text-[var(--color-linen)]">
            {title}
          </h2>
          <div className="rep-brass-rule-lg my-7" />
          <p className="rep-body text-[var(--color-linen)]/65">{subtitle}</p>
        </header>

        <figure className="group relative mb-14 overflow-hidden">
          <SlotImage
            slot="gallery"
            index={4}
            alt="Aerial neighborhood view"
            className="aspect-[21/9] w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)] via-transparent to-transparent" />
        </figure>

        <div className="grid gap-px border border-[var(--color-brass)]/20 bg-[var(--color-brass)]/20 md:grid-cols-3">
          {NEIGHBORHOODS.map((n, i) => (
            <article key={n.name} className="bg-[var(--color-primary)] p-8 lg:p-10">
              <span className="rep-editorial-index text-[var(--color-brass)]" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="rep-font-body mt-4 text-[0.625rem] uppercase tracking-[0.26em] text-[var(--color-brass)]">
                {n.properties} residences
              </p>
              <h3 className="rep-font-display mt-3 text-2xl text-[var(--color-linen)]">{n.name}</h3>
              <p className="rep-body-sm mt-4 text-[var(--color-linen)]/60">{n.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
