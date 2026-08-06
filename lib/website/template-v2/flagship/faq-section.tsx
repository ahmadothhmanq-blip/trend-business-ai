"use client";

import { useId, useState } from "react";
import { FlagshipSectionHeader } from "@/lib/website/template-v2/flagship/section-header";
import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export type FlagshipFaqItem = { question: string; answer: string };

export type FlagshipFaqProps = {
  ui: FlagshipUi;
  componentId: string;
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FlagshipFaqItem[];
};

const DEFAULT_FAQ: FlagshipFaqItem[] = [
  {
    question: "How quickly can we get started?",
    answer:
      "Most teams launch their first workspace within two weeks. Our onboarding specialists guide you through data migration, integrations, and team training.",
  },
  {
    question: "Do you support enterprise security requirements?",
    answer:
      "Yes. We offer SSO, role-based access, audit logs, and compliance certifications including SOC 2 Type II and GDPR alignment.",
  },
  {
    question: "Can we customize workflows for our industry?",
    answer:
      "Absolutely. Templates adapt to your sector, and our visual builder lets you tailor pages, sections, and automations without code.",
  },
  {
    question: "What kind of support is included?",
    answer:
      "All plans include email support. Enterprise customers receive a dedicated success manager, SLA-backed response times, and quarterly business reviews.",
  },
];

export function FlagshipFaqSection({
  ui,
  componentId,
  id = "faq",
  eyebrow = "FAQ",
  title = "Answers before you ask",
  subtitle,
  items = DEFAULT_FAQ,
}: FlagshipFaqProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id={id}
      data-v2-component={componentId}
      aria-labelledby={`${id}-title`}
      className={`${ui.section} df-section-alt bg-[var(--color-surface)]`}
    >
      <div className={ui.container}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <FlagshipSectionHeader ui={ui} id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <div className="space-y-3">
            {items.map((item, index) => {
              const panelId = `${baseId}-panel-${index}`;
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.question}
                  className={`${ui.card} overflow-hidden transition-shadow duration-300 ${isOpen ? "shadow-[var(--shadow-surface)]" : ""}`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`${baseId}-trigger-${index}`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className={`${ui.fontBody} flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-semibold text-[var(--color-foreground)] transition-colors hover:text-[var(--color-primary)] ${ui.focusRing}`}
                    >
                      {item.question}
                      <span
                        aria-hidden
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] text-sm font-medium text-[var(--color-accent)] transition-transform duration-300 ${isOpen ? "rotate-180 bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]" : ""}`}
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={`${baseId}-trigger-${index}`}
                    hidden={!isOpen}
                    className={`${ui.fontBody} border-t border-[var(--border-subtle,rgba(0,0,0,0.06))] px-5 py-4 text-sm leading-relaxed text-[var(--color-muted)] motion-safe:animate-[df-slide-up_0.35s_ease_both]`}
                  >
                    {item.answer}
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
