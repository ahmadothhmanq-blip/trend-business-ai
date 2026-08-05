"use client";

import { useState } from "react";

type MedicalPremiumContactProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

export function MedicalPremiumContact({
  title = "Request a consultation",
  subtitle = "Complete the form below and a care coordinator will contact you within one business day.",
  ctaLabel = "Submit request",
}: MedicalPremiumContactProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="contact"
      data-v2-component="medical-premium-contact"
      aria-labelledby="mp-contact-title"
      className="mp-section border-t border-[var(--border-subtle)] px-5 sm:px-8"
    >
      <div className="mx-auto grid max-w-[76rem] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] p-8 text-[var(--color-pearl)] sm:p-10">
          <p className="mp-eyebrow mb-4 text-[var(--color-healing)]">Contact</p>
          <div className="mp-sage-rule mb-5 bg-gradient-to-r from-[var(--color-healing)] to-[var(--color-accent)]" aria-hidden />
          <h2 id="mp-contact-title" className="mp-headline-sm text-[var(--color-pearl)]">
            {title}
          </h2>
          <p className="mp-font-body mt-4 text-base leading-relaxed text-white/70">{subtitle}</p>
          <dl className="mp-font-body mt-10 space-y-5 text-sm">
            <div>
              <dt className="font-semibold text-[var(--color-accent)]">Care line</dt>
              <dd className="mt-1">
                <a
                  href="tel:+18005550199"
                  className="text-[var(--color-pearl)] underline-offset-4 hover:underline mp-focus-ring"
                >
                  +1 (800) 555-0199
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-accent)]">Hours</dt>
              <dd className="mt-1 text-white/65">Mon–Fri 7am–8pm · Sat 8am–2pm</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-accent)]">Emergency</dt>
              <dd className="mt-1">
                <a href="tel:911" className="font-semibold text-[var(--color-pearl)] mp-focus-ring">
                  Call 911
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <form
          className="mp-card bg-[var(--color-pearl)] p-6 sm:p-9"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          aria-label="Consultation request"
        >
          {submitted ? (
            <div role="status" className="flex min-h-[20rem] flex-col items-center justify-center py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)] text-2xl text-[var(--color-healing)]" aria-hidden>
                ✓
              </span>
              <p className="mp-eyebrow mb-3 mt-6">Received</p>
              <p className="mp-font-display text-2xl text-[var(--color-foreground)]">
                A care coordinator will be in touch shortly.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              <label className="block">
                <span className="mp-font-body mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                  Full name <span className="text-[var(--color-accent)]">*</span>
                </span>
                <input
                  required
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 mp-font-body text-base focus:border-[var(--color-healing)] focus:outline-none focus:ring-2 focus:ring-[var(--color-healing)]/30"
                />
              </label>
              <label className="block">
                <span className="mp-font-body mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                  Email <span className="text-[var(--color-accent)]">*</span>
                </span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 mp-font-body text-base focus:border-[var(--color-healing)] focus:outline-none focus:ring-2 focus:ring-[var(--color-healing)]/30"
                />
              </label>
              <label className="block">
                <span className="mp-font-body mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                  Specialty of interest
                </span>
                <select className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 mp-font-body text-base focus:border-[var(--color-healing)] focus:outline-none">
                  <option>General consultation</option>
                  <option>Cardiology</option>
                  <option>Oncology</option>
                  <option>Orthopedics</option>
                  <option>Executive health</option>
                </select>
              </label>
              <label className="block">
                <span className="mp-font-body mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                  Message
                </span>
                <textarea
                  rows={4}
                  className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 mp-font-body text-base leading-relaxed focus:border-[var(--color-healing)] focus:outline-none focus:ring-2 focus:ring-[var(--color-healing)]/30"
                />
              </label>
              <button type="submit" className="mp-btn-primary w-full sm:w-auto">
                {ctaLabel}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
