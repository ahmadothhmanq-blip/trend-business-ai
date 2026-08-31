"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import { hasSlotImage } from "@/lib/website/template-v2/slots/slot-layout";

const FEATURED_FILTERS = ["Waterfront", "Vineyard", "Penthouse", "Historic"];

const FEATURED_SPECS = [
  { term: "Reference", value: "EST-2048" },
  { term: "Beds", value: "5" },
  { term: "Baths", value: "6" },
  { term: "Interior", value: "6,400 sq ft" },
  { term: "Tenure", value: "Freehold" },
  { term: "Guide", value: "Upon request" },
];

type RealEstatePremiumHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function RealEstatePremiumHero({
  title = "Harbour House, No. 12",
  subtitle = "Waterfront residence with private quay access, gallery-level interiors, and white-glove conveyance.",
  eyebrow = "Featured dossier",
  primaryCta = "Search listings",
  secondaryCta = "Open full sheet",
  imageUrl = null,
}: RealEstatePremiumHeroProps) {
  const hasVisual = hasSlotImage("hero", 0, imageUrl);

  return (
    <section
      id="top"
      data-v2-component="real-estate-premium-hero"
      aria-labelledby="rep-hero-title"
      className="rep-dossier-opener"
    >
      <aside className="rep-dossier-search" aria-label="Property search">
        <p className="rep-dossier-search-label">Search utility</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label className="sr-only" htmlFor="rep-search-q">
            Location or reference
          </label>
          <input id="rep-search-q" type="search" name="q" placeholder="Location, neighborhood, or ref." />
          <label className="sr-only" htmlFor="rep-search-type">
            Property type
          </label>
          <select id="rep-search-type" name="type" defaultValue="residence">
            <option value="residence">Residence</option>
            <option value="estate">Estate</option>
            <option value="penthouse">Penthouse</option>
            <option value="investment">Investment</option>
          </select>
          <button type="submit" className="rep-btn-primary rep-focus-ring">
            {primaryCta}
          </button>
        </form>
        <div className="rep-dossier-filters" role="group" aria-label="Quick filters">
          {FEATURED_FILTERS.map((loc) => (
            <button key={loc} type="button">
              {loc}
            </button>
          ))}
        </div>
      </aside>

      <div className="rep-dossier-featured">
        <div className="rep-dossier-featured-visual">
          {hasVisual ? (
            <SlotImage slot="hero" index={0} preferred={imageUrl} alt="" className="h-full w-full object-cover" priority />
          ) : (
            <div className="rep-dossier-featured-visual-empty" aria-hidden>
              Dossier
            </div>
          )}
        </div>
        <article className="rep-dossier-sheet">
          <p className="rep-dossier-sheet-ref">{eyebrow}</p>
          <h1 id="rep-hero-title">{title}</h1>
          <p className="rep-dossier-sheet-deck">{subtitle}</p>
          <dl className="rep-spec-list">
            {FEATURED_SPECS.map((spec) => (
              <div key={spec.term}>
                <dt>{spec.term}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
          <a href="#portfolio" className="rep-btn-secondary rep-focus-ring mt-5 inline-flex">
            {secondaryCta}
          </a>
        </article>
      </div>
    </section>
  );
}
