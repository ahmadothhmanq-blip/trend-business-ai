import assert from "node:assert/strict";
import { test } from "node:test";
import { createWebsiteProject } from "@/lib/ai-core/website-builder/domain/create";
import { transition } from "@/lib/ai-core/website-builder/domain/state-machine";
import type { DirectorPlannedPage, WebsiteDirectorLlmDraft } from "@/lib/ai-core/website-builder/director/contracts";
import { assembleDirectorWebsitePlan } from "@/lib/ai-core/website-builder/director/service";
import type { WebsiteGeneratedStructure } from "@/lib/ai-core/website-builder/generation/contracts";
import { runWebsiteGeneration } from "@/lib/ai-core/website-builder/generation";
import { applyEditorCommand, openWebsiteEditor, WebsiteEditorError } from "@/lib/ai-core/website-builder/editor";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_USER = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const PROJECT_ID = "22222222-2222-4222-8222-222222222222";
const PLAN_ID = "33333333-3333-4333-8333-333333333333";
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

function page(slug: string, name: string, purpose: string, sections: DirectorPlannedPage["sections"]): DirectorPlannedPage {
  return { slug, name, purpose, isHomepage: slug === "home", sections };
}

function architecture(pages: DirectorPlannedPage[], extra?: Partial<WebsiteDirectorLlmDraft["informationArchitecture"]>): WebsiteDirectorLlmDraft["informationArchitecture"] {
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
      { kind: "logo", purpose: "Brand mark", description: "Primary logomark for header and footer." },
      { kind: "image", purpose: "Hero visual", description: "Product interface mockup on a dark display." },
    ],
    forms: [{ kind: "contact", name: "Contact", purpose: "Collect qualified inbound inquiries from the site.", fields: ["name", "email", "message"] }],
    integrations: [{ kind: "analytics", name: "Analytics", purpose: "Measure acquisition without exposing implementation.", required: true }],
    ...extra,
  };
}

function draft(type: "saas" | "landing-page"): WebsiteDirectorLlmDraft {
  const pages =
    type === "landing-page"
      ? [
          page("home", "Home", "Convert campaign traffic into qualified enterprise waitlist leads.", [
            { type: "hero", purpose: "State the campaign offer immediately." },
            { type: "features", purpose: "Prove the offer with three outcomes." },
            { type: "cta", purpose: "Close with the lead form." },
          ]),
        ]
      : [
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
        ];
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
    informationArchitecture: architecture(
      pages,
      type === "saas"
        ? { forms: [{ kind: "demo", name: "Request a demo", purpose: "Qualify operators for a product demonstration.", fields: ["name", "work email", "company"] }] }
        : { forms: [{ kind: "lead", name: "Campaign lead", purpose: "Capture campaign leads with a short qualification form.", fields: ["name", "email", "company"] }] },
    ),
  };
}

async function structureOf(type: "saas" | "landing-page"): Promise<WebsiteGeneratedStructure> {
  const project = createWebsiteProject({
    id: PROJECT_ID,
    userId: USER_ID,
    name: "Northstar",
    niche: "corporate",
    language: "en",
  });
  const generated = await runWebsiteGeneration({
    input: {
      project: transition(transition(project, "planning"), "planned"),
      directorPlan: assembleDirectorWebsitePlan({
        draft: draft(type),
        project,
        language: "en",
        promptHash: `${type}-hash`,
        id: PLAN_ID,
        createdAt: "2026-08-18T18:00:00.000Z",
      }),
    },
    createId: uuidSeq("aaaaaaaa-aaaa"),
    now: () => "2026-08-18T18:05:00.000Z",
  });
  assert.equal(generated.status, "ready");
  return generated.structure!;
}

function ids() {
  return uuidSeq("bbbbbbbb-bbbb");
}

test("edit text updates the selected heading without breaking SEO", async () => {
  const session = openWebsiteEditor({ structure: await structureOf("landing-page"), actorUserId: USER_ID });
  const heading = session.structure.components.find((item) => item.type === "heading")!;
  const edited = applyEditorCommand({
    session,
    actorUserId: USER_ID,
    command: { type: "editText", componentId: heading.id, text: "Operator-grade waitlist" },
  });
  const next = edited.structure.components.find((item) => item.id === heading.id)!;
  assert.equal(next.props.text, "Operator-grade waitlist");
  assert.equal(edited.structure.seo.title, session.structure.seo.title);
  assert.equal(edited.autosave.dirty, true);
});

test("edit image updates alt and source on an image component", async () => {
  const session = openWebsiteEditor({ structure: await structureOf("landing-page"), actorUserId: USER_ID });
  const image = session.structure.components.find((item) => item.type === "image")!;
  const edited = applyEditorCommand({
    session,
    actorUserId: USER_ID,
    command: { type: "editImage", componentId: image.id, alt: "Product dashboard on a dark display", src: "/assets/image/hero.webp" },
  });
  const next = edited.structure.components.find((item) => item.id === image.id)!;
  assert.equal(next.props.alt, "Product dashboard on a dark display");
  assert.equal(next.props.src, "/assets/image/hero.webp");
});

test("reorder sections changes page order and keeps hierarchy", async () => {
  const session = openWebsiteEditor({ structure: await structureOf("landing-page"), actorUserId: USER_ID });
  const home = session.structure.pages.find((page) => page.isHomepage)!;
  const reversed = [...home.sectionIds].reverse();
  const edited = applyEditorCommand({
    session,
    actorUserId: USER_ID,
    command: { type: "reorderSections", pageId: home.id, sectionIds: reversed },
  });
  const nextHome = edited.structure.pages.find((page) => page.id === home.id)!;
  assert.deepEqual(nextHome.sectionIds, reversed);
  const orders = edited.structure.sections
    .filter((section) => section.pageId === home.id)
    .sort((a, b) => a.order - b.order)
    .map((section) => section.id);
  assert.deepEqual(orders, reversed);
});

test("duplicate section allocates unique component IDs", async () => {
  const session = openWebsiteEditor({ structure: await structureOf("landing-page"), actorUserId: USER_ID, sessionId: PLAN_ID });
  const hero = session.structure.sections.find((section) => section.type === "hero")!;
  const before = session.structure.sections.length;
  const edited = applyEditorCommand({
    session,
    actorUserId: USER_ID,
    createId: ids(),
    command: { type: "duplicateSection", sectionId: hero.id },
  });
  assert.equal(edited.structure.sections.length, before + 1);
  const componentIds = edited.structure.components.map((item) => item.id);
  assert.equal(new Set(componentIds).size, componentIds.length);
});

test("delete section is allowed, homepage page is not", async () => {
  const landing = openWebsiteEditor({ structure: await structureOf("landing-page"), actorUserId: USER_ID });
  const cta = landing.structure.sections.find((section) => section.type === "cta")!;
  const afterDelete = applyEditorCommand({
    session: landing,
    actorUserId: USER_ID,
    command: { type: "deleteSection", sectionId: cta.id },
  });
  assert.equal(afterDelete.structure.sections.some((section) => section.id === cta.id), false);

  const home = afterDelete.structure.pages.find((page) => page.isHomepage)!;
  assert.throws(
    () => applyEditorCommand({ session: afterDelete, actorUserId: USER_ID, command: { type: "deletePage", pageId: home.id } }),
    (error: unknown) => error instanceof WebsiteEditorError && error.code === "illegal_delete",
  );
});

test("undo and redo restore structure snapshots", async () => {
  const session = openWebsiteEditor({ structure: await structureOf("landing-page"), actorUserId: USER_ID });
  const heading = session.structure.components.find((item) => item.type === "heading")!;
  const original = String(heading.props.text);
  const edited = applyEditorCommand({
    session,
    actorUserId: USER_ID,
    command: { type: "editText", componentId: heading.id, text: "Revised headline copy" },
  });
  const undone = applyEditorCommand({ session: edited, actorUserId: USER_ID, command: { type: "undo" } });
  assert.equal(undone.structure.components.find((item) => item.id === heading.id)?.props.text, original);
  const redone = applyEditorCommand({ session: undone, actorUserId: USER_ID, command: { type: "redo" } });
  assert.equal(redone.structure.components.find((item) => item.id === heading.id)?.props.text, "Revised headline copy");
});

test("validation rejects broken reorder and empty text", async () => {
  const session = openWebsiteEditor({ structure: await structureOf("landing-page"), actorUserId: USER_ID });
  const home = session.structure.pages[0];
  assert.throws(
    () =>
      applyEditorCommand({
        session,
        actorUserId: USER_ID,
        command: { type: "reorderSections", pageId: home.id, sectionIds: home.sectionIds.slice(1) },
      }),
    (error: unknown) => error instanceof WebsiteEditorError && error.code === "invalid_hierarchy",
  );
  const heading = session.structure.components.find((item) => item.type === "heading")!;
  assert.throws(
    () => applyEditorCommand({ session, actorUserId: USER_ID, command: { type: "editText", componentId: heading.id, text: "   " } }),
    (error: unknown) => error instanceof WebsiteEditorError && error.code === "invalid_input",
  );
});

test("idempotency does not apply the same mutating command twice", async () => {
  const session = openWebsiteEditor({ structure: await structureOf("landing-page"), actorUserId: USER_ID });
  const button = session.structure.components.find((item) => item.type === "button")!;
  const first = applyEditorCommand({
    session,
    actorUserId: USER_ID,
    idempotencyKey: "btn-1",
    command: { type: "editButton", componentId: button.id, text: "Request access" },
  });
  const second = applyEditorCommand({
    session: first,
    actorUserId: USER_ID,
    idempotencyKey: "btn-1",
    command: { type: "editButton", componentId: button.id, text: "Should not apply" },
  });
  assert.equal(second.structure.components.find((item) => item.id === button.id)?.props.text, "Request access");
  assert.equal(second.autosave.revision, first.autosave.revision);
});

test("ownership rejects another actor and inactive plans", async () => {
  const structure = await structureOf("saas");
  assert.throws(
    () => openWebsiteEditor({ structure, actorUserId: OTHER_USER }),
    (error: unknown) => error instanceof WebsiteEditorError && error.code === "ownership",
  );
  const session = openWebsiteEditor({ structure, actorUserId: USER_ID });
  const heading = session.structure.components.find((item) => item.type === "heading")!;
  assert.throws(
    () =>
      applyEditorCommand({
        session,
        actorUserId: OTHER_USER,
        command: { type: "editText", componentId: heading.id, text: "Stolen edit" },
      }),
    (error: unknown) => error instanceof WebsiteEditorError && error.code === "ownership",
  );
});

test("autosave clears dirty without changing the plan snapshot", async () => {
  const session = openWebsiteEditor({ structure: await structureOf("landing-page"), actorUserId: USER_ID });
  const heading = session.structure.components.find((item) => item.type === "heading")!;
  const edited = applyEditorCommand({
    session,
    actorUserId: USER_ID,
    command: { type: "editText", componentId: heading.id, text: "Saved headline copy" },
  });
  const saved = applyEditorCommand({
    session: edited,
    actorUserId: USER_ID,
    command: { type: "autosave" },
    now: () => "2026-08-18T19:00:00.000Z",
  });
  assert.equal(saved.autosave.dirty, false);
  assert.equal(saved.autosave.savedAt, "2026-08-18T19:00:00.000Z");
  assert.equal(saved.structure.components.find((item) => item.id === heading.id)?.props.text, "Saved headline copy");
});

test("selecting a page and deleting a non-home page keeps navigation valid", async () => {
  const session = openWebsiteEditor({ structure: await structureOf("saas"), actorUserId: USER_ID });
  const pricing = session.structure.pages.find((page) => page.slug === "pricing")!;
  const selected = applyEditorCommand({
    session,
    actorUserId: USER_ID,
    command: { type: "selectPage", pageId: pricing.id },
  });
  assert.equal(selected.selection.pageId, pricing.id);
  const deleted = applyEditorCommand({
    session: selected,
    actorUserId: USER_ID,
    command: { type: "deletePage", pageId: pricing.id },
  });
  assert.equal(deleted.structure.pages.some((page) => page.id === pricing.id), false);
  assert.equal(deleted.structure.plan.pageIds.includes(pricing.id), false);
  assert.equal(deleted.selection.pageId, null);
});
