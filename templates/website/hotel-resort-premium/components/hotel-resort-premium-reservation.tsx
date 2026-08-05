"use client";

import { useState } from "react";

type HotelResortPremiumReservationProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

export function HotelResortPremiumReservation({
  title = "Reserve your sanctuary",
  subtitle = "Forty-eight villas. One coastline. An experience composed around your arrival.",
  ctaLabel = "Confirm reservation",
}: HotelResortPremiumReservationProps) {
  const [guests, setGuests] = useState("2");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="reserve"
      data-v2-component="hotel-resort-premium-reservation"
      aria-labelledby="hr-reserve-title"
      className="hr-section border-y border-[var(--border-subtle)] bg-[var(--color-surface)]/40"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="hr-eyebrow mb-5">Reservations</p>
            <h2 id="hr-reserve-title" className="hr-headline text-[clamp(2rem,4vw,3rem)]">
              {title}
            </h2>
            <div className="hr-azure-rule my-6" />
            <p className="hr-body text-muted-foreground max-w-md">{subtitle}</p>
            <ul className="mt-8 space-y-3 hr-font-body text-sm text-[var(--color-muted)]">
              <li>· Flexible cancellation within 72 hours</li>
              <li>· Airport transfers and villa preferences welcomed</li>
              <li>· Spa and dining reservations arranged by concierge</li>
            </ul>
          </div>

          <form
            className="border border-[var(--border-subtle)] bg-[var(--color-background)]/60 p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            aria-label="Villa reservation"
          >
            {submitted ? (
              <div role="status" className="py-12 text-center">
                <p className="hr-eyebrow mb-3">Confirmed</p>
                <p className="hr-font-display text-2xl text-[var(--color-foreground)]">
                  We look forward to welcoming you to Azure Haven.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="hr-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Full name
                  </span>
                  <input
                    required
                    type="text"
                    autoComplete="name"
                    className="hr-input"
                  />
                </label>
                <label className="block">
                  <span className="hr-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Check-in
                  </span>
                  <input required type="date" className="hr-input" />
                </label>
                <label className="block">
                  <span className="hr-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Check-out
                  </span>
                  <input required type="date" className="hr-input" />
                </label>
                <label className="block">
                  <span className="hr-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Guests
                  </span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="hr-input"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={String(n)}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="hr-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Phone
                  </span>
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    className="hr-input"
                  />
                </label>
                <div className="sm:col-span-2 pt-2">
                  <button type="submit" className="hr-btn-primary w-full sm:w-auto">
                    {ctaLabel}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
