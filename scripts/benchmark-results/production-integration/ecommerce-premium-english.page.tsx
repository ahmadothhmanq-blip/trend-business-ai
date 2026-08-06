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
        ctaLabel={"Shop collection"}
        links={[{"href":"#product","label":"Shop"},{"href":"#gallery","label":"Lookbook"},{"href":"#pricing","label":"Offers"},{"href":"#testimonials","label":"Reviews"},{"href":"#contact","label":"Support"}]}
      />
      </header>
      <main data-v2-region="main" className="v2-region-grid flex flex-col">
        <h1 className="v2-sr-only">ecommerce showcase</h1>
      <div data-v2-section="hero" data-v2-variant="product-spotlight">
      <EcommercePremiumHero
        subtitle={"Premium ecommerce digital experience"}
        eyebrow={"Premium commerce"}
        primaryCta={"Shop collection"}
        secondaryCta={"Our story"}
      />
      </div>
      <div data-v2-section="features" data-v2-variant="bento-mosaic">
      <EcommercePremiumCollections
        eyebrow={"Why shop here"}
        title={"Details customers notice"}
        subtitle={"Clarity, photography, and trust signals that feel Webflow-polished."}
        items={[{"title":"Product storytelling","body":"Hero product moments with benefits that read in seconds."},{"title":"Fast discovery","body":"Collections organized for browsing — not endless filters."},{"title":"Trusted checkout","body":"Payments and shipping timelines stated without fine-print surprises."},{"title":"Order clarity","body":"Tracking and support that resolve questions quickly."}]}
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="minimal-list">
      <EcommercePremiumTestimonials
        eyebrow={"Reviews"}
        title={"What buyers say after delivery"}
        subtitle={"Specific praise — not anonymous five-star spam."}
        items={[{"quote":"Packaging and product quality matched the site promise — working with ecommerce showcase.","name":"Riley Stone","role":"Customer"},{"quote":"Checkout was the smoothest I have used this year.","name":"Amelia Cho","role":"Repeat buyer"},{"quote":"Returns were clear — no scavenger hunt for policies.","name":"Ben Torres","role":"Customer"}]}
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="cards-grid">
      <EcommercePremiumContact
        title={"Need help with an order?"}
        subtitle={"Customer care responds quickly with clear next steps."}
        ctaLabel={"Shop collection"}
      />
      </div>
      </main>

      <footer data-v2-region="footer">
      <EcommercePremiumFooter
        brandName={"ecommerce showcase"}
        tagline={"Collections, offers, and checkout that feel effortless."}
        links={[{"href":"#product","label":"Shop"},{"href":"#gallery","label":"Lookbook"},{"href":"#pricing","label":"Offers"},{"href":"#testimonials","label":"Reviews"},{"href":"#contact","label":"Support"}]}
      />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div data-v2-section="cta" data-v2-variant="split-offer">
      <EcommercePremiumFloatingCta
        primaryCta={"Shop collection"}
        secondaryCta={"Our story"}
        title={"Find your next favorite"}
        subtitle={"Browse featured collections or jump straight to current offers."}
      />
      </div>
      </div>
    </div>
  );
}
