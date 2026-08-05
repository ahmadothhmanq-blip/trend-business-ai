"use client";

import { useState } from "react";

type RealEstatePrestigeInquiryProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

export function RealEstatePrestigeInquiry({
  title = "Request a private showing",
  subtitle = "Share your preferences and our advisory team will curate a selection exclusively for you.",
  ctaLabel = "Submit inquiry",
}: RealEstatePrestigeInquiryProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="inquire"
      data-v2-component="real-estate-prestige-inquiry"
      aria-labelledby="rep-inquire-title"
      className="rep-section border-t border-[var(--border-subtle)] bg-[var(--color-stone)]/40"
    >
      <div className="px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="rep-eyebrow mb-5">Inquire</p>
            <h2 id="rep-inquire-title" className="rep-headline-sm">
              {title}
            </h2>
            <div className="rep-brass-rule my-6" />
            <p className="rep-body max-w-md">{subtitle}</p>
            <p className="rep-font-body mt-8 text-sm text-[var(--color-muted)]">
              All inquiries handled with complete confidentiality.
            </p>
          </div>

          <form
            className="rep-card bg-[var(--color-surface)] p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            aria-label="Private showing inquiry"
          >
            {submitted ? (
              <div role="status" className="py-12 text-center">
                <p className="rep-eyebrow mb-3">Received</p>
                <p className="rep-font-display text-2xl text-[var(--color-foreground)]">
                  Your advisor will be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Full name
                  </span>
                  <input
                    required
                    type="text"
                    autoComplete="name"
                    className="w-full border border-[var(--border-default)] bg-transparent px-4 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brass)]"
                  />
                </label>
                <label className="block">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    className="w-full border border-[var(--border-default)] bg-transparent px-4 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brass)]"
                  />
                </label>
                <label className="block">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Phone
                  </span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    className="w-full border border-[var(--border-default)] bg-transparent px-4 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brass)]"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Preferred market
                  </span>
                  <select className="w-full border border-[var(--border-default)] bg-transparent px-4 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none">
                    <option>Manhattan</option>
                    <option>Hamptons</option>
                    <option>Aspen</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Message
                  </span>
                  <textarea
                    rows={4}
                    className="w-full resize-none border border-[var(--border-default)] bg-transparent px-4 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brass)]"
                  />
                </label>
                <div className="sm:col-span-2 pt-2">
                  <button type="submit" className="rep-btn-primary w-full sm:w-auto">
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
