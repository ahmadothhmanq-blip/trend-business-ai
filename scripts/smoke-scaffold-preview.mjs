import { buildStaticPreviewHtml } from "../lib/website/build-static-preview.server.ts";

const html = buildStaticPreviewHtml({
  title: "Halcyon",
  websiteThemeId: "luxury",
  components: [
    "ThemeLuxuryNav",
    "ThemeLuxuryHero",
    "ThemeLuxuryStory",
    "ThemeLuxuryFooter",
  ],
});

const ok =
  html.includes('data-theme-scaffold="true"') &&
  html.includes("tracking-[0.38em]") &&
  !html.includes("tp-nav-luxury") &&
  html.includes("ti-theme-luxury");

if (!ok) {
  console.error("FAIL scaffold preview sync");
  process.exit(1);
}

console.log("PASS scaffold preview sync");
