"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type HotelResortPremiumReservationCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function HotelResortPremiumReservationCta({
  title = "Your sanctuary awaits",
  subtitle = "Forty-eight private villas along a secluded coastline. Reserve early for peak season and signature suite categories.",
  ctaLabel = "Book your stay",
  ctaHref = "#contact",
}: HotelResortPremiumReservationCtaProps) {
  return (
    <section
      id="reservation"
      data-v2-component="hotel-resort-premium-reservation-cta"
      aria-labelledby="hr-cta-title"
      className="relative min-h-[28rem] overflow-hidden py-24 sm:min-h-[32rem] sm:py-32"
    >
      <div className="absolute inset-0" aria-hidden>
        <SlotImage
          slot="cta"
          index={0}
          alt="Azure Haven resort coastline at twilight"
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[var(--color-background)]/82" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 100%, color-mix(in srgb, var(--color-azure) 22%, transparent), transparent 65%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[90rem] px-5 text-center sm:px-8 lg:px-10">
        <p className="hr-eyebrow mb-6">Reservations</p>
        <h2 id="hr-cta-title" className="hr-headline mx-auto max-w-2xl text-[clamp(2.25rem,5vw,3.75rem)]">
          {title}
        </h2>
        <div className="hr-azure-rule mx-auto my-8" />
        <p className="hr-body text-muted-foreground mx-auto max-w-lg">{subtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href={ctaHref} className="hr-btn-primary hr-focus-ring min-w-[12rem]">
            {ctaLabel}
          </a>
          <a href="tel:+18005550188" className="hr-btn-ghost hr-focus-ring min-w-[12rem]">
            +1 (800) 555-0188
          </a>
        </div>
        <p className="hr-font-body mt-8 text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Check-in 3pm · Check-out 11am · Airport transfers available
        </p>
      </div>
    </section>
  );
}
