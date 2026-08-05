"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type RestaurantPremiumReservationCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function RestaurantPremiumReservationCta({
  title = "Your table awaits",
  subtitle = "We hold twelve seats each evening. Reserve early for weekends and special occasions.",
  ctaLabel = "Book Now",
  ctaHref = "#contact",
}: RestaurantPremiumReservationCtaProps) {
  return (
    <section
      id="reservation"
      data-v2-component="restaurant-premium-reservation-cta"
      aria-labelledby="rp-cta-title"
      className="relative min-h-[28rem] overflow-hidden py-24 sm:min-h-[32rem] sm:py-32"
    >
      <div className="absolute inset-0" aria-hidden>
        <SlotImage
          slot="cta"
          index={0}
          alt=""
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[var(--color-background)]/82" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 100%, color-mix(in srgb, var(--color-copper) 22%, transparent), transparent 65%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[90rem] px-5 text-center sm:px-8 lg:px-10">
        <p className="rp-eyebrow mb-6">Reservations</p>
        <h2 id="rp-cta-title" className="rp-headline mx-auto max-w-2xl text-[clamp(2.25rem,5vw,3.75rem)]">
          {title}
        </h2>
        <div className="rp-copper-rule mx-auto my-8" />
        <p className="rp-body text-muted-foreground mx-auto max-w-lg">{subtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href={ctaHref} className="rp-btn-primary rp-focus-ring min-w-[12rem]">
            {ctaLabel}
          </a>
          <a href="tel:+12125550188" className="rp-btn-ghost rp-focus-ring min-w-[12rem]">
            +1 (212) 555-0188
          </a>
        </div>
        <p className="rp-font-body mt-8 text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Tue – Sat · 6pm seating · Dress code: smart casual
        </p>
      </div>
    </section>
  );
}
