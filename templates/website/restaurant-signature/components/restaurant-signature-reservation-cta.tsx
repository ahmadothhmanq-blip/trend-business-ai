"use client";

type RestaurantSignatureReservationCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function RestaurantSignatureReservationCta({
  title = "Your table awaits",
  subtitle = "We hold twelve seats each evening. Reserve early for weekends and special occasions.",
  ctaLabel = "Book Now",
  ctaHref = "#reserve",
}: RestaurantSignatureReservationCtaProps) {
  return (
    <section
      data-v2-component="restaurant-signature-reservation-cta"
      aria-labelledby="rs-cta-title"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, var(--color-copper) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-[90rem] px-5 text-center sm:px-8 lg:px-10">
        <p className="rs-eyebrow mb-6">Reservations</p>
        <h2 id="rs-cta-title" className="rs-headline mx-auto max-w-2xl text-[clamp(2.25rem,5vw,3.75rem)]">
          {title}
        </h2>
        <div className="rs-copper-rule mx-auto my-8" />
        <p className="rs-body mx-auto max-w-lg">{subtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href={ctaHref} className="rs-btn-primary">
            {ctaLabel}
          </a>
          <a href="tel:+15551234567" className="rs-btn-ghost">
            +1 (555) 123-4567
          </a>
        </div>
      </div>
    </section>
  );
}
