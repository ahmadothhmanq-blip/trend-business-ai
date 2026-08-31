import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  WEBAPP_DEP_CACHE_INVALIDATION_RULES,
  WEBAPP_TURBOPACK_ROOT_MARKER,
  applyWebAppTurbopackRoot,
  computeWebAppDependencyHash,
  computeWebAppTurbopackRoot,
  ensureWebAppBaseWorkspace,
  getWebAppDepCacheRuntimeMetrics,
  isWebAppDepWorkspaceHealthy,
  linkWebAppNodeModules,
  resetWebAppDepCacheRuntimeMetrics,
} from "@/lib/ai/webapp-base-workspace";
import { ISOLATED_NEXT_CONFIG } from "@/lib/ai/webapp-isolation";
import { verifyWebAppProjectBuild } from "@/lib/ai/webapp-project-verify";
import type { GeneratedProjectFile } from "@/lib/ai/types";

function tempCacheRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "webapp-dep-cache-test-"));
}

function samplePackageJson(extraDep?: Record<string, string>): string {
  return `${JSON.stringify(
    {
      name: "generated-webapp",
      private: true,
      dependencies: {
        next: "^16.0.0",
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        ...(extraDep ?? {}),
      },
      devDependencies: {
        typescript: "^5.7.0",
      },
    },
    null,
    2,
  )}\n`;
}

function fakeInstall(workspaceDir: string): void {
  const nextDir = path.join(workspaceDir, "node_modules", "next");
  fs.mkdirSync(nextDir, { recursive: true });
  fs.writeFileSync(
    path.join(nextDir, "package.json"),
    JSON.stringify({ name: "next", version: "16.0.0" }),
    "utf8",
  );
}

describe("webapp base workspace dependency cache", () => {
  it("hashes dependencies stably and ignores project name", () => {
    const a = samplePackageJson();
    const b = samplePackageJson();
    const renamed = a.replace("generated-webapp", "other-title");
    assert.equal(computeWebAppDependencyHash(a), computeWebAppDependencyHash(b));
    assert.equal(computeWebAppDependencyHash(a), computeWebAppDependencyHash(renamed));
  });

  it("workspace install package.json strips postinstall without changing hash", () => {
    const cacheRoot = tempCacheRoot();
    const pkg = `${JSON.stringify(
      {
        name: "with-postinstall",
        private: true,
        scripts: { postinstall: "prisma generate", typecheck: "tsc --noEmit" },
        dependencies: { next: "^16.0.0" },
      },
      null,
      2,
    )}\n`;
    const hash = computeWebAppDependencyHash(pkg);
    ensureWebAppBaseWorkspace(pkg, {
      cacheRoot,
      runInstall: (dir) => {
        const written = JSON.parse(
          fs.readFileSync(path.join(dir, "package.json"), "utf8"),
        ) as { scripts?: Record<string, string> };
        assert.equal(written.scripts?.postinstall, undefined);
        assert.equal(written.scripts?.typecheck, "tsc --noEmit");
        fakeInstall(dir);
      },
    });
    assert.equal(computeWebAppDependencyHash(pkg), hash);
  });

  it("cache miss then cache hit skips install", () => {
    resetWebAppDepCacheRuntimeMetrics();
    const cacheRoot = tempCacheRoot();
    let installs = 0;
    const pkg = samplePackageJson();

    const miss = ensureWebAppBaseWorkspace(pkg, {
      cacheRoot,
      runInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });
    assert.equal(miss.cacheHit, false);
    assert.equal(miss.installSkipped, false);
    assert.equal(installs, 1);

    const hit = ensureWebAppBaseWorkspace(pkg, {
      cacheRoot,
      runInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });
    assert.equal(hit.cacheHit, true);
    assert.equal(hit.installSkipped, true);
    assert.equal(hit.hash, miss.hash);
    assert.equal(installs, 1);
    assert.equal(hit.workspaceDir, miss.workspaceDir);

    fs.rmSync(cacheRoot, { recursive: true, force: true });
  });

  it("dependency change invalidates cache (new hash + install)", () => {
    const cacheRoot = tempCacheRoot();
    let installs = 0;
    const base = samplePackageJson();
    const changed = samplePackageJson({ zod: "^3.23.0" });

    assert.notEqual(
      computeWebAppDependencyHash(base),
      computeWebAppDependencyHash(changed),
    );

    ensureWebAppBaseWorkspace(base, {
      cacheRoot,
      runInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });
    ensureWebAppBaseWorkspace(changed, {
      cacheRoot,
      runInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });
    assert.equal(installs, 2);

    fs.rmSync(cacheRoot, { recursive: true, force: true });
  });

  it("new dependency added creates a distinct workspace", () => {
    const cacheRoot = tempCacheRoot();
    const first = ensureWebAppBaseWorkspace(samplePackageJson(), {
      cacheRoot,
      runInstall: fakeInstall,
    });
    const second = ensureWebAppBaseWorkspace(samplePackageJson({ clsx: "^2.1.1" }), {
      cacheRoot,
      runInstall: fakeInstall,
    });
    assert.notEqual(first.hash, second.hash);
    assert.notEqual(first.workspaceDir, second.workspaceDir);
    assert.equal(fs.existsSync(first.workspaceDir), true);
    assert.equal(fs.existsSync(second.workspaceDir), true);

    fs.rmSync(cacheRoot, { recursive: true, force: true });
  });

  it("corrupted cache recovers with reinstall", () => {
    const cacheRoot = tempCacheRoot();
    let installs = 0;
    const pkg = samplePackageJson();
    const ready = ensureWebAppBaseWorkspace(pkg, {
      cacheRoot,
      runInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });

    fs.rmSync(path.join(ready.workspaceDir, "node_modules"), {
      recursive: true,
      force: true,
    });
    const health = isWebAppDepWorkspaceHealthy(ready.workspaceDir, ready.hash);
    assert.equal(health.healthy, false);
    assert.equal(health.reason, "missing-node-modules");

    const recovered = ensureWebAppBaseWorkspace(pkg, {
      cacheRoot,
      runInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });
    assert.equal(recovered.cacheHit, false);
    assert.equal(recovered.invalidationReason, "missing-node-modules");
    assert.equal(installs, 2);
    assert.equal(
      isWebAppDepWorkspaceHealthy(recovered.workspaceDir, recovered.hash).healthy,
      true,
    );

    fs.rmSync(cacheRoot, { recursive: true, force: true });
  });

  it("verifyWebAppProjectBuild uses cache on second install step", () => {
    resetWebAppDepCacheRuntimeMetrics();
    const cacheRoot = tempCacheRoot();
    let installs = 0;
    const files: GeneratedProjectFile[] = [
      {
        path: "package.json",
        language: "json",
        content: samplePackageJson(),
      },
      {
        path: "tsconfig.json",
        language: "json",
        content: JSON.stringify({
          compilerOptions: { strict: true, noEmit: true, skipLibCheck: true },
        }),
      },
    ];

    const first = verifyWebAppProjectBuild(files, {
      steps: ["install"],
      keepDir: true,
      depCacheRoot: cacheRoot,
      runDepInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });
    assert.equal(first.ok, true);
    assert.equal(first.depCache?.cacheHit, false);
    assert.equal(installs, 1);

    const second = verifyWebAppProjectBuild(files, {
      steps: ["install"],
      keepDir: true,
      depCacheRoot: cacheRoot,
      runDepInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });
    assert.equal(second.ok, true);
    assert.equal(second.depCache?.cacheHit, true);
    assert.equal(second.depCache?.installSkipped, true);
    assert.equal(installs, 1);

    const metrics = getWebAppDepCacheRuntimeMetrics();
    assert.equal(metrics.ensures, 2);
    assert.equal(metrics.hits, 1);
    assert.equal(metrics.misses, 1);
    assert.equal(metrics.hitRate, 0.5);

    if (first.dir) fs.rmSync(first.dir, { recursive: true, force: true });
    if (second.dir) fs.rmSync(second.dir, { recursive: true, force: true });
    fs.rmSync(cacheRoot, { recursive: true, force: true });
  });

  it("linkWebAppNodeModules attaches cached modules into a project dir", () => {
    const cacheRoot = tempCacheRoot();
    const workspace = ensureWebAppBaseWorkspace(samplePackageJson(), {
      cacheRoot,
      runInstall: fakeInstall,
    });
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "webapp-link-"));
    const linked = linkWebAppNodeModules(projectDir, workspace.workspaceDir);
    assert.equal(
      fs.existsSync(path.join(projectDir, "node_modules", "next", "package.json")),
      true,
    );
    assert.equal(
      fs.existsSync(path.join(projectDir, WEBAPP_TURBOPACK_ROOT_MARKER)),
      true,
    );
    const marker = fs
      .readFileSync(path.join(projectDir, WEBAPP_TURBOPACK_ROOT_MARKER), "utf8")
      .trim();
    assert.equal(marker, linked.turbopackRoot);
    assert.equal(
      computeWebAppTurbopackRoot(projectDir, workspace.workspaceDir),
      linked.turbopackRoot,
    );
    fs.rmSync(projectDir, { recursive: true, force: true });
    fs.rmSync(cacheRoot, { recursive: true, force: true });
  });

  it("computes turbopack.root as common ancestor of project and cache", () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), "webapp-turbo-root-"));
    const projectDir = path.join(base, "projects", "app-a");
    const workspaceDir = path.join(base, "webapp-dep-workspaces", "abc123");
    fs.mkdirSync(projectDir, { recursive: true });
    fs.mkdirSync(workspaceDir, { recursive: true });

    const root = computeWebAppTurbopackRoot(projectDir, workspaceDir);
    assert.equal(root, path.resolve(base));
    assert.equal(applyWebAppTurbopackRoot(projectDir, workspaceDir), root);
    assert.equal(
      fs.readFileSync(path.join(projectDir, WEBAPP_TURBOPACK_ROOT_MARKER), "utf8").trim(),
      root,
    );

    fs.rmSync(base, { recursive: true, force: true });
  });

  it("turbopack root detection is Windows-path compatible", () => {
    const drive = process.platform === "win32" ? "C:" : "";
    const sep = path.sep;
    // Simulate nested Temp-style paths via path.resolve (platform-native).
    const project = path.resolve(
      process.platform === "win32"
        ? "C:\\Users\\PC\\AppData\\Local\\Temp\\app-builder-single-xyz"
        : "/tmp/app-builder-single-xyz",
    );
    const workspace = path.resolve(
      process.platform === "win32"
        ? "C:\\Users\\PC\\AppData\\Local\\Temp\\webapp-dep-workspaces\\hash1"
        : "/tmp/webapp-dep-workspaces/hash1",
    );
    const root = computeWebAppTurbopackRoot(project, workspace);
    const expected = path.resolve(
      process.platform === "win32"
        ? "C:\\Users\\PC\\AppData\\Local\\Temp"
        : "/tmp",
    );
    assert.equal(root, expected);
    assert.equal(root.includes(sep) || /^[A-Za-z]:\\?$/i.test(root), true);
    if (process.platform === "win32") {
      assert.match(root, /^[A-Za-z]:/);
      assert.equal(path.isAbsolute(root), true);
      assert.ok(!root.includes("/"), "Windows root should use backslashes from path.resolve");
    }
    void drive;
  });

  it("isolated next.config resolves turbopack root via marker without changing default hash cache", () => {
    assert.match(ISOLATED_NEXT_CONFIG, /\.webapp-turbopack-root/);
    assert.match(ISOLATED_NEXT_CONFIG, /WEBAPP_TURBOPACK_ROOT/);
    assert.match(ISOLATED_NEXT_CONFIG, /turbopack:\s*\{\s*root:\s*turbopackRoot\s*\}/);
    assert.match(ISOLATED_NEXT_CONFIG, /outputFileTracingRoot:\s*turbopackRoot/);

    resetWebAppDepCacheRuntimeMetrics();
    const cacheRoot = tempCacheRoot();
    let installs = 0;
    const pkg = samplePackageJson();
    const miss = ensureWebAppBaseWorkspace(pkg, {
      cacheRoot,
      runInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });
    const hit = ensureWebAppBaseWorkspace(pkg, {
      cacheRoot,
      runInstall: (dir) => {
        installs += 1;
        fakeInstall(dir);
      },
    });
    assert.equal(miss.cacheHit, false);
    assert.equal(hit.cacheHit, true);
    assert.equal(hit.installSkipped, true);
    assert.equal(installs, 1);

    fs.rmSync(cacheRoot, { recursive: true, force: true });
  });

  it("documents invalidation rules", () => {
    assert.ok(WEBAPP_DEP_CACHE_INVALIDATION_RULES.length >= 5);
  });
});
