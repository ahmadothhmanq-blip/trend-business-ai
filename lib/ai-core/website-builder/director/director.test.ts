import assert from "node:assert/strict";
import { test } from "node:test";
import { createWebsiteProject } from "@/lib/ai-core/website-builder/domain/create";
import type {
  DirectorPlannedPage,
  WebsiteDirectorLlmAdapter,
  WebsiteDirectorLlmDraft,
  WebsiteDirectorType,
} from "@/lib/ai-core/website-builder/director/contracts";
import { WebsiteDirectorError } from "@/lib/ai-core/website-builder/director/errors";
import {
  createMemoryWebsiteDirectorStore,
  runWebsiteDirector,
  websiteDirectorIdempotencyKey,
} from "@/lib/ai-core/website-builder/director/service";
import {
  assertWebsiteDirectorInput,
  evaluateWebsiteDirectorDraft,
} from "@/lib/ai-core/website-builder/director/validation";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const PROJECT_ID = "22222222-2222-4222-8222-222222222222";

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

function project() {
  return createWebsiteProject({
    id: PROJECT_ID,
    userId: USER_ID,
    name: "Northstar",
    niche: "corporate",
    language: "en",
  });
}

function page(
  slug: string,
  name: string,
  purpose: string,
  sections: DirectorPlannedPage["sections"],
  isHomepage = slug === "home",
): DirectorPlannedPage {
  return { slug, name, purpose, isHomepage, sections };
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
      { kind: "og" as const, purpose: "Social preview", description: "Open Graph still of the homepage hero." },
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

function draftFor(type: WebsiteDirectorType, over?: Partial<WebsiteDirectorLlmDraft>): WebsiteDirectorLlmDraft {
  const pagesByType: Record<WebsiteDirectorType, DirectorPlannedPage[]> = {
    company: [
      page("home", "Home", "Introduce the firm and convert to contact.", [
        { type: "hero", purpose: "State the firm promise with a product-grade visual." },
        { type: "services", purpose: "Summarize core capabilities for buyers." },
        { type: "cta", purpose: "Route qualified visitors to contact." },
      ]),
      page("about", "About", "Explain operating principles and credibility.", [
        { type: "about", purpose: "Describe the firm with professional proof." },
        { type: "team", purpose: "Introduce leadership without casual photography." },
      ]),
      page("services", "Services", "Detail the service catalog.", [
        { type: "services", purpose: "List service lines with outcomes." },
        { type: "process", purpose: "Show the delivery process." },
      ]),
      page("contact", "Contact", "Capture inbound demand.", [
        { type: "contact", purpose: "Provide the inquiry form and location facts." },
        { type: "cta", purpose: "Reinforce the consultation offer." },
      ]),
    ],
    saas: [
      page("home", "Home", "Position the product and drive demo requests.", [
        { type: "hero", purpose: "Lead with the product outcome on a dashboard visual." },
        { type: "features", purpose: "Explain operator-grade capabilities." },
        { type: "cta", purpose: "Send buyers to a demo form." },
      ]),
      page("features", "Features", "Explain the product system in depth.", [
        { type: "features", purpose: "Map modules to operational jobs." },
        { type: "stats", purpose: "Show measurable operating gains." },
      ]),
      page("pricing", "Pricing", "Clarify commercial packages.", [
        { type: "pricing", purpose: "Present transparent package tiers." },
        { type: "faq", purpose: "Answer procurement questions." },
      ]),
      page("contact", "Contact", "Convert remaining demand to a demo.", [
        { type: "contact", purpose: "Host the demo request form." },
        { type: "cta", purpose: "Restate the trial path." },
      ]),
    ],
    ecommerce: [
      page("home", "Home", "Merchandise the catalog and build purchase intent.", [
        { type: "hero", purpose: "Present the collection with product photography." },
        { type: "products", purpose: "Feature priority SKUs." },
        { type: "cta", purpose: "Move shoppers into the catalog." },
      ]),
      page("products", "Products", "Browse the full catalog.", [
        { type: "products", purpose: "List products with trustworthy merchandising." },
        { type: "faq", purpose: "Cover shipping and materials questions." },
      ]),
      page("contact", "Contact", "Support pre-purchase questions.", [
        { type: "contact", purpose: "Collect merchandising and order questions." },
        { type: "cta", purpose: "Return shoppers to the catalog." },
      ]),
    ],
    restaurant: [
      page("home", "Home", "Introduce the dining room and cuisine.", [
        { type: "hero", purpose: "Set the culinary positioning with plated dishes." },
        { type: "menu", purpose: "Preview signature courses." },
        { type: "cta", purpose: "Drive reservation intent." },
      ]),
      page("menu", "Menu", "Present courses and pairing notes.", [
        { type: "menu", purpose: "Organize courses with professional descriptions." },
        { type: "gallery", purpose: "Show plated dishes and the dining room." },
      ]),
      page("contact", "Reservations", "Capture booking requests.", [
        { type: "booking", purpose: "Collect reservation details." },
        { type: "location", purpose: "State address and service hours." },
      ]),
    ],
    portfolio: [
      page("home", "Home", "Introduce the practice and selected work.", [
        { type: "hero", purpose: "State the studio positioning." },
        { type: "gallery", purpose: "Feature selected projects." },
      ]),
      page("work", "Work", "Present case studies.", [
        { type: "gallery", purpose: "Grid of project case studies." },
        { type: "process", purpose: "Explain the delivery method." },
      ]),
      page("contact", "Contact", "Open a project inquiry.", [
        { type: "contact", purpose: "Collect project briefs." },
        { type: "cta", purpose: "Invite a discovery conversation." },
      ]),
    ],
    agency: [
      page("home", "Home", "Position the agency for qualified briefs.", [
        { type: "hero", purpose: "Lead with capability and proof." },
        { type: "services", purpose: "Summarize the offer." },
      ]),
      page("services", "Services", "Detail engagement models.", [
        { type: "services", purpose: "Explain service lines." },
        { type: "process", purpose: "Show how engagements run." },
      ]),
      page("contact", "Contact", "Collect RFPs.", [
        { type: "contact", purpose: "Capture the brief form." },
        { type: "cta", purpose: "Invite a capabilities call." },
      ]),
    ],
    healthcare: [
      page("home", "Home", "Introduce the clinic with calm authority.", [
        { type: "hero", purpose: "State care positioning without sensational claims." },
        { type: "services", purpose: "Outline clinical services." },
      ]),
      page("services", "Services", "Explain care pathways.", [
        { type: "services", purpose: "Detail service lines." },
        { type: "faq", purpose: "Answer visit preparation questions." },
      ]),
      page("contact", "Contact", "Request an appointment.", [
        { type: "contact", purpose: "Collect appointment requests." },
        { type: "location", purpose: "Share clinic location and hours." },
      ]),
    ],
    education: [
      page("home", "Home", "Introduce the institution and programs.", [
        { type: "hero", purpose: "State academic positioning." },
        { type: "features", purpose: "Preview flagship programs." },
      ]),
      page("programs", "Programs", "Present curriculum tracks.", [
        { type: "features", purpose: "Describe programs with outcomes." },
        { type: "faq", purpose: "Cover admissions questions." },
      ]),
      page("contact", "Contact", "Capture enrollment interest.", [
        { type: "contact", purpose: "Collect enrollment inquiries." },
        { type: "cta", purpose: "Invite a counselor conversation." },
      ]),
    ],
    "real-estate": [
      page("home", "Home", "Introduce the brokerage and inventory.", [
        { type: "hero", purpose: "Present the market positioning." },
        { type: "listings", purpose: "Feature priority properties." },
      ]),
      page("listings", "Listings", "Browse available properties.", [
        { type: "listings", purpose: "Show inventory cards with facts." },
        { type: "faq", purpose: "Cover viewing and offer process." },
      ]),
      page("contact", "Contact", "Request a viewing.", [
        { type: "contact", purpose: "Collect viewing requests." },
        { type: "cta", purpose: "Invite a valuation conversation." },
      ]),
    ],
    blog: [
      page("home", "Home", "Introduce the publication.", [
        { type: "hero", purpose: "State editorial positioning." },
        { type: "blog-index", purpose: "Feature latest essays." },
      ]),
      page("articles", "Articles", "Index long-form essays.", [
        { type: "blog-index", purpose: "List articles by topic." },
        { type: "content", purpose: "Explain editorial standards." },
      ]),
      page("contact", "Contact", "Collect pitches and partnerships.", [
        { type: "contact", purpose: "Capture editorial inquiries." },
        { type: "cta", purpose: "Invite newsletter signup via form later." },
      ]),
    ],
    "landing-page": [
      page("home", "Home", "Convert campaign traffic into qualified leads.", [
        { type: "hero", purpose: "State the campaign offer immediately." },
        { type: "features", purpose: "Prove the offer with three outcomes." },
        { type: "cta", purpose: "Close with the lead form." },
      ]),
    ],
  };

  const extras: Partial<Record<WebsiteDirectorType, Partial<WebsiteDirectorLlmDraft["informationArchitecture"]>>> = {
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
      sitemap: [
        { slug: "home", title: "Home", path: "/", parentSlug: null },
      ],
    },
  };

  const pages = pagesByType[type];
  const summaries: Record<WebsiteDirectorType, string> = {
    company: "A corporate firm site that explains services and captures inbound demand.",
    saas: "A B2B SaaS product site for workflow automation with demo conversion.",
    ecommerce: "A product catalog site for a premium goods retailer with purchase intent.",
    restaurant: "A fine-dining restaurant site focused on menu and reservations.",
    portfolio: "A professional studio portfolio for case-study led inquiry.",
    agency: "A consulting agency site for capability proof and RFP capture.",
    healthcare: "A clinic site that explains services and appointment requests.",
    education: "An institution site for programs and enrollment inquiries.",
    "real-estate": "A brokerage site for listings discovery and viewing requests.",
    blog: "An editorial publication with an articles index and inquiry path.",
    "landing-page": "A single-page campaign built to convert paid traffic into leads.",
  };

  return {
    intent: { websiteType: type, promptSummary: summaries[type] },
    business: {
      businessCategory: `${type} professional services`,
      targetAudience: "Operations leaders and qualified buyers evaluating a premium digital presence.",
      brandSummary: "A precise, high-trust brand that favors product-grade visuals over casual stock photography.",
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
    informationArchitecture: architecture(pages, extras[type]),
    ...over,
  };
}

function adapterFrom(sequence: unknown[]): WebsiteDirectorLlmAdapter & { calls: number; prompts: string[] } {
  const prompts: string[] = [];
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    prompts,
    async generateJson({ prompt }) {
      prompts.push(prompt);
      const next = sequence[Math.min(calls, sequence.length - 1)];
      calls += 1;
      if (next instanceof Error) throw next;
      return next;
    },
  };
}

test("SaaS prompt produces a SaaS website plan with demo conversion", async () => {
  const adapter = adapterFrom([draftFor("saas")]);
  const result = await runWebsiteDirector({
    input: {
      project: project(),
      prompt: "Build a SaaS website for Northstar Ops workflow automation aimed at operations teams.",
    },
    adapter,
    createId: () => "33333333-3333-4333-8333-333333333333",
  });
  assert.equal(result.status, "ready");
  assert.equal(result.plan?.websiteType, "saas");
  assert.ok(result.plan?.requiredPages.some((page) => page.slug === "pricing"));
  assert.ok(result.plan?.forms.some((form) => form.kind === "demo"));
  assert.equal(result.project.domainState, "planned");
  assert.equal(result.domainPlan?.objective.startsWith("Establish"), true);
  assert.equal(result.attempts, 1);
});

test("Ecommerce prompt requires catalog pages and a payments integration", async () => {
  const result = await runWebsiteDirector({
    input: {
      project: project(),
      prompt: "Create an ecommerce catalog for a premium lighting brand with product photography.",
    },
    adapter: adapterFrom([draftFor("ecommerce")]),
  });
  assert.equal(result.status, "ready");
  assert.equal(result.plan?.websiteType, "ecommerce");
  assert.ok(result.plan?.requiredPages.some((page) => page.slug === "products"));
  assert.ok(result.plan?.integrations.some((row) => row.kind === "payments"));
});

test("Restaurant prompt plans menu and reservation capture", async () => {
  const result = await runWebsiteDirector({
    input: {
      project: project(),
      prompt: "Plan a restaurant website for a contemporary tasting-menu kitchen in the city center.",
    },
    adapter: adapterFrom([draftFor("restaurant")]),
  });
  assert.equal(result.status, "ready");
  assert.equal(result.plan?.websiteType, "restaurant");
  assert.ok(result.plan?.requiredPages.some((page) => page.slug === "menu"));
  assert.ok(result.plan?.forms.some((form) => form.kind === "reservation"));
});

test("Landing page prompt yields a single homepage", async () => {
  const result = await runWebsiteDirector({
    input: {
      project: project(),
      prompt: "Need a landing page campaign for a product waitlist aimed at enterprise buyers.",
    },
    adapter: adapterFrom([draftFor("landing-page")]),
  });
  assert.equal(result.status, "ready");
  assert.equal(result.plan?.websiteType, "landing-page");
  assert.equal(result.plan?.requiredPages.length, 1);
  assert.equal(result.plan?.sitemap[0].path, "/");
});

test("adapter failure returns llm_failed without a plan", async () => {
  const result = await runWebsiteDirector({
    input: {
      project: project(),
      prompt: "Build a SaaS website for Northstar Ops workflow automation aimed at operations teams.",
    },
    adapter: adapterFrom([new Error("upstream timeout")]),
  });
  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "llm_failed");
  assert.equal(result.plan, null);
  assert.equal(result.attempts, 1);
});

test("incomplete plan is rejected after one retry", async () => {
  const incomplete = { intent: { websiteType: "saas" } };
  const adapter = adapterFrom([incomplete, incomplete]);
  const result = await runWebsiteDirector({
    input: {
      project: project(),
      prompt: "Build a SaaS website for Northstar Ops workflow automation aimed at operations teams.",
    },
    adapter,
  });
  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "incomplete_plan");
  assert.equal(adapter.calls, 2);
  assert.ok(adapter.prompts[1].includes("RETRY"));
});

test("retry recovers when the second response is valid", async () => {
  const adapter = adapterFrom([{ intent: { websiteType: "saas" } }, draftFor("saas")]);
  const result = await runWebsiteDirector({
    input: {
      project: project(),
      prompt: "Build a SaaS website for Northstar Ops workflow automation aimed at operations teams.",
    },
    adapter,
  });
  assert.equal(result.status, "ready");
  assert.equal(result.attempts, 2);
  assert.equal(adapter.calls, 2);
  assert.equal(result.plan?.websiteType, "saas");
});

test("validation rejects missing SEO keywords and unknown website types", () => {
  const valid = draftFor("saas");
  const missingSeo = structuredClone(valid);
  missingSeo.strategy.seoStrategy.primaryKeywords = ["saas"];
  const seoEval = evaluateWebsiteDirectorDraft(missingSeo);
  assert.equal(seoEval.ok, false);
  if (!seoEval.ok) assert.equal(seoEval.code, "incomplete_plan");

  const badType = structuredClone(valid);
  (badType.intent as { websiteType: string }).websiteType = "wiki";
  const typeEval = evaluateWebsiteDirectorDraft(badType);
  assert.equal(typeEval.ok, false);

  const noHome = structuredClone(valid);
  noHome.informationArchitecture.requiredPages = noHome.informationArchitecture.requiredPages.map((page) => ({
    ...page,
    isHomepage: false,
  }));
  const homeEval = evaluateWebsiteDirectorDraft(noHome);
  assert.equal(homeEval.ok, false);
});

test("idempotency reuses the stored plan and skips the adapter", async () => {
  const store = createMemoryWebsiteDirectorStore();
  const adapter = adapterFrom([draftFor("saas")]);
  const input = {
    project: project(),
    prompt: "Build a SaaS website for Northstar Ops workflow automation aimed at operations teams.",
    language: "en",
  };
  const first = await runWebsiteDirector({ input, adapter, store });
  const second = await runWebsiteDirector({ input, adapter, store });
  assert.equal(first.status, "ready");
  assert.equal(second.status, "reused");
  assert.equal(second.reused, true);
  assert.equal(adapter.calls, 1);
  assert.equal(second.plan?.id, first.plan?.id);
  assert.equal(
    websiteDirectorIdempotencyKey({ ...input, project: input.project, language: "en" }),
    websiteDirectorIdempotencyKey({
      ...input,
      prompt: "  Build a SaaS website for Northstar Ops workflow automation aimed at operations teams.  ",
      language: "en",
    }),
  );
});

test("missing adapter and short prompts fail closed", async () => {
  const unconfigured = await runWebsiteDirector({
    input: {
      project: project(),
      prompt: "Build a SaaS website for Northstar Ops workflow automation aimed at operations teams.",
    },
  });
  assert.equal(unconfigured.errorCode, "llm_unconfigured");

  const short = await runWebsiteDirector({
    input: { project: project(), prompt: "hello" },
    adapter: adapterFrom([draftFor("saas")]),
  });
  assert.equal(short.errorCode, "invalid_input");

  assert.throws(
    () =>
      assertWebsiteDirectorInput({
        project: { ...project(), domainState: "ready" },
        prompt: "Build a SaaS website for Northstar Ops workflow automation aimed at operations teams.",
      }),
    (error: unknown) => error instanceof WebsiteDirectorError && error.code === "invalid_state",
  );
});
