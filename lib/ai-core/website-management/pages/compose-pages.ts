/**
 * Compose real App Router pages for industry site structure.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  ManagedPageDef,
  NavLink,
  SiteStructurePlan,
} from "@/lib/ai-core/website-management/types";
import { wireNavAndFooterToRoutes } from "@/lib/ai-core/website-management/pages/wire-nav";
import { writeStructureToFiles } from "@/lib/ai-core/website-management/pages/site-structure";

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

function slugifyRoute(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "page";
}

export function routeToPagePath(route: string): string {
  if (route === "/") return "app/page.tsx";
  const clean = route.replace(/^\//, "").replace(/\/$/, "");
  return `app/${clean}/page.tsx`;
}

export function addPage(
  structure: SiteStructurePlan,
  params: { label: string; route?: string; purpose?: string },
): SiteStructurePlan {
  const baseRoute = params.route || `/${slugifyRoute(params.label)}`;
  const route = baseRoute.startsWith("/") ? baseRoute : `/${baseRoute}`;
  const path = routeToPagePath(route);
  if (structure.pages.some((p) => p.route === route)) return structure;

  const page: ManagedPageDef = {
    route,
    path,
    label: params.label,
    purpose: params.purpose || `${params.label} page`,
    sections: [],
  };

  return {
    ...structure,
    pages: [...structure.pages, page],
    sitemapPaths: structure.sitemapPaths.includes(route)
      ? structure.sitemapPaths
      : [...structure.sitemapPaths, route],
  };
}

export function removePage(
  structure: SiteStructurePlan,
  route: string,
): SiteStructurePlan {
  if (route === "/") return structure;
  return {
    ...structure,
    pages: structure.pages.filter((p) => p.route !== route),
    sitemapPaths: structure.sitemapPaths.filter((p) => p !== route),
    navLinks: structure.navLinks.filter((l) => l.href !== route),
    footerLinks: structure.footerLinks.filter((l) => l.href !== route),
  };
}

export function duplicatePage(
  structure: SiteStructurePlan,
  route: string,
): SiteStructurePlan {
  const source = structure.pages.find((p) => p.route === route);
  if (!source) return structure;
  const copyLabel = `${source.label} Copy`;
  let candidate = `/${slugifyRoute(copyLabel)}`;
  let i = 2;
  while (structure.pages.some((p) => p.route === candidate)) {
    candidate = `/${slugifyRoute(copyLabel)}-${i}`;
    i += 1;
  }
  return addPage(structure, {
    label: copyLabel,
    route: candidate,
    purpose: source.purpose,
  });
}

export function reorderPages(
  structure: SiteStructurePlan,
  routes: string[],
): SiteStructurePlan {
  const byRoute = new Map(structure.pages.map((p) => [p.route, p]));
  const pages = routes
    .map((r) => byRoute.get(r))
    .filter((p): p is ManagedPageDef => Boolean(p));
  for (const page of structure.pages) {
    if (!pages.some((p) => p.route === page.route)) pages.push(page);
  }
  return {
    ...structure,
    pages,
    sitemapPaths: routes.length ? routes : structure.sitemapPaths,
  };
}

export function setHomepage(
  structure: SiteStructurePlan,
  route: string,
): SiteStructurePlan {
  const target = structure.pages.find((p) => p.route === route);
  const currentHome = structure.pages.find((p) => p.route === "/");
  if (!target || route === "/") return structure;

  const pages = structure.pages.map((p) => {
    if (p.route === "/") {
      return { ...target, route: "/", path: "app/page.tsx" };
    }
    if (p.route === route && currentHome) {
      return {
        ...currentHome,
        route,
        path: routeToPagePath(route),
      };
    }
    return p;
  });

  const sitemapPaths = structure.sitemapPaths.map((p) =>
    p === route ? "/" : p === "/" ? route : p,
  );

  return { ...structure, pages, sitemapPaths };
}

export function updatePageMeta(
  structure: SiteStructurePlan,
  route: string,
  patch: Partial<Pick<ManagedPageDef, "label" | "purpose">>,
): SiteStructurePlan {
  return {
    ...structure,
    pages: structure.pages.map((p) =>
      p.route === route ? { ...p, ...patch } : p,
    ),
  };
}

/**
 * Apply structure changes to blueprint files: pages, sitemap, nav wiring.
 */
export function applyStructureToProjectFiles(params: {
  files: GeneratedProjectFile[];
  structure: SiteStructurePlan;
  brandName: string;
}): GeneratedProjectFile[] {
  const validPaths = new Set(params.structure.pages.map((p) => p.path));
  let files = params.files.filter((f) => {
    if (f.path === "app/page.tsx") return validPaths.has("app/page.tsx");
    if (/^app\/.+\/page\.tsx$/.test(f.path)) return validPaths.has(f.path);
    return true;
  });

  const secondary = composeManagedSecondaryPages({
    structure: params.structure,
    brandName: params.brandName,
  });
  for (const file of secondary) {
    if (
      files.some((f) => f.path === file.path) &&
      (file.path.startsWith("app/models") ||
        file.path.startsWith("app/inventory"))
    ) {
      continue;
    }
    files = [...files.filter((f) => f.path !== file.path), file];
  }

  files = writeStructureToFiles(files, params.structure);
  return wireNavAndFooterToRoutes(files, params.structure);
}
