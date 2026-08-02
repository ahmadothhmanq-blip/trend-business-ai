/**
 * Chief QA audit — Website Builder Template Library (installed packages only).
 * Usage: node scripts/audit-template-library.mjs [--api-base=http://localhost:3003]
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = join(root, "templates/website");
const apiBase =
  process.argv.find((arg) => arg.startsWith("--api-base="))?.split("=")[1] ??
  process.env.QA_BASE_URL ??
  "http://localhost:3003";

const MARKER = "__WB_TEMPLATE_AUDIT__";

function discoverPackageIds() {
  return readdirSync(templatesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function runAuditRunner(packageIds) {
  const runnerSource = `
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { validateWbTemplatePackage } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-engine/spec/validate-package.ts")).href)};
import { initializeWbTemplateEngine, getWbTemplateRegistry } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-engine/index.server.ts")).href)};
import { resolveBuilderTemplateRuntimeModel } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/template-runtime.server.ts")).href)};
import { getWebsiteStructureTemplate, WEBSITE_STRUCTURE_TEMPLATES } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/structure-templates.ts")).href)};
import { STRUCTURE_TEMPLATE_INTELLIGENCE_MAP, isKnownStructureTemplatePackage } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/template-package-ti-mapping.ts")).href)};
import { getTemplateIntelligence } from ${JSON.stringify(pathToFileURL(join(root, "lib/ai-core/template-intelligence/catalog.ts")).href)};

const templatesRoot = ${JSON.stringify(templatesRoot)};
const apiBase = ${JSON.stringify(apiBase)};
const packageIds = ${JSON.stringify(packageIds)};
const MARKER = ${JSON.stringify(MARKER)};

function isValidImageFile(filePath) {
  if (!existsSync(filePath)) return { ok: false, reason: "missing" };
  const stat = statSync(filePath);
  if (stat.size < 64) return { ok: false, reason: "too_small" };
  const header = readFileSync(filePath).subarray(0, 8);
  const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
  const isJpeg = header[0] === 0xff && header[1] === 0xd8;
  if (!isPng && !isJpeg) {
    const text = readFileSync(filePath, "utf8").slice(0, 32);
    if (text.includes("<svg")) return { ok: true, format: "svg" };
    return { ok: false, reason: "invalid_image_header" };
  }
  return { ok: true, format: isPng ? "png" : "jpeg" };
}

function auditPageRouting(manifest) {
  const issues = [];
  const paths = new Set();
  for (const page of manifest.pages) {
    if (!page.path?.startsWith("/")) {
      issues.push({ code: "routing.invalid_path", message: \`page "\${page.id}" path "\${page.path}" must start with /\`, file: page.file });
    }
    if (paths.has(page.path)) {
      issues.push({ code: "routing.duplicate_path", message: \`duplicate page path "\${page.path}"\`, file: page.file });
    }
    paths.add(page.path);
    if (!manifest.layouts.some((layout) => layout.id === page.layoutId)) {
      issues.push({ code: "routing.missing_layout", message: \`page "\${page.id}" references unknown layout "\${page.layoutId}"\`, file: page.file });
    }
  }
  return issues;
}

async function auditApiPreview(templateId) {
  const issues = [];
  try {
    const res = await fetch(\`\${apiBase}/api/website-builder/template-engine\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, pageId: "home" }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const body = await res.text();
      issues.push({ code: "api.preview.failed", message: \`POST template-engine returned \${res.status}: \${body.slice(0, 200)}\` });
      return issues;
    }
    const data = await res.json();
    if (!data.ok || !data.preview?.html) {
      issues.push({ code: "api.preview.empty", message: "POST template-engine returned ok without preview HTML" });
      return issues;
    }
    const html = data.preview.html;
    if (!html.includes(\`data-template-id="\${templateId}"\`)) {
      issues.push({ code: "api.preview.missing_marker", message: "preview HTML missing data-template-id marker" });
    }
    if (html.length < 200) {
      issues.push({ code: "api.preview.too_short", message: \`preview HTML suspiciously short (\${html.length} bytes)\` });
    }
  } catch (error) {
    issues.push({ code: "api.preview.unreachable", message: error instanceof Error ? error.message : String(error) });
  }
  return issues;
}

const engine = await initializeWbTemplateEngine();
await engine.ensureLoaded();

const catalogIds = new Set(WEBSITE_STRUCTURE_TEMPLATES.map((t) => t.id));
const indexIds = catalogIds;

const report = {
  auditedAt: new Date().toISOString(),
  packageCount: packageIds.length,
  apiBase,
  working: [],
  fixed: [],
  broken: [],
  warnings: [],
};

for (const id of packageIds) {
  const packageDir = join(templatesRoot, id);
  const templateIssues = [];

  if (!indexIds.has(id)) {
    templateIssues.push({ code: "catalog.index_missing", message: \`package "\${id}" missing from template-package-index.ts\` });
  }
  if (!catalogIds.has(id)) {
    templateIssues.push({ code: "catalog.structure_missing", message: \`package "\${id}" missing from WEBSITE_STRUCTURE_TEMPLATES\` });
  }

  const validation = await validateWbTemplatePackage(packageDir);
  if (!validation.valid) {
    for (const issue of validation.issues) {
      templateIssues.push({ code: issue.code, message: issue.message, file: issue.path });
    }
  }

  const registered = getWbTemplateRegistry().getPackage(id);
  if (!registered) {
    templateIssues.push({ code: "registry.missing", message: \`package "\${id}" not registered in template engine\` });
  }

  if (!getWebsiteStructureTemplate(id)) {
    templateIssues.push({ code: "selection.unavailable", message: \`getWebsiteStructureTemplate("\${id}") returned undefined\` });
  }

  if (!isKnownStructureTemplatePackage(id)) {
    templateIssues.push({ code: "ti.mapping_missing", message: \`no TI mapping for package "\${id}"\` });
  } else {
    const tiId = STRUCTURE_TEMPLATE_INTELLIGENCE_MAP[id];
    if (!getTemplateIntelligence(tiId)) {
      templateIssues.push({ code: "ti.profile_missing", message: \`TI profile "\${tiId}" not found in catalog\` });
    }
  }

  const runtime = await resolveBuilderTemplateRuntimeModel(id);
  if (!runtime.ok) {
    templateIssues.push({ code: runtime.code, message: runtime.message });
  } else {
    const preview = await engine.buildPreview(id, { pageId: "home" });
    if (!preview?.html) {
      templateIssues.push({ code: "preview.empty", message: "engine.buildPreview returned empty HTML" });
    } else if (!preview.html.includes(\`data-template-id="\${id}"\`)) {
      templateIssues.push({ code: "preview.missing_marker", message: "preview HTML missing data-template-id marker" });
    }

    if (registered?.manifest) {
      templateIssues.push(...auditPageRouting(registered.manifest));
    }

    if (registered?.mediaPaths) {
      for (const [label, filePath] of [["thumbnail", registered.mediaPaths.thumbnail], ["preview", registered.mediaPaths.preview]]) {
        const check = isValidImageFile(filePath);
        if (!check.ok) {
          templateIssues.push({ code: \`media.\${label}.\${check.reason}\`, message: \`\${label} asset invalid at \${filePath}\`, file: label });
        }
      }
    }
  }

  templateIssues.push(...await auditApiPreview(id));

  if (templateIssues.length === 0) {
    report.working.push(id);
  } else {
    report.broken.push({ id, issues: templateIssues });
  }
}

for (const id of indexIds) {
  if (!packageIds.includes(id)) {
    report.warnings.push(\`index references missing package "\${id}"\`);
  }
}

console.log(MARKER + JSON.stringify(report));
`;

  const runnerDir = mkdtempSync(join(tmpdir(), "wb-template-audit-"));
  const runnerPath = join(runnerDir, "runner.mts");

  try {
    writeFileSync(runnerPath, runnerSource, "utf8");
    const result =
      process.platform === "win32"
        ? spawnSync(`npx --yes tsx "${runnerPath.replaceAll('"', '\\"')}"`, {
            cwd: root,
            encoding: "utf8",
            env: process.env,
            shell: true,
          })
        : spawnSync("npx", ["--yes", "tsx", runnerPath], {
            cwd: root,
            encoding: "utf8",
            env: process.env,
          });

    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    const markerLine = output.split(/\r?\n/).find((line) => line.startsWith(MARKER));
    if (!markerLine) {
      console.error(output.trim());
      throw new Error("audit runner did not return a result");
    }
    if (result.status !== 0) {
      console.error(output.trim());
    }
    return JSON.parse(markerLine.slice(MARKER.length));
  } finally {
    rmSync(runnerDir, { recursive: true, force: true });
  }
}

const packageIds = discoverPackageIds();
if (!existsSync(templatesRoot)) {
  console.error(`templates root not found: ${templatesRoot}`);
  process.exit(1);
}

const report = runAuditRunner(packageIds);

if (report.broken.length > 0) {
  console.error(`\n✗ ${report.broken.length} broken template(s):`);
  for (const item of report.broken) {
    console.error(`  ${item.id}:`);
    for (const issue of item.issues) {
      console.error(`    - [${issue.code}] ${issue.message}`);
    }
  }
  process.exit(1);
}

console.log(`\n✓ All ${report.working.length} installed templates healthy`);
for (const id of report.working) {
  console.log(`  - ${id}`);
}
if (report.warnings.length) {
  console.log(`\nWarnings (${report.warnings.length}):`);
  for (const warning of report.warnings) {
    console.log(`  ! ${warning}`);
  }
}
