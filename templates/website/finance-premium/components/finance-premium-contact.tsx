"use client";

import { useId, useState } from "react";

export function FinancePremiumContact(
  props: Partial<{
    eyebrow: string;
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    address: string;
    submitLabel: string;
  }> = {},
) {
  const {
    eyebrow = "Private consultation",
    title = "Speak with a senior partner",
    subtitle = "Share your priorities in confidence. We will assemble the right advisory team for a private consultation.",
    email = "partners@meridiancapital.com",
    phone = "+1 (212) 555-0140",
    address = "200 Park Avenue, New York, NY",
    submitLabel = "Request consultation",
  } = props;

  const formId = useId();
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="contact"
      data-v2-component="finance-premium-contact"
      aria-labelledby="contact-title"
      className="fn-section fn-section-glow relative bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="fn-eyebrow mb-3">{eyebrow}</p>
            <h2 id="contact-title" className="fn-headline-sm">
              {title}
            </h2>
            <div className="fn-accent-line mt-4" aria-hidden />
            <p className="fn-body text-muted-foreground mt-5">{subtitle}</p>
            <address className="fn-font-body mt-8 space-y-4 text-sm not-italic">
              <p className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-surface)] p-4">
                <span className="block font-semibold text-[var(--color-foreground)]">Email</span>
                <a
                  href={`mailto:${email}`}
                  className="fn-focus-ring mt-1 inline-block text-[var(--color-muted)] hover:text-[var(--color-signal)]"
                >
                  {email}
                </a>
              </p>
              <p className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-surface)] p-4">
                <span className="block font-semibold text-[var(--color-foreground)]">Phone</span>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="fn-focus-ring mt-1 inline-block text-[var(--color-muted)] hover:text-[var(--color-signal)]"
                >
                  {phone}
                </a>
              </p>
              <p className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-surface)] p-4">
                <span className="block font-semibold text-[var(--color-foreground)]">Office</span>
                <span className="mt-1 block text-[var(--color-muted)]">{address}</span>
              </p>
            </address>
          </div>

          <form
            id={formId}
            className="fn-card p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            noValidate
          >
            {submitted ? (
              <p className="fn-body text-center" role="status">
                Thank you — a senior partner will respond within one business day.
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor={`${formId}-name`}
                    className="fn-font-body mb-2 block text-sm font-medium text-[var(--color-foreground)]"
                  >
                    Name
                  </label>
                  <input
                    id={`${formId}-name`}
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="fn-input fn-focus-ring"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${formId}-email`}
                    className="fn-font-body mb-2 block text-sm font-medium text-[var(--color-foreground)]"
                  >
                    Email
                  </label>
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="fn-input fn-focus-ring"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${formId}-message`}
                    className="fn-font-body mb-2 block text-sm font-medium text-[var(--color-foreground)]"
                  >
                    Message
                  </label>
                  <textarea
                    id={`${formId}-message`}
                    name="message"
                    rows={4}
                    required
                    className="fn-textarea resize-y fn-focus-ring"
                  />
                </div>
                <button type="submit" className="fn-btn-primary fn-focus-ring w-full sm:w-auto">
                  {submitLabel}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
