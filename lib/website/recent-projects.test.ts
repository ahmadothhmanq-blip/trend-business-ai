import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { upsertRecentProject } from "@/lib/website/recent-projects";

describe("recent projects list", () => {
  it("prepends a new project", () => {
    const existing = [{ id: "a", title: "A" }];
    const next = upsertRecentProject(existing, { id: "b", title: "B" });
    assert.deepEqual(next.map((p) => p.id), ["b", "a"]);
  });

  it("replaces an existing project without duplicating", () => {
    const existing = [
      { id: "a", title: "Old" },
      { id: "b", title: "B" },
    ];
    const updated = { id: "a", title: "New" };
    const next = upsertRecentProject(existing, updated);
    assert.deepEqual(next.map((p) => p.id), ["a", "b"]);
    assert.equal(next[0]?.title, "New");
  });
});
