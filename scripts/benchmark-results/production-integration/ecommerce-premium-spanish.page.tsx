import type { Metadata } from "next";
import { EcommercePremiumHero } from "@/components/ecommerce-premium-hero";
import { EcommercePremiumCollections } from "@/components/ecommerce-premium-collections";
import { EcommercePremiumTestimonials } from "@/components/ecommerce-premium-testimonials";
import { EcommercePremiumContact } from "@/components/ecommerce-premium-contact";
import { EcommercePremiumFloatingCta } from "@/components/ecommerce-premium-floating-cta";
import { EcommercePremiumNav } from "@/components/ecommerce-premium-nav";
import { EcommercePremiumFooter } from "@/components/ecommerce-premium-footer";

export const metadata: Metadata = {
  title: "ecommerce showcase",
  description: "Premium ecommerce digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-ecommerce-premium" data-v2-package="ecommerce-premium" data-v2-composer="region-grid" data-v2-layout="default" data-v2-blueprint="bp-ecommerce-premium-ecommerce">
      <header data-v2-region="header">
      <EcommercePremiumNav
        brandName={"ecommerce showcase"}
        ctaLabel={"Comenzar"}
        links={[{"href":"#shop","label":"Servicios"},{"href":"#collections","label":"Collections"},{"href":"#story","label":"About"},{"href":"#contact","label":"Contacto"}]}
      />
      </header>
      <main data-v2-region="main" className="v2-region-grid flex flex-col">
        <h1 className="v2-sr-only">ecommerce showcase</h1>
      <div data-v2-section="hero" data-v2-variant="product-spotlight">
      <EcommercePremiumHero
        subtitle={"Premium ecommerce digital experience"}
        primaryCta={"Comenzar"}
        secondaryCta={"Saber más"}
      />
      </div>
      <div data-v2-section="features" data-v2-variant="bento-mosaic">
      <EcommercePremiumCollections
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="minimal-list">
      <EcommercePremiumTestimonials
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="cards-grid">
      <EcommercePremiumContact
        ctaLabel={"Comenzar"}
      />
      </div>
      </main>

      <footer data-v2-region="footer">
      <EcommercePremiumFooter
        brandName={"ecommerce showcase"}
        links={[{"href":"#shop","label":"Servicios"},{"href":"#collections","label":"Collections"},{"href":"#story","label":"About"},{"href":"#contact","label":"Contacto"}]}
      />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div data-v2-section="cta" data-v2-variant="split-offer">
      <EcommercePremiumFloatingCta
        primaryCta={"Comenzar"}
        secondaryCta={"Saber más"}
      />
      </div>
      </div>
    </div>
  );
}
