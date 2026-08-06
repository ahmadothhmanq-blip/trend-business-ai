import type { Metadata } from "next";
import { SaasEnterpriseHero } from "@/components/saas-enterprise-hero";
import { SaasEnterpriseFeatures } from "@/components/saas-enterprise-features";
import { SaasEnterprisePricing } from "@/components/saas-enterprise-pricing";
import { SaasEnterpriseTestimonials } from "@/components/saas-enterprise-testimonials";
import { SaasEnterpriseAbout } from "@/components/saas-enterprise-about";
import { SaasEnterpriseContact } from "@/components/saas-enterprise-contact";
import { SaasEnterpriseIntegrations } from "@/components/saas-enterprise-integrations";
import { SaasEnterpriseFloatingCta } from "@/components/saas-enterprise-floating-cta";
import { SaasEnterpriseNav } from "@/components/saas-enterprise-nav";
import { SaasEnterpriseFooter } from "@/components/saas-enterprise-footer";

export const metadata: Metadata = {
  title: "saas showcase",
  description: "Premium saas digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-saas-enterprise" data-v2-package="saas-enterprise" data-v2-composer="region-grid" data-v2-layout="default" data-v2-blueprint="bp-saas-enterprise-saas">
      <header data-v2-region="header">
      <SaasEnterpriseNav
        brandName={"saas showcase"}
        ctaLabel={"Book a demo"}
        links={[{"href":"#features","label":"Product"},{"href":"#services","label":"Solutions"},{"href":"#pricing","label":"Pricing"},{"href":"#testimonials","label":"Customers"},{"href":"#contact","label":"Contact"}]}
      />
      </header>
      <main data-v2-region="main" className="v2-region-grid flex flex-col">
        <h1 className="v2-sr-only">saas showcase</h1>
      <div data-v2-section="hero" data-v2-variant="metrics-rail">
      <SaasEnterpriseHero
        subtitle={"Premium saas digital experience"}
        eyebrow={"Modern SaaS platform"}
        primaryCta={"Book a demo"}
        secondaryCta={"View platform tour"}
      />
      </div>
      <div data-v2-section="features" data-v2-variant="bento-mosaic">
      <SaasEnterpriseFeatures
        eyebrow={"Capabilities"}
        title={"Designed like a premium SaaS product"}
        subtitle={"Webflow-level polish with product clarity — hierarchy, motion, and conversion paths that feel intentional."}
        items={[{"title":"Ship faster","body":"Opinionated workflows that remove busywork and keep teams productive."},{"title":"Stay aligned","body":"Shared dashboards and roles so product, sales, and ops stay in sync."},{"title":"Scale securely","body":"Enterprise-ready permissions, audit trails, and reliable uptime."},{"title":"Measure what matters","body":"Clear analytics that connect usage to revenue — not vanity charts."}]}
      />
      </div>
      <div data-v2-section="pricing" data-v2-variant="comparison-table">
      <SaasEnterprisePricing
        eyebrow={"Pricing"}
        title={"Simple plans. Serious product."}
        subtitle={"Transparent tiers with a recommended path for growing teams."}
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="minimal-list">
      <SaasEnterpriseTestimonials
        eyebrow={"Customers"}
        title={"Loved by teams shipping serious software"}
        subtitle={"Specific outcomes from founders and operators who care about craft."}
        items={[{"quote":"We replaced three tools with one workflow. Onboarding went from weeks to days — working with saas showcase.","name":"Maya Chen","role":"Head of Operations, Lattice Labs"},{"quote":"The product feels premium — crisp UI, clear CTAs, zero fluff.","name":"Evan Brooks","role":"Founder, Orbitly"},{"quote":"Our team adopted it in a week. Support was sharp and human.","name":"Priya Nair","role":"VP Product, Northwind"}]}
      />
      </div>
      <div data-v2-section="about" data-v2-variant="split-narrative">
      <SaasEnterpriseAbout
        eyebrow={"Platform"}
        title={"Everything your team needs to move faster"}
        subtitle={"Purpose-built modules that replace fragmented tools with one coherent product experience."}
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="cards-grid">
      <SaasEnterpriseContact
        title={"Talk to product specialists"}
        subtitle={"Tell us your stack and goals — we will map the fastest path to value."}
        ctaLabel={"Book a demo"}
      />
      </div>
      <SaasEnterpriseIntegrations
        primaryCta={"Book a demo"}
        secondaryCta={"View platform tour"}
        title={"Ready to see it with your data?"}
        subtitle={"Book a personalized demo and leave with a clear rollout plan for your team."}
      />
      </main>

      <footer data-v2-region="footer">
      <SaasEnterpriseFooter
        brandName={"saas showcase"}
        tagline={"Software built for clarity, speed, and measurable growth."}
        links={[{"href":"#features","label":"Product"},{"href":"#services","label":"Solutions"},{"href":"#pricing","label":"Pricing"},{"href":"#testimonials","label":"Customers"},{"href":"#contact","label":"Contact"}]}
      />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div data-v2-section="cta" data-v2-variant="floating-card">
      <SaasEnterpriseFloatingCta
        primaryCta={"Book a demo"}
        secondaryCta={"View platform tour"}
        title={"Ready to see it with your data?"}
        subtitle={"Book a personalized demo and leave with a clear rollout plan for your team."}
      />
      </div>
      </div>
    </div>
  );
}
