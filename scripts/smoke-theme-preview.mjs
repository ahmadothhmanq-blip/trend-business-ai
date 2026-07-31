import { buildStaticPreviewHtml } from "../lib/website/build-static-preview.server.ts";

const html = buildStaticPreviewHtml({
  title: "Acme",
  pages: ["Home", "Pricing"],
  templateIntelligenceId: "ti-modern-clean",
  websiteThemeId: "modern",
  components: [
    "ThemeModernNav",
    "ThemeModernHero",
    "ThemeModernFeatures",
    "ThemeModernServices",
    "ThemeModernPricing",
    "ThemeModernFaq",
    "ThemeModernFooter",
  ],
});

const ok =
  html.includes('data-ti-render="v4"') &&
  html.includes('data-component="ThemeModernNav"') &&
  html.includes('data-component="ThemeModernHero"') &&
  !html.includes("ti-site-header") &&
  html.includes('id="pricing"') &&
  !html.includes("<script");

if (!ok) {
  console.error("FAIL theme preview smoke");
  process.exit(1);
}

const techHtml = buildStaticPreviewHtml({
  title: "Vertex",
  templateIntelligenceId: "ti-technology-dark",
  websiteThemeId: "technology",
  components: [
    "ThemeTechNav",
    "ThemeTechHero",
    "ThemeTechBento",
    "ThemeTechFooter",
    "ThemeTechFloatingCta",
  ],
});

const techOk =
  techHtml.includes('data-theme="technology"') &&
  (techHtml.includes("lg:pl-[min(18rem,88vw)]") ||
    techHtml.includes("ti-topology-sidebar_rail")) &&
  techHtml.includes("ThemeTechNav");

if (!techOk) {
  console.error("FAIL technology theme topology smoke");
  process.exit(1);
}

console.log("PASS theme preview smoke");
