/**
 * Brand Studio platform health report.
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export type BrandStudioHealthReport = {
  status: "healthy" | "degraded";
  productId: string;
  version: string;
  checks: Array<{ id: string; ok: boolean; detail?: string }>;
};

const REQUIRED_MODULES = [
  "lib/ai-core/brand-studio/engine.ts",
  "lib/ai-core/brand-studio/model.ts",
  "lib/ai-core/brand-studio/logos.ts",
  "lib/ai-core/brand-studio/kit.ts",
  "lib/ai-core/brand-studio/templates.ts",
  "lib/ai-core/brand-studio/assistant.ts",
  "app/api/brand-identity/health/route.ts",
  "app/api/brand-identity/templates/route.ts",
  "app/api/brand-identity/stream/route.ts",
  "components/dashboard/brand-identity/brand-management-dashboard.tsx",
  "app/(dashboard)/dashboard/brand-studio/[id]/page.tsx",
];

export function buildBrandStudioHealthReport(root = process.cwd()): BrandStudioHealthReport {
  const checks = REQUIRED_MODULES.map((rel) => ({
    id: rel,
    ok: existsSync(join(root, rel)),
    detail: existsSync(join(root, rel)) ? "present" : "missing",
  }));

  const migrations = ["048", "049", "050", "051", "052"].map((n) => {
    const pattern = `supabase/migrations/${n}_`;
    const ok =
      existsSync(join(root, "supabase/migrations")) &&
      readdirSync(join(root, "supabase/migrations")).some((f) => f.startsWith(`${n}_`));
    return { id: `migration_${n}`, ok, detail: ok ? "present" : "missing" };
  });

  const all = [...checks, ...migrations];
  const ok = all.every((c) => c.ok);

  return {
    status: ok ? "healthy" : "degraded",
    productId: "brand-designer",
    version: "2.0.0",
    checks: all,
  };
}
