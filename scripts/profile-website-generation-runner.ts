import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { generateWebsite } from "@/lib/website-generator";
import { runWithWebsiteProfiler } from "@/lib/ai-core/performance/profiler-context";
import { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";

const profile = process.env.WB_PROFILE ?? "ultra";
const prompt = process.env.WB_PROMPT ?? "";

async function main() {
  const profiler = new WebsitePipelineProfiler();
  profiler.snapshotMemory("profile-start");

  const startedAt = Date.now();
  const result = await runWithWebsiteProfiler(profiler, async () =>
    generateWebsite({
      prompt,
      language: "English",
      theme: "modern",
      projectType: "website",
      projectKind: "website",
      features: ["contact-form", "seo"],
      generationProfile: profile as "ultra" | "fast" | "professional",
      userId: "profile-run-user",
      onProgress: (msg) => {
        if (process.env.WB_PROFILE_VERBOSE === "1") console.error(msg);
      },
    }),
  );

  profiler.snapshotMemory("profile-end");
  const wallClockMs = Date.now() - startedAt;
  const report = profiler.toReport();

  const payload = {
    source: "live-profile",
    profile,
    prompt,
    wallClockMs,
    generationTimeMs: result.generationTimeMs,
    fileCount: result.files?.length ?? 0,
    provider: result.provider,
    usage: result.usage,
    pipelinePerformanceReport: report,
    pipelinePerformanceMarkdown: profiler.formatMarkdownReport(),
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `profile-${profile}-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(outPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
