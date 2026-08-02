import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectImportRegressionFingerprints,
  compareGenerationQuality,
  isNpmPackageImportIssue,
} from "@/lib/website/validation/wave-scheduler-quality";
import type { GeneratedProjectFile } from "@/lib/ai/types";

describe("wave-scheduler-quality harness", () => {
  it("detects npm package fixture noise", () => {
    assert.equal(
      isNpmPackageImportIssue(
        'components/sections/ContactSection.tsx: imports "react" but package.json is missing "react".',
      ),
      true,
    );
  });

  it("ignores npm import noise in isolated scope without package.json", () => {
    const files: GeneratedProjectFile[] = [
      {
        path: "components/sections/ContactSection.tsx",
        language: "tsx",
        content: `import { useState } from "react";\nexport function ContactSection() { return null; }`,
      },
    ];
    const issues = [
      'components/sections/ContactSection.tsx: imports "react" but package.json is missing "react".',
    ];
    const fingerprints = collectImportRegressionFingerprints(
      issues,
      files,
      "isolated-file-stage",
    );
    assert.equal(fingerprints.size, 0);
  });

  it("keeps unresolved @/ import fingerprints", () => {
    const files: GeneratedProjectFile[] = [
      {
        path: "app/page.tsx",
        language: "tsx",
        content: `import { Hero } from "@/components/sections/Missing";\nexport default function Page() { return null; }`,
      },
    ];
    const issues = [
      'app/page.tsx: missing project import "@/components/sections/Missing" (resolved candidates not in tree).',
    ];
    const fingerprints = collectImportRegressionFingerprints(
      issues,
      files,
      "isolated-file-stage",
    );
    assert.equal(fingerprints.size, 1);
  });

  it("flags net-new @/ import regressions only", () => {
    const legacyFiles: GeneratedProjectFile[] = [
      {
        path: "app/page.tsx",
        language: "tsx",
        content: `import { Hero } from "@/components/sections/HeroLuxury";\nexport default function Page() { return <Hero />; }`,
      },
      {
        path: "components/sections/HeroLuxury.tsx",
        language: "tsx",
        content: `export function HeroLuxury() { return null; }`,
      },
    ];
    const waveFiles: GeneratedProjectFile[] = [
      {
        path: "app/page.tsx",
        language: "tsx",
        content: `import { Hero } from "@/components/sections/Missing";\nexport default function Page() { return <Hero />; }`,
      },
    ];

    const result = compareGenerationQuality({
      promptId: "test",
      prompt: "test",
      language: "English",
      legacyFiles,
      waveFiles,
      scope: "isolated-file-stage",
    });

    assert.equal(result.passed, false);
    assert.match(result.regressions.join(" "), /import regressions/);
  });
});
