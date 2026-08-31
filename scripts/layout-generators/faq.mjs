import { DEFAULT_FAQ } from "../layout-dna.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const FAQ_GENERATORS = {
  "accordion-sidebar": accordionSidebar,
  "two-column-grid": twoColumnGrid,
  "numbered-faq": numberedFaq,
  "corporate-accordion": corporateAccordion,
  "minimal-list": minimalList,
  "clinical-faq": clinicalFaq,
  "resort-faq": resortFaq,
  "culinary-faq": culinaryFaq,
  "academic-faq": academicFaq,
  "shop-faq": shopFaq,
  "saas-faq": saasFaq,
  "studio-faq": studioFaq,
  "estate-faq": estateFaq,
  "organic-faq": organicFaq,
  "glass-faq": glassFaq,
  "terminal-faq": terminalFaq,
  "compliance-faq": complianceFaq,
  "spec-faq": specFaq,
  "legal-faq": legalFaq,
  "wellness-faq": wellnessFaq,
};

export function generateFaq(entry, layoutKey) {
  const fn = FAQ_GENERATORS[layoutKey] ?? accordionSidebar;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function faqHeader({ p, pkg, Pascal }) {
  return `"use client";

import { useState } from "react";

const DEFAULT_FAQ = ${JSON.stringify(DEFAULT_FAQ, null, 2)};

type ${Pascal}FaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function ${Pascal}Faq({
  eyebrow = "FAQ",
  title = "Common questions",
  subtitle = "Everything you need to know before getting started.",
  items = DEFAULT_FAQ,
}: ${Pascal}FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);`;
}

function accordionSidebar({ p, pkg, Pascal }) {
  return `${faqHeader({ p, pkg, Pascal })}
  return (
    <section id="faq" data-v2-component="${pkg}-faq" aria-labelledby="${p}-faq-title" className="${p}-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto grid max-w-[82rem] gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] sm:px-8">
        <header className="lg:sticky lg:top-28">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 id="${p}-faq-title" className="${p}-headline-sm mt-2">{title}</h2>
          <p className="${p}-body mt-4 text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="space-y-3">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className={\`${p}-card overflow-hidden \${open ? "shadow-md" : ""}\`}>
                <button type="button" className="flex w-full items-center justify-between p-5 text-start font-semibold" aria-expanded={open} onClick={() => setOpenIndex(open ? null : index)}>
                  {item.question}
                  <span aria-hidden>{open ? "−" : "+"}</span>
                </button>
                {open ? <p className="border-t border-[var(--border-subtle)] px-5 pb-5 pt-3 text-sm text-[var(--color-muted)]">{item.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;
}

function twoColumnGrid({ p, pkg, Pascal }) {
  return `${faqHeader({ p, pkg, Pascal })}
  return (
    <section id="faq" data-v2-component="${pkg}-faq" className="py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <dl className="mt-10 grid gap-8 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.question}>
              <dt className="font-bold">{item.question}</dt>
              <dd className="mt-2 text-sm text-[var(--color-muted)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
`;
}

function numberedFaq({ p, pkg, Pascal }) {
  return `${faqHeader({ p, pkg, Pascal })}
  return (
    <section id="faq" data-v2-component="${pkg}-faq" className="${p}-section py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <ol className="mt-10 space-y-8">
          {items.map((item, i) => (
            <li key={item.question} className="grid gap-4 border-b border-[var(--border-subtle)] pb-8 lg:grid-cols-[3rem_1fr]">
              <span className="${p}-font-mono text-2xl text-[var(--color-accent)]">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-bold">{item.question}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{item.answer}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
`;
}

function corporateAccordion({ p, pkg, Pascal }) {
  return accordionSidebar({ p, pkg, Pascal });
}

function minimalList({ p, pkg, Pascal }) {
  return twoColumnGrid({ p, pkg, Pascal });
}

function clinicalFaq({ p, pkg, Pascal }) {
  return `${faqHeader({ p, pkg, Pascal })}
  return (
    <section id="faq" data-v2-component="${pkg}-faq" className="py-16">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <div className="mt-10 space-y-4">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className="rounded-2xl bg-[var(--color-surface)] p-5">
                <button type="button" className="w-full text-start font-medium" onClick={() => setOpenIndex(open ? null : index)}>{item.question}</button>
                {open ? <p className="mt-3 text-sm text-[var(--color-muted)]">{item.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;
}

function resortFaq({ p, pkg, Pascal }) {
  return clinicalFaq({ p, pkg, Pascal });
}

function culinaryFaq({ p, pkg, Pascal }) {
  return accordionSidebar({ p, pkg, Pascal });
}

function academicFaq({ p, pkg, Pascal }) {
  return numberedFaq({ p, pkg, Pascal });
}

function shopFaq({ p, pkg, Pascal }) {
  return `${faqHeader({ p, pkg, Pascal })}
  return (
    <section id="faq" data-v2-component="${pkg}-faq" className="py-12">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
        <ul className="mt-8 space-y-6">
          {items.map((item) => (
            <li key={item.question} className="border-b border-[var(--border-subtle)] pb-6">
              <p className="font-medium">{item.question}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{item.answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
`;
}

function saasFaq({ p, pkg, Pascal }) {
  return accordionSidebar({ p, pkg, Pascal });
}

function studioFaq({ p, pkg, Pascal }) {
  return twoColumnGrid({ p, pkg, Pascal });
}

function estateFaq({ p, pkg, Pascal }) {
  return numberedFaq({ p, pkg, Pascal });
}

function organicFaq({ p, pkg, Pascal }) {
  return clinicalFaq({ p, pkg, Pascal });
}

function glassFaq({ p, pkg, Pascal }) {
  return `${faqHeader({ p, pkg, Pascal })}
  return (
    <section id="faq" data-v2-component="${pkg}-faq" className="py-16">
      <div className="mx-auto max-w-2xl ${p}-glass-card rounded-2xl border border-[var(--border-accent)] p-8 backdrop-blur">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-8 space-y-4">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question}>
                <button type="button" className="w-full text-start font-medium" onClick={() => setOpenIndex(open ? null : index)}>{item.question}</button>
                {open ? <p className="mt-2 text-sm text-[var(--color-muted)]">{item.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;
}

function terminalFaq({ p, pkg, Pascal }) {
  return `${faqHeader({ p, pkg, Pascal })}
  return (
    <section id="faq" data-v2-component="${pkg}-faq" className="bg-[#0a0f0a] py-12 font-mono text-sm text-[#00ff88]">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p>$ man faq</p>
        {items.map((item, i) => (
          <div key={item.question} className="mt-6">
            <p className="text-white">[{i + 1}] {item.question}</p>
            <p className="mt-2 ps-4 text-[#00ff88]/70">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}

function complianceFaq({ p, pkg, Pascal }) {
  return `${faqHeader({ p, pkg, Pascal })}
  return (
    <section id="faq" data-v2-component="${pkg}-faq" className="py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-8 flex flex-wrap gap-2">
          {["SOC 2", "GDPR", "PCI-DSS"].map((b) => <span key={b} className="rounded border px-2 py-1 text-xs">{b}</span>)}
        </div>
        <dl className="mt-10 space-y-6">
          {items.map((item) => (
            <div key={item.question} className="border-s-2 border-[var(--color-accent)] ps-6">
              <dt className="font-bold">{item.question}</dt>
              <dd className="mt-2 text-sm text-[var(--color-muted)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
`;
}

function specFaq({ p, pkg, Pascal }) {
  return `${faqHeader({ p, pkg, Pascal })}
  return (
    <section id="faq" data-v2-component="${pkg}-faq" className="py-16" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      <div className="mx-auto max-w-2xl border-2 border-dashed border-[var(--color-accent)] p-8">
        <p className="${p}-font-mono text-xs text-[var(--color-accent)]">FAQ SPEC</p>
        {items.map((item, i) => (
          <div key={item.question} className="mt-6 border-t border-[var(--border-default)] pt-4">
            <p className="text-xs text-[var(--color-muted)]">Q-{String(i + 1).padStart(2, "0")}</p>
            <p className="font-bold">{item.question}</p>
            <p className="mt-2 text-sm">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}

function legalFaq({ p, pkg, Pascal }) {
  return complianceFaq({ p, pkg, Pascal });
}

function wellnessFaq({ p, pkg, Pascal }) {
  return clinicalFaq({ p, pkg, Pascal });
}
