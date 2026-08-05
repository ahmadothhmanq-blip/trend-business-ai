"use client";

import { useState } from "react";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function CorporateBusinessContact({
  eyebrow = "Contact",
  title = "Speak with a senior partner",
  subtitle = "Share your priorities and we will assemble the right advisory team for a confidential consultation.",
  email = "partners@meridianadvisory.com",
  phone = "+1 (212) 555-0180",
  address = "200 Park Avenue, New York, NY",
  submitLabel = "Request consultation",
}: Props) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="contact"
      data-v2-component="corporate-business-contact"
      aria-labelledby="cb-contact-title"
      className="cb-section relative"
    >
      <div className="cb-container">
        <div className="cb-surface-elevated overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-[var(--border-subtle)] p-10 sm:p-12 lg:border-b-0 lg:border-e">
              <p className="cb-eyebrow mb-5">{eyebrow}</p>
              <h2 id="cb-contact-title" className="cb-headline-sm max-w-[14ch]">
                {title}
              </h2>
              <p className="cb-prose mt-6">{subtitle}</p>

              <dl className="mt-12 space-y-6">
                <div>
                  <dt className="cb-font-mono text-[0.625rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    Email
                  </dt>
                  <dd className="cb-font-body mt-2">
                    <a href={`mailto:${email}`} className="text-[var(--color-foreground)] hover:text-[var(--color-signal)] cb-focus-ring">
                      {email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="cb-font-mono text-[0.625rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    Phone
                  </dt>
                  <dd className="cb-font-body mt-2 text-[var(--color-foreground)]">{phone}</dd>
                </div>
                <div>
                  <dt className="cb-font-mono text-[0.625rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    Headquarters
                  </dt>
                  <dd className="cb-font-body mt-2 text-[var(--color-foreground)]">{address}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-[var(--color-surface)] p-10 sm:p-12">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="cb-font-display text-2xl font-medium text-[var(--color-foreground)]">
                    Thank you
                  </p>
                  <p className="cb-font-body mt-3 max-w-xs text-sm text-[var(--color-muted)]">
                    A senior partner will respond within one business day.
                  </p>
                </div>
              ) : (
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cb-first" className="cb-font-body mb-2 block text-xs font-medium text-[var(--color-muted)]">
                        First name
                      </label>
                      <input id="cb-first" name="firstName" required className="cb-input cb-focus-ring" />
                    </div>
                    <div>
                      <label htmlFor="cb-last" className="cb-font-body mb-2 block text-xs font-medium text-[var(--color-muted)]">
                        Last name
                      </label>
                      <input id="cb-last" name="lastName" required className="cb-input cb-focus-ring" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cb-email" className="cb-font-body mb-2 block text-xs font-medium text-[var(--color-muted)]">
                      Work email
                    </label>
                    <input id="cb-email" name="email" type="email" required className="cb-input cb-focus-ring" />
                  </div>
                  <div>
                    <label htmlFor="cb-company" className="cb-font-body mb-2 block text-xs font-medium text-[var(--color-muted)]">
                      Company
                    </label>
                    <input id="cb-company" name="company" className="cb-input cb-focus-ring" />
                  </div>
                  <div>
                    <label htmlFor="cb-message" className="cb-font-body mb-2 block text-xs font-medium text-[var(--color-muted)]">
                      How can we help?
                    </label>
                    <textarea id="cb-message" name="message" rows={4} className="cb-textarea cb-focus-ring" />
                  </div>
                  <button type="submit" className="cb-btn-primary cb-focus-ring w-full sm:w-auto">
                    {submitLabel}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
