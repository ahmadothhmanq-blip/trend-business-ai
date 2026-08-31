import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { describe, it } from "node:test";
import { PACKAGE_SUPERSESSION_ALIASES } from "@/lib/website/builder/resolve-builder-template-package-id";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";

/** Installed packages that ship to production. */
export const ACTIVE_V2_FLAGSHIP_PACKAGES = [] as const;

describe("V2 package uniqueness audit", () => {
  it("keeps supersession aliases empty", () => {
    assert.deepEqual(PACKAGE_SUPERSESSION_ALIASES, {});
  });

  it("keeps no active flagship packages on disk", () => {
    const root = resolveWbTemplatesRoot();
    const onDisk = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name);
    assert.deepEqual(onDisk, []);
    assert.deepEqual([...ACTIVE_V2_FLAGSHIP_PACKAGES], []);
  });
});
