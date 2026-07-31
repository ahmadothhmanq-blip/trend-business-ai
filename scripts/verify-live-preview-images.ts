import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolveLivePreviewHtml } from "../lib/website/live-preview.server";
import { prepareWebsiteProjectForExport } from "../lib/website/prepare-export";
import type { WebsiteGeneration } from "../types/database";

dotenv.config({ path: ".env.local" });

async function main() {
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
  const imgRe = /<img[^>]+src="([^"]+)"/g;
  const imgs: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = imgRe.exec(html))) {
    imgs.push(match[1]!);
  }
  const unique = [...new Set(imgs)];
  console.log("render", html.match(/data-ti-render="([^"]+)"/)?.[1]);
  console.log("img count", imgs.length, "unique", unique.length);
  for (const url of unique) {
    console.log(url.slice(0, 110));
  }

  const blueprint = data?.blueprint as { files?: { path: string; content: string }[] };
  const prep = prepareWebsiteProjectForExport(
    (blueprint?.files ?? []).map((file) => ({
      ...file,
      language: file.path.endsWith(".tsx")
        ? "tsx"
        : file.path.endsWith(".ts")
          ? "typescript"
          : "text",
    })),
  );
  const site = prep.files.find((f) => f.path.includes("site-images"));
  const hero = site?.content.match(/HERO_IMAGE = "([^"]+)"/)?.[1];
  console.log("export ready", prep.ready);
  console.log("export hero", hero?.slice(0, 90));
  if (hero?.includes("photo-1542744173")) {
    throw new Error("export still contains removed hero photo");
  }
}

main().catch(console.error);
