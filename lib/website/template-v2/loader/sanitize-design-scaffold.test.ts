import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { sanitizeDesignScaffold } from "@/lib/website/template-v2/loader/sanitize-design-scaffold";

const templatesRoot = path.join(process.cwd(), "templates/website");

function readScaffold(...parts: string[]) {
  return readFileSync(path.join(templatesRoot, ...parts), "utf8");
}

describe("sanitizeDesignScaffold demo-constant stripping", () => {
  it("keeps resolveLinks when emptying object DEFAULT_LINKS (Signal footer)", () => {
    const out = sanitizeDesignScaffold(
      readScaffold(
        "ai-startup-signal",
        "components",
        "ai-startup-signal-footer.tsx",
      ),
      "ai-startup-signal-footer",
    );

    assert.match(out, /function resolveLinks/);
    assert.match(
      out,
      /const DEFAULT_LINKS = \{ product: \[\], company: \[\], legal: \[\] \};/,
    );
    assert.doesNotMatch(out, /DEFAULT_LINKS = \[\];\s*\};/);
    assert.match(out, /type AiStartupSignalFooterProps/);
  });

  it("empties multi-line string DEFAULT_* without eating props types (Haven about)", () => {
    const out = sanitizeDesignScaffold(
      readScaffold(
        "hotel-resort-premium",
        "components",
        "hotel-resort-premium-about.tsx",
      ),
      "hotel-resort-premium-about",
    );

    assert.match(out, /const DEFAULT_PULL_QUOTE = "";/);
    assert.match(
      out,
      /type HotelResortPremiumAboutProps = \{[\s\S]*primaryCta\?: string;/,
    );
    assert.doesNotMatch(out, /DEFAULT_PULL_QUOTE = "";\s*primaryCta\?:/);
  });

  it("keeps DEFAULT_* destructuring refs after emptying array constants (Signal hero)", () => {
    const out = sanitizeDesignScaffold(
      readScaffold(
        "ai-startup-signal",
        "components",
        "ai-startup-signal-hero.tsx",
      ),
      "ai-startup-signal-hero",
    );

    assert.match(out, /const DEFAULT_METRICS = \[\];/);
    assert.match(out, /const DEFAULT_TRUST = \[\];/);
    assert.match(out, /metrics = DEFAULT_METRICS/);
    assert.match(out, /trustSectors = DEFAULT_TRUST/);
  });
});
