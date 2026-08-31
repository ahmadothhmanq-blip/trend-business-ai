/**
 * Audit website builder templates + toolbar visibility for a mock Arabic real-estate project.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  listTemplateMarketplaceCatalog,
  resetWbTemplateMarketplaceRegistry,
} from "../lib/website/template-marketplace/index.server.ts";
import { refreshCapabilities } from "../lib/website/builder/capabilities/service.ts";
import { resolveBuilderToolbar } from "../lib/website/builder/tools/resolve.ts";
import { PROFESSIONAL_FEATURES } from "../lib/website/builder/professional.ts";
import { BUSINESS_FEATURES } from "../lib/website/builder/business.ts";
import { filterItemsByCapabilities } from "../lib/website/builder/capabilities/service.ts";
import { BUILDER_TOOL_REGISTRY } from "../lib/website/builder/tools/registry.ts";
import { listAiBuilderActionsForCapabilities } from "../lib/website/builder/ai-builder.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

resetWbTemplateMarketplaceRegistry();
const catalog = await listTemplateMarketplaceCatalog();

const mockProject = {
  projectKind: "website",
  title: "شركة أفق العقارية",
  description: "وسيط عقاري فاخر في دبي يقدم فلل وشقق فاخرة",
  pages: ["app/page.tsx", "app/about/page.tsx", "app/contact/page.tsx"],
  sections: ["Hero", "Listings", "Contact"],
  colorPalette: [],
  typography: [],
  components: [],
  content: [],
  seo: ["عقارات دبي", "فلل فاخرة"],
  roadmap: [],
  files: [
    {
      path: "app/page.tsx",
      content: "export default function Page(){return <main/>}",
      language: "tsx",
    },
    {
      path: "lib/site-images.ts",
      content: 'export const HERO_IMAGE = "https://images.unsplash.com/photo-1";',
      language: "typescript",
    },
  ],
  businessProfile: {
    projectName: "أفق العقارية",
    industry: "real-estate",
    targetAudience: "مشترون فاخرون",
    businessGoals: ["حجز معاينة"],
    offer: "عقارات فاخرة",
    tone: "فاخر وموثوق",
    geography: "الإمارات",
    competitors: [],
    kpis: [],
    summary: "وسيط عقاري رائد في دبي",
    requiredSections: ["hero", "listings", "contact"],
  },
  settings: {
    templatePackageId: "real-estate-premium",
    templateIntelligenceId: "ti-real-estate-listings",
  },
};

const cap = refreshCapabilities(mockProject, {
  seedFeatures: [
    "contact",
    "booking",
    "analytics",
    "seo",
    "localization",
    "gallery",
    "testimonials",
    "maps",
    "blog",
    "payment",
    "chat",
  ],
});

const toolbar = resolveBuilderToolbar(cap.service);
const visibleToolIds = new Set(toolbar.tools.map((t) => t.id));
const hiddenTools = BUILDER_TOOL_REGISTRY.filter((t) => !visibleToolIds.has(t.id));

const report = {
  templates: {
    total: catalog.total,
    v1: catalog.listings.filter((l) => l.id.startsWith("ti-")).length,
    v2: catalog.listings.filter((l) => !l.id.startsWith("ti-")).length,
    realEstate: catalog.listings
      .filter((l) => /real-estate|ti-real-estate/i.test(l.id + l.name))
      .map((l) => ({
        id: l.id,
        name: l.name,
        availability: l.availability,
      })),
  },
  editorToolbar: {
    visible: toolbar.tools.map((t) => t.id),
    hidden: hiddenTools.map((t) => ({ id: t.id, requires: t.visibility })),
  },
  professionalPanel: {
    visible: filterItemsByCapabilities(PROFESSIONAL_FEATURES, cap.service).map(
      (f) => f.id,
    ),
    hidden: PROFESSIONAL_FEATURES.filter(
      (f) =>
        !filterItemsByCapabilities(PROFESSIONAL_FEATURES, cap.service).some(
          (v) => v.id === f.id,
        ),
    ).map((f) => f.id),
  },
  businessPanel: {
    visible: filterItemsByCapabilities(BUSINESS_FEATURES, cap.service).map(
      (f) => f.id,
    ),
    hidden: BUSINESS_FEATURES.filter(
      (f) =>
        !filterItemsByCapabilities(BUSINESS_FEATURES, cap.service).some(
          (v) => v.id === f.id,
        ),
    ).map((f) => f.id),
  },
  aiActions: listAiBuilderActionsForCapabilities(cap.service).map((a) => a.id),
  activeCapabilities: cap.service.getActiveCapabilities(),
};

const outPath = join(root, "scripts", "benchmark-results", "wb-tools-audit.json");
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
