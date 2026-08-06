import type { Metadata } from "next";
import { HotelResortPremiumSidebarRail } from "@/components/hotel-resort-premium-sidebar-rail";
import { HotelResortPremiumHero } from "@/components/hotel-resort-premium-hero";
import { HotelResortPremiumTastingMenu } from "@/components/hotel-resort-premium-tasting-menu";
import { HotelResortPremiumTestimonials } from "@/components/hotel-resort-premium-testimonials";
import { HotelResortPremiumChefStory } from "@/components/hotel-resort-premium-chef-story";
import { HotelResortPremiumContact } from "@/components/hotel-resort-premium-contact";
import { HotelResortPremiumReservationCta } from "@/components/hotel-resort-premium-reservation-cta";
import { HotelResortPremiumNav } from "@/components/hotel-resort-premium-nav";
import { HotelResortPremiumFooter } from "@/components/hotel-resort-premium-footer";

export const metadata: Metadata = {
  title: "hotel-resort showcase",
  description: "Premium hotel-resort digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-hotel-resort-premium v2-layout-sidebar-left" data-v2-package="hotel-resort-premium" data-v2-composer="region-grid" data-v2-layout="full-bleed" data-v2-blueprint="bp-hotel-resort-premium-hotel-resort">
      <header data-v2-region="header">
      <HotelResortPremiumNav
        brandName={"hotel-resort showcase"}
        ctaLabel={"ابدأ الآن"}
        links={[{"href":"#menu","label":"الخدمات"},{"href":"#chef","label":"المميزات"},{"href":"#gallery","label":"الأسعار"},{"href":"#reservation","label":"تواصل معنا"}]}
      />
      </header>
      <div className="v2-sidebar-shell mx-auto flex w-full max-w-[var(--container-max,82rem)] flex-col lg:flex-row">
        <h1 className="v2-sr-only">hotel-resort showcase</h1>
      <aside data-v2-region="sidebar" className="v2-sidebar-rail hidden shrink-0 lg:block lg:w-56 xl:w-64">
      <HotelResortPremiumSidebarRail
        brandName={"hotel-resort showcase"}
        ctaLabel={"ابدأ الآن"}
        links={[{"href":"#menu","label":"الخدمات"},{"href":"#chef","label":"المميزات"},{"href":"#gallery","label":"الأسعار"},{"href":"#reservation","label":"تواصل معنا"}]}
      />
      </aside>
      <main data-v2-region="main" className="v2-main-canvas min-w-0 flex-1">
      <div data-v2-section="hero" data-v2-variant="immersive-visual">
      <HotelResortPremiumHero
        subtitle={"Premium hotel-resort digital experience"}
        primaryCta={"ابدأ الآن"}
        secondaryCta={"اعرف المزيد"}
      />
      </div>
      <div data-v2-section="services" data-v2-variant="process-rail">
      <HotelResortPremiumTastingMenu
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="minimal-list">
      <HotelResortPremiumTestimonials
      />
      </div>
      <div data-v2-section="about" data-v2-variant="timeline-story">
      <HotelResortPremiumChefStory
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="dark-panel">
      <HotelResortPremiumContact
        ctaLabel={"ابدأ الآن"}
      />
      </div>
      </main>
      </div>

      <footer data-v2-region="footer">
      <HotelResortPremiumFooter
        brandName={"hotel-resort showcase"}
        links={[{"href":"#menu","label":"الخدمات"},{"href":"#chef","label":"المميزات"},{"href":"#gallery","label":"الأسعار"},{"href":"#reservation","label":"تواصل معنا"}]}
      />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div data-v2-section="cta" data-v2-variant="centered-band">
      <HotelResortPremiumReservationCta
        primaryCta={"ابدأ الآن"}
        secondaryCta={"اعرف المزيد"}
      />
      </div>
      </div>
    </div>
  );
}
