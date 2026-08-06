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
        ctaLabel={"Reserve your table"}
        links={[{"href":"#services","label":"Menu"},{"href":"#gallery","label":"Gallery"},{"href":"#testimonials","label":"Guests"},{"href":"#booking","label":"Reserve"},{"href":"#contact","label":"Contact"}]}
      />
      </header>
      <div className="v2-sidebar-shell mx-auto flex w-full max-w-[var(--container-max,82rem)] flex-col lg:flex-row">
        <h1 className="v2-sr-only">restaurant showcase</h1>
      <aside data-v2-region="sidebar" className="v2-sidebar-rail hidden shrink-0 lg:block lg:w-56 xl:w-64">
      <RestaurantPremiumSidebarRail
        brandName={"restaurant showcase"}
        ctaLabel={"Reserve your table"}
        links={[{"href":"#services","label":"Menu"},{"href":"#gallery","label":"Gallery"},{"href":"#testimonials","label":"Guests"},{"href":"#booking","label":"Reserve"},{"href":"#contact","label":"Contact"}]}
      />
      </aside>
      <main data-v2-region="main" className="v2-main-canvas min-w-0 flex-1">
      <div data-v2-section="hero" data-v2-variant="immersive-visual">
      <RestaurantPremiumHero
        subtitle={"Premium restaurant digital experience"}
        eyebrow={"Dining destination"}
        primaryCta={"Reserve your table"}
        secondaryCta={"View tasting menu"}
      />
      </div>
      <div data-v2-section="services" data-v2-variant="process-rail">
      <RestaurantPremiumTastingMenu
        eyebrow={"Experience"}
        title={"More than a reservation"}
        subtitle={"From weeknight dinners to celebrations — hospitality with intention."}
        items={[{"title":"Dining room","body":"Premium restaurant digital experience","cta":"Get started"},{"title":"Private events","body":"Hosts and servers who anticipate without hovering.","cta":"Learn more"},{"title":"Catering","body":"Lighting, pacing, and music tuned for conversation and celebration.","cta":"Learn more"}]}
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="minimal-list">
      <RestaurantPremiumTestimonials
        eyebrow={"Guests"}
        title={"Tables that earn return visits"}
        subtitle={"Notes from diners who notice the details."}
        items={[{"quote":"Anniversary dinner done right — food, pacing, and warmth — working with restaurant showcase.","name":"Claire & Tom","role":"Guests"},{"quote":"The tasting menu was inventive without being precious.","name":"Diego Alvarez","role":"Food writer"},{"quote":"Private dining for our team offsite was flawless.","name":"Nina Park","role":"People Ops Lead"}]}
      />
      </div>
      <div data-v2-section="about" data-v2-variant="timeline-story">
      <RestaurantPremiumChefStory
        eyebrow={"Experience"}
        title={"More than a reservation"}
        subtitle={"From weeknight dinners to celebrations — hospitality with intention."}
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="dark-panel">
      <RestaurantPremiumContact
        title={"Host your evening with us"}
        subtitle={"Questions about allergies, groups, or private dining? Reach out."}
        ctaLabel={"Reserve your table"}
      />
      </div>
      </main>
      </div>

      <footer data-v2-region="footer">
      <RestaurantPremiumFooter
        brandName={"restaurant showcase"}
        tagline={"Seasonal cooking, warm hospitality, and tables worth reserving."}
        links={[{"href":"#services","label":"Menu"},{"href":"#gallery","label":"Gallery"},{"href":"#testimonials","label":"Guests"},{"href":"#booking","label":"Reserve"},{"href":"#contact","label":"Contact"}]}
      />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div data-v2-section="cta" data-v2-variant="inline-newsletter">
      <RestaurantPremiumReservationCta
        primaryCta={"Reserve your table"}
        secondaryCta={"View tasting menu"}
        title={"Save your table"}
        subtitle={"Weekend seats go quickly — reserve now and we will confirm instantly."}
      />
      </div>
      </div>
    </div>
  );
}
