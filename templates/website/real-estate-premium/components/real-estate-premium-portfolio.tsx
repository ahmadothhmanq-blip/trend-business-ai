"use client";

import { useMemo, useState } from "react";
import { SlotImage } from "@/lib/website/template-v2/slots";
import { hasSlotImage } from "@/lib/website/template-v2/slots/slot-layout";

const DEFAULT_ITEMS = [
  {
    company: "Harbour House",
    industry: "Waterfront",
    outcome: "$18.4M",
    outcomeLabel: "guide",
    detail: "Private quay, five suites, and a gallery wing overlooking the marina.",
  },
  {
    company: "Vineyard Ridge",
    industry: "Estate",
    outcome: "$24.0M",
    outcomeLabel: "guide",
    detail: "Hilltop estate with cellar, olive groves, and a restored stone residence.",
  },
  {
    company: "Apex Penthouse",
    industry: "Urban",
    outcome: "$12.7M",
    outcomeLabel: "guide",
    detail: "Full-floor residence with dual terraces and museum-grade climate control.",
  },
];

type Listing = {
  company: string;
  industry: string;
  outcome: string;
  outcomeLabel?: string;
  detail: string;
  imageUrl?: string | null;
};

type RealEstatePremiumPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Listing[];
};

export function RealEstatePremiumPortfolio({
  eyebrow = "Active listings",
  title = "Property dossier",
  subtitle = "Select a listing to open its specification sheet.",
  items = DEFAULT_ITEMS,
}: RealEstatePremiumPortfolioProps) {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  const hasVisual = useMemo(
    () => (current ? hasSlotImage("gallery", active, current.imageUrl ?? null) : false),
    [active, current],
  );

  if (!current) return null;

  return (
    <section
      id="portfolio"
      data-v2-component="real-estate-premium-portfolio"
      aria-labelledby="rep-portfolio-title"
      className="rep-listings"
    >
      <div className="rep-listings-index">
        <p className="rep-listings-index-head" id="rep-portfolio-title">
          {eyebrow} · {title}
        </p>
        <p className="sr-only">{subtitle}</p>
        {items.map((item, i) => (
          <button
            key={item.company}
            type="button"
            className="rep-listing-row"
            aria-current={i === active ? "true" : undefined}
            onClick={() => setActive(i)}
          >
            <p className="rep-listing-row-title">{item.company}</p>
            <p className="rep-listing-row-meta">
              {item.industry} · {item.outcome}
              {item.outcomeLabel ? ` ${item.outcomeLabel}` : ""}
            </p>
          </button>
        ))}
      </div>

      <article className="rep-listings-detail" aria-live="polite">
        <div className="rep-listings-detail-visual">
          {hasVisual ? (
            <SlotImage
              slot="gallery"
              index={active}
              preferred={current.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="rep-dossier-featured-visual-empty" aria-hidden>
              {String(active + 1).padStart(2, "0")}
            </div>
          )}
        </div>
        <div className="rep-dossier-sheet">
          <p className="rep-dossier-sheet-ref">
            Listing {String(active + 1).padStart(2, "0")} · {current.industry}
          </p>
          <h2>{current.company}</h2>
          <p className="rep-dossier-sheet-deck">{current.detail}</p>
          <dl className="rep-spec-list">
            <div>
              <dt>Market</dt>
              <dd>{current.industry}</dd>
            </div>
            <div>
              <dt>Guide</dt>
              <dd>
                {current.outcome}
                {current.outcomeLabel ? ` ${current.outcomeLabel}` : ""}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Private viewing by appointment</dd>
            </div>
            <div>
              <dt>Advisory</dt>
              <dd>White-glove conveyance included</dd>
            </div>
          </dl>
          <a href="#contact" className="rep-btn-primary rep-focus-ring mt-5 inline-flex">
            Request dossier
          </a>
        </div>
      </article>
    </section>
  );
}
