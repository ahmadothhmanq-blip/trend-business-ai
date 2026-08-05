"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const CASES = [
  { id: "a", title: "Void Gallery", span: "lg:col-span-8 lg:row-span-2", index: 3 },
  { id: "b", title: "Neon District", span: "lg:col-span-4", index: 4 },
  { id: "c", title: "Silent Type", span: "lg:col-span-4", index: 5 },
  { id: "d", title: "Apex Records", span: "lg:col-span-8", index: 6 },
  { id: "e", title: "Lumen Labs", span: "lg:col-span-12", index: 7 },
];

type CreativeAgencyPremiumCaseGridProps = {
  eyebrow?: string;
  title?: string;
};

export function CreativeAgencyPremiumCaseGrid({
  eyebrow = "Archive",
  title = "Case studies in brutalist grid",
}: CreativeAgencyPremiumCaseGridProps) {
  return (
    <section
      data-v2-component="creative-agency-premium-case-grid"
      aria-labelledby="sv-grid-title"
      className="sv-section"
    >
      <div className="px-5 sm:px-8">
        <header className="mb-12 flex flex-col gap-4 border-s-4 border-[var(--color-volt)] ps-6 lg:mb-16">
          <p className="sv-eyebrow">{eyebrow}</p>
          <h2 id="sv-grid-title" className="sv-headline-sm">
            {title}
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-12 lg:gap-3">
          {CASES.map((item, i) => (
            <article
              key={item.id}
              id={`case-${item.id}`}
              className={`sv-card-lift group relative min-h-[18rem] overflow-hidden border border-[var(--border-default)] ${item.span}`}
            >
              <SlotImage
                slot="gallery"
                index={item.index}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/40 to-transparent" />
              <div className="relative flex h-full min-h-[18rem] flex-col justify-between p-6 lg:p-8">
                <span className="sv-font-mono sv-index-num text-xs text-[var(--color-volt)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="sv-font-display text-xl font-bold uppercase tracking-tight lg:text-2xl">
                    {item.title}
                  </h3>
                  <span className="sv-volt-line mt-4 block max-w-[3rem] opacity-0 transition group-hover:max-w-[6rem] group-hover:opacity-100" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
