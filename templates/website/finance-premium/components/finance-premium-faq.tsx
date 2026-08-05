"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "How do client relationships typically begin?",
    answer:
      "We begin with a confidential discovery conversation — understanding your family's or institution's objectives, existing structures, and priorities. A tailored advisory proposal follows within two weeks.",
  },
  {
    question: "What is your minimum relationship size?",
    answer:
      "Our private wealth practice typically serves families with investable assets above $10 million. Institutional engagements are evaluated on scope and fiduciary fit rather than a fixed threshold.",
  },
  {
    question: "How do you measure stewardship success?",
    answer:
      "We define outcome metrics collaboratively — risk-adjusted returns, tax efficiency, governance standards, and generational preparedness — with quarterly partner reviews and annual board-level reporting.",
  },
  {
    question: "Do you operate as a fiduciary?",
    answer:
      "Yes. Meridian Capital Advisors is a registered investment adviser operating under a fiduciary standard across all wealth management and institutional advisory engagements.",
  },
];

type FinancePremiumFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function FinancePremiumFaq({
  eyebrow = "FAQ",
  title = "Questions from prospective clients",
  subtitle = "What families and institutional leaders ask before entrusting us with their capital.",
  items = DEFAULT_FAQ,
}: FinancePremiumFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-v2-component="finance-premium-faq"
      aria-labelledby="fn-faq-title"
      className="fn-section fn-section-alt"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <header className="lg:sticky lg:top-28">
            <p className="fn-eyebrow mb-3">{eyebrow}</p>
            <h2 id="fn-faq-title" className="fn-headline-sm">
              {title}
            </h2>
            <div className="fn-accent-line mt-4" aria-hidden />
            <p className="fn-body text-muted-foreground mt-5">{subtitle}</p>
          </header>

          <div className="space-y-3">
            {items.map((item, index) => {
              const open = openIndex === index;
              const panelId = `fn-faq-panel-${index}`;
              return (
                <div
                  key={`faq-${index}-${item.question}`}
                  className={`fn-card overflow-hidden transition-shadow duration-300 ${open ? "shadow-[var(--shadow-surface)]" : ""}`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`fn-faq-trigger-${index}`}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start fn-focus-ring transition-colors hover:text-[var(--color-primary)]"
                      onClick={() => setOpenIndex(open ? null : index)}
                    >
                      <span className="fn-font-display text-sm font-semibold text-[var(--color-foreground)]">
                        {item.question}
                      </span>
                      <span
                        className={`fn-font-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] text-xs text-[var(--color-signal)] transition-all duration-300 ${open ? "rotate-180 bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)]" : ""}`}
                        aria-hidden
                      >
                        {open ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={`fn-faq-trigger-${index}`}
                    hidden={!open}
                    className="border-t border-[var(--border-subtle)] px-5 py-4 motion-safe:animate-[fn-slide-up_0.35s_ease_both]"
                  >
                    <p className="fn-font-body text-sm leading-relaxed text-[var(--color-muted)]">
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
