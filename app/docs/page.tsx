import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { SeoService } from "@/lib/seo/engine";
import { breadcrumbJsonLd, howToJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = SeoService.createMetadata({
  title: "Documentation & Help Center",
  description: PUBLIC_SAAS_PAGES.docs.description,
  path: "/docs",
});

export default function DocsPage() {
  return (
    <>
      <JsonLdScript
        id="docs-jsonld"
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Knowledge Center", path: "/learn" },
            { name: "Documentation", path: "/docs" },
          ]),
          webPageJsonLd({
            name: "Documentation & Help Center",
            description: PUBLIC_SAAS_PAGES.docs.description,
            path: "/docs",
          }),
          howToJsonLd({
            name: "Get started with Trend Business AI",
            description: "Create an account, open your dashboard, and run your first AI generation.",
            path: "/docs",
            steps: [
              { name: "Create an account", text: "Sign up and verify access to your private dashboard." },
              { name: "Choose a product", text: "Open a Create, Design, Content, or Business workspace." },
              { name: "Generate and export", text: "Describe your brief, save results, and export when ready." },
            ],
          }),
        ]}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.docs} />
    </>
  );
}
