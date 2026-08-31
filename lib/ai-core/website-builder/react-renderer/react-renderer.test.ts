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
import type { RenderDocument } from "@/lib/ai-core/website-builder/render/contracts";
import { runWebsiteRender } from "@/lib/ai-core/website-builder/render";
import type { WebsiteReactProjectBuilder } from "@/lib/ai-core/website-builder/react-renderer/contracts";
import { WebsiteReactRenderError } from "@/lib/ai-core/website-builder/react-renderer/errors";
import {
  assertReactWebsiteProject,
  buildReactWebsiteProject,
  createMemoryWebsiteReactRenderStore,
  REQUIRED_REACT_FILES,
  runWebsiteReactRender,
} from "@/lib/ai-core/website-builder/react-renderer";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const PROJECT_ID = "22222222-2222-4222-8222-222222222222";
const PLAN_ID = "33333333-3333-4333-8333-333333333333";
const BASE_URL = "https://northstar.example";
const THEME = {
  name: "Corporate Precision",
  colors: { background: "#0B1220", foreground: "#F8FAFC", accent: "#2563EB", muted: "#94A3B8" },
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

function page(slug: string, name: string, purpose: string, sections: DirectorPlannedPage["sections"]): DirectorPlannedPage {
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
    navigation: pages.map((item, order) => ({ label: item.name, pageSlug: item.slug, order, children: [] })),
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
    forms: [{ kind: "contact" as const, name: "Contact", purpose: "Collect qualified inbound inquiries from the site.", fields: ["name", "email", "message"] }],
    integrations: [{ kind: "analytics" as const, name: "Analytics", purpose: "Measure acquisition and conversion without exposing implementation.", required: true }],
    ...extra,
  };
}

function draftFor(type: Extract<WebsiteDirectorType, "saas" | "ecommerce" | "restaurant" | "landing-page">): WebsiteDirectorLlmDraft {
  const pages: Record<typeof type, DirectorPlannedPage[]> = {
    saas: [
      page("home", "Home", "Position the product and drive demo requests for operations teams.", [
        { type: "hero", purpose: "Lead with the product outcome." },
        { type: "cta", purpose: "Route visitors to the primary conversion." },
      ]),
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
    saas: { forms: [{ kind: "demo", name: "Request a demo", purpose: "Qualify operators for a product demonstration.", fields: ["name", "work email", "company", "team size"] }] },
    ecommerce: { integrations: [{ kind: "payments", name: "Payments", purpose: "Record that checkout payments will be required in a later phase.", required: true }] },
    restaurant: { forms: [{ kind: "reservation", name: "Reserve a table", purpose: "Collect dining reservation requests.", fields: ["name", "phone", "party size", "datetime"] }] },
    "landing-page": { forms: [{ kind: "lead", name: "Campaign lead", purpose: "Capture campaign leads with a short qualification form.", fields: ["name", "email", "company"] }] },
  };
  return {
    intent: { websiteType: type, promptSummary: `Professional ${type} website plan for Northstar with conversion architecture.` },
    business: {
      businessCategory: `${type} professional services`,
      targetAudience: "Operations leaders and qualified buyers evaluating a premium digital presence.",
      brandSummary: "A precise, high-trust brand that favors product-grade visuals over casual photography.",
      uniqueValue: "Clear architecture, measurable outcomes, and conversion paths without gimmicks.",
    },
    strategy: {
      goals: ["Establish a trustworthy category position", "Convert qualified visitors through a single primary action"],
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

async function documentOf(type: Parameters<typeof draftFor>[0]): Promise<RenderDocument> {
  const generated = await runWebsiteGeneration({
    input: { project: plannedProject(), directorPlan: directorPlan(type) },
    createId: uuidSeq("aaaaaaaa-aaaa"),
    now: () => "2026-08-18T18:05:00.000Z",
  });
  const rendered = await runWebsiteRender({
    input: { structure: generated.structure!, documentBaseUrl: BASE_URL },
    now: () => "2026-08-18T18:10:00.000Z",
  });
  assert.equal(rendered.status, "ready");
  return rendered.document!;
}

async function reactOf(type: Parameters<typeof draftFor>[0], over: Partial<Parameters<typeof runWebsiteReactRender>[0]> = {}) {
  return runWebsiteReactRender({
    now: () => "2026-08-18T18:15:00.000Z",
    ...over,
    input: {
      document: await documentOf(type),
      siteName: "Northstar",
      theme: THEME,
      ...over.input,
    },
  });
}

function source(project: NonNullable<Awaited<ReturnType<typeof reactOf>>["project"]>, path: string) {
  const file = project.files.find((item) => item.path === path);
  assert.ok(file, `missing ${path}`);
  return file.contents;
}

test("SaaS document becomes a Next.js App Router project with pricing and demo contact", async () => {
  const result = await reactOf("saas");
  assert.equal(result.status, "ready");
  const project = result.project!;
  for (const path of REQUIRED_REACT_FILES) assert.ok(project.files.some((file) => file.path === path), path);
  assert.ok(project.content.pages.some((page) => page.path === "/pricing"));
  assert.ok(source(project, "app/[slug]/page.tsx").includes("generateStaticParams"));
  assert.ok(source(project, "components/contact.tsx").includes("aria-label"));
  const contact = project.content.pages.find((page) => page.slug === "contact")!;
  assert.ok(contact.sections.some((section) => section.form?.label === "demo"));
  assert.equal(project.tree.children.some((node) => node.name === "Header"), true);
});

test("Ecommerce project keeps catalog routes and optimized images", async () => {
  const result = await reactOf("ecommerce");
  const project = result.project!;
  assert.ok(project.content.navigation.some((item) => item.href === "/products"));
  assert.ok(source(project, "components/hero.tsx").includes("next/image"));
  assert.ok(source(project, "components/gallery.tsx").includes('loading="lazy"') || source(project, "components/about.tsx").includes('loading="lazy"') || source(project, "components/hero.tsx").includes("priority"));
});

test("Restaurant project renders reservation fields and gallery sections", async () => {
  const result = await reactOf("restaurant");
  const reservations = result.project!.content.pages.find((page) => page.slug === "contact")!;
  assert.ok(reservations.sections.some((section) => section.form?.label === "reservation"));
  const menu = result.project!.content.pages.find((page) => page.slug === "menu")!;
  assert.ok(menu.sections.some((section) => section.component === "Gallery" || section.component === "Features"));
});

test("Landing page project uses a single homepage and an empty static slug list", async () => {
  const result = await reactOf("landing-page");
  const project = result.project!;
  assert.equal(project.content.pages.length, 1);
  assert.ok(source(project, "app/page.tsx").includes('slug="home"') || source(project, "app/page.tsx").includes("slug={"));
  assert.ok(source(project, "app/[slug]/page.tsx").includes("generateStaticParams"));
});

test("responsive Tailwind v4 utilities and dark mode are present", async () => {
  const result = await reactOf("saas");
  const css = source(result.project!, "app/globals.css");
  assert.ok(css.includes('@import "tailwindcss"'));
  assert.ok(css.includes("@custom-variant dark"));
  const header = source(result.project!, "components/header.tsx");
  assert.ok(header.includes("sm:") && header.includes("lg:"));
  assert.ok(source(result.project!, "components/theme-toggle.tsx").startsWith('"use client"'));
});

test("metadata API covers canonical, Open Graph, sitemap, robots, and manifest", async () => {
  const result = await reactOf("saas");
  const meta = source(result.project!, "lib/site/metadata.ts");
  assert.ok(meta.includes("alternates: { canonical"));
  assert.ok(meta.includes("openGraph"));
  assert.ok(source(result.project!, "app/sitemap.ts").includes("MetadataRoute.Sitemap"));
  assert.ok(source(result.project!, "app/robots.ts").includes("allow: \"/\""));
  assert.ok(source(result.project!, "app/manifest.ts").includes("MetadataRoute.Manifest"));
  assert.ok(source(result.project!, "app/layout.tsx").includes("next/font/google"));
});

test("accessibility and hydration safety hold for the generated tree", async () => {
  const result = await reactOf("landing-page");
  const project = result.project!;
  assert.ok(source(project, "app/layout.tsx").includes("Skip to content"));
  assert.ok(source(project, "components/site-page.tsx").includes('id="main-content"'));
  assert.ok(source(project, "components/hero.tsx").includes("<h1"));
  for (const file of project.files) {
    if (file.path === "components/theme-toggle.tsx") continue;
    assert.equal(file.contents.includes('"use client"'), false, file.path);
    assert.equal(/\bDate\.now\s*\(|\bMath\.random\s*\(/.test(file.contents), false, file.path);
  }
});

test("invalid render documents fail closed", async () => {
  const document = await documentOf("landing-page");
  const result = await runWebsiteReactRender({
    input: { document: { ...document, pages: [] } },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "invalid_document");
});

test("retry succeeds after a transient builder failure", async () => {
  const document = await documentOf("landing-page");
  let calls = 0;
  const builder: WebsiteReactProjectBuilder = {
    build(context) {
      calls += 1;
      if (calls === 1) throw new Error("transient react render failure");
      return buildReactWebsiteProject(context);
    },
  };
  const result = await runWebsiteReactRender({ input: { document, siteName: "Northstar", theme: THEME }, builder });
  assert.equal(result.status, "ready");
  assert.equal(result.attempts, 2);
});

test("idempotency reuses the React project", async () => {
  const document = await documentOf("saas");
  const store = createMemoryWebsiteReactRenderStore();
  const input = { document, siteName: "Northstar", theme: THEME };
  const first = await runWebsiteReactRender({ input, store });
  const second = await runWebsiteReactRender({
    input,
    store,
    builder: { build() { throw new Error("should not run"); } },
  });
  assert.equal(first.status, "ready");
  assert.equal(second.status, "reused");
  assert.equal(second.project?.content.pages.length, first.project?.content.pages.length);
});

test("validation failures reject a project missing the root layout", async () => {
  const ready = await reactOf("landing-page");
  const broken = {
    ...ready.project!,
    files: ready.project!.files.filter((file) => file.path !== "app/layout.tsx"),
  };
  assert.throws(
    () => assertReactWebsiteProject(broken),
    (error: unknown) => error instanceof WebsiteReactRenderError && error.code === "invalid_react_tree",
  );
});
