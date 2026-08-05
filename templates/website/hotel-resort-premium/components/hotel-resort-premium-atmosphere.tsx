"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type HotelResortPremiumAtmosphereProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function HotelResortPremiumAtmosphere({
  eyebrow = "The sanctuary",
  title = "Cinematic coastal calm",
  subtitle = "Vaulted pavilions open to the horizon. Natural stone, woven textures, and the rhythm of the tide compose every arrival — unhurried, attentive, present.",
}: HotelResortPremiumAtmosphereProps) {
  return (
    <section
      id="sanctuary"
      data-v2-component="hotel-resort-premium-atmosphere"
      aria-labelledby="hr-atmosphere-title"
      className="hr-section overflow-hidden"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <figure className="hr-card group relative aspect-[16/10] overflow-hidden">
              <SlotImage
                slot="backgrounds"
                index={0}
                alt="Oceanfront pavilion with infinity pool and horizon views at dusk"
                className="h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--border-azure,rgba(74,159,212,0.2))]"
                aria-hidden
              />
            </figure>
          </div>

          <div className="flex flex-col justify-center lg:col-span-5">
            <p className="hr-eyebrow mb-5">{eyebrow}</p>
            <h2 id="hr-atmosphere-title" className="hr-headline text-[clamp(2rem,4vw,3rem)]">
              {title}
            </h2>
            <div className="hr-azure-rule my-6" />
            <p className="hr-body">{subtitle}</p>

            <figure className="hr-card group relative mt-10 aspect-[4/3] overflow-hidden">
              <SlotImage
                slot="backgrounds"
                index={1}
                alt="Private villa terrace with woven loungers and ocean breeze"
                className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            </figure>
          </div>
        </div>

        <blockquote className="relative mx-auto mt-24 max-w-3xl px-6 text-center sm:px-10">
          <span
            className="hr-font-display pointer-events-none absolute -top-6 start-1/2 -translate-x-1/2 text-6xl text-[var(--color-azure)]/25"
            aria-hidden
          >
            &ldquo;
          </span>
          <p className="hr-font-display text-[clamp(1.5rem,3vw,2.25rem)] italic leading-snug text-[var(--color-foreground)]">
            A stay that unfolds like a horizon line — each moment a new shade of azure, the resort its
            gentle refrain.
          </p>
          <footer className="hr-font-body mt-8 text-[0.6875rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
            — Condé Nast Traveler
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
