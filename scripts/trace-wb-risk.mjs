import ts from "typescript";
import path from "path";
import fs from "fs";

const root = process.cwd();
const configPath = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath),
);
const host = ts.createCompilerHost(parsed.options, true);
const program = ts.createProgram(parsed.fileNames, parsed.options, host);
const norm = (f) => path.resolve(f).replace(/\\/g, "/").toLowerCase();

const entries = [
  "components/dashboard/website-builder-tool.tsx",
];

function resolveImport(fromFile, spec) {
  const r = ts.resolveModuleName(spec, fromFile, parsed.options, host)
    .resolvedModule;
  return r ? norm(r.resolvedFileName) : null;
}

function getImports(file) {
  const sf = program.getSourceFile(file);
  if (!sf) return [];
  const out = [];
  ts.forEachChild(sf, function walk(node) {
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      out.push({
        spec: node.moduleSpecifier.text,
        resolved: resolveImport(file, node.moduleSpecifier.text),
      });
    }
    ts.forEachChild(node, walk);
  });
  return out.filter((x) => x.resolved);
}

function bfsOrder(start) {
  const q = [start];
  const seen = new Set();
  const order = [];
  while (q.length) {
    const f = q.shift();
    if (seen.has(f)) continue;
    seen.add(f);
    order.push(f);
    for (const imp of getImports(f)) q.push(imp.resolved);
  }
  return order;
}

const start = norm(path.resolve(root, entries[0]));
const order = bfsOrder(start);
const risky = [];

for (const f of order) {
  const text = fs.readFileSync(f, "utf8");
  if (/from ["']node:|require\(["']node:|import\(["']node:/.test(text)) {
    risky.push({ file: f, reason: "node: import" });
  }
  if (/from ["']@\/lib\/website\/builder["']/.test(text)) {
    risky.push({ file: f, reason: "builder barrel" });
  }
  if (/from ["']@\/lib\/ai-core\/website-management["']/.test(text)) {
    risky.push({ file: f, reason: "website-management barrel" });
  }
}

console.log("modules reachable:", order.length);
for (const r of risky) {
  console.log(r.reason, r.file.replace(root.toLowerCase(), ""));
}
