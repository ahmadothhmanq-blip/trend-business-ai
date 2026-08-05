"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type Suite = {
  name: string;
  description: string;
  imageIndex?: number;
};

const DEFAULT_SUITES: Suite[] = [
  {
    name: "Ocean Villa",
    description: "Private infinity pool, panoramic horizon, dedicated butler service",
    imageIndex: 0,
  },
  {
    name: "Cliffside Pavilion",
    description: "Elevated terrace, glass walls, sunrise yoga deck access",
    imageIndex: 1,
  },
  {
    name: "Garden Sanctuary",
    description: "Courtyard garden, outdoor rain shower, spa ritual suite",
    imageIndex: 2,
  },
];

const CAPTIONS = [
  "Ocean villa with private infinity pool",
  "Cliffside pavilion with glass walls and horizon views",
  "Garden sanctuary suite with courtyard terrace",
];

type HotelResortPremiumSignatureDishesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Suite[];
};

export function HotelResortPremiumSignatureDishes({
  eyebrow = "Signature suites",
  title = "Residences shaped by the sea",
  subtitle = "Three villa categories composed for distinct rhythms of retreat — each a private world above the azure.",
  items = DEFAULT_SUITES,
}: HotelResortPremiumSignatureDishesProps) {
  return (
    <section
      id="suites"
      data-v2-component="hotel-resort-premium-signature-dishes"
      aria-labelledby="hr-dishes-title"
      className="hr-section hr-section-alt"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <header className="mb-16 max-w-xl">
          <p className="hr-eyebrow mb-5">{eyebrow}</p>
          <h2 id="hr-dishes-title" className="hr-headline text-[clamp(2rem,4vw,3rem)]">
            {title}
          </h2>
          <div className="hr-azure-rule my-6" />
          <p className="hr-body">{subtitle}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 md:gap-5">
          {items.map((suite, index) => (
            <article key={`suite-${suite.name}`} className="hr-card group relative overflow-hidden">
              <figure className="relative aspect-[3/4] overflow-hidden">
                <SlotImage
                  slot="products"
                  index={suite.imageIndex ?? index}
                  alt={CAPTIONS[index] ?? suite.name}
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
                <figcaption className="absolute inset-x-0 bottom-0 p-7">
                  <span className="hr-font-body text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-azure)]">
                    Suite {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="hr-font-display mt-2 text-2xl text-[var(--color-foreground)]">
                    {suite.name}
                  </h3>
                  <p className="hr-font-body mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {suite.description}
                  </p>
                </figcaption>
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
