"use client";

import { useId, useState } from "react";
import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export type FlagshipContactProps = {
  ui: FlagshipUi;
  componentId: string;
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function FlagshipContactSection({
  ui,
  componentId,
  id,
  eyebrow,
  title,
  subtitle,
  email,
  phone,
  address,
  submitLabel,
}: FlagshipContactProps) {
  const sectionId = id ?? "contact";
  const formId = useId();
  const [submitted, setSubmitted] = useState(false);

  if (!title && !subtitle && !eyebrow && !email && !phone && !address) return null;

  return (
    <section
      id={sectionId}
      data-v2-component={componentId}
      aria-labelledby={`${sectionId}-title`}
      className={`${ui.section} df-section-glow relative bg-[var(--color-background)]`}
    >
      <div className={ui.container}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {eyebrow ? <p className={`${ui.eyebrow} mb-3`}>{eyebrow}</p> : null}
            {title ? (
              <h2 id={`${sectionId}-title`} className={ui.headlineSm}>
                {title}
              </h2>
            ) : null}
            {title ? (
              <div className="df-accent-line mt-4" aria-hidden />
            ) : null}
            {subtitle ? <p className={`${ui.body} mt-5`}>{subtitle}</p> : null}
            {(email || phone || address) && (
              <address className={`${ui.fontBody} mt-8 space-y-4 text-sm not-italic`}>
                {email ? (
                  <p className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-surface)] p-4">
                    <span className="block font-semibold text-[var(--color-foreground)]">Email</span>
                    <a href={`mailto:${email}`} className={`${ui.focusRing} mt-1 inline-block text-[var(--color-muted)] hover:text-[var(--color-accent)]`}>
                      {email}
                    </a>
                  </p>
                ) : null}
                {phone ? (
                  <p className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-surface)] p-4">
                    <span className="block font-semibold text-[var(--color-foreground)]">Phone</span>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className={`${ui.focusRing} mt-1 inline-block text-[var(--color-muted)] hover:text-[var(--color-accent)]`}>
                      {phone}
                    </a>
                  </p>
                ) : null}
                {address ? (
                  <p className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-surface)] p-4">
                    <span className="block font-semibold text-[var(--color-foreground)]">Office</span>
                    <span className="mt-1 block text-[var(--color-muted)]">{address}</span>
                  </p>
                ) : null}
              </address>
            )}
          </div>

          <form
            id={formId}
            className={`${ui.card} p-6 sm:p-8`}
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            noValidate
          >
            {submitted ? (
              <p className={`${ui.body} text-center`} role="status">
                Thank you — we&apos;ll be in touch shortly.
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <label htmlFor={`${formId}-name`} className={`${ui.fontBody} mb-2 block text-sm font-medium text-[var(--color-foreground)]`}>
                    Name
                  </label>
                  <input
                    id={`${formId}-name`}
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className={`df-input ${ui.focusRing}`}
                  />
                </div>
                <div>
                  <label htmlFor={`${formId}-email`} className={`${ui.fontBody} mb-2 block text-sm font-medium text-[var(--color-foreground)]`}>
                    Email
                  </label>
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={`df-input ${ui.focusRing}`}
                  />
                </div>
                <div>
                  <label htmlFor={`${formId}-message`} className={`${ui.fontBody} mb-2 block text-sm font-medium text-[var(--color-foreground)]`}>
                    Message
                  </label>
                  <textarea
                    id={`${formId}-message`}
                    name="message"
                    rows={4}
                    required
                    className={`df-textarea resize-y ${ui.focusRing}`}
                  />
                </div>
                {submitLabel ? (
                  <button type="submit" className={`${ui.btnPrimary} w-full sm:w-auto ${ui.focusRing}`}>
                    {submitLabel}
                  </button>
                ) : null}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
