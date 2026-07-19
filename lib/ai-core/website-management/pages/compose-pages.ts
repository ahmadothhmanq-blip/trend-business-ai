/**
 * Compose real App Router pages for industry site structure.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { SiteStructurePlan } from "@/lib/ai-core/website-management/types";

function pageShell(params: {
  brand: string;
  title: string;
  description: string;
  bodyImports: string;
  bodyJsx: string;
}): string {
  return `import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
${params.bodyImports}

export const metadata: Metadata = {
  title: ${JSON.stringify(params.title)},
  description: ${JSON.stringify(params.description)},
};

export default function ManagedPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
      <SiteHeader brandName=${JSON.stringify(params.brand)} />
      ${params.bodyJsx}
      <SiteFooter brandName=${JSON.stringify(params.brand)} />
    </main>
  );
}
`;
}

function sectionForRoute(
  route: string,
  industryId: string,
  brand: string,
  label: string,
): { imports: string; jsx: string } {
  const title = `${brand} · ${label}`;

  if (route === "/menu" || (industryId === "restaurant" && route.includes("menu"))) {
    return {
      imports: `import { MenuHighlights } from "@/components/sections/menu-highlights";
import { ReservationSection } from "@/components/sections/reservation-section";`,
      jsx: `<section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[var(--container-max)]">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">Menu</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl md:text-5xl">${title}</h1>
          <p className="mt-4 max-w-2xl text-[var(--color-foreground)]/70">Seasonal dishes, crafted with care. Explore categories and signatures.</p>
        </div>
      </section>
      <MenuHighlights />
      <ReservationSection />`,
    };
  }

  if (route === "/gallery") {
    return {
      imports: `import { GalleryExperience } from "@/components/sections/gallery-experience";`,
      jsx: `<GalleryExperience
        eyebrow="Gallery"
        title=${JSON.stringify(title)}
        subtitle="Moments that capture the atmosphere of the brand."
      />`,
    };
  }

  if (route === "/reservation" || route === "/contact") {
    return {
      imports: `import { ContactSection } from "@/components/sections/contact-section";
import { MapsSection } from "@/components/sections/maps-section";`,
      jsx: `<section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[var(--container-max)]">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl">${title}</h1>
          <p className="mt-4 max-w-2xl text-[var(--color-foreground)]/70">Reach the team — we respond quickly.</p>
        </div>
      </section>
      <ContactSection />
      <MapsSection />`,
    };
  }

  if (route === "/about") {
    return {
      imports: `import { FeatureStorytelling } from "@/components/sections/feature-storytelling";`,
      jsx: `<section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[var(--container-max)]">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">About</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl md:text-5xl">${title}</h1>
        </div>
      </section>
      <FeatureStorytelling />`,
    };
  }

  if (route === "/services" || route === "/projects" || route === "/pricing") {
    const comp =
      route === "/pricing"
        ? "PricingModern"
        : route === "/projects"
          ? "CaseStudies"
          : "ServicesModern";
    const path =
      route === "/pricing"
        ? "pricing-modern"
        : route === "/projects"
          ? "case-studies"
          : "services-modern";
    return {
      imports: `import { ${comp} } from "@/components/sections/${path}";`,
      jsx: `<section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[var(--container-max)]">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl">${title}</h1>
        </div>
      </section>
      <${comp} />`,
    };
  }

  if (route === "/listings" || route === "/shop") {
    return {
      imports: `import { PropertyListings } from "@/components/sections/property-listings";`,
      jsx: `<section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[var(--container-max)]">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl">${title}</h1>
          <p className="mt-4 max-w-2xl text-[var(--color-foreground)]/70">Browse curated options with clear pricing and details.</p>
        </div>
      </section>
      <PropertyListings />`,
    };
  }

  if (route === "/locations") {
    return {
      imports: `import { BranchesMap } from "@/components/sections/branches-map";`,
      jsx: `<section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[var(--container-max)]">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl">${title}</h1>
        </div>
      </section>
      <BranchesMap />`,
    };
  }

  if (route === "/inventory") {
    return {
      imports: `import { InventoryGrid } from "@/components/sections/inventory-grid";`,
      jsx: `<InventoryGrid />`,
    };
  }

  if (route === "/models") {
    return {
      imports: `import { VehicleShowcase } from "@/components/sections/vehicle-showcase";
import { VehicleComparison } from "@/components/sections/vehicle-comparison";`,
      jsx: `<VehicleShowcase />
      <VehicleComparison />`,
    };
  }

  // Generic fallback page
  return {
    imports: `import { ServicesModern } from "@/components/sections/services-modern";
import { ContactCta } from "@/components/sections/contact-cta";`,
    jsx: `<section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[var(--container-max)]">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl">${title}</h1>
          <p className="mt-4 max-w-2xl text-[var(--color-foreground)]/70">${label} for ${brand}.</p>
        </div>
      </section>
      <ServicesModern />
      <ContactCta />`,
  };
}

/**
 * Generate secondary page files (skips home `/` which is composed separately).
 * Keeps existing automotive models/[slug] if already present.
 */
export function composeManagedSecondaryPages(params: {
  structure: SiteStructurePlan;
  brandName: string;
}): GeneratedProjectFile[] {
  const brand = params.brandName || "Brand";
  const files: GeneratedProjectFile[] = [];

  for (const page of params.structure.pages) {
    if (page.route === "/") continue;
    // Prefer richer automotive composers already in polish for models/inventory
    if (
      params.structure.industryId === "automotive" &&
      (page.route === "/models" || page.route === "/inventory")
    ) {
      continue;
    }

    const body = sectionForRoute(
      page.route,
      params.structure.industryId,
      brand,
      page.label,
    );
    files.push({
      path: page.path,
      language: "tsx",
      content: pageShell({
        brand,
        title: `${brand} · ${page.label}`,
        description: page.purpose,
        bodyImports: body.imports,
        bodyJsx: body.jsx,
      }),
    });
  }

  // Dynamic vehicle detail for automotive if not already handled
  if (params.structure.industryId === "automotive") {
    files.push({
      path: "app/models/[slug]/page.tsx",
      language: "tsx",
      content: `import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { VehicleDetail } from "@/components/sections/vehicle-detail";
import { AppointmentCalendar } from "@/components/sections/appointment-calendar";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: ${JSON.stringify(brand)} + " · " + slug };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
      <SiteHeader brandName=${JSON.stringify(brand)} />
      <VehicleDetail slug={slug} />
      <AppointmentCalendar />
      <SiteFooter brandName=${JSON.stringify(brand)} />
    </main>
  );
}
`,
    });
  }

  // Sitemap route helper
  const urls = params.structure.sitemapPaths
    .map((p) => `  ${JSON.stringify(p)},`)
    .join("\n");
  files.push({
    path: "lib/site-sitemap.ts",
    language: "typescript",
    content: `/** Auto-generated site sitemap paths */
export const SITE_SITEMAP_PATHS = [
${urls}
] as const;

export const SITE_NAV_LINKS = ${JSON.stringify(params.structure.navLinks, null, 2)} as const;

export const SITE_FOOTER_LINKS = ${JSON.stringify(params.structure.footerLinks, null, 2)} as const;
`,
  });

  return files;
}
