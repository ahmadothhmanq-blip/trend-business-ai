import type { Metadata } from "next";
import { HERO_IMAGE } from "@/lib/site-images";
import { SiteHeader } from "@/components/layout/site-header";
import { HeroLuxuryShowcase } from "@/components/sections/hero-luxury-showcase";
import { FeatureStorytelling } from "@/components/sections/feature-storytelling";
import { FeatureHighlights } from "@/components/sections/feature-highlights";
import { TestimonialsCarousel } from "@/components/sections/testimonials-carousel";
import { CtaBand } from "@/components/sections/cta-band";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Drive the vehicle that fits your life",
  description: "High-performance vehicles with advanced technology and bold design. Browse inventory with transparent specs, book a test drive, and get financing guidance without the pressure.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased ti-topology-classic_stack">
      <SiteHeader
        brandName="Apex Motors"
        ctaLabel="View inventory"
        links={[{"href":"#product","label":"Inventory"},{"href":"#services","label":"Services"},{"href":"#gallery","label":"Gallery"},{"href":"#contact","label":"Contact"}]}
      />
      <HeroLuxuryShowcase
        title="Drive the vehicle that fits your life"
        subtitle="High-performance vehicles with advanced technology and bold design. Browse inventory with transparent specs, book a test drive, and get financing guidance without the pressure."
        eyebrow="Dealership experience"
        primaryCta="View inventory"
        secondaryCta="Book a test drive"
        imageUrl={HERO_IMAGE}
      />
      <FeatureStorytelling
        eyebrow="Why us"
        title="A modern buying experience"
        subtitle="Premium automotive storytelling with decisive next steps."
        items={[{"title":"Transparent specs","body":"Vehicle details presented clearly — trim, mileage, and history."},{"title":"Honest pricing","body":"Pricing conversations grounded in listed offers, not surprises."},{"title":"Flexible test drives","body":"Book on-site or delivery test drives around your schedule."},{"title":"Ownership care","body":"Maintenance plans that keep ownership predictable."}]}
        features={[{"title":"Transparent specs","body":"Vehicle details presented clearly — trim, mileage, and history."},{"title":"Honest pricing","body":"Pricing conversations grounded in listed offers, not surprises."},{"title":"Flexible test drives","body":"Book on-site or delivery test drives around your schedule."},{"title":"Ownership care","body":"Maintenance plans that keep ownership predictable."}]}
      />
      <FeatureHighlights
        eyebrow="Why us"
        title="A modern buying experience"
        subtitle="Premium automotive storytelling with decisive next steps."
        items={[{"title":"Transparent specs","body":"Vehicle details presented clearly — trim, mileage, and history."},{"title":"Honest pricing","body":"Pricing conversations grounded in listed offers, not surprises."},{"title":"Flexible test drives","body":"Book on-site or delivery test drives around your schedule."},{"title":"Ownership care","body":"Maintenance plans that keep ownership predictable."}]}
        features={[{"title":"Transparent specs","body":"Vehicle details presented clearly — trim, mileage, and history."},{"title":"Honest pricing","body":"Pricing conversations grounded in listed offers, not surprises."},{"title":"Flexible test drives","body":"Book on-site or delivery test drives around your schedule."},{"title":"Ownership care","body":"Maintenance plans that keep ownership predictable."}]}
      />
      <TestimonialsCarousel
        eyebrow="Owners"
        title="Drivers who appreciated the process"
        subtitle="Honest feedback from recent buyers."
        items={[{"quote":"No pressure sales — just clear inventory and a great drive — working with Apex Motors.","name":"Marcus Reed","role":"Buyer"},{"quote":"Financing options were explained in plain language.","name":"Sofia Lang","role":"First-time buyer"},{"quote":"Service scheduling online actually worked.","name":"Chris Nolan","role":"Owner"}]}
        quotes={[{"quote":"No pressure sales — just clear inventory and a great drive — working with Apex Motors.","name":"Marcus Reed","role":"Buyer"},{"quote":"Financing options were explained in plain language.","name":"Sofia Lang","role":"First-time buyer"},{"quote":"Service scheduling online actually worked.","name":"Chris Nolan","role":"Owner"}]}
      />
      <CtaBand
        eyebrow="Visit"
        title="Book a test drive today"
        subtitle="Choose a vehicle and time — we will confirm and prepare the keys."
        primaryCta="View inventory"
        secondaryCta="Book a test drive"
      />
      <SiteFooter
        brandName="Apex Motors"
        tagline="Inventory, test drives, and ownership support without pressure."
        links={[{"href":"#product","label":"Inventory"},{"href":"#services","label":"Services"},{"href":"#gallery","label":"Gallery"},{"href":"#contact","label":"Contact"}]}
      />

    </main>
  );
}
