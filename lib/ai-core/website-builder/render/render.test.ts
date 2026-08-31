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
import { runWebsiteGeneration } from "@/lib/ai-core/website-builder/generation";
import type { WebsiteGeneratedStructure } from "@/lib/ai-core/website-builder/generation/contracts";
import type { HtmlNode, WebsiteDocumentRenderer } from "@/lib/ai-core/website-builder/render/contracts";
import { WebsiteRenderError } from "@/lib/ai-core/website-builder/render/errors";
import {
  assertRenderDocument,
  createMemoryWebsiteRenderStore,
  findHtml,
  renderWebsiteDocument,
  runWebsiteRender,
  walkHtml,
} from "@/lib/ai-core/website-builder/render";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const PROJECT_ID = "22222222-2222-4222-8222-222222222222";
const PLAN_ID = "33333333-3333-4333-8333-333333333333";
const BASE_URL = "https://northstar.example";

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
    informationArchitecture: architecture(pages[type], extras[type]),
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

async function structureOf(type: Parameters<typeof draftFor>[0]): Promise<WebsiteGeneratedStructure> {
  const generated = await runWebsiteGeneration({
    input: { project: plannedProject(), directorPlan: directorPlan(type) },
    createId: uuidSeq("aaaaaaaa-aaaa"),
    now: () => "2026-08-18T18:05:00.000Z",
  });
  assert.equal(generated.status, "ready");
  return generated.structure!;
}

async function renderType(type: Parameters<typeof draftFor>[0], over: Partial<Parameters<typeof runWebsiteRender>[0]> = {}) {
  return runWebsiteRender({
    now: () => "2026-08-18T18:10:00.000Z",
    ...over,
    input: {
      structure: await structureOf(type),
      documentBaseUrl: BASE_URL,
      ...over.input,
    },
  });
}

function tagsOf(node: HtmlNode, tag: HtmlNode["tag"]): HtmlNode[] {
  return findHtml(node, tag);
}

test("SaaS structure renders semantic pages with demo form and JSON-LD", async () => {
  const result = await renderType("saas");
  assert.equal(result.status, "ready");
  const document = result.document!;
  assert.ok(document.pages.some((page) => page.path === "/pricing"));
  const contact = document.pages.find((page) => page.slug === "contact")!;
  const form = tagsOf(contact.tree, "form")[0];
  assert.equal(form.attrs["aria-label"], "demo");
  assert.ok(tagsOf(contact.tree, "header").length === 1);
  assert.ok(tagsOf(contact.tree, "nav").length >= 1);
  assert.ok(tagsOf(contact.tree, "main").length === 1);
  assert.ok(tagsOf(contact.tree, "footer").length === 1);
  const jsonLd = tagsOf(contact.tree, "script").find((node) => node.attrs.type === "application/ld+json");
  const parsed = JSON.parse(jsonLd!.text!) as { "@type": string };
  assert.equal(parsed["@type"], "WebPage");
});

test("Ecommerce structure keeps catalog links internal and valid", async () => {
  const result = await renderType("ecommerce");
  assert.equal(result.status, "ready");
  const document = result.document!;
  assert.ok(document.navigation.some((item) => item.href === "/products"));
  const home = document.pages.find((page) => page.slug === "home")!;
  const hrefs: string[] = [];
  walkHtml(home.tree, (node) => {
    if (node.tag === "a") hrefs.push(node.attrs.href);
  });
  assert.ok(hrefs.includes("/products"));
  assert.ok(tagsOf(home.tree, "picture").length >= 1);
  assert.ok(tagsOf(home.tree, "img").every((node) => (node.attrs.alt ?? "").length >= 3));
});

test("Restaurant structure renders reservation form and gallery media", async () => {
  const result = await renderType("restaurant");
  assert.equal(result.status, "ready");
  const reservations = result.document!.pages.find((page) => page.slug === "contact")!;
  const form = tagsOf(reservations.tree, "form")[0];
  assert.equal(form.attrs["aria-label"], "reservation");
  const menu = result.document!.pages.find((page) => page.slug === "menu")!;
  assert.ok(tagsOf(menu.tree, "img").length >= 1);
  assert.ok(tagsOf(menu.tree, "section").length >= 1);
});

test("Landing page renders a single document with one main and one h1", async () => {
  const result = await renderType("landing-page");
  assert.equal(result.status, "ready");
  assert.equal(result.document!.pages.length, 1);
  const page = result.document!.pages[0];
  assert.equal(page.path, "/");
  assert.equal(tagsOf(page.tree, "main").length, 1);
  assert.equal(tagsOf(page.tree, "h1").length, 1);
  assert.ok(tagsOf(page.tree, "button").length >= 1);
  assert.ok(tagsOf(page.tree, "video").length === 1);
});

test("SEO validation covers title, description, canonical, Open Graph, and JSON-LD", async () => {
  const result = await renderType("saas");
  const home = result.document!.pages.find((page) => page.path === "/")!;
  const title = tagsOf(home.tree, "title")[0].text!;
  assert.ok(title.length >= 10 && title.length <= 70);
  const description = tagsOf(home.tree, "meta").find((node) => node.attrs.name === "description")!;
  assert.ok(description.attrs.content.length >= 50);
  const canonical = tagsOf(home.tree, "link").find((node) => node.attrs.rel === "canonical")!;
  assert.equal(canonical.attrs.href, `${BASE_URL}/`);
  assert.equal(home.canonicalUrl, `${BASE_URL}/`);
  for (const property of ["og:title", "og:description", "og:type", "og:url", "og:image"]) {
    assert.ok(tagsOf(home.tree, "meta").some((node) => node.attrs.property === property));
  }
});

test("accessibility validation requires one main, one h1, heading order, and image alt", async () => {
  const result = await renderType("saas");
  for (const page of result.document!.pages) {
    assert.equal(tagsOf(page.tree, "main").length, 1);
    assert.equal(tagsOf(page.tree, "h1").length, 1);
    const headings: string[] = [];
    walkHtml(tagsOf(page.tree, "main")[0], (node) => {
      if (node.tag === "h1" || node.tag === "h2" || node.tag === "h3") headings.push(node.tag);
    });
    assert.equal(headings[0], "h1");
    walkHtml(page.tree, (node) => {
      assert.equal("class" in node.attrs, false);
      assert.equal("style" in node.attrs, false);
      if (node.tag === "img") assert.ok((node.attrs.alt ?? "").length >= 3);
    });
  }
});

test("invalid generated structure is rejected before rendering", async () => {
  const structure = await structureOf("landing-page");
  const result = await runWebsiteRender({
    input: { structure: { ...structure, pages: [] }, documentBaseUrl: BASE_URL },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "invalid_structure");
  assert.equal(result.attempts, 0);
});

test("retry succeeds when the first renderer call fails", async () => {
  const structure = await structureOf("landing-page");
  let calls = 0;
  const renderer: WebsiteDocumentRenderer = {
    render(context) {
      calls += 1;
      if (calls === 1) throw new Error("transient render failure");
      return renderWebsiteDocument(context);
    },
  };
  const result = await runWebsiteRender({
    input: { structure, documentBaseUrl: BASE_URL },
    renderer,
  });
  assert.equal(result.status, "ready");
  assert.equal(result.attempts, 2);
  assert.equal(calls, 2);
});

test("idempotency reuses the rendered document", async () => {
  const structure = await structureOf("saas");
  const store = createMemoryWebsiteRenderStore();
  const input = { structure, documentBaseUrl: BASE_URL };
  const first = await runWebsiteRender({ input, store });
  const second = await runWebsiteRender({
    input,
    store,
    renderer: {
      render() {
        throw new Error("should not run");
      },
    },
  });
  assert.equal(first.status, "ready");
  assert.equal(second.status, "reused");
  assert.equal(second.document?.planId, first.document?.planId);
});

test("removing main from a document fails render validation", async () => {
  const ready = await renderType("landing-page");
  const page = ready.document!.pages[0];
  const broken = {
    ...ready.document!,
    pages: [
      {
        ...page,
        tree: {
          ...page.tree,
          children: page.tree.children.map((child) =>
            child.tag === "body"
              ? { ...child, children: child.children.filter((node) => node.tag !== "main") }
              : child,
          ),
        },
      },
    ],
  };
  assert.throws(
    () => assertRenderDocument(broken),
    (error: unknown) => error instanceof WebsiteRenderError && error.code === "missing_main",
  );
});
