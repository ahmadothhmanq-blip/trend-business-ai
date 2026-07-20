import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isRasterGenerationAvailable, listAvailableProviders } from "@/lib/ai-core/image-design-platform/providers";

export type ImageDesignHealthReport = {
  status: "healthy" | "degraded";
  productId: string;
  version: string;
  rasterAvailable: boolean;
  providers: ReturnType<typeof listAvailableProviders>;
  checks: Array<{ id: string; ok: boolean; detail?: string }>;
};

const REQUIRED = [
  "lib/ai-core/image-design-platform/engine.ts",
  "lib/ai-core/image-design-platform/pipeline.ts",
  "lib/ai-core/image-design-platform/editor/engine.ts",
  "lib/ai-core/image-design-platform/editing/provider.ts",
  "app/api/image-generator/health/route.ts",
  "app/api/image-generator/templates/route.ts",
  "app/api/image-generator/stream/route.ts",
  "app/api/image-generator/[id]/export/route.ts",
  "app/api/image-generator/[id]/assets/route.ts",
  "app/api/image-generator/[id]/editor/route.ts",
  "app/api/image-generator/[id]/editor/save/route.ts",
  "app/api/image-generator/[id]/edit-image/route.ts",
  "app/api/image-generator/assets/search/route.ts",
  "components/dashboard/image-generator/design-editor.tsx",
  "app/(dashboard)/dashboard/image-generator/[id]/editor/page.tsx",
  "supabase/migrations/053_design_projects.sql",
  "supabase/migrations/054_design_assets.sql",
  "supabase/migrations/055_design_generations.sql",
  "supabase/migrations/056_design_canvas.sql",
  "supabase/migrations/057_design_layers.sql",
  "supabase/migrations/058_design_editor_history.sql",
  "supabase/migrations/059_design_templates_v2.sql",
];

export function buildImageDesignHealthReport(root = process.cwd()): ImageDesignHealthReport {
  const checks = REQUIRED.map((rel) => ({
    id: rel,
    ok: existsSync(join(root, rel)),
    detail: existsSync(join(root, rel)) ? "present" : "missing",
  }));

  const migrationsOk = ["053", "054", "055", "056", "057", "058", "059"].every((n) =>
    existsSync(join(root, "supabase/migrations")) &&
    readdirSync(join(root, "supabase/migrations")).some((f) => f.startsWith(`${n}_`)),
  );
  checks.push({ id: "migrations", ok: migrationsOk, detail: migrationsOk ? "present" : "missing" });

  const ok = checks.every((c) => c.ok);
  return {
    status: ok ? "healthy" : "degraded",
    productId: "image-generator",
    version: "2.0.0",
    rasterAvailable: isRasterGenerationAvailable(),
    providers: listAvailableProviders(),
    checks,
  };
}
