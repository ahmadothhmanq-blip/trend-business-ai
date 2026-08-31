import { buildStaticPreviewHtml } from "../lib/website/build-static-preview.server.ts";
import { renderV2PageMarkup } from "../lib/website/template-v2/preview/v2-preview-compiler.ts";

// Minimal reproduction using corporate-business components from disk + typical page.tsx
const pageSource = `import { CorporateBusinessHero } from "@/components/corporate-business-hero";
export default function HomePage() {
  return (
    <CorporateBusinessHero title="Test" subtitle="Sub" primaryCta="Go" />
  );
}`;

const files = [
  { path: "app/page.tsx", content: pageSource },
  { path: "app/globals.css", content: ":root { --color-background: #000; }" },
];

try {
  const html = renderV2PageMarkup(files);
  console.log("OK", html.length);
} catch (e) {
  console.error("FAIL", e);
}
