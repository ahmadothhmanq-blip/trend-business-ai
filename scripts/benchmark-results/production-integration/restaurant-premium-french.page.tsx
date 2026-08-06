import type { Metadata } from "next";
import { RestaurantPremiumSidebarRail } from "@/components/restaurant-premium-sidebar-rail";
import { RestaurantPremiumHero } from "@/components/restaurant-premium-hero";
import { RestaurantPremiumTastingMenu } from "@/components/restaurant-premium-tasting-menu";
import { RestaurantPremiumTestimonials } from "@/components/restaurant-premium-testimonials";
import { RestaurantPremiumChefStory } from "@/components/restaurant-premium-chef-story";
import { RestaurantPremiumContact } from "@/components/restaurant-premium-contact";
import { RestaurantPremiumReservationCta } from "@/components/restaurant-premium-reservation-cta";
import { RestaurantPremiumNav } from "@/components/restaurant-premium-nav";
import { RestaurantPremiumFooter } from "@/components/restaurant-premium-footer";

export const metadata: Metadata = {
  title: "restaurant showcase",
  description: "Premium restaurant digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-restaurant-premium v2-layout-sidebar-left" data-v2-package="restaurant-premium" data-v2-composer="region-grid" data-v2-layout="full-bleed" data-v2-blueprint="bp-restaurant-premium-restaurant">
      <header data-v2-region="header">
      <RestaurantPremiumNav
        brandName={"restaurant showcase"}
        ctaLabel={"Commencer"}
        links={[{"href":"#menu","label":"Services"},{"href":"#chef","label":"Fonctionnalités"},{"href":"#gallery","label":"Tarifs"},{"href":"#reservation","label":"Contact"}]}
      />
      </header>
      <div className="v2-sidebar-shell mx-auto flex w-full max-w-[var(--container-max,82rem)] flex-col lg:flex-row">
        <h1 className="v2-sr-only">restaurant showcase</h1>
      <aside data-v2-region="sidebar" className="v2-sidebar-rail hidden shrink-0 lg:block lg:w-56 xl:w-64">
      <RestaurantPremiumSidebarRail
        brandName={"restaurant showcase"}
        ctaLabel={"Commencer"}
        links={[{"href":"#menu","label":"Services"},{"href":"#chef","label":"Fonctionnalités"},{"href":"#gallery","label":"Tarifs"},{"href":"#reservation","label":"Contact"}]}
      />
      </aside>
      <main data-v2-region="main" className="v2-main-canvas min-w-0 flex-1">
      <div data-v2-section="hero" data-v2-variant="immersive-visual">
      <RestaurantPremiumHero
        subtitle={"Premium restaurant digital experience"}
        primaryCta={"Commencer"}
        secondaryCta={"En savoir plus"}
      />
      </div>
      <div data-v2-section="services" data-v2-variant="process-rail">
      <RestaurantPremiumTastingMenu
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="minimal-list">
      <RestaurantPremiumTestimonials
      />
      </div>
      <div data-v2-section="about" data-v2-variant="timeline-story">
      <RestaurantPremiumChefStory
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="dark-panel">
      <RestaurantPremiumContact
        ctaLabel={"Commencer"}
      />
      </div>
      </main>
      </div>

      <footer data-v2-region="footer">
      <RestaurantPremiumFooter
        brandName={"restaurant showcase"}
        links={[{"href":"#menu","label":"Services"},{"href":"#chef","label":"Fonctionnalités"},{"href":"#gallery","label":"Tarifs"},{"href":"#reservation","label":"Contact"}]}
      />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div data-v2-section="cta" data-v2-variant="inline-newsletter">
      <RestaurantPremiumReservationCta
        primaryCta={"Commencer"}
        secondaryCta={"En savoir plus"}
      />
      </div>
      </div>
    </div>
  );
}
