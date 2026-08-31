import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  composeTbgeUnifiedHomeFiles,
  isTbgeBareScaffoldHomePage,
  resolveTbgeHomeComponentOrder,
} from "@/lib/tbge/integration/compose-unified-home";

const apexHome = [
  'import { SiteShell } from "@/components/layout/site-shell";',
  'import { Button } from "@/components/ui/button";',
  "",
  "export default function HomePage() {",
  "  return (",
  "    <SiteShell>",
  "      <h1>Apex Motors</h1>",
  "      <p>Landing page</p>",
  "      <section><h2>Hero</h2></section>",
  "      <section><h2>TrustBar</h2></section>",
  "      <section><h2>FeaturedModels</h2></section>",
  "      <section><h2>WhyChooseUs</h2></section>",
  "      <section><h2>Testimonials</h2></section>",
  "      <section><h2>TestDriveCTA</h2></section>",
  "      <Button>Book a Test Drive</Button>",
  "    </SiteShell>",
  "  );",
  "}",
].join("\n");

describe("compose-unified-home", () => {
  it("detects TBGE bare scaffold home pages", () => {
    assert.equal(isTbgeBareScaffoldHomePage(apexHome), true);
    assert.equal(
      isTbgeBareScaffoldHomePage(
        'export default function Page(){return <><SiteHeader/><HeroSplit/></>}',
      ),
      false,
    );
  });

  it("maps automotive section names to professional components", () => {
    const order = resolveTbgeHomeComponentOrder({
      industryId: "automotive",
      sectionNames: [
        "Hero",
        "TrustBar",
        "FeaturedModels",
        "WhyChooseUs",
        "Testimonials",
        "TestDriveCTA",
      ],
    });
    assert.ok(order.includes("SiteHeader"));
    assert.ok(order.includes("HeroLuxuryShowcase"));
    assert.ok(order.includes("BrandTrust"));
    assert.ok(order.includes("SiteFooter"));
  });

  it("replaces bare scaffold with composed professional home page", () => {
    const files = composeTbgeUnifiedHomeFiles({
      files: [
        { path: "app/page.tsx", content: apexHome, language: "tsx" },
        {
          path: "app/globals.css",
          content: "@tailwind base;",
          language: "css",
        },
      ],
      title: "Apex Motors",
      description: "Premium automotive dealership",
      language: "English",
      industryId: "automotive",
      sectionNames: [
        "Hero",
        "TrustBar",
        "FeaturedModels",
        "WhyChooseUs",
        "Testimonials",
        "TestDriveCTA",
      ],
    });

    const page = files.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(!page.includes("<h2>Hero</h2>"));
    assert.ok(page.includes("HeroLuxuryShowcase") || page.includes("HeroSplit"));
    assert.ok(files.length > 3);
  });

  it("uses h1 brand name when session title is still generating placeholder", () => {
    const files = composeTbgeUnifiedHomeFiles({
      files: [
        { path: "app/page.tsx", content: apexHome, language: "tsx" },
        { path: "app/globals.css", content: "@tailwind base;", language: "css" },
      ],
      title: "Generating website…",
      description: "Premium automotive dealership",
      language: "English",
      industryId: "automotive",
      sectionNames: ["Hero", "TrustBar", "FeaturedModels"],
    });

    const page = files.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes("Apex Motors"));
    assert.ok(!page.includes("Generating website"));
  });
});
