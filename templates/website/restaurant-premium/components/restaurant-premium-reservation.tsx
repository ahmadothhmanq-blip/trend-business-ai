"use client";

import { useState } from "react";

type RestaurantPremiumReservationProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

export function RestaurantPremiumReservation({
  title = "Reserve your evening",
  subtitle = "Twelve tables. One seating. An experience composed around your party.",
  ctaLabel = "Confirm Reservation",
}: RestaurantPremiumReservationProps) {
  const [guests, setGuests] = useState("2");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="reserve"
      data-v2-component="restaurant-premium-reservation"
      aria-labelledby="rp-reserve-title"
      className="rp-section border-y border-[var(--border-subtle)] bg-[var(--color-surface)]/40"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="rp-eyebrow mb-5">Reservations</p>
            <h2 id="rp-reserve-title" className="rp-headline text-[clamp(2rem,4vw,3rem)]">
              {title}
            </h2>
            <div className="rp-copper-rule my-6" />
            <p className="rp-body text-muted-foreground max-w-md">{subtitle}</p>
            <ul className="mt-8 space-y-3 rp-font-body text-sm text-[var(--color-muted)]">
              <li>· Tasting menu · 7 courses</li>
              <li>· Dietary requirements welcomed with 48h notice</li>
              <li>· Smart evening attire appreciated</li>
            </ul>
          </div>

          <form
            className="border border-[var(--border-subtle)] bg-[var(--color-background)]/60 p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            aria-label="Table reservation"
          >
            {submitted ? (
              <div role="status" className="py-12 text-center">
                <p className="rp-eyebrow mb-3">Confirmed</p>
                <p className="rp-font-display text-2xl text-[var(--color-foreground)]">
                  We look forward to welcoming you.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="rp-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Full name
                  </span>
                  <input
                    required
                    type="text"
                    autoComplete="name"
                    className="w-full border border-[var(--border-subtle)] bg-transparent px-4 py-3 rp-font-body text-sm text-[var(--color-foreground)] focus:border-[var(--color-copper)] focus:outline-none focus:ring-1 focus:ring-[var(--color-copper)]"
                  />
                </label>
                <label className="block">
                  <span className="rp-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Date
                  </span>
                  <input
                    required
                    type="date"
                    className="w-full border border-[var(--border-subtle)] bg-transparent px-4 py-3 rp-font-body text-sm text-[var(--color-foreground)] focus:border-[var(--color-copper)] focus:outline-none focus:ring-1 focus:ring-[var(--color-copper)]"
                  />
                </label>
                <label className="block">
                  <span className="rp-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Time
                  </span>
                  <input
                    required
                    type="time"
                    className="w-full border border-[var(--border-subtle)] bg-transparent px-4 py-3 rp-font-body text-sm text-[var(--color-foreground)] focus:border-[var(--color-copper)] focus:outline-none focus:ring-1 focus:ring-[var(--color-copper)]"
                  />
                </label>
                <label className="block">
                  <span className="rp-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Guests
                  </span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full border border-[var(--border-subtle)] bg-transparent px-4 py-3 rp-font-body text-sm text-[var(--color-foreground)] focus:border-[var(--color-copper)] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={String(n)}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="rp-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Phone
                  </span>
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    className="w-full border border-[var(--border-subtle)] bg-transparent px-4 py-3 rp-font-body text-sm text-[var(--color-foreground)] focus:border-[var(--color-copper)] focus:outline-none focus:ring-1 focus:ring-[var(--color-copper)]"
                  />
                </label>
                <div className="sm:col-span-2 pt-2">
                  <button type="submit" className="rp-btn-primary w-full sm:w-auto">
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
