import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeRecentProjectsList, upsertRecentProject } from "@/lib/website/recent-projects";

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

  it("keeps an optimistic project when the API list lags behind", () => {
    const hydrated = {
      id: "new",
      title: "Fresh Site",
      generatedProject: { files: [{ path: "app/page.tsx" }] },
    };
    const current = [hydrated];
    const fromApi = [{ id: "old", title: "Old Site" }];

    const merged = mergeRecentProjectsList(current, fromApi, {
      ensureProject: hydrated,
    });

    assert.deepEqual(merged.map((p) => p.id), ["new", "old"]);
    assert.equal(merged[0]?.title, "Fresh Site");
  });

  it("preserves hydrated blueprints when merging API stubs", () => {
    const local = {
      id: "a",
      title: "A",
      generatedProject: { files: [{ path: "app/page.tsx" }] },
    };
    const fromApi = [{ id: "a", title: "A", generatedProject: { files: [] } }];

    const merged = mergeRecentProjectsList([local], fromApi);
    assert.equal(merged[0]?.generatedProject?.files?.length, 1);
  });

  it("preserves local-only rows when API list omits them", () => {
    const localOnly = { id: "live", title: "Live", generatedProject: { files: [] } };
    const fromApi = [{ id: "old", title: "Old" }];

    const merged = mergeRecentProjectsList([localOnly], fromApi, {
      preserveLocalIds: ["live"],
    });

    assert.deepEqual(merged.map((p) => p.id), ["live", "old"]);
  });
});
