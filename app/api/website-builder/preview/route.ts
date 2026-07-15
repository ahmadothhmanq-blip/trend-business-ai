import { exec } from "node:child_process";
import { randomUUID } from "node:crypto";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { logApiError } from "@/lib/api/errors";
import { writePreviewOwner } from "@/lib/api/preview-ownership";
import { sanitizeProjectPath } from "@/lib/ai/sanitize-path";
import { NextResponse } from "next/server";
import { z } from "zod";

const execAsync = promisify(exec);
const GENERATED_ROOT = path.join(process.cwd(), ".next", "generated-projects");
const PREVIEW_BUILDER_ENABLED =
  process.env.WEBSITE_PREVIEW_BUILDER_ENABLED === "true";

export const runtime = "nodejs";

const generatedFileSchema = z.object({
  path: z.string().min(1).max(260),
  content: z.string().max(500_000),
  language: z.string().optional(),
});

const previewBuildSchema = z.object({
  title: z.string().min(1).max(120),
  files: z.array(generatedFileSchema).min(1).max(50),
});

async function writeGeneratedProject(
  projectDir: string,
  files: z.infer<typeof generatedFileSchema>[],
  previewId: string,
) {
  await rm(projectDir, { force: true, recursive: true });
  await mkdir(projectDir, { recursive: true });

  await Promise.all(
    files.map(async (file) => {
      const safePath = sanitizeProjectPath(file.path);
      const fileName = path.basename(safePath).toLowerCase();

      if (fileName.startsWith("next.config.")) {
        return;
      }

      const targetPath = path.join(projectDir, safePath);

      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, file.content, "utf8");
    }),
  );

  await writeFile(
    path.join(projectDir, "next.config.mjs"),
    `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  assetPrefix: "/api/website-builder/preview/${previewId}/asset",
};

export default nextConfig;
`,
    "utf8",
  );
}

async function ensureBuildablePackageJson(projectDir: string) {
  const packageJsonPath = path.join(projectDir, "package.json");

  try {
    await access(packageJsonPath);
  } catch {
    throw new Error("Generated project is missing package.json.");
  }

  const rawPackageJson = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(rawPackageJson) as {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: unknown;
  };

  const disallowedScriptFlags = [
    "--" + "turbo",
    "--" + "turbo" + "pack",
    "--" + "webpack",
  ];
  const cleanScript = (script: string | undefined, fallback: string) =>
    disallowedScriptFlags
      .reduce((value, flag) => value.replaceAll(flag, ""), script ?? fallback)
      .replace(/\s+/g, " ")
      .trim();

  packageJson.scripts = Object.fromEntries(
    Object.entries(packageJson.scripts ?? {}).map(([name, script]) => [
      name,
      cleanScript(script, ""),
    ]),
  );
  packageJson.scripts.build = "next build";
  packageJson.dependencies = {
    ...packageJson.dependencies,
    next: "16.2.9",
    react: "19.2.4",
    "react-dom": "19.2.4",
  };
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    typescript: packageJson.devDependencies?.typescript ?? "^5",
    tailwindcss: packageJson.devDependencies?.tailwindcss ?? "^4",
    "@tailwindcss/postcss":
      packageJson.devDependencies?.["@tailwindcss/postcss"] ?? "^4",
  };

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
}

async function ensureDependenciesInstalled(projectDir: string) {
  try {
    await access(path.join(projectDir, "node_modules"));
  } catch {
    await runShellCommand("npm install --no-audit --no-fund", projectDir, 180_000);
  }
}

async function assertStaticExport(projectDir: string) {
  const indexPath = path.join(projectDir, "out", "index.html");
  await access(indexPath);

  const html = await readFile(indexPath, "utf8");
  return html.trim().length > 0;
}

async function runShellCommand(command: string, cwd: string, timeout: number) {
  const blockedEnvKeys = new Set(["TURBO" + "PACK", "NEXT_RUNTIME_" + "TURBO"]);
  const cleanEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !blockedEnvKeys.has(key)),
  );

  return execAsync(command, {
    cwd,
    env: {
      ...cleanEnv,
      NODE_ENV: "production",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh",
    timeout,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 8,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  if (!PREVIEW_BUILDER_ENABLED) {
    return NextResponse.json(
      { error: "Live Preview builder is temporarily disabled." },
      { status: 503 },
    );
  }

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = previewBuildSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid generated project." },
      { status: 400 },
    );
  }

  const previewId = randomUUID();
  const projectDir = path.join(GENERATED_ROOT, previewId);

  try {
    await writeGeneratedProject(
      projectDir,
      parsed.data.files,
      previewId,
    );
    await writePreviewOwner(previewId, auth.user!.id);
    await ensureBuildablePackageJson(projectDir);
    await ensureDependenciesInstalled(projectDir);

    await runShellCommand(
      "npx next build",
      projectDir,
      120_000,
    );
    await assertStaticExport(projectDir);

    return NextResponse.json({
      ok: true,
      previewId,
      previewUrl: `/api/website-builder/preview/${previewId}`,
    });
  } catch (error) {
    logApiError("website-builder.preview.build", error);
    return NextResponse.json(
      {
        ok: false,
        previewId,
        error: "Generated project failed to compile.",
      },
      { status: 500 },
    );
  }
}
