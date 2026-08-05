"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

const FEATURED = [
  {
    id: "01",
    title: "Monolith Residences",
    category: "Architecture · Brand",
    year: "2025",
    imageIndex: 0,
  },
  {
    id: "02",
    title: "Pulse Festival",
    category: "Motion · Experience",
    year: "2025",
    imageIndex: 1,
  },
  {
    id: "03",
    title: "Forma Type Foundry",
    category: "Identity · Digital",
    year: "2024",
    imageIndex: 2,
  },
];

type CreativePortfolioSelectedWorkProps = {
  eyebrow?: string;
  title?: string;
};

export function CreativePortfolioSelectedWork({
  eyebrow = "Selected work",
  title = "Cases that move culture forward",
}: CreativePortfolioSelectedWorkProps) {
  return (
    <section
      id="work"
      data-v2-component="creative-portfolio-selected-work"
      aria-labelledby="cp-work-title"
      className="cp-section border-b border-[var(--border-subtle)]"
    >
      <div className="px-5 sm:px-8">
        <header className="mb-12 flex flex-col gap-4 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="cp-eyebrow">{eyebrow}</p>
            <h2 id="cp-work-title" className="cp-headline mt-4 max-w-lg">
              {title}
            </h2>
          </div>
          <a href="/work" className="cp-link-volt cp-font-mono text-xs uppercase tracking-widest">
            View all projects →
          </a>
        </header>

        <ul className="divide-y divide-[var(--border-subtle)]">
          {FEATURED.map((item, i) => {
            const src = resolveSlotImage("hero", item.imageIndex);
            return (
              <li key={item.id}>
                <a
                  href={`#case-${item.id}`}
                  className="cp-case-row group grid gap-6 py-8 transition-colors hover:bg-[var(--color-surface)]/50 lg:grid-cols-[4rem_1fr_12rem_6rem] lg:items-center lg:gap-8 lg:py-10"
                >
                  <span className="cp-font-mono text-sm text-[var(--color-volt)]">{item.id}</span>
                  <div>
                    <h3 className="cp-font-display text-2xl font-bold uppercase tracking-tight transition group-hover:text-[var(--color-volt)] lg:text-3xl">
                      {item.title}
                    </h3>
                    <p className="cp-font-mono mt-1 text-xs uppercase tracking-widest text-[var(--color-zinc)]">
                      {item.category}
                    </p>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden border border-[var(--border-default)] lg:aspect-[4/3]">
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-[var(--color-surface)]" />
                    )}
                  </div>
                  <span className="cp-font-mono text-end text-sm text-[var(--color-muted)]">{item.year}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
