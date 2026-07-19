/**
 * Post-generation content polish — runs inside generateWebsite after component inject.
 * Does not add pipeline stages; improves copy, brand wiring, and premium CSS tokens.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import { composeHomePage } from "@/lib/ai-core/components/compose";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import { applyWebsiteManagementToProject } from "@/lib/ai-core/website-management";

const PREMIUM_CSS_SNIPPET = `
/* Production polish — SaaS / Webflow spacing & type */
:root {
  --section-y: 7.5rem;
  --section-y-mobile: 4.25rem;
  --container-max: 72rem;
  --ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
  --text-h2: 2.75rem;
  --space-section-gap: 1.75rem;
}

html {
  scroll-behavior: smooth;
}

body {
  letter-spacing: -0.011em;
  line-height: 1.65;
}

h1, h2, h3, h4 {
  letter-spacing: -0.03em;
  text-wrap: balance;
}

p {
  text-wrap: pretty;
}

::selection {
  background: color-mix(in srgb, var(--color-primary) 28%, transparent);
}

img {
  max-width: 100%;
  height: auto;
}

/* Richer visual rhythm for generated sites */
main > section + section {
  scroll-margin-top: 5rem;
}

.bg-gradient-hero {
  background-size: 140% 140%;
}
`;

function composeAutomotiveSecondaryPages(brand: string): GeneratedProjectFile[] {
  return [
    {
      path: "app/models/page.tsx",
      language: "tsx",
      content: `import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { VehicleShowcase } from "@/components/sections/vehicle-showcase";
import { VehicleComparison } from "@/components/sections/vehicle-comparison";

export const metadata: Metadata = {
  title: ${JSON.stringify(`${brand} · Models`)},
  description: "Browse luxury vehicles, compare trims, and open model detail pages.",
};

export default function ModelsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
      <SiteHeader brandName=${JSON.stringify(brand)} ctaLabel="Book test drive" />
      <VehicleShowcase
        eyebrow="Models"
        title="The collection"
        subtitle="Explore flagship vehicles with cinematic photography and clear next steps."
      />
      <VehicleComparison />
      <SiteFooter brandName=${JSON.stringify(brand)} />
    </main>
  );
}
`,
    },
    {
      path: "app/models/[slug]/page.tsx",
      language: "tsx",
      content: `import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { VehicleDetail } from "@/components/sections/vehicle-detail";
import { FinanceCalculator } from "@/components/sections/finance-calculator";
import { AppointmentCalendar } from "@/components/sections/appointment-calendar";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return {
    title: \`\${label} · ${brand}\`,
    description: \`Vehicle detail page for \${label} — specs, gallery, finance, and test-drive booking.\`,
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
      <SiteHeader brandName=${JSON.stringify(brand)} ctaLabel="Book test drive" />
      <VehicleDetail slug={slug} />
      <FinanceCalculator />
      <AppointmentCalendar />
      <SiteFooter brandName=${JSON.stringify(brand)} />
    </main>
  );
}
`,
    },
    {
      path: "app/inventory/page.tsx",
      language: "tsx",
      content: `import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { InventoryGrid } from "@/components/sections/inventory-grid";
import { FinanceCalculator } from "@/components/sections/finance-calculator";

export const metadata: Metadata = {
  title: ${JSON.stringify(`${brand} · Inventory`)},
  description: "Filter available vehicles by body style and budget.",
};

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
      <SiteHeader brandName=${JSON.stringify(brand)} ctaLabel="Book test drive" />
      <InventoryGrid />
      <FinanceCalculator />
      <SiteFooter brandName=${JSON.stringify(brand)} />
    </main>
  );
}
`,
    },
  ];
}

export function polishGeneratedProject(params: {
  files: GeneratedProjectFile[];
  componentIds?: string[];
  brandName?: string;
  pageTitle?: string;
  pageDescription?: string;
  content: ProductionContentPack;
}): GeneratedProjectFile[] {
  const byPath = new Map(params.files.map((f) => [f.path, { ...f }]));
  const brand = params.brandName?.trim() || "Brand";
  const content = params.content;
  const ids = params.componentIds ?? [];

  if (ids.length) {
    byPath.set("app/page.tsx", {
      path: "app/page.tsx",
      language: "tsx",
      content: composeHomePage({
        componentIds: ids,
        brandName: brand,
        title: params.pageTitle || content.heroHeadline,
        description: params.pageDescription || content.heroSubheadline,
        heroHeadline: content.heroHeadline,
        heroSubheadline: content.heroSubheadline,
        primaryCta: content.primaryCta,
        secondaryCta: content.secondaryCta,
        heroEyebrow: content.heroEyebrow,
        content,
      }),
    });
  }

  const isAutomotive =
    content.industryId === "automotive" ||
    ids.some((id) =>
      [
        "VehicleShowcase",
        "InventoryGrid",
        "VehicleDetail",
        "FinanceCalculator",
        "AppointmentCalendar",
        "VehicleComparison",
      ].includes(id),
    );

  if (isAutomotive) {
    for (const file of composeAutomotiveSecondaryPages(brand)) {
      byPath.set(file.path, file);
    }
  }

  const globals = byPath.get("app/globals.css");
  if (globals?.content && !globals.content.includes("Production polish")) {
    byPath.set("app/globals.css", {
      ...globals,
      content: `${globals.content.trimEnd()}\n${PREMIUM_CSS_SNIPPET}\n`,
    });
  } else if (globals?.content && !globals.content.includes("--space-section-gap")) {
    byPath.set("app/globals.css", {
      ...globals,
      content: `${globals.content.trimEnd()}\n${PREMIUM_CSS_SNIPPET}\n`,
    });
  }

  // Brand fallback for any remaining hardcoded scaffold brand marks.
  for (const [path, file] of byPath) {
    if (!/\.(tsx|ts|jsx|js)$/.test(path)) continue;
    if (path === "app/page.tsx" || path.startsWith("app/models") || path.startsWith("app/inventory")) {
      continue;
    }
    let next = file.content;
    next = next.replace(/>Brand</g, `>${brand}<`);
    next = next.replace(/>Brand\n/g, `>${brand}\n`);
    if (next !== file.content) {
      byPath.set(path, { ...file, content: next });
    }
  }

  // Ensure site image module exists with role comments for asset placeholders.
  const siteImages = byPath.get("lib/site-images.ts");
  if (siteImages?.content && !siteImages.content.includes("Production asset roles")) {
    byPath.set("lib/site-images.ts", {
      ...siteImages,
      content: `/** Production asset roles: hero, product, service, gallery, testimonial, background */\n${siteImages.content}`,
    });
  }

  // Website Management — real secondary pages, nav/footer routes, business catalog
  const managed = applyWebsiteManagementToProject({
    files: Array.from(byPath.values()),
    industryId: content.industryId,
    brandName: brand,
    promptHint: params.pageDescription || content.heroSubheadline,
  });
  for (const file of managed.files) {
    byPath.set(file.path, file);
  }

  return Array.from(byPath.values());
}
