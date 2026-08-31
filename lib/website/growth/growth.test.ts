import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPublishedHreflangEntries,
  buildVisitorLocaleConfig,
} from "@/lib/website/site-plan/visitor-locales";
import { buildHreflangLinkTags } from "@/lib/website/growth/hreflang-tags";
import {
  buildPublishedLanguageSwitcherHtml,
  injectLanguageSwitcherIntoHtml,
} from "@/lib/website/growth/language-switcher";
import { buildReferralSharePayload } from "@/lib/website/growth/referral";

describe("language switcher", () => {
  it("injects switcher HTML before body close", () => {
    const config = buildVisitorLocaleConfig({
      enabled: true,
      contentLanguage: "Arabic",
    });
    const html = buildPublishedLanguageSwitcherHtml({
      publicBaseUrl: "https://example.com/w/demo",
      config,
      currentLocale: "en",
    });
    assert.ok(html.includes("tb-language-switcher"));
    assert.ok(html.includes("English"));
    assert.ok(html.includes("Arabic"));

    const injected = injectLanguageSwitcherIntoHtml(
      "<html><body><main>Hi</main></body></html>",
      html,
    );
    assert.ok(injected.includes("</main>"));
    assert.ok(injected.indexOf("tb-language-switcher") > injected.indexOf("<main>"));
  });
});

describe("visitor locales publish", () => {
  it("builds hreflang URLs with English as primary at /w/slug", () => {
    const config = buildVisitorLocaleConfig({
      enabled: true,
      contentLanguage: "Arabic",
    });
    assert.equal(config.primaryLocale, "English");
    assert.equal(config.contentLocale, "Arabic");
    assert.ok(config.alternates.includes("Arabic"));

    const entries = buildPublishedHreflangEntries({
      publicBaseUrl: "https://example.com/w/my-site",
      config,
    });
    assert.ok(entries.some((e) => e.locale === "en" && e.href === "https://example.com/w/my-site"));
    assert.ok(entries.some((e) => e.locale === "ar" && e.href.endsWith("/ar")));
    assert.ok(entries.some((e) => e.locale === "x-default"));
  });

  it("renders link tags", () => {
    const config = buildVisitorLocaleConfig({
      enabled: true,
      contentLanguage: "French",
    });
    const tags = buildHreflangLinkTags(config, "https://example.com/w/demo");
    assert.ok(tags.some((t) => t.includes('hreflang="en"')));
    assert.ok(tags.some((t) => t.includes('hreflang="x-default"')));
  });
});

describe("referral share", () => {
  it("builds referral query on public URL", () => {
    const payload = buildReferralSharePayload({
      publicUrl: "https://example.com/w/demo",
      userId: "user-abc",
      generationId: "gen-xyz",
      title: "Demo",
    });
    assert.ok(payload.referralUrl.includes("ref="));
    assert.ok(payload.twitterIntentUrl.includes("twitter.com"));
  });
});
