"use client";

import { useState } from "react";

type RealEstatePremiumInquiryProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

export function RealEstatePremiumInquiry({
  title = "Request a private showing",
  subtitle = "Share your preferences and our advisory team will curate a selection exclusively for you.",
  ctaLabel = "Submit inquiry",
}: RealEstatePremiumInquiryProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="inquire"
      data-v2-component="real-estate-premium-inquiry"
      aria-labelledby="rep-inquire-title"
      className="rep-section"
    >
      <div className="px-5 sm:px-8 lg:px-12">
        <div className="grid gap-0 overflow-hidden border border-[var(--border-subtle)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[var(--color-primary)] p-8 sm:p-10 lg:p-14">
            <p className="rep-eyebrow mb-5 text-[var(--color-brass)]">Inquire</p>
            <h2 id="rep-inquire-title" className="rep-headline-sm text-[var(--color-linen)]">
              {title}
            </h2>
            <div className="rep-brass-rule-lg my-7" />
            <p className="rep-body text-[var(--color-linen)]/65">{subtitle}</p>
            <p className="rep-font-body mt-10 text-sm text-[var(--color-linen)]/45">
              All inquiries handled with complete confidentiality.
            </p>
            <dl className="mt-12 space-y-5 border-t border-[var(--color-brass)]/20 pt-8">
              <div>
                <dt className="rep-font-body text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-linen)]/40">
                  Response time
                </dt>
                <dd className="rep-font-display mt-1 text-xl text-[var(--color-linen)]">Within 24 hours</dd>
              </div>
              <div>
                <dt className="rep-font-body text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-linen)]/40">
                  Concierge
                </dt>
                <dd className="rep-font-body mt-1 text-sm text-[var(--color-brass)]">
                  +1 (212) 555-0100
                </dd>
              </div>
            </dl>
          </div>

          <form
            className="bg-[var(--color-surface)] p-8 sm:p-10 lg:p-14"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            aria-label="Private showing inquiry"
          >
            {submitted ? (
              <div role="status" className="flex min-h-[20rem] flex-col items-center justify-center text-center">
                <p className="rep-eyebrow mb-4">Received</p>
                <p className="rep-font-display text-3xl text-[var(--color-foreground)]">
                  Your advisor will be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
                    Full name
                  </span>
                  <input
                    required
                    type="text"
                    autoComplete="name"
                    className="w-full border-0 border-b border-[var(--border-default)] bg-transparent px-0 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="block">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    className="w-full border-0 border-b border-[var(--border-default)] bg-transparent px-0 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="block">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
                    Phone
                  </span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    className="w-full border-0 border-b border-[var(--border-default)] bg-transparent px-0 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
                    Preferred market
                  </span>
                  <select className="w-full border-0 border-b border-[var(--border-default)] bg-transparent px-0 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none">
                    <option>Manhattan</option>
                    <option>Hamptons</option>
                    <option>Aspen</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="rep-font-body mb-2 block text-[0.625rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
                    Message
                  </span>
                  <textarea
                    rows={4}
                    className="w-full resize-none border border-[var(--border-default)] bg-transparent px-4 py-3 rep-font-body text-sm focus:border-[var(--color-brass)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brass)]"
                  />
                </label>
                <div className="sm:col-span-2 pt-4">
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
