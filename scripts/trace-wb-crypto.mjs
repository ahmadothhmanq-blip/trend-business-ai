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

function bfsWithEdges(start) {
  const q = [{ node: start, edge: null }];
  const seen = new Set();
  const edges = [];
  while (q.length) {
    const { node, edge } = q.shift();
    if (seen.has(node)) continue;
    seen.add(node);
    if (edge) edges.push(edge);
    for (const imp of getImports(node)) {
      q.push({
        node: imp.resolved,
        edge: { from: node, spec: imp.spec, to: imp.resolved },
      });
    }
  }
  return { seen, edges };
}

const start = norm(
  path.resolve(root, "components/dashboard/website-builder-tool.tsx"),
);
const { seen, edges } = bfsWithEdges(start);

const nodeCryptoFiles = [...seen].filter((f) => {
  const text = fs.readFileSync(f, "utf8");
  return text.includes("node:crypto");
});

console.log("reachable modules:", seen.size);
console.log("files with node:crypto in graph:", nodeCryptoFiles.length);
for (const f of nodeCryptoFiles) {
  console.log(" node:crypto file:", f.replace(root.toLowerCase(), ""));
}

// find shortest path to first node:crypto file
function shortestPath(goal) {
  const q = [[start]];
  const seen2 = new Set([start]);
  while (q.length) {
    const chain = q.shift();
    const last = chain[chain.length - 1];
    if (last === goal) return chain;
    for (const imp of getImports(last)) {
      if (seen2.has(imp.resolved)) continue;
      seen2.add(imp.resolved);
      q.push([...chain, imp.resolved]);
    }
  }
  return null;
}

for (const goal of nodeCryptoFiles) {
  const chain = shortestPath(goal);
  if (!chain) continue;
  console.log("\nPATH TO", goal.replace(root.toLowerCase(), ""));
  let prev = chain[0];
  for (let i = 1; i < chain.length; i++) {
    const imp = getImports(prev).find((x) => x.resolved === chain[i]);
    console.log(`  ${imp?.spec}  (${path.basename(prev)} -> ${path.basename(chain[i])})`);
    prev = chain[i];
  }
}

// builder barrel paths
const barrelHits = edges.filter((e) => e.spec === "@/lib/website/builder");
console.log("\nbuilder barrel edges:", barrelHits.length);
for (const e of barrelHits) {
  console.log(
    " ",
    e.spec,
    path.basename(e.from),
    "->",
    path.basename(e.to),
  );
}
