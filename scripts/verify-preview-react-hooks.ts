import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { renderThemeScaffoldMarkup } from "../lib/website/theme-preview/scaffold-compiler";
import { resolveLivePreviewHtml } from "../lib/website/live-preview.server";
import type { WebsiteGeneration } from "../types/database";

dotenv.config({ path: ".env.local" });

function assertNoInvalidHookCall(output: string, label: string): void {
  assert.ok(
    !/Invalid hook call/i.test(output),
    `${label} must not emit Invalid hook call warnings`,
  );
}

async function main() {
  const chunks: string[] = [];
  const originalWarn = console.warn;
  const originalError = console.error;
  console.warn = (...args: unknown[]) => {
    chunks.push(args.map(String).join(" "));
    originalWarn(...args);
  };
  console.error = (...args: unknown[]) => {
    chunks.push(args.map(String).join(" "));
    originalError(...args);
  };

  const navMarkup = renderThemeScaffoldMarkup(
    "ThemeEditorialNav",
    "editorial",
    {
      brandName: "Hook Test",
      ctaLabel: "Start",
      links: [{ href: "#work", label: "Work" }],
    },
    {
      title: "Hook Test",
      description: "Nav scaffold uses useState/useEffect hooks.",
      brandName: "Hook Test",
      heroHeadline: "Hook Test",
      heroSubheadline: "Sub",
      heroEyebrow: "Eyebrow",
      primaryCta: "Start",
      secondaryCta: "Learn",
      heroImageUrl: null,
      content: [],
      navLinks: [],
      language: "en",
    },
  );
  assert.ok(navMarkup.includes("Hook Test"), "nav scaffold should render");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await supabase
    .from("website_generations")
    .select("*")
    .eq("id", "aaeb84db-b942-49b4-86e4-3904b2b35862")
    .single();

  const html = resolveLivePreviewHtml(data as WebsiteGeneration);
  const combined = chunks.join("\n");

  console.warn = originalWarn;
  console.error = originalError;

  assert.ok(html.includes("<html"), "preview html should render");
  assertNoInvalidHookCall(combined, "theme preview scaffold SSR");

  console.log("preview-react-hooks: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
