"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "What is your return policy?",
    answer:
      "We offer 30-day returns on all unworn and unused items in original packaging. Concierge support handles exchanges and store credit within 48 hours.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard delivery arrives within 3–5 business days. Express shipping (48h) is complimentary on orders over $150. International orders ship within 7–10 days.",
  },
  {
    question: "Are your products ethically sourced?",
    answer:
      "Every maker in our network is vetted for fair labor practices, sustainable materials, and transparent supply chains. Provenance notes accompany each product listing.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer:
      "Yes — artisan wrapping, handwritten notes, and scheduled delivery are available at checkout. Our concierge team can also curate gift sets for special occasions.",
  },
];

type EcommercePremiumFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function EcommercePremiumFaq({
  eyebrow = "FAQ",
  title = "Questions from our collectors",
  subtitle = "Everything you need to know before your first order.",
  items = DEFAULT_FAQ,
}: EcommercePremiumFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-v2-component="ecommerce-premium-faq"
      aria-labelledby="ec-faq-title"
      className="ec-section ec-section-alt bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <header className="lg:sticky lg:top-28">
            <p className="ec-eyebrow mb-4">{eyebrow}</p>
            <h2 id="ec-faq-title" className="ec-headline-sm">
              {title}
            </h2>
            <div className="ec-gold-rule mt-5" aria-hidden />
            <p className="ec-body mt-6">{subtitle}</p>
          </header>

          <div className="space-y-3">
            {items.map((item, index) => {
              const open = openIndex === index;
              const panelId = `ec-faq-panel-${index}`;
              return (
                <div
                  key={`faq-${index}-${item.question}`}
                  className={`ec-card overflow-hidden transition-shadow duration-300 ${open ? "ec-card-featured" : ""}`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`ec-faq-trigger-${index}`}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start ec-focus-ring transition-colors hover:text-[var(--color-champagne)]"
                      onClick={() => setOpenIndex(open ? null : index)}
                    >
                      <span className="ec-font-display text-base text-[var(--color-foreground)]">
                        {item.question}
                      </span>
                      <span
                        className={`ec-font-body flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--border-default)] text-xs text-[var(--color-champagne)] transition-all duration-300 ${open ? "rotate-180 border-[var(--border-accent)] bg-[color-mix(in_srgb,var(--color-champagne)_8%,transparent)]" : ""}`}
                        aria-hidden
                      >
                        {open ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={`ec-faq-trigger-${index}`}
                    hidden={!open}
                    className="border-t border-[var(--border-subtle)] px-6 py-5 motion-safe:animate-[ec-slide-up_0.35s_ease_both]"
                  >
                    <p className="ec-font-body text-sm leading-relaxed text-[var(--color-muted)]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
