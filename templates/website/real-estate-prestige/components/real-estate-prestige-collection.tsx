"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

const DEFAULT_PROPERTIES = [
  {
    name: "The Whitmore Penthouse",
    location: "Upper East Side, Manhattan",
    price: "$18.5M",
    beds: 6,
    sqft: "8,400",
    imageIndex: 1,
  },
  {
    name: "Stonegate Manor",
    location: "East Hampton",
    price: "$12.2M",
    beds: 7,
    sqft: "11,200",
    imageIndex: 2,
  },
  {
    name: "Alpine Ridge Estate",
    location: "Aspen, Colorado",
    price: "$24.8M",
    beds: 5,
    sqft: "9,600",
    imageIndex: 3,
  },
];

type RealEstatePrestigeCollectionProps = {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  items?: typeof DEFAULT_PROPERTIES;
};

export function RealEstatePrestigeCollection({
  eyebrow = "Curated collection",
  title = "Exceptional residences",
  subtitle = "Each property selected for architectural merit, provenance, and the quality of light.",
  items = DEFAULT_PROPERTIES,
}: RealEstatePrestigeCollectionProps) {
  return (
    <section
      id="collection"
      data-v2-component="real-estate-prestige-collection"
      aria-labelledby="rep-collection-title"
      className="rep-section"
    >
      <div className="px-5 sm:px-8 lg:px-10">
        <header className="mb-14 max-w-xl">
          <p className="rep-eyebrow mb-5">{eyebrow}</p>
          <h2 id="rep-collection-title" className="rep-headline-sm">
            {title}
          </h2>
          <div className="rep-brass-rule my-6" />
          <p className="rep-body">{subtitle}</p>
        </header>

        <div className="space-y-16">
          {items.map((property, index) => {
            const src = resolveSlotImage("about", property.imageIndex);
            const reversed = index % 2 === 1;
            return (
              <article
                key={property.name}
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${reversed ? "lg:[direction:rtl]" : ""}`}
              >
                <figure className={`rep-card overflow-hidden ${reversed ? "lg:[direction:ltr]" : ""}`}>
                  {src ? (
                    <img
                      src={src}
                      alt={property.name}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-[1.4s] hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="aspect-[4/3] w-full"
                      style={{
                        background: `linear-gradient(${145 + index * 15}deg, var(--color-stone), var(--color-secondary))`,
                      }}
                    />
                  )}
                </figure>
                <div className={reversed ? "lg:[direction:ltr]" : ""}>
                  <p className="rep-font-body text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-brass)]">
                    {property.location}
                  </p>
                  <h3 className="rep-font-display mt-3 text-3xl text-[var(--color-foreground)]">
                    {property.name}
                  </h3>
                  <p className="rep-font-display mt-4 text-2xl text-[var(--color-foreground)]">
                    {property.price}
                  </p>
                  <dl className="rep-font-body mt-6 flex gap-8 text-sm text-[var(--color-muted)]">
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.2em]">Beds</dt>
                      <dd className="mt-1 text-[var(--color-foreground)]">{property.beds}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.2em]">Sq ft</dt>
                      <dd className="mt-1 text-[var(--color-foreground)]">{property.sqft}</dd>
                    </div>
                  </dl>
                  <a href="#inquire" className="rep-btn-ghost mt-8 inline-flex">
                    Request dossier
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
