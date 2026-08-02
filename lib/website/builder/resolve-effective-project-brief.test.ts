import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveEffectiveProjectBrief } from "@/lib/website/builder/resolve-effective-project-brief";

describe("resolveEffectiveProjectBrief", () => {
  it("prefers the typed project brief", () => {
    assert.equal(
      resolveEffectiveProjectBrief({
        projectBrief: "A boutique coffee roastery",
        language: "English",
        placeholderFallback: "e.g. Example",
      }),
      "A boutique coffee roastery",
    );
  });

  it("builds a brief from template payload when textarea is empty", () => {
    const brief = resolveEffectiveProjectBrief({
      projectBrief: "",
      language: "English",
      tpl: {
        name: "Luxury Restaurant",
        description: "Fine dining with reservations",
        industry: "restaurant",
        style: "luxury",
        layoutType: "editorial",
        features: ["menu", "reservations"],
      },
      placeholderFallback: "e.g. Example",
    });
    assert.match(brief, /Luxury Restaurant/);
    assert.match(brief, /Fine dining/);
  });

  it("falls back to placeholder when no selections exist", () => {
    const brief = resolveEffectiveProjectBrief({
      projectBrief: "",
      language: "English",
      placeholderFallback:
        "e.g. A luxury spa in Dubai for professionals who want weekend recovery packages…",
    });
    assert.match(brief, /luxury spa in Dubai/i);
  });
});
