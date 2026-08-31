"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import { hasSlotImage } from "@/lib/website/template-v2/slots/slot-layout";

const DEFAULT_ITEMS = [
  {
    company: "Vertex Systems",
    industry: "Technology",
    outcome: "42%",
    outcomeLabel: "faster cycles",
    detail: "Unified brand and product language across six regions with measurable lift in quarter one.",
  },
  {
    company: "Helix Group",
    industry: "Healthcare",
    outcome: "$3.1M",
    outcomeLabel: "value unlocked",
    detail: "Campaign system and patient journey redesign that clarified the category story.",
  },
  {
    company: "Axiom Logistics",
    industry: "Supply Chain",
    outcome: "99%",
    outcomeLabel: "accuracy",
    detail: "Motion-led launch kit and dashboard UX that replaced manual reporting theatre.",
  },
];

type CreativePortfolioPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{
    company: string;
    industry: string;
    outcome: string;
    outcomeLabel?: string;
    detail: string;
    imageUrl?: string | null;
  }>;
};

export function CreativePortfolioPortfolio({
  eyebrow = "Selected work",
  title = "Filmstrip cases",
  subtitle = "Primary navigation through the work is horizontal.",
  items = DEFAULT_ITEMS,
}: CreativePortfolioPortfolioProps) {
  return (
    <section
      id="filmstrip"
      data-v2-component="creative-portfolio-portfolio"
      aria-labelledby="cp-portfolio-title"
      className="cp-filmstrip-section"
    >
      <div className="cp-filmstrip-label">
        <span id="cp-portfolio-title">{eyebrow}</span>
        <span>{title}</span>
      </div>
      <p className="sr-only">{subtitle}</p>
      <div className="cp-filmstrip" role="region" aria-label={title} tabIndex={0}>
        <div className="cp-filmstrip-track">
          {items.map((item, i) => {
            const hasVisual = hasSlotImage("gallery", i, item.imageUrl ?? null);
            const index = String(i + 1).padStart(2, "0");
            return (
              <article key={item.company} className="cp-film-panel" aria-label={`${index} ${item.company}`}>
                <div>
                  <p className="cp-film-panel-index">
                    Case {index}
                  </p>
                  <h3 className="cp-film-panel-title">{item.company}</h3>
                  <p className="cp-film-panel-body">{item.detail}</p>
                  <p className="cp-film-panel-meta">
                    {item.industry}
                    {item.outcomeLabel ? ` · ${item.outcome} ${item.outcomeLabel}` : ` · ${item.outcome}`}
                  </p>
                </div>
                <div className="cp-film-panel-visual">
                  {hasVisual ? (
                    <SlotImage
                      slot="gallery"
                      index={i}
                      preferred={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="cp-film-panel-visual-empty" aria-hidden>
                      {item.outcome}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
