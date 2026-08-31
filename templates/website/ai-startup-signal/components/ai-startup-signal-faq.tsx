"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "How does model routing work?",
    answer: "Signal routes inference across providers using latency-aware policies, automatic failover, and per-region health checks — without changing your client SDK.",
  },
  {
    question: "What observability do we get?",
    answer: "Full request traces, token usage, cost attribution, and deployment timelines in one mesh — exportable to your existing APM stack.",
  },
  {
    question: "Which compliance frameworks are supported?",
    answer: "SOC 2 Type II, GDPR, and HIPAA-ready deployments with audit logs, RBAC, and VPC / private link options.",
  },
  {
    question: "How long does onboarding take?",
    answer: "Most teams connect their first endpoints in under a week with guided implementation and a dedicated solutions architect.",
  },
];

type AiStartupSignalFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function AiStartupSignalFaq({
  eyebrow = "FAQ",
  title = "Platform questions",
  subtitle = "Everything teams ask before routing production inference through Signal.",
  items = DEFAULT_FAQ,
}: AiStartupSignalFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" data-v2-component="ai-startup-signal-faq" aria-labelledby="as-faq-title" className="df-reveal as-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="df-reveal-stagger mx-auto grid max-w-[82rem] gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] sm:px-8">
        <header className="lg:sticky lg:top-28">
          <p className="as-eyebrow mb-3">{eyebrow}</p>
          <h2 id="as-faq-title" className="as-headline-sm">{title}</h2>
          <p className="as-body mt-5 text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="space-y-3">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.question}
                className={`as-glass-card overflow-hidden rounded-xl border transition-colors ${open ? "as-accent-selected border-[var(--color-accent)]" : "border-[var(--border-default)]"}`}
              >
                <button
                  type="button"
                  className="as-focus-ring flex w-full items-center justify-between p-5 text-start font-semibold"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  {item.question}
                  <span className="text-[var(--color-accent)]" aria-hidden>{open ? "−" : "+"}</span>
                </button>
                {open ? (
                  <p className="border-t border-[var(--border-subtle)] px-5 pb-5 pt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                    {item.answer}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
