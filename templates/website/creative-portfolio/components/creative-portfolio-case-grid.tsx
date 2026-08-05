"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

const CASES = [
  { id: "a", title: "Void Gallery", span: "lg:col-span-7 lg:row-span-2", index: 3 },
  { id: "b", title: "Neon District", span: "lg:col-span-5", index: 4 },
  { id: "c", title: "Silent Type", span: "lg:col-span-5", index: 5 },
  { id: "d", title: "Apex Records", span: "lg:col-span-7", index: 6 },
  { id: "e", title: "Lumen Labs", span: "lg:col-span-12", index: 7 },
];

type CreativePortfolioCaseGridProps = {
  eyebrow?: string;
  title?: string;
};

export function CreativePortfolioCaseGrid({
  eyebrow = "Archive",
  title = "Asymmetric case studies",
}: CreativePortfolioCaseGridProps) {
  return (
    <section
      data-v2-component="creative-portfolio-case-grid"
      aria-labelledby="cp-grid-title"
      className="cp-section"
    >
      <div className="px-5 sm:px-8">
        <header className="mb-10">
          <p className="cp-eyebrow">{eyebrow}</p>
          <h2 id="cp-grid-title" className="cp-headline-sm mt-3">
            {title}
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          {CASES.map((item) => {
            const src = resolveSlotImage("hero", item.index);
            return (
              <article
                key={item.id}
                id={`case-${item.id}`}
                className={`cp-card-tilt group relative min-h-[16rem] overflow-hidden border border-[var(--border-default)] ${item.span}`}
              >
                {src ? (
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[var(--color-surface)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent" />
                <div className="relative flex h-full min-h-[16rem] flex-col justify-end p-6">
                  <span className="cp-font-mono text-xs text-[var(--color-volt)]" aria-hidden>
                    —
                  </span>
                  <h3 className="cp-font-display mt-2 text-xl font-bold uppercase tracking-tight lg:text-2xl">
                    {item.title}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
