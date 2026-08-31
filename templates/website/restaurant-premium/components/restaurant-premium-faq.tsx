"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  { question: "How do we get started?", answer: "Share your goals — we respond within one business day with recommended next steps." },
  { question: "What does onboarding look like?", answer: "A discovery call, scoped proposal, and a clear timeline before work begins." },
  { question: "Can you support multi-market teams?", answer: "Yes — we coordinate delivery across regions with a single accountable lead." },
  { question: "Do you offer ongoing support?", answer: "Project and retainer models are available depending on scope and cadence." },
];

type RestaurantPremiumFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function RestaurantPremiumFaq({
  eyebrow = "FAQ",
  title = "Common questions",
  subtitle = "Straightforward answers before you engage.",
  items = DEFAULT_FAQ,
}: RestaurantPremiumFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!items.length) return null;

  return (
    <section id="faq" data-v2-component="restaurant-premium-faq" aria-labelledby="rp-faq-title" className="rp-reveal rp-section">
      <div className="rp-shell rp-faq-layout">
        <header>
          {eyebrow ? <p className="rp-kicker">{eyebrow}</p> : null}
          <h2 id="rp-faq-title" className="rp-h2">{title}</h2>
          {subtitle ? <p className="rp-body rp-section-sub">{subtitle}</p> : null}
        </header>
        <dl className="rp-faq-list">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question}>
                <dt>
                  <button
                    type="button"
                    aria-expanded={open}
                    className="rp-faq-q rp-focus-ring"
                    onClick={() => setOpenIndex(open ? null : index)}
                  >
                    {item.question}
                    <span aria-hidden>{open ? "−" : "+"}</span>
                  </button>
                </dt>
                {open ? <dd className="rp-faq-a">{item.answer}</dd> : null}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
