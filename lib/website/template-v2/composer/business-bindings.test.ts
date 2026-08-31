import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildComponentProps,
  propsToJsx,
  resolveHeroCopy,
} from "@/lib/website/template-v2/composer/business-bindings";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";

const sampleContent = {
  services: [{ title: "Launch", body: "Ship faster", cta: "Learn more" }],
  features: [{ title: "API", body: "REST + GraphQL", cta: "Docs" }],
  ctaTitle: "Start building",
  serviceHours: "Tue – Sat · 6pm seating · Dress code: smart casual",
} as unknown as ProductionContentPack;

describe("business-bindings — flagship package defaults", () => {
  it("keeps package section copy but overlays real brand/CTA when usePackageDefaults", () => {
    const hero = resolveHeroCopy({
      brandName: "Inspect Co",
      usePackageDefaults: true,
    });
    assert.equal(hero.title, undefined);
    assert.equal(hero.subtitle, undefined);

    const props = buildComponentProps({
      componentId: "ai-startup-signal-hero",
      role: "hero",
      packageId: "ai-startup-signal",
      ctx: {
        brandName: "Inspect Co",
        usePackageDefaults: true,
        primaryCta: "Get started",
        secondaryCta: "See platform",
      },
    });
    assert.deepEqual(props, {
      brandName: "Inspect Co",
      primaryCta: "Get started",
      secondaryCta: "See platform",
    });
    assert.equal((props as Record<string, unknown>).title, undefined);
  });

  it("skips stub brands so CLI previews keep package defaults", () => {
    const props = buildComponentProps({
      componentId: "ai-startup-signal-nav",
      role: "navigation",
      packageId: "ai-startup-signal",
      ctx: {
        brandName: "Verify",
        usePackageDefaults: true,
      },
    });
    assert.deepEqual(props, {});
  });

  it("overlays nav brand and CTA for real businesses", () => {
    const props = buildComponentProps({
      componentId: "ai-startup-signal-nav",
      role: "navigation",
      packageId: "ai-startup-signal",
      ctx: {
        brandName: "Citadel",
        usePackageDefaults: true,
        primaryCta: "Request access",
        content: {
          navLinks: [
            { href: "#platform", label: "Platform" },
            { href: "#pricing", label: "Pricing" },
          ],
        } as ProductionContentPack,
      },
    });
    assert.deepEqual(props, {
      brandName: "Citadel",
      ctaLabel: "Request access",
      links: [
        { href: "#platform", label: "Platform" },
        { href: "#pricing", label: "Pricing" },
      ],
    });
  });
});

describe("business-bindings — localized hero copy", () => {
  it("does not fall back to English page description for Arabic sites", () => {
    const hero = resolveHeroCopy({
      brandName: "شركة ألعاب",
      language: "Arabic",
      heroHeadline: "عناوين الألعاب القادمة",
      pageDescription: "English placeholder description that must not appear",
    });
    assert.equal(hero.title, "عناوين الألعاب القادمة");
    assert.equal(hero.subtitle, undefined);
  });

  it("emits empty text slots for localized JSX to override scaffold defaults", () => {
    const jsx = propsToJsx(
      {
        title: "عنوان",
        subtitle: "",
        eyebrow: "",
      },
      { localizedCopy: true },
    );
    assert.match(jsx, /subtitle=\{""\}/);
    assert.match(jsx, /eyebrow=\{""\}/);
  });
});

describe("business-bindings — sector isolation", () => {
  it("maps services to generic items for saas-enterprise", () => {
    const props = buildComponentProps({
      componentId: "saas-enterprise-features",
      role: "services",
      packageId: "saas-enterprise",
      ctx: { brandName: "Nexus", content: sampleContent },
    });
    const items = props.items as Array<Record<string, string>>;
    assert.ok(items?.length);
    assert.equal("course" in items[0]!, false);
    assert.equal(items[0]?.title, "Launch");
  });

  it("maps services to menu items only for hospitality packages", () => {
    const props = buildComponentProps({
      componentId: "restaurant-premium-tasting-menu",
      role: "services",
      packageId: "restaurant-premium",
      ctx: { brandName: "Ember", content: sampleContent },
    });
    const items = props.items as Array<Record<string, string>>;
    assert.equal(items[0]?.course, "1");
    assert.equal(items[0]?.name, "Launch");
  });

  it("does not bind hospitality reservation footnotes for saas-enterprise", () => {
    const props = buildComponentProps({
      componentId: "saas-enterprise-utility-band",
      role: "cta",
      packageId: "saas-enterprise",
      ctx: { brandName: "Nexus", content: sampleContent },
    });
    assert.equal("footnote" in props, false);
  });

  it("binds integrations logos from services and features", () => {
    const props = buildComponentProps({
      componentId: "ai-startup-signal-integrations",
      role: "integrations",
      packageId: "ai-startup-signal",
      ctx: {
        brandName: "Aura",
        content: sampleContent,
      },
    });
    const logos = props.logos as Array<{ name: string; category: string }>;
    assert.ok(logos?.length);
    // Features take priority over services for integrations logos.
    assert.equal(logos[0]?.name, "API");
  });

  it("binds utility band trust badges from showcase bullets", () => {
    const props = buildComponentProps({
      componentId: "ai-startup-signal-utility-band",
      role: "cta",
      packageId: "ai-startup-signal",
      ctx: {
        brandName: "Aura",
        content: {
          ...sampleContent,
          showcaseBullets: ["SOC 2 Type II", "99.9% uptime SLA", "14-day onboarding"],
        } as ProductionContentPack,
      },
    });
    const badges = props.badges as string[];
    assert.deepEqual(badges, ["SOC 2 Type II", "99.9% uptime SLA", "14-day onboarding"]);
  });

  it("binds hospitality reservation footnotes only for restaurant packages", () => {
    const props = buildComponentProps({
      componentId: "restaurant-premium-reservation-cta",
      role: "cta",
      packageId: "restaurant-premium",
      ctx: { brandName: "Ember", content: sampleContent },
    });
    assert.equal(props.footnote, sampleContent.serviceHours);
  });
});
