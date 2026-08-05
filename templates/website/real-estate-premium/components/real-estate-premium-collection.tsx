"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_PROPERTIES = [
  {
    name: "The Whitmore Penthouse",
    location: "Upper East Side, Manhattan",
    price: "$18.5M",
    beds: 6,
    sqft: "8,400",
    imageIndex: 1,
    tag: "Penthouse",
  },
  {
    name: "Stonegate Manor",
    location: "East Hampton",
    price: "$12.2M",
    beds: 7,
    sqft: "11,200",
    imageIndex: 2,
    tag: "Estate",
  },
  {
    name: "Alpine Ridge Residence",
    location: "Aspen, Colorado",
    price: "$24.8M",
    beds: 5,
    sqft: "9,600",
    imageIndex: 3,
    tag: "Mountain",
  },
];

type RealEstatePremiumCollectionProps = {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  items?: typeof DEFAULT_PROPERTIES;
};

export function RealEstatePremiumCollection({
  eyebrow = "Curated collection",
  title = "Exceptional residences",
  subtitle = "Each property selected for architectural merit, provenance, and the quality of light that defines a true home.",
  items = DEFAULT_PROPERTIES,
}: RealEstatePremiumCollectionProps) {
  return (
    <section
      id="collection"
      data-v2-component="real-estate-premium-collection"
      aria-labelledby="rep-collection-title"
      className="rep-section"
    >
      <div className="px-5 sm:px-8 lg:px-12">
        <header className="mb-16 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="rep-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rep-collection-title" className="rep-headline-sm">
              {title}
            </h2>
          </div>
          <div>
            <div className="rep-brass-rule mb-6 lg:ms-auto" />
            <p className="rep-body max-w-lg lg:ms-auto lg:text-end">{subtitle}</p>
          </div>
        </header>

        <div className="space-y-20 lg:space-y-28">
          {items.map((property, index) => {
            const reversed = index % 2 === 1;
            const indexLabel = String(index + 1).padStart(2, "0");
            return (
              <article
                key={property.name}
                className={`grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 ${reversed ? "lg:[direction:rtl]" : ""}`}
              >
                <figure className={`group relative overflow-hidden ${reversed ? "lg:[direction:ltr]" : ""}`}>
                  <div className="rep-card overflow-hidden">
                    <SlotImage
                      slot="gallery"
                      index={property.imageIndex}
                      alt={property.name}
                      className="aspect-[5/4] w-full object-cover transition-transform duration-[1.6s] group-hover:scale-[1.04]"
                    />
                  </div>
                  <span
                    className="rep-editorial-index pointer-events-none absolute -bottom-4 -start-2 select-none lg:-start-6"
                    aria-hidden
                  >
                    {indexLabel}
                  </span>
                </figure>

                <div className={reversed ? "lg:[direction:ltr]" : ""}>
                  <span className="rep-font-body inline-block border border-[var(--border-brass)] px-3 py-1 text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-brass)]">
                    {property.tag}
                  </span>
                  <p className="rep-font-body mt-5 text-[0.625rem] uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    {property.location}
                  </p>
                  <h3 className="rep-font-display mt-3 text-4xl text-[var(--color-foreground)]">
                    {property.name}
                  </h3>
                  <p className="rep-font-display mt-5 text-3xl text-[var(--color-brass)]">
                    {property.price}
                  </p>
                  <dl className="rep-font-body mt-8 flex gap-10 border-t border-[var(--border-subtle)] pt-6 text-sm">
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">Beds</dt>
                      <dd className="rep-font-display mt-1 text-xl text-[var(--color-foreground)]">{property.beds}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">Sq ft</dt>
                      <dd className="rep-font-display mt-1 text-xl text-[var(--color-foreground)]">{property.sqft}</dd>
                    </div>
                  </dl>
                  <a href="#inquire" className="rep-btn-ghost mt-10 inline-flex">
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
