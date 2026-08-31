import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDeterministicRepairMode,
  isLlmRepairAllowed,
  formatDeterministicRepairAbort,
} from "@/lib/ai/webapp-repair-policy";
import { validateAndRepairWebAppProject } from "@/lib/ai/webapp-repair-pipeline";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";

const flags = {
  requiresAuth: true,
  requiresDatabase: true,
  requiresDashboard: true,
  isEcommerce: false,
  isSaas: true,
  databaseProvider: "prisma" as const,
};

const analysis = {
  appName: "Ops",
  appType: "saas",
  complexity: "moderate" as const,
  pages: ["Home", "Login", "Dashboard"],
  features: ["auth"],
  technologies: ["next"],
  databaseTables: ["Item"],
  apiEndpoints: [],
  requiresAuth: true,
  requiresDatabase: true,
  requiresDashboard: true,
  isEcommerce: false,
  isSaas: true,
  databaseProvider: "prisma" as const,
};

function scaffoldProject(): GeneratedProjectFile[] {
  return hardenGeneratedWebApp(
    buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Item"],
    }),
  );
}

function plansFromFiles(files: GeneratedProjectFile[]): PlannedFile[] {
  return files.map((file) => ({
    path: file.path,
    purpose: file.path,
    language: file.language || "typescript",
    category: "lib" as const,
  }));
}

describe("deterministic repair policy", () => {
  it("aiFileCount == 0 enters deterministic mode; > 0 allows LLM repair", () => {
    assert.equal(isDeterministicRepairMode(0), true);
    assert.equal(isLlmRepairAllowed(0), false);
    assert.equal(isDeterministicRepairMode(1), false);
    assert.equal(isLlmRepairAllowed(1), true);
  });

  it("aiFileCount == 0 never calls DeepSeek repair callback", async () => {
    const files = scaffoldProject();
    let llmCalls = 0;

    const result = await validateAndRepairWebAppProject({
      aiFileCount: 0,
      analysis,
      filePlans: plansFromFiles(files),
      files,
      flags,
      tablesForValidation: ["Item"],
      scaffoldOptions: {
        projectName: "Ops",
        requiresAuth: true,
        requiresDatabase: true,
        requiresDashboard: true,
        tables: ["Item"],
      },
      repairFileWithLlm: async () => {
        llmCalls += 1;
        throw new Error("DeepSeek must not be called in deterministic repair mode");
      },
    });

    assert.ok(result.length > 0);
    assert.equal(llmCalls, 0);
  });

  it("aiFileCount == 0 + validation failure → deterministic abort only", async () => {
    const files = scaffoldProject().filter(
      (file) => file.path !== "app/login/page.tsx",
    );
    // Remove auth page and block gap-fill by claiming no auth in options that
    // still leave readiness/requirements unhappy — strip login while keeping
    // requiresAuth so validation fails even after scaffold attempts.
    let llmCalls = 0;

    await assert.rejects(
      () =>
        validateAndRepairWebAppProject({
          aiFileCount: 0,
          analysis: { ...analysis, requiresAuth: true },
          filePlans: plansFromFiles(files),
          files: files.map((file) =>
            file.path === "lib/auth.ts"
              ? {
                  ...file,
                  // Break auth contract so readiness cannot pass even if gap-fill
                  // restores login (thin session without DB-backed userId).
                  content: `export type Session = { sessionId: string };
export async function getSession() { return null; }
`,
                }
              : file,
          ),
          flags,
          tablesForValidation: ["Item"],
          scaffoldOptions: {
            projectName: "Ops",
            requiresAuth: false,
            requiresDatabase: false,
            requiresDashboard: true,
            tables: ["Item"],
          },
          repairFileWithLlm: async () => {
            llmCalls += 1;
            throw new Error("DeepSeek must not be called");
          },
        }),
      (error: unknown) => {
        assert.equal(llmCalls, 0);
        assert.ok(error instanceof Error);
        assert.match(
          error.message,
          /Deterministic repair failed \(DeepSeek repair disabled when aiFileCount=0\)/,
        );
        return true;
      },
    );
  });

  it("aiFileCount > 0 keeps LLM repair path for non-scaffold targets", async () => {
    const files = scaffoldProject();
    const customPath = "lib/custom-business.ts";
    const broken: GeneratedProjectFile = {
      path: customPath,
      language: "typescript",
      content: "", // empty → validateGeneratedFileContent fails → regenerate target
    };
    const withCustom = [...files, broken];
    const filePlans: PlannedFile[] = [
      ...plansFromFiles(files),
      {
        path: customPath,
        purpose: "Custom business logic",
        language: "typescript",
        category: "lib",
      },
    ];

    let llmCalls = 0;
    const fixed: GeneratedProjectFile = {
      path: customPath,
      language: "typescript",
      content: `export function customBusiness() { return "ok"; }\n`,
    };

    const result = await validateAndRepairWebAppProject({
      aiFileCount: 1,
      analysis,
      filePlans,
      files: withCustom,
      flags,
      tablesForValidation: ["Item"],
      scaffoldOptions: {
        projectName: "Ops",
        requiresAuth: true,
        requiresDatabase: true,
        requiresDashboard: true,
        tables: ["Item"],
      },
      repairFileWithLlm: async ({ targetPath }) => {
        llmCalls += 1;
        assert.equal(targetPath, customPath);
        return fixed;
      },
    });

    assert.ok(llmCalls >= 1, "expected LLM repair for non-scaffold file");
    assert.equal(
      result.find((file) => file.path === customPath)?.content,
      fixed.content,
    );
  });

  it("formatDeterministicRepairAbort includes issue details", () => {
    const error = formatDeterministicRepairAbort([
      "Missing trust-critical file: lib/auth.ts",
    ]);
    assert.match(error.message, /Deterministic repair failed/);
    assert.match(error.message, /lib\/auth\.ts/);
  });
});
