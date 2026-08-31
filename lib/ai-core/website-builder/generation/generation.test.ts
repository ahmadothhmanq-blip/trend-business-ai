import assert from "node:assert/strict";
import { test } from "node:test";
import { createWebsiteProject } from "@/lib/ai-core/website-builder/domain/create";
import { transition } from "@/lib/ai-core/website-builder/domain/state-machine";
import type {
  DirectorPlannedPage,
  DirectorWebsitePlan,
  WebsiteDirectorLlmDraft,
  WebsiteDirectorType,
} from "@/lib/ai-core/website-builder/director/contracts";
import { assembleDirectorWebsitePlan } from "@/lib/ai-core/website-builder/director/service";
import {
  assertGeneratedWebsite,
  buildWebsiteDomainStructure,
  createMemoryWebsiteGenerationStore,
  runWebsiteGeneration,
} from "@/lib/ai-core/website-builder/generation";
import { WebsiteGenerationError } from "@/lib/ai-core/website-builder/generation/errors";
import type { WebsiteStructureBuilder } from "@/lib/ai-core/website-builder/generation/contracts";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const PROJECT_ID = "22222222-2222-4222-8222-222222222222";
const PLAN_ID = "33333333-3333-4333-8333-333333333333";

const THEME = {
  name: "Corporate Precision",
  colors: {
    background: "#0B1220",
    foreground: "#F8FAFC",
    accent: "#2563EB",
    muted: "#94A3B8",
  },
  fonts: { sans: "Inter", display: "Sora" },
  radiusPx: 8,
};

function uuidSeq(prefix: string) {
  let n = 1;
  return () => {
    const hex = n.toString(16).padStart(12, "0");
    n += 1;
    return `${prefix}-4aaa-8aaa-${hex}`;
  };
}

function project() {
  return createWebsiteProject({
    id: PROJECT_ID,
    userId: USER_ID,
    name: "Northstar",
    niche: "corporate",
    language: "en",
  });
}

function plannedProject() {
  return transition(transition(project(), "planning"), "planned");
}

function page(
  slug: string,
  name: string,
  purpose: string,
  sections: DirectorPlannedPage["sections"],
): DirectorPlannedPage {
  return { slug, name, purpose, isHomepage: slug === "home", sections };
}

function architecture(pages: DirectorPlannedPage[], extra?: Partial<WebsiteDirectorLlmDraft["informationArchitecture"]>) {
  return {
    sitemap: pages.map((item) => ({
      slug: item.slug,
      title: item.name,
      path: item.isHomepage ? "/" : `/${item.slug}`,
      parentSlug: item.isHomepage ? null : "home",
    })),
    navigation: pages.map((item, order) => ({
      label: item.name,
      pageSlug: item.slug,
      order,
      children: [],
    })),
    requiredPages: pages,
    contentRequirements: pages.map((item) => ({
      pageSlug: item.slug,
      tone: "Professional and precise",
      mustInclude: [`${item.name} narrative`, "clear next step"],
    })),
    assetRequirements: [
      { kind: "logo" as const, purpose: "Brand mark", description: "Primary logomark for header and footer." },
      { kind: "image" as const, purpose: "Hero visual", description: "Product interface mockup on a dark display." },
    ],
    forms: [
      {
        kind: "contact" as const,
        name: "Contact",
        purpose: "Collect qualified inbound inquiries from the site.",
        fields: ["name", "email", "message"],
      },
    ],
    integrations: [
      {
        kind: "analytics" as const,
        name: "Analytics",
        purpose: "Measure acquisition and conversion without exposing implementation.",
        required: true,
      },
    ],
    ...extra,
  };
}

function draftFor(type: Extract<WebsiteDirectorType, "saas" | "ecommerce" | "restaurant" | "landing-page">): WebsiteDirectorLlmDraft {
  const two = (purpose: string): DirectorPlannedPage["sections"] => [
    { type: "hero", purpose },
    { type: "cta", purpose: "Route visitors to the primary conversion." },
  ];
  const pages: Record<typeof type, DirectorPlannedPage[]> = {
    saas: [
      page("home", "Home", "Position the product and drive demo requests for operations teams.", two("Lead with the product outcome.")),
      page("features", "Features", "Explain the product system in depth for operators.", [
        { type: "features", purpose: "Map modules to operational jobs." },
        { type: "stats", purpose: "Show measurable operating gains." },
      ]),
      page("pricing", "Pricing", "Clarify commercial packages for procurement teams.", [
        { type: "pricing", purpose: "Present transparent package tiers." },
        { type: "faq", purpose: "Answer procurement questions." },
      ]),
      page("contact", "Contact", "Convert remaining demand into a scheduled product demo.", [
        { type: "contact", purpose: "Host the demo request form." },
        { type: "cta", purpose: "Restate the trial path." },
      ]),
    ],
    ecommerce: [
      page("home", "Home", "Merchandise the catalog and build purchase intent with product stills.", [
        { type: "hero", purpose: "Present the collection with product photography." },
        { type: "products", purpose: "Feature priority SKUs." },
      ]),
      page("products", "Products", "Browse the full catalog with trustworthy merchandising.", [
        { type: "products", purpose: "List products with trustworthy merchandising." },
        { type: "faq", purpose: "Cover shipping and materials questions." },
      ]),
      page("contact", "Contact", "Support pre-purchase questions from serious shoppers.", [
        { type: "contact", purpose: "Collect merchandising and order questions." },
        { type: "cta", purpose: "Return shoppers to the catalog." },
      ]),
    ],
    restaurant: [
      page("home", "Home", "Introduce the dining room and contemporary tasting-menu cuisine.", [
        { type: "hero", purpose: "Set the culinary positioning with plated dishes." },
        { type: "menu", purpose: "Preview signature courses." },
      ]),
      page("menu", "Menu", "Present courses and pairing notes for the tasting menu.", [
        { type: "menu", purpose: "Organize courses with professional descriptions." },
        { type: "gallery", purpose: "Show plated dishes and the dining room." },
      ]),
      page("contact", "Reservations", "Capture booking requests for the dining room.", [
        { type: "booking", purpose: "Collect reservation details." },
        { type: "location", purpose: "State address and service hours." },
      ]),
    ],
    "landing-page": [
      page("home", "Home", "Convert campaign traffic into qualified enterprise waitlist leads.", [
        { type: "hero", purpose: "State the campaign offer immediately." },
        { type: "features", purpose: "Prove the offer with three outcomes." },
        { type: "cta", purpose: "Close with the lead form." },
      ]),
    ],
  };

  const extras: Partial<Record<typeof type, Partial<WebsiteDirectorLlmDraft["informationArchitecture"]>>> = {
    saas: {
      forms: [
        {
          kind: "demo",
          name: "Request a demo",
          purpose: "Qualify operators for a product demonstration.",
          fields: ["name", "work email", "company", "team size"],
        },
      ],
    },
    ecommerce: {
      integrations: [
        {
          kind: "payments",
          name: "Payments",
          purpose: "Record that checkout payments will be required in a later phase.",
          required: true,
        },
      ],
    },
    restaurant: {
      forms: [
        {
          kind: "reservation",
          name: "Reserve a table",
          purpose: "Collect dining reservation requests.",
          fields: ["name", "phone", "party size", "datetime"],
        },
      ],
    },
    "landing-page": {
      forms: [
        {
          kind: "lead",
          name: "Campaign lead",
          purpose: "Capture campaign leads with a short qualification form.",
          fields: ["name", "email", "company"],
        },
      ],
    },
  };

  const selected = pages[type];
  return {
    intent: {
      websiteType: type,
      promptSummary: `Professional ${type} website plan for Northstar with conversion architecture.`,
    },
    business: {
      businessCategory: `${type} professional services`,
      targetAudience: "Operations leaders and qualified buyers evaluating a premium digital presence.",
      brandSummary: "A precise, high-trust brand that favors product-grade visuals over casual photography.",
      uniqueValue: "Clear architecture, measurable outcomes, and conversion paths without gimmicks.",
    },
    strategy: {
      goals: [
        "Establish a trustworthy category position",
        "Convert qualified visitors through a single primary action",
      ],
      conversionFocus: "Primary conversion is a high-intent form submission from the planned pages.",
      seoStrategy: {
        primaryKeywords: [`${type} website`, "professional digital presence", "conversion architecture"],
        titleTemplate: "Northstar | Professional Website Architecture",
        metaDescriptionTemplate:
          "Northstar plans professional websites with clear information architecture, SEO foundations, and conversion paths for serious buyers.",
        locale: "en",
      },
      suggestedTheme: THEME,
    },
    informationArchitecture: architecture(selected, extras[type]),
  };
}

function directorPlan(type: Parameters<typeof draftFor>[0]): DirectorWebsitePlan {
  return assembleDirectorWebsitePlan({
    draft: draftFor(type),
    project: project(),
    language: "en",
    promptHash: `${type}-hash`,
    id: PLAN_ID,
    createdAt: "2026-08-18T18:00:00.000Z",
  });
}

async function generate(type: Parameters<typeof draftFor>[0], over: Partial<Parameters<typeof runWebsiteGeneration>[0]> = {}) {
  return runWebsiteGeneration({
    createId: uuidSeq("aaaaaaaa-aaaa"),
    now: () => "2026-08-18T18:05:00.000Z",
    ...over,
    input: {
      project: plannedProject(),
      directorPlan: directorPlan(type),
      ...over.input,
    },
  });
}

test("SaaS plan becomes a full domain structure with pricing and demo form", async () => {
  const result = await generate("saas");
  assert.equal(result.status, "ready");
  const structure = result.structure!;
  assert.equal(structure.project.domainState, "editing");
  assert.equal(structure.pages.filter((page) => page.isHomepage).length, 1);
  assert.ok(structure.pages.some((page) => page.slug === "pricing"));
  assert.ok(structure.sections.some((section) => section.type === "pricing"));
  assert.ok(structure.components.some((component) => component.type === "form" && component.props.kind === "demo"));
  assert.ok(structure.pages.every((page) => page.sectionIds.includes(structure.sections.find((section) => section.pageId === page.id && section.type === "footer")!.id)));
  assert.equal(structure.seo.title, structure.pages.find((page) => page.isHomepage)!.seo.title);
  assert.equal(structure.theme.name, "Corporate Precision");
});

test("Ecommerce plan maps catalog pages into domain sections and components", async () => {
  const result = await generate("ecommerce");
  assert.equal(result.status, "ready");
  const structure = result.structure!;
  assert.ok(structure.pages.some((page) => page.slug === "products"));
  assert.ok(structure.sections.some((section) => section.type === "features"));
  assert.ok(structure.components.some((component) => component.type === "card"));
  assert.equal(structure.navigation.items.length, 3);
});

test("Restaurant plan maps menu and reservation intake into domain models", async () => {
  const result = await generate("restaurant");
  assert.equal(result.status, "ready");
  const structure = result.structure!;
  assert.ok(structure.pages.some((page) => page.slug === "menu"));
  assert.ok(structure.sections.some((section) => section.type === "gallery"));
  assert.ok(structure.components.some((component) => component.type === "form" && String(component.props.kind) === "reservation"));
});

test("Landing page plan yields one homepage with hero, features, CTA, and footer", async () => {
  const result = await generate("landing-page");
  assert.equal(result.status, "ready");
  const structure = result.structure!;
  assert.equal(structure.pages.length, 1);
  assert.equal(structure.pages[0].path, "/");
  const types = new Set(structure.sections.map((section) => section.type));
  assert.ok(types.has("hero"));
  assert.ok(types.has("features"));
  assert.ok(types.has("cta"));
  assert.ok(types.has("footer"));
});

test("validation failures: two homepages, orphan navigation, and incomplete SEO", async () => {
  const ready = await generate("saas");
  const structure = ready.structure!;
  const doubled = {
    ...structure,
    pages: structure.pages.map((page) => ({ ...page, isHomepage: true, path: "/", parentPageId: null })),
  };
  assert.throws(
    () => assertGeneratedWebsite(doubled, structure.project),
    (error: unknown) => error instanceof WebsiteGenerationError && error.code === "missing_homepage",
  );

  const orphaned = {
    ...structure,
    navigation: { ...structure.navigation, items: structure.navigation.items.slice(0, 1) },
  };
  assert.throws(
    () => assertGeneratedWebsite(orphaned, structure.project),
    (error: unknown) => error instanceof WebsiteGenerationError && error.code === "orphan_page",
  );

  const noSeo = {
    ...structure,
    pages: structure.pages.map((page) =>
      page.isHomepage ? { ...page, seo: { ...page.seo, description: "too short" } } : page,
    ),
  };
  assert.throws(
    () => assertGeneratedWebsite(noSeo, structure.project),
    (error: unknown) => error instanceof WebsiteGenerationError && error.code === "incomplete_seo",
  );
});

test("retry succeeds when the first structure build fails", async () => {
  let calls = 0;
  const builder: WebsiteStructureBuilder = {
    build(context) {
      calls += 1;
      if (calls === 1) throw new Error("transient structure failure");
      return buildWebsiteDomainStructure(context);
    },
  };
  const result = await generate("landing-page", { builder });
  assert.equal(result.status, "ready");
  assert.equal(result.attempts, 2);
  assert.equal(calls, 2);
});

test("idempotency reuses the generated structure", async () => {
  const store = createMemoryWebsiteGenerationStore();
  const input = { project: plannedProject(), directorPlan: directorPlan("saas") };
  const first = await runWebsiteGeneration({ input, store, createId: uuidSeq("bbbbbbbb-bbbb") });
  const second = await runWebsiteGeneration({
    input,
    store,
    createId: uuidSeq("cccccccc-cccc"),
    builder: {
      build() {
        throw new Error("should not run");
      },
    },
  });
  assert.equal(first.status, "ready");
  assert.equal(second.status, "reused");
  assert.equal(second.reused, true);
  assert.equal(second.structure?.plan.id, first.structure?.plan.id);
});

test("empty director plan is rejected", async () => {
  const empty = {
    ...directorPlan("saas"),
    requiredPages: [],
    sitemap: [],
    informationArchitecture: {
      ...directorPlan("saas").informationArchitecture,
      requiredPages: [],
      sitemap: [],
    },
  };
  const result = await runWebsiteGeneration({
    input: { project: plannedProject(), directorPlan: empty },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "empty_plan");
  assert.equal(result.attempts, 0);
});
