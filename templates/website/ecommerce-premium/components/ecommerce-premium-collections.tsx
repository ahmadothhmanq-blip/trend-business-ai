"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_COLLECTIONS = [
  {
    title: "Objects & vessels",
    description: "Hand-thrown ceramics and sculptural glass from independent ateliers.",
    priceFrom: "$128",
    badge: "New arrivals",
  },
  {
    title: "Textiles & soft goods",
    description: "Heritage looms, natural dyes, and traceable supply chains.",
    priceFrom: "$84",
    badge: "Bestseller",
  },
  {
    title: "Home fragrance",
    description: "Small-batch candles and incense with botanical profiles.",
    priceFrom: "$56",
    badge: "Limited",
  },
];

type EcommercePremiumCollectionsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; priceFrom?: string; badge?: string }>;
};

export function EcommercePremiumCollections({
  eyebrow = "Featured collections",
  title = "Curated for the considered home",
  subtitle = "Each collection is edited for material integrity, provenance, and lasting craft — never trend-driven surplus.",
  items = DEFAULT_COLLECTIONS,
}: EcommercePremiumCollectionsProps) {
  return (
    <section
      id="collections"
      data-v2-component="ecommerce-premium-collections"
      aria-labelledby="ec-collections-title"
      className="ec-section ec-section-alt bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="ec-eyebrow mb-4">{eyebrow}</p>
            <h2 id="ec-collections-title" className="ec-headline-sm">
              {title}
            </h2>
            <div className="ec-gold-rule mt-5" aria-hidden />
            <p className="ec-body mt-6">{subtitle}</p>
          </div>
          <a href="/collections" className="ec-btn-secondary ec-focus-ring shrink-0 self-start lg:self-auto">
            View all collections
          </a>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, i) => (
            <article key={item.title} className="ec-card group overflow-hidden">
              <div className="ec-editorial-frame relative overflow-hidden border-0 shadow-none">
                <SlotImage
                  slot="products"
                  index={i}
                  alt={item.title}
                  className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                {item.badge ? (
                  <span className="ec-badge absolute start-4 top-4">{item.badge}</span>
                ) : null}
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="ec-font-display text-xl text-[var(--color-foreground)]">
                  {item.title}
                </h3>
                <p className="ec-body mt-2.5 text-sm">{item.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-5">
                  {item.priceFrom ? (
                    <span className="ec-font-body text-sm font-medium text-[var(--color-foreground)]">
                      From {item.priceFrom}
                    </span>
                  ) : null}
                  <a href="#shop" className="ec-link-arrow text-xs uppercase tracking-[0.14em]">
                    Shop now →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
