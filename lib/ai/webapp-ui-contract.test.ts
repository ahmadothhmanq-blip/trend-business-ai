import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  filterUiRepairTargets,
  findMissingUiJsxImportIssues,
  findUiBarrelContractIssues,
  isUiLocallyRepairableIssue,
  isUiLocallyRepairableTarget,
} from "@/lib/ai/webapp-ui-contract";
import {
  CANONICAL_UI_PRIMITIVES,
  buildFullCanonicalUiBarrel,
  correctCanonicalButtonContracts,
  injectMissingCanonicalUiExports,
} from "@/lib/ai/webapp-ui-primitives";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";

function file(path: string, content: string): GeneratedProjectFile {
  return { path, content, language: "typescript" };
}

describe("webapp UI contract (no LLM)", () => {
  it("detects missing UI barrel exports before repair", () => {
    const issues = findUiBarrelContractIssues([
      file("components/ui.tsx", "export function Button() { return null; }"),
      file(
        "app/page.tsx",
        `import { Button, Table, Select } from "@/components/ui";
export default function Page() { return <Button><Select /><Table /></Button>; }
`,
      ),
    ]);
    assert.ok(issues.some((issue) => issue.includes('missing export "Table"')));
    assert.ok(issues.some((issue) => issue.includes('missing export "Select"')));
    assert.ok(issues.every(isUiLocallyRepairableIssue));
  });

  it("detects JSX UI usage without imports", () => {
    const issues = findMissingUiJsxImportIssues([
      file(
        "app/page.tsx",
        `import { Button } from "@/components/ui";
export default function Page() {
  return <div><Button>Ok</Button><Card>Missing</Card></div>;
}
`,
      ),
    ]);
    assert.equal(issues.length, 1);
    assert.match(issues[0]!, /JSX uses <Card>/);
    assert.ok(isUiLocallyRepairableIssue(issues[0]!));
  });

  it("never keeps components/ui in LLM repair targets", () => {
    const { llmTargets, skippedUiIssues } = filterUiRepairTargets(
      ["components/ui.tsx", "app/dashboard/page.tsx", "lib/db.ts"],
      [
        'components/ui.tsx: missing export "Table" required by "@/components/ui" imports.',
        "lib/db.ts: imports \"jose\" but package.json is missing \"jose\".",
      ],
    );
    assert.deepEqual(llmTargets, ["app/dashboard/page.tsx", "lib/db.ts"]);
    assert.ok(skippedUiIssues.some((issue) => issue.includes("components/ui")));
    assert.ok(isUiLocallyRepairableTarget("components/ui.tsx"));
    assert.ok(isUiLocallyRepairableTarget("components/ui/button.tsx"));
    assert.equal(isUiLocallyRepairableTarget("app/page.tsx"), false);
  });

  it("hardener clears UI contract + missing JSX import issues without LLM", () => {
    const before = [
      file(
        "components/ui.tsx",
        `import * as React from "react";
import { cn } from "@/lib/utils";
export function Button() { return null; }
`,
      ),
      file(
        "app/page.tsx",
        `import { Button } from "@/components/ui";
export default function Page() {
  return (
    <div>
      <Button>Go</Button>
      <Card>Hi</Card>
      <Table><TableBody><TableRow><TableCell>A</TableCell></TableRow></TableBody></Table>
    </div>
  );
}
`,
      ),
    ];

    assert.ok(findUiBarrelContractIssues(before).length > 0 || findMissingUiJsxImportIssues(before).length > 0);

    const hardened = hardenGeneratedWebApp(before);
    assert.deepEqual(findUiBarrelContractIssues(hardened), []);
    assert.deepEqual(findMissingUiJsxImportIssues(hardened), []);

    const page = hardened.find((entry) => entry.path === "app/page.tsx")!.content;
    assert.match(page, /\bCard\b/);
    assert.match(page, /\bTable\b/);
    assert.match(page, /from\s+["']@\/components\/ui["']/);

    const ui = hardened.find((entry) => entry.path === "components/ui.tsx")!.content;
    for (const name of ["Card", "Table", "TableBody", "TableRow", "TableCell"]) {
      assert.match(ui, new RegExp(`export function ${name}`));
    }
  });
});

describe("webapp UI primitives", () => {
  it("builds a full canonical barrel covering every required primitive", () => {
    const barrel = buildFullCanonicalUiBarrel();
    for (const name of CANONICAL_UI_PRIMITIVES) {
      assert.match(barrel, new RegExp(`\\b${name}\\b`));
    }
    assert.match(barrel, /size\?:\s*"default"\s*\|\s*"sm"\s*\|\s*"lg"\s*\|\s*"icon"/);
  });

  it("injects the full canonical set into a partial barrel", () => {
    const result = injectMissingCanonicalUiExports(
      `export function Button() { return null; }\n`,
      ["Select"],
    );
    assert.ok(result.injected.includes("Select"));
    assert.ok(result.injected.includes("Table"));
    assert.ok(result.injected.includes("Dialog"));
    assert.ok(result.injected.length >= CANONICAL_UI_PRIMITIVES.length - 1);
  });

  it("corrects Button icon size and cloneElement ref without replacing exports", () => {
    const input = `
export interface ButtonProps {
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}
export const Button = React.forwardRef((props, ref) => {
  const classes = cn(size === "lg" && "h-11");
  return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
    className: classes,
    ref,
  });
});
`;
    const next = correctCanonicalButtonContracts(input);
    assert.match(next, /"icon"/);
    assert.match(next, /size === "icon"/);
    assert.doesNotMatch(next, /cloneElement\([^)]*\{[^}]*\bref\b/);
  });
});
