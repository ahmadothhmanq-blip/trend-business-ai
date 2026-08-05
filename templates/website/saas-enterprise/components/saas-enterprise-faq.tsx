"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "How long does implementation take?",
    answer:
      "Most enterprise teams go live in 14 days with guided onboarding. Complex multi-region rollouts typically complete within 30 days.",
  },
  {
    question: "Does Northline integrate with our CRM?",
    answer:
      "Yes. Native bi-directional sync with Salesforce, HubSpot, and Microsoft Dynamics, plus custom API connectors for proprietary systems.",
  },
  {
    question: "What security certifications do you hold?",
    answer:
      "Northline is SOC 2 Type II certified, GDPR compliant, and supports HIPAA BAA agreements for healthcare customers.",
  },
  {
    question: "Can we customize dashboards for executives?",
    answer:
      "Role-based dashboards let CROs, VPs, and reps each see the metrics that matter most, with drill-down to deal-level detail.",
  },
];

type SaasEnterpriseFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function SaasEnterpriseFaq({
  eyebrow = "FAQ",
  title = "Answers for revenue leaders",
  subtitle = "Everything you need to know before your first demo.",
  items = DEFAULT_FAQ,
}: SaasEnterpriseFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-v2-component="saas-enterprise-faq"
      aria-labelledby="se-faq-title"
      className="se-section se-section-alt bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <header className="lg:sticky lg:top-28">
            <p className="se-eyebrow mb-3">{eyebrow}</p>
            <h2 id="se-faq-title" className="se-headline-sm">
              {title}
            </h2>
            <div className="mt-4 h-px w-12 bg-gradient-to-r from-[var(--color-accent)] to-transparent" aria-hidden />
            <p className="se-body text-muted-foreground mt-5">{subtitle}</p>
          </header>

          <div className="space-y-3">
            {items.map((item, index) => {
              const open = openIndex === index;
              const panelId = `se-faq-panel-${index}`;
              return (
                <div
                  key={`faq-${index}-${item.question}`}
                  className={`se-card overflow-hidden transition-shadow duration-300 ${open ? "shadow-[var(--shadow-surface)]" : ""}`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`se-faq-trigger-${index}`}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start se-focus-ring transition-colors hover:text-[var(--color-primary)]"
                      onClick={() => setOpenIndex(open ? null : index)}
                    >
                      <span className="se-font-display text-sm font-semibold text-[var(--color-foreground)]">
                        {item.question}
                      </span>
                      <span
                        className={`se-font-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] text-xs text-[var(--color-accent)] transition-all duration-300 ${open ? "rotate-180 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]" : ""}`}
                        aria-hidden
                      >
                        {open ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={`se-faq-trigger-${index}`}
                    hidden={!open}
                    className="border-t border-[var(--border-subtle)] px-5 py-4 motion-safe:animate-[se-slide-up_0.35s_ease_both]"
                  >
                    <p className="se-font-body text-sm leading-relaxed text-[var(--color-muted)]">
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
