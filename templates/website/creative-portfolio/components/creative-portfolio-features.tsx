"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import { hasSlotImage } from "@/lib/website/template-v2/slots/slot-layout";

const DEFAULT_FEATURES = [
  {
    title: "Brand systems",
    description: "Identity, guidelines, and launch assets that scale across every touchpoint.",
    icon: "01",
    span: "hero",
  },
  {
    title: "Product design",
    description: "End-to-end UX for digital products that feel inevitable in market.",
    icon: "02",
    span: "tall",
  },
  {
    title: "Campaign craft",
    description: "Launch narratives and motion systems built for global attention.",
    icon: "03",
    span: "compact",
  },
  {
    title: "Design ops",
    description: "Systems, tooling, and governance that keep creative teams shipping fast.",
    icon: "04",
    span: "wide",
  },
];

type CreativePortfolioFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string; imageUrl?: string | null }>;
};

export function CreativePortfolioFeatures({
  eyebrow = "Capability reel",
  title = "Selected capabilities",
  subtitle = "Swipe sideways through the studio stages.",
  items = DEFAULT_FEATURES,
}: CreativePortfolioFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="creative-portfolio-features"
      aria-labelledby="cp-features-title"
      className="cp-filmstrip-section"
    >
      <div className="cp-filmstrip-label">
        <span id="cp-features-title">{eyebrow}</span>
        <span>{title}</span>
      </div>
      <p className="sr-only">{subtitle}</p>
      <div className="cp-filmstrip" role="region" aria-label={title} tabIndex={0}>
        <div className="cp-filmstrip-track">
          {items.map((item, i) => {
            const hasVisual = hasSlotImage("features", i, item.imageUrl ?? null);
            const index = String(i + 1).padStart(2, "0");
            return (
              <article key={item.title} className="cp-film-panel" aria-label={`${index} ${item.title}`}>
                <div>
                  <p className="cp-film-panel-index">
                    Stage {item.icon ?? index}
                  </p>
                  <h3 className="cp-film-panel-title">{item.title}</h3>
                  <p className="cp-film-panel-body">{item.description}</p>
                  <p className="cp-film-panel-meta">Capability · Horizontal</p>
                </div>
                <div className="cp-film-panel-visual">
                  {hasVisual ? (
                    <SlotImage
                      slot="features"
                      index={i}
                      preferred={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="cp-film-panel-visual-empty" aria-hidden>
                      {index}
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
