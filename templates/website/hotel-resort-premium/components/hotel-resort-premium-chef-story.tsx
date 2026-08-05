"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const PILLARS = [
  { title: "Sanctuary", body: "Architecture that dissolves into landscape — stone, timber, and open sky." },
  { title: "Stillness", body: "Spa rituals drawn from ocean minerals and indigenous botanical wisdom." },
  { title: "Discovery", body: "Curated excursions from private yacht charters to reef conservation dives." },
];

type HotelResortPremiumChefStoryProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function HotelResortPremiumChefStory({
  eyebrow = "Our philosophy",
  title = "Hospitality written in horizon light",
  subtitle = "Founded by travelers who believed luxury should feel effortless, Azure Haven was composed as a sanctuary where every arrival slows the clock — where service is invisible and the ocean is the constant companion.",
}: HotelResortPremiumChefStoryProps) {
  return (
    <section
      id="philosophy"
      data-v2-component="hotel-resort-premium-chef-story"
      aria-labelledby="hr-chef-title"
      className="hr-section"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <figure className="hr-card relative aspect-[4/5] overflow-hidden">
              <SlotImage
                slot="about"
                index={0}
                alt="Resort concierge welcoming guests to oceanfront pavilion"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-[var(--border-subtle)]" aria-hidden />
            </figure>
            <div
              className="absolute -bottom-6 -end-6 hidden h-32 w-32 border border-[var(--border-azure)] bg-[var(--color-background)]/90 p-4 backdrop-blur-sm lg:block"
              aria-hidden
            >
              <p className="hr-font-display text-center text-3xl text-[var(--color-azure)]">★</p>
              <p className="hr-font-body mt-1 text-center text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                Five-Star
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="hr-eyebrow mb-5">{eyebrow}</p>
            <h2 id="hr-chef-title" className="hr-headline text-[clamp(2rem,4vw,3.25rem)]">
              {title}
            </h2>
            <div className="hr-azure-rule my-6" />
            <p className="hr-body text-muted-foreground max-w-lg">{subtitle}</p>
          </div>
        </div>

        <div className="mt-20 grid gap-px border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="bg-[var(--color-background)] p-8 transition-colors hover:bg-[color-mix(in_srgb,var(--color-azure)_4%,var(--color-background))] lg:p-10"
            >
              <h3 className="hr-font-display text-2xl text-[var(--color-azure)]">{pillar.title}</h3>
              <p className="hr-font-body mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
