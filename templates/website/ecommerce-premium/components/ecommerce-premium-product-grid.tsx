"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_PRODUCTS = [
  { name: "Stoneware bowl", maker: "Atelier Mørk", price: "$148", tag: "Handmade" },
  { name: "Linen throw", maker: "Nord Weave", price: "$220", tag: "Organic" },
  { name: "Brass candlestick", maker: "Foundry No. 7", price: "$96", tag: "Limited" },
  { name: "Walnut serving board", maker: "Hearth & Grain", price: "$174", tag: "Small batch" },
  { name: "Porcelain vase", maker: "Studio Kō", price: "$132", tag: "Editor's pick" },
  { name: "Wool cushion", maker: "Highland Loom", price: "$118", tag: "New" },
];

type EcommercePremiumProductGridProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  products?: Array<{ name: string; maker: string; price: string; tag?: string }>;
};

export function EcommercePremiumProductGrid({
  eyebrow = "Shop the edit",
  title = "Pieces worth keeping",
  subtitle = "Every object is vetted for material quality, maker ethics, and timeless design — not seasonal churn.",
  products = DEFAULT_PRODUCTS,
}: EcommercePremiumProductGridProps) {
  return (
    <section
      id="shop"
      data-v2-component="ecommerce-premium-product-grid"
      aria-labelledby="ec-shop-title"
      className="ec-section bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-14 max-w-2xl">
          <p className="ec-eyebrow mb-4">{eyebrow}</p>
          <h2 id="ec-shop-title" className="ec-headline-sm">
            {title}
          </h2>
          <div className="ec-gold-rule mt-5" aria-hidden />
          <p className="ec-body mt-6">{subtitle}</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <article key={product.name} className="ec-product-card group">
              <div className="ec-product-media ec-editorial-frame relative overflow-hidden border-0">
                <SlotImage
                  slot="products"
                  index={i}
                  alt={product.name}
                  className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                {product.tag ? <span className="ec-badge absolute start-3 top-3">{product.tag}</span> : null}
                <button
                  type="button"
                  className="ec-btn-primary ec-focus-ring absolute bottom-3 end-3 text-[0.5625rem] opacity-0 transition group-hover:opacity-100"
                >
                  Quick view
                </button>
              </div>
              <div className="mt-5 flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <h3 className="ec-font-display text-lg">{product.name}</h3>
                  <p className="ec-font-body mt-0.5 text-sm text-[var(--color-muted)]">{product.maker}</p>
                </div>
                <span className="ec-font-body shrink-0 text-sm font-semibold text-[var(--color-champagne)]">
                  {product.price}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a href="/shop" className="ec-btn-secondary ec-focus-ring">
            Browse full catalog
          </a>
        </div>
      </div>
    </section>
  );
}
