import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFileTree, filterFileTree } from "@/lib/website/workspace/file-tree";
import type { WorkspaceFileRef } from "@/lib/website/workspace/file-contracts";

const files: WorkspaceFileRef[] = [
  { path: "app/page.tsx", language: "tsx", sizeBytes: 100 },
  { path: "components/Hero.tsx", language: "tsx", sizeBytes: 80 },
  { path: "preview/index.html", language: "html", sizeBytes: 200 },
];

describe("file-tree", () => {
  it("groups files into folders", () => {
    const tree = buildFileTree(files);
    assert.ok(tree.some((n) => n.name === "app" && n.type === "folder"));
    assert.ok(tree.some((n) => n.name === "preview"));
  });

  it("filters by path query", () => {
    const tree = buildFileTree(files);
    const filtered = filterFileTree(tree, "hero");
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.type, "folder");
  });
});
