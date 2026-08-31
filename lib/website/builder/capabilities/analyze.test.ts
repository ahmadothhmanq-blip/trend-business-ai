import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import { WB_WEBSITE_BLUEPRINT_SETTING } from "@/lib/website/template-v2/constants";
import {
  createCapabilityService,
  refreshCapabilities,
} from "@/lib/website/builder/capabilities/service";
import { resolveBuilderToolbar } from "@/lib/website/builder/tools/resolve";

function auraLikeProject(): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: "Aura Signal",
    description: "AI operations platform",
    pages: ["home", "pricing", "platform"],
    sections: [
      "ai-startup-signal-hero",
      "ai-startup-signal-features",
      "ai-startup-signal-testimonials",
      "ai-startup-signal-pricing",
      "ai-startup-signal-faq",
      "ai-startup-signal-contact",
    ],
    components: [
      "ai-startup-signal-hero",
      "ai-startup-signal-testimonials",
      "ai-startup-signal-pricing",
      "ai-startup-signal-faq",
      "ai-startup-signal-contact",
    ],
    colorPalette: [],
    typography: [],
    content: ["Trusted by modern teams", "FAQ", "Contact us today"],
    seo: ["meta description", "sitemap"],
    roadmap: [],
    files: [
      {
        path: "app/page.tsx",
        content: "export default function Page() {}",
        language: "tsx",
      },
      {
        path: "app/contact/page.tsx",
        content: "export default function Contact() {}",
        language: "tsx",
      },
      {
        path: "app/sitemap.ts",
        content: "export default function sitemap() {}",
        language: "typescript",
      },
    ],
    strategy: {
      positioning: "Signal-grade AI ops",
      sitemap: ["/", "/pricing", "/platform"],
      pages: [
        {
          name: "Pricing",
          path: "/pricing",
          purpose: "Convert trials",
          keySections: ["Pricing table"],
          primaryCta: "Start trial",
        },
      ],
      sectionPlan: [
        {
          id: "faq",
          page: "home",
          name: "FAQ",
          goal: "Answer objections",
          contentNotes: "Launch timeline and onboarding",
        },
        {
          id: "testimonials",
          page: "home",
          name: "Testimonials",
          goal: "Social proof",
          contentNotes: "Customer quotes",
        },
        {
          id: "pricing",
          page: "home",
          name: "Pricing",
          goal: "Plans",
          contentNotes: "Starter, Growth, Enterprise",
        },
        {
          id: "contact",
          page: "home",
          name: "Contact",
          goal: "Lead capture",
          contentNotes: "Contact form",
        },
      ],
      conversionFunnel: [],
      contentStructure: [],
      contentStrategy: {
        brandVoice: "confident",
        messagingPillars: [],
        proofPoints: ["99.9% uptime"],
        objectionHandlers: ["How fast can we launch?"],
        seoTopics: ["ai operations"],
      },
      ctas: ["Start trial"],
      seoFocus: ["ai platform"],
    },
    settings: {
      [WB_WEBSITE_BLUEPRINT_SETTING]: {
        sectionOrder: [
          "hero",
          "features",
          "testimonials",
          "pricing",
          "faq",
          "contact",
          "footer",
        ],
        footerStyle: { newsletter: true },
      },
    },
  };
}

describe("capability manifest — hybrid pipeline", () => {
  it("builds an initial manifest from blueprint and strategy only", () => {
    const { service } = refreshCapabilities(auraLikeProject(), { force: true });
    const initialIds = new Set(service.getActiveCapabilities());

    assert.ok(initialIds.has("testimonials"));
    assert.ok(initialIds.has("pricing"));
    assert.ok(initialIds.has("faq"));
    assert.ok(initialIds.has("newsletter"));
  });

  it("verifies capabilities from project files and components", () => {
    const { service } = refreshCapabilities(auraLikeProject(), { force: true });
    const ids = new Set(service.getActiveCapabilities());

    assert.ok(ids.has("forms"));
    assert.ok(ids.has("seo"));
    assert.ok(
      service.getCapability("forms")?.confidence !== "low",
      "low-confidence capabilities must be hidden",
    );
  });

  it("shows all toolbar tools with enabled flags for Aura-like projects", () => {
    const prev = process.env.WB_CAPABILITY_TOOLBAR;
    process.env.WB_CAPABILITY_TOOLBAR = "1";
    try {
      const service = createCapabilityService(auraLikeProject());
      const toolbar = resolveBuilderToolbar(service);

      assert.equal(toolbar.tools.length, 9);
      const toolIds = toolbar.tools.map((tool) => tool.id);
      assert.ok(toolIds.includes("structure"));
      assert.ok(toolIds.includes("design"));
      assert.ok(toolIds.includes("professional"));
      assert.ok(toolIds.includes("publish"));
      assert.ok(toolIds.includes("business"), "contact/forms should surface business hub");
      const media = toolbar.tools.find((tool) => tool.id === "media");
      assert.equal(media?.enabled, false);
      assert.ok(media?.unlockCopilotCommand);
    } finally {
      if (prev === undefined) delete process.env.WB_CAPABILITY_TOOLBAR;
      else process.env.WB_CAPABILITY_TOOLBAR = prev;
    }
  });
});
